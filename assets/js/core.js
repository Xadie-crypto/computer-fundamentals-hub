/* Core: utilities, storage, statistics, shell, and hash router. */
(function () {
  'use strict';

  var CONTENT = window.COMPF_CONTENT;
  var BANK = window.COMPF_BANK;
  var TOPICS = CONTENT.topics;
  var TOPIC_MAP = {};
  TOPICS.forEach(function (t) { TOPIC_MAP[t.id] = t; });
  var ALL = [];
  Object.keys(BANK).forEach(function (k) {
    BANK[k].forEach(function (q) { q.topic = k; ALL.push(q); });
  });
  var COUNTS = window.COMPF_COUNTS || {};
  var views = {};
  var state = {
    route: 'home',
    params: [],
    practice: null,
    practiceResult: null,
    bank: null,
    essayScore: null
  };

  var KEY_STATS = 'compf.stats.v2';
  var KEY_THEME = 'compf.theme';
  var KEY_EXAM = 'compf.exam.v1';
  var KEY_RESULT = 'compf.exam.result.v1';

  /* ---------- DOM ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function icon(name, cls) {
    return '<svg class="icon ' + (cls || '') + '" aria-hidden="true"><use href="#i-' + name + '"></use></svg>';
  }
  function statement(text) {
    return esc(text).replace(/\[\[(.+?)\]\]/g, '<u class="blank">$1</u>');
  }
  function letter(i) { return 'ABCDEFGH'[i] || '?'; }
  function pct(n, d) { return d ? Math.round((n / d) * 100) : 0; }
  function ring(percent, size, stroke) {
    var p = Math.max(0, Math.min(100, Number(percent) || 0));
    var r = size / 2 - stroke - 2;
    var circ = 2 * Math.PI * r;
    var filled = circ * p / 100;
    return '<svg class="ring" viewBox="0 0 ' + size + ' ' + size + '" role="img" aria-label="' + p + ' percent">' +
      '<circle class="track" cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '"></circle>' +
      '<circle class="fill" cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" stroke-dasharray="' + filled.toFixed(1) + ' ' + circ.toFixed(1) + '"></circle>' +
      '</svg>';
  }

  /* ---------- random ---------- */
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }
  function sample(arr, n) { return shuffle(arr).slice(0, Math.max(0, n)); }

  /* ---------- answer matching ---------- */
  function normalize(str) {
    var s = String(str == null ? '' : str).toLowerCase();
    if (s.normalize) s = s.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
    s = s.replace(/&/g, ' and ');
    s = s.replace(/%|percent|per cent/g, ' ');
    s = s.replace(/,/g, '');
    s = s.replace(/\b(billion|million|thousand)\b/g, ' ');
    s = s.replace(/\.(?!\d)/g, ' ');
    s = s.replace(/[^a-z0-9. ]+/g, ' ');
    s = s.replace(/\s+/g, ' ').trim();
    s = s.replace(/\.0\b/g, '').replace(/\.$/, '');
    if (/^\d+(\.\d+)?$/.test(s)) s = String(parseFloat(s));
    return s;
  }
  function lev(a, b) {
    var m = a.length, n = b.length;
    if (!m) return n;
    if (!n) return m;
    var prev = new Array(n + 1);
    var cur = new Array(n + 1);
    for (var j = 0; j <= n; j++) prev[j] = j;
    for (var i = 1; i <= m; i++) {
      cur[0] = i;
      for (var k = 1; k <= n; k++) {
        var cost = a.charAt(i - 1) === b.charAt(k - 1) ? 0 : 1;
        cur[k] = Math.min(prev[k] + 1, cur[k - 1] + 1, prev[k - 1] + cost);
      }
      var swap = prev; prev = cur; cur = swap;
    }
    return prev[n];
  }
  function textClose(a, b) {
    if (!a || !b) return false;
    if (a === b) return true;
    var A = a.replace(/ /g, '');
    var B = b.replace(/ /g, '');
    if (A === B) return true;
    if (/\d/.test(A) || /\d/.test(B)) return false;
    var shortest = Math.min(A.length, B.length);
    if (shortest < 5) return false;
    return lev(A, B) <= (shortest >= 12 ? 2 : 1);
  }
  function matchAnswer(q, input) {
    var value = normalize(input);
    if (!value) return false;
    if (q.t === 'tf') {
      if (q.a) return value === 'true' || value === 't' || value === 'yes';
      if (value === 'true' || value === 't' || value === 'false' || value === 'f' || value === 'yes' || value === 'no') return false;
      var tfList = [q.fix].concat(q.accept || []);
      return tfList.some(function (x) { return textClose(value, normalize(x)); });
    }
    var list = Array.isArray(q.a) ? q.a : [q.a];
    return list.some(function (x) { return textClose(value, normalize(x)); });
  }
  function possibleAnswer(q) {
    if (q.t === 'mc') return letter(q.a) + '. ' + q.o[q.a];
    if (q.t === 'id') return q.a[0];
    if (q.t === 'tf') return q.a ? 'TRUE' : q.fix;
    return '';
  }

  /* ---------- storage ---------- */
  function readJSON(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }
  function writeJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (e) { return false; }
  }
  function removeKey(key) { try { localStorage.removeItem(key); } catch (e) { /* ignore */ } }

  var stats = readJSON(KEY_STATS, null) || { seen: {}, sessions: [], exams: [] };
  if (!stats.seen) stats.seen = {};
  if (!stats.sessions) stats.sessions = [];
  if (!stats.exams) stats.exams = [];

  function persistStats() { writeJSON(KEY_STATS, stats); }
  function recordAnswer(q, correct) {
    var rec = stats.seen[q.id];
    if (!rec) rec = stats.seen[q.id] = { n: 0, c: 0, topic: q.topic, type: q.t };
    rec.n += 1;
    if (correct) rec.c += 1;
    rec.topic = q.topic;
    rec.type = q.t;
    persistStats();
  }
  function topicStat(id) {
    var n = 0, c = 0;
    Object.keys(stats.seen).forEach(function (k) {
      var r = stats.seen[k];
      if (r.topic === id) { n += r.n; c += r.c; }
    });
    return { n: n, c: c, acc: n ? Math.round((c / n) * 100) : null };
  }
  function overallStat() {
    var n = 0, c = 0;
    Object.keys(stats.seen).forEach(function (k) {
      n += stats.seen[k].n;
      c += stats.seen[k].c;
    });
    return { n: n, c: c, acc: n ? Math.round((c / n) * 100) : null, seen: Object.keys(stats.seen).length };
  }
  function recordSession(session) {
    var entry = Object.assign({ date: new Date().toISOString() }, session);
    stats.sessions.unshift(entry);
    stats.sessions = stats.sessions.slice(0, 25);
    persistStats();
  }
  function recordExamResult(result) {
    var entry = {
      date: result.date || new Date().toISOString(),
      objective: result.objective,
      essay: result.essay,
      bonus: result.bonus,
      total: result.total,
      max: result.max,
      name: result.name || ''
    };
    var existing = -1;
    stats.exams.forEach(function (e, i) { if (e.date === entry.date) existing = i; });
    if (existing >= 0) stats.exams[existing] = entry;
    else stats.exams.unshift(entry);
    stats.exams = stats.exams.slice(0, 20);
    persistStats();
  }
  function resetStats() {
    stats.seen = {};
    stats.sessions = [];
    stats.exams = [];
    persistStats();
  }

  /* ---------- theme ---------- */
  function currentTheme() { return document.documentElement.getAttribute('data-theme') || 'light'; }
  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem(KEY_THEME, theme); } catch (e) { /* ignore */ }
    var btn = $('#theme-toggle');
    if (btn) btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  }
  function toggleTheme() { setTheme(currentTheme() === 'dark' ? 'light' : 'dark'); }

  /* ---------- sidebar ---------- */
  function setSidebar(open) {
    document.body.classList.toggle('nav-open', open);
    var btn = $('#menu-btn');
    if (btn) btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    var scrim = $('#sidebar-scrim');
    if (scrim) scrim.hidden = !open;
  }

  /* ---------- modal & toast ---------- */
  var modalState = null;
  function closeModal() {
    var root = $('#modal-root');
    if (root) root.innerHTML = '';
    document.body.classList.remove('modal-open');
    modalState = null;
  }
  function openModal(opts) {
    var root = $('#modal-root');
    if (!root) return null;
    var actions = opts.actions || [];
    var actionsHtml = actions.map(function (a, i) {
      return '<button class="btn ' + (a.kind === 'primary' ? 'btn-primary' : a.kind === 'danger' ? 'btn-danger' : 'btn-ghost') + '" data-action="' + i + '">' + esc(a.label) + '</button>';
    }).join('');
    root.innerHTML =
      '<div class="modal-backdrop" data-close="1">' +
        '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">' +
          '<div class="modal-head">' +
            '<h2 id="modal-title">' + esc(opts.title || '') + '</h2>' +
            '<button class="icon-btn" data-close="1" aria-label="Close">' + icon('close') + '</button>' +
          '</div>' +
          '<div class="modal-body">' + (opts.body || '') + '</div>' +
          (actions.length ? '<div class="modal-actions">' + actionsHtml + '</div>' : '') +
        '</div>' +
      '</div>';
    document.body.classList.add('modal-open');
    modalState = { close: closeModal };
    $$('[data-close]', root).forEach(function (el) {
      el.addEventListener('click', function (e) {
        if (el.getAttribute('data-close') === '1' && (e.target === el || el.tagName === 'BUTTON')) closeModal();
      });
    });
    $$('[data-action]', root).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var action = actions[parseInt(btn.getAttribute('data-action'), 10)];
        if (!action) return;
        if (action.onClick) {
          var keep = action.onClick();
          if (keep !== false) closeModal();
        } else closeModal();
      });
    });
    var focusable = $('input, textarea, select, button', root);
    if (focusable) setTimeout(function () { focusable.focus(); }, 30);
    return modalState;
  }
  var toastTimer = null;
  function toast(message) {
    var el = $('#toast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('show'); }, 2600);
  }

  /* ---------- countdown ---------- */
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function updateCountdowns() {
    var target = new Date(CONTENT.meta.examDateISO).getTime();
    var end = target + 2 * 60 * 60 * 1000;
    var now = Date.now();
    var diff = target - now;
    var days = 0, hours = 0, mins = 0, secs = 0, label = '';
    if (diff > 0) {
      days = Math.floor(diff / 86400000);
      hours = Math.floor((diff % 86400000) / 3600000);
      mins = Math.floor((diff % 3600000) / 60000);
      secs = Math.floor((diff % 60000) / 1000);
      label = days > 0 ? days + 'd ' + hours + 'h ' + mins + 'm away' : hours + 'h ' + mins + 'm away';
    } else if (now < end) {
      label = 'Exam in progress';
    } else {
      label = 'Exam completed';
    }
    $$('[data-cd]').forEach(function (el) {
      var key = el.getAttribute('data-cd');
      var val = key === 'days' ? days : key === 'hours' ? hours : key === 'mins' ? mins : secs;
      el.textContent = diff > 0 ? pad2(val) : '00';
    });
    var side = $('#sidebar-countdown');
    if (side) side.textContent = label;
    var sub = $('#hero-countdown-label');
    if (sub) sub.textContent = label;
  }

  /* ---------- router ---------- */
  function parseHash() {
    var raw = location.hash.replace(/^#\/?/, '');
    var parts = raw.split('/').filter(function (p) { return p.length; });
    return { route: parts[0] || 'home', params: parts.slice(1) };
  }
  function navigate(path) {
    var next = path.charAt(0) === '#' ? path : '#/' + path.replace(/^\//, '');
    if (location.hash === next) render();
    else location.hash = next;
  }
  function setActiveNav(active) {
    $$('[data-nav]').forEach(function (el) {
      el.classList.toggle('active', el.getAttribute('data-nav') === active);
    });
  }
  function titleFor(route, params) {
    if (route === 'home') return 'Dashboard';
    if (route === 'notes') return TOPIC_MAP[params[0]] ? TOPIC_MAP[params[0]].name : 'Notes';
    if (route === 'bank') return 'Question bank';
    if (route === 'practice' || route === 'practice-run' || route === 'practice-result') return 'Practice';
    if (route === 'progress') return 'Progress';
    if (route === 'exam' || route === 'exam-run' || route === 'exam-result') return 'Mock exam';
    return 'Computer Fundamentals Review';
  }
  function errorView(err) {
    return '<div class="view-pad"><div class="empty-state">' +
      '<p class="eyebrow">Something went wrong</p>' +
      '<h1>This view could not load.</h1>' +
      '<p class="muted">' + esc(err && err.message ? err.message : 'Unknown error') + '</p>' +
      '<a class="btn btn-primary" href="#/">Back to dashboard</a>' +
      '</div></div>';
  }
  function render() {
    var parsed = parseHash();
    state.route = parsed.route;
    state.params = parsed.params;
    var viewFn = views[parsed.route] || views.home;
    var root = $('#view');
    if (!root) return;
    document.body.classList.toggle('focus-mode', parsed.route === 'exam-run');
    setSidebar(false);
    var active = parsed.route;
    if (parsed.route === 'notes') active = 'notes-' + parsed.params[0];
    if (parsed.route === 'practice-run' || parsed.route === 'practice-result') active = 'practice';
    if (parsed.route === 'exam-run' || parsed.route === 'exam-result') active = 'exam';
    setActiveNav(active);
    var crumb = $('#crumbs');
    if (crumb) crumb.textContent = titleFor(parsed.route, parsed.params);
    document.title = titleFor(parsed.route, parsed.params) + ' | Computer Fundamentals Review';
    window.scrollTo(0, 0);
    try {
      root.innerHTML = '';
      viewFn(parsed.params, root);
      root.classList.remove('view-enter');
      void root.offsetWidth;
      root.classList.add('view-enter');
    } catch (err) {
      console.error(err);
      root.innerHTML = errorView(err);
    }
    updateCountdowns();
  }
  function register(name, fn) { views[name] = fn; }

  /* ---------- shell ---------- */
  function bindShell() {
    var skip = $('.skip-link');
    if (skip) skip.addEventListener('click', function (e) {
      e.preventDefault();
      var view = $('#view');
      if (view) { view.focus(); view.scrollIntoView(); }
    });
    var menu = $('#menu-btn');
    if (menu) menu.addEventListener('click', function () { setSidebar(!document.body.classList.contains('nav-open')); });
    var scrim = $('#sidebar-scrim');
    if (scrim) scrim.addEventListener('click', function () { setSidebar(false); });
    var themeBtn = $('#theme-toggle');
    if (themeBtn) themeBtn.addEventListener('click', toggleTheme);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        if (modalState) { closeModal(); return; }
        if (document.body.classList.contains('nav-open')) setSidebar(false);
      }
    });
    window.addEventListener('hashchange', render);
    $$('.nav-item').forEach(function (link) {
      link.addEventListener('click', function () { setSidebar(false); });
    });
  }
  function fillCounts() {
    var total = $('#nav-total-count');
    if (total) total.textContent = ALL.length;
    $$('[data-topic-count]').forEach(function (el) {
      var id = el.getAttribute('data-topic-count');
      el.textContent = COUNTS[id] || '';
    });
  }
  function init() {
    setTheme(currentTheme());
    fillCounts();
    bindShell();
    updateCountdowns();
    setInterval(updateCountdowns, 30000);
    if (!location.hash) {
      try { history.replaceState(null, '', '#/'); } catch (e) { location.hash = '#/'; }
    }
    render();
  }

  window.C = {
    $: $, $$: $$, esc: esc, icon: icon, statement: statement, letter: letter, pct: pct, ring: ring,
    shuffle: shuffle, sample: sample, normalize: normalize, matchAnswer: matchAnswer, possibleAnswer: possibleAnswer,
    content: CONTENT, topics: TOPICS, topicMap: TOPIC_MAP, bank: BANK, all: ALL, counts: COUNTS,
    meta: CONTENT.meta, essays: CONTENT.essays, bonus: CONTENT.bonus,
    state: state, register: register, navigate: navigate, render: render,
    openModal: openModal, closeModal: closeModal, toast: toast,
    stats: stats, persistStats: persistStats, recordAnswer: recordAnswer, topicStat: topicStat,
    overallStat: overallStat, recordSession: recordSession, recordExamResult: recordExamResult, resetStats: resetStats,
    readJSON: readJSON, writeJSON: writeJSON, removeKey: removeKey,
    KEYS: { stats: KEY_STATS, exam: KEY_EXAM, result: KEY_RESULT, theme: KEY_THEME },
    topicQuestions: function (id) { return BANK[id] || []; },
    updateCountdowns: updateCountdowns
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else setTimeout(init, 0);
})();
