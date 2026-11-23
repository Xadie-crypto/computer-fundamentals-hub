/* Views: dashboard, notes, question bank, practice engine, progress report. */
(function () {
  'use strict';

  var C = window.C;
  if (!C) return;

  /* ---------------- helpers ---------------- */
  var TYPE_LABEL = { mc: 'Multiple choice', id: 'Identification', tf: 'True or false' };
  var TYPE_SHORT = { mc: 'MC', id: 'ID', tf: 'T/F' };
  var DIFF_LABEL = { 1: 'Easy', 2: 'Medium', 3: 'Hard' };

  function typeLabel(t) { return TYPE_LABEL[t] || 'Mixed'; }
  function typeShort(t) { return TYPE_SHORT[t] || 'Mix'; }
  function diffLabel(d) { return DIFF_LABEL[d] || 'Standard'; }
  function topicName(id) { return C.topicMap[id] ? C.topicMap[id].name : 'Mixed'; }
  function topicLabel(id) { return C.topicMap[id] ? C.topicMap[id].label : 'All topics'; }
  function topicAccent(id) { return C.topicMap[id] ? C.topicMap[id].accent : '#6d766f'; }

  function ring(percent, size, stroke) { return C.ring(percent, size, stroke); }

  function fmtClock(sec) {
    sec = Math.max(0, Math.floor(sec));
    var h = Math.floor(sec / 3600);
    var m = Math.floor((sec % 3600) / 60);
    var s = sec % 60;
    var mm = (m < 10 ? '0' : '') + m;
    var ss = (s < 10 ? '0' : '') + s;
    return h ? h + ':' + mm + ':' + ss : mm + ':' + ss;
  }
  function fmtDuration(sec) {
    var m = Math.floor(sec / 60), s = sec % 60;
    return m + 'm ' + (s < 10 ? '0' : '') + s + 's';
  }
  function fmtDateShort(iso) {
    try {
      var d = new Date(iso);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' · ' +
        d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } catch (e) { return ''; }
  }
  function dateLabelNow() {
    return new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }
  function seenCount(topicId) {
    var n = 0;
    var seen = C.stats.seen || {};
    Object.keys(seen).forEach(function (k) { if (seen[k].topic === topicId) n += 1; });
    return n;
  }
  function responseFilled(q, resp) {
    if (!resp) return false;
    if (q.t === 'mc') return typeof resp.value === 'number';
    if (q.t === 'id') return String(resp.value == null ? '' : resp.value).trim().length > 0;
    if (q.t === 'tf') return typeof resp.value === 'boolean';
    return false;
  }
  function answerText(q, resp) {
    if (!resp) return 'No answer';
    if (q.t === 'mc') return typeof resp.value === 'number' ? C.letter(resp.value) + '. ' + q.o[resp.value] : 'No answer';
    if (q.t === 'id') return String(resp.value || '').trim() || 'No answer';
    if (q.t === 'tf') {
      if (typeof resp.value !== 'boolean') return 'No answer';
      return resp.value ? 'TRUE' : 'FALSE' + (resp.correction ? ' — ' + resp.correction : ' (no replacement given)');
    }
    return '';
  }
  function gradeResponse(q, resp) {
    if (!responseFilled(q, resp)) return false;
    if (q.t === 'mc') return resp.value === q.a;
    if (q.t === 'id') return C.matchAnswer(q, resp.value);
    if (q.t === 'tf') {
      if (resp.value !== q.a) return false;
      if (q.a) return true;
      return C.matchAnswer(q, resp.correction || '');
    }
    return false;
  }
  function safeLabel(d) { return d === 1 ? 'Easy' : d === 2 ? 'Medium' : d === 3 ? 'Hard' : 'Standard'; }

  function chip(text, cls) { return '<span class="chip ' + (cls || '') + '">' + C.esc(text) + '</span>'; }
  function typeChip(t) { return chip(typeShort(t), t === 'mc' ? 'chip-accent' : t === 'id' ? 'chip-ok' : 'chip-ink'); }
  function topicChip(id) { return '<span class="chip" style="border-color:transparent;background:color-mix(in srgb, ' + topicAccent(id) + ' 12%, transparent);color:' + topicAccent(id) + '">' + C.esc(topicLabel(id)) + '</span>'; }

  /* =========================================================
     HOME
     ========================================================= */
  function heroHTML() {
    var meta = C.meta;
    return '<section class="hero">' +
      '<div class="hero-main">' +
        '<p class="eyebrow">Computer Fundamentals · Final review</p>' +
        '<h1>Walk into the exam <em>already ready.</em></h1>' +
        '<p class="hero-sub">Six source decks, distilled into ' + C.all.length + ' practice questions, tight study notes, and a mock final that mirrors the real paper — identification, multiple choice, modified true or false, and essay.</p>' +
        '<div class="hero-actions">' +
          '<a class="btn btn-primary btn-lg" href="#/practice">' + C.icon('target') + ' Start practising</a>' +
          '<a class="btn btn-ghost btn-lg" href="#/notes/systems">' + C.icon('book') + ' Read the notes</a>' +
        '</div>' +
        '<div class="hero-facts">' +
          '<span>' + C.icon('layers') + ' 6 topics · ' + C.all.length + ' questions</span>' +
          '<span>' + C.icon('timer') + ' ' + meta.durationMinutes + ' minutes</span>' +
          '<span>' + C.icon('flag') + ' ' + meta.totalPoints + ' points + ' + meta.bonusPoints + ' bonus</span>' +
        '</div>' +
      '</div>' +
      '<div class="hero-aside">' +
        '<div class="exam-ticket">' +
          '<div class="ticket-label"><span>Final examination</span><b>' + C.esc(meta.examDateLabel) + '</b></div>' +
          '<div class="countdown">' +
            '<div class="cd-unit"><b data-cd="days">00</b><small>Days</small></div>' +
            '<div class="cd-unit"><b data-cd="hours">00</b><small>Hours</small></div>' +
            '<div class="cd-unit"><b data-cd="mins">00</b><small>Mins</small></div>' +
            '<div class="cd-unit"><b data-cd="secs">00</b><small>Secs</small></div>' +
          '</div>' +
          '<div class="ticket-rows">' +
            '<span>Scheduled <b id="hero-countdown-label">Calculating…</b></span>' +
            '<span>Time <b>' + C.esc(meta.examTime) + '</b></span>' +
            '<span>Room <b>' + C.esc(meta.room) + '</b></span>' +
          '</div>' +
        '</div>' +
        '<div class="hero-sections">' +
          meta.sections.map(function (s) {
            return '<div class="hs-row"><i>' + s.numeral + '</i><span>' + C.esc(s.name) + '</span><b>' + s.total + '</b></div>';
          }).join('') +
          '<div class="hs-note">' + meta.sections.reduce(function (a, s) { return a + s.total; }, 0) + ' points total · up to ' + meta.bonusPoints + ' bonus</div>' +
        '</div>' +
      '</div>' +
    '</section>';
  }

  function quickHTML() {
    return '<div class="quick-grid">' +
      '<a class="quick-card" href="#/practice">' + C.icon('target') + '<span><strong>Practice set</strong><small>Timed or guided</small></span></a>' +
      '<a class="quick-card" href="#/bank">' + C.icon('layers') + '<span><strong>Question bank</strong><small>' + C.all.length + ' with answers</small></span></a>' +
      '<a class="quick-card" href="#/exam">' + C.icon('spark') + '<span><strong>Mock final</strong><small>60 pts · 2 hours</small></span></a>' +
      '<a class="quick-card" href="#/progress">' + C.icon('chart') + '<span><strong>Readiness</strong><small>Accuracy by topic</small></span></a>' +
    '</div>';
  }

  function topicCard(t, i) {
    var stat = C.topicStat(t.id);
    var seen = seenCount(t.id);
    var total = C.topicQuestions(t.id).length;
    var acc = stat.acc;
    var bar = acc == null ? 0 : acc;
    return '<article class="topic-card" style="--tc:' + t.accent + '">' +
      '<div class="topic-top"><span class="topic-num">' + String(i + 1).padStart(2, '0') + '</span><span class="topic-source">' + C.esc(t.source.replace(/\.(pdf|docx)$/i, '')) + '</span></div>' +
      '<h3><a href="#/notes/' + t.id + '">' + C.esc(t.name) + '</a></h3>' +
      '<p>' + C.esc(t.blurb) + '</p>' +
      '<div class="topic-meta"><span>' + total + ' questions</span><span>' + (t.minutes || 15) + ' min read</span><span>' + seen + ' seen</span></div>' +
      '<div class="topic-meter">' +
        '<div class="topic-meter-top"><span>' + (acc == null ? 'Not started' : 'Accuracy') + '</span><b>' + (acc == null ? '—' : acc + '%') + '</b></div>' +
        '<div class="progress-track" style="--tc:' + t.accent + '"><i style="width:' + bar + '%;background:' + t.accent + '"></i></div>' +
      '</div>' +
      '<div class="topic-links">' +
        '<a href="#/notes/' + t.id + '">Notes</a>' +
        '<a href="#/practice" data-practice-topic="' + t.id + '">Practice</a>' +
        '<a class="solid" href="#/bank" data-bank-topic="' + t.id + '">Question bank</a>' +
      '</div>' +
    '</article>';
  }

  function blueprintHTML() {
    var sections = C.meta.sections;
    return '<div class="panel">' +
      '<div class="panel-head"><div><h3>The paper at a glance</h3><p class="sub">Follows the exam pointers exactly — four sections, 60 points.</p></div>' + C.icon('flag') + '</div>' +
      '<div class="blueprint">' +
        sections.map(function (s) {
          return '<div class="blue-row">' +
            '<span class="blue-num">' + s.numeral + '</span>' +
            '<div><strong>' + C.esc(s.name) + '</strong><small>' + s.items + ' item' + (s.items > 1 ? 's' : '') + ' · ' + C.esc(s.hint) + '</small></div>' +
            '<div class="blue-points"><b>' + s.total + '</b><small>' + (s.items > 1 ? s.items + ' × ' + s.pointsEach : s.pointsEach + ' pts') + '</small></div>' +
          '</div>';
        }).join('') +
      '</div>' +
      '<div class="blue-total"><span>Sections I–IV</span><span><b>60 points</b> · plus up to 5 bonus</span></div>' +
    '</div>';
  }

  function readinessHTML() {
    var overall = C.overallStat();
    var acc = overall.acc;
    var copy, sub;
    if (overall.n === 0) {
      copy = 'No attempts logged yet';
      sub = 'Answer a few practice questions and this panel starts tracking accuracy by topic.';
    } else if (acc >= 85) {
      copy = 'Exam-ready range';
      sub = overall.n + ' attempts at ' + acc + '% accuracy. Keep the streak with a timed set and one full mock.';
    } else if (acc >= 65) {
      copy = 'Solid, still tightening';
      sub = overall.n + ' attempts at ' + acc + '%. Revisit the lowest bars, then retry the questions you missed.';
    } else {
      copy = 'Early days';
      sub = overall.n + ' attempts at ' + acc + '%. Read the notes for the weakest topic before drilling again.';
    }
    return '<div class="panel">' +
      '<div class="panel-head"><div><h3>Readiness snapshot</h3><p class="sub">All practice attempts on this device.</p></div><a class="head-link" href="#/progress">Report ' + C.icon('arrow') + '</a></div>' +
      '<div class="readiness">' +
        '<div class="readiness-top">' +
          '<div class="ring-wrap">' + ring(acc || 0, 118, 8) + '<div class="ring-label"><b>' + (acc == null ? '—' : acc + '%') + '</b><small>accuracy</small></div></div>' +
          '<div class="readiness-copy"><h3>' + copy + '</h3><p>' + sub + '</p><a class="btn btn-ghost btn-small" href="#/practice">Start a set ' + C.icon('arrow') + '</a></div>' +
        '</div>' +
        '<div class="readiness-list">' +
          C.topics.map(function (t) {
            var stat = C.topicStat(t.id);
            return '<div class="readiness-row">' +
              '<span>' + C.esc(t.label) + '</span>' +
              '<div class="progress-track"><i style="width:' + (stat.acc || 0) + '%;background:' + t.accent + '"></i></div>' +
              '<b>' + (stat.acc == null ? '—' : stat.acc + '%') + '</b>' +
            '</div>';
          }).join('') +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function sourcesHTML() {
    var rows = [
      { tag: 'PDF', name: '6-Systems-Software.pdf', desc: 'System software, five types, operating systems, firmware, drivers.' },
      { tag: 'PDF', name: '7-Application-Software.pdf', desc: 'Ten categories, freeware, open source, shareware, adware, crippleware.' },
      { tag: 'PDF', name: '8-Programming-Languages.pdf', desc: 'Five generations, source code, assemblers, compilers, interpreters.' },
      { tag: 'PDF', name: '9-Importance-of-Computer-Networks.pdf', desc: 'Components, devices, LAN/MAN/WAN, topologies, protocols.' },
      { tag: 'DOCX', name: 'TRENDS AND LAWS NOTES.docx', desc: 'Digital Philippines 2022, social media, 1G–5G, edge computing, R.A. 10175 and 10173.' },
      { tag: 'DOCX', name: 'COMPF DETAILS + POINTERS.docx', desc: 'Exam schedule, point distribution, and the emphasis each section demands.' }
    ];
    return '<div class="panel">' +
      '<div class="panel-head"><div><h3>Where every question comes from</h3><p class="sub">Nothing outside these six sources; nothing important left out.</p></div>' + C.icon('book') + '</div>' +
      '<div class="sources">' +
        rows.map(function (r) {
          return '<div class="source-row"><span class="file-tag">' + r.tag + '</span><div><strong>' + C.esc(r.name) + '</strong><small>' + C.esc(r.desc) + '</small></div></div>';
        }).join('') +
      '</div>' +
    '</div>';
  }

  function bindTopicShortcuts(root) {
    C.$$('[data-practice-topic]', root).forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        var setup = ensureSetup();
        setup.topic = el.getAttribute('data-practice-topic');
        setup.type = 'all';
        setup.count = 20;
        C.navigate('practice');
      });
    });
    C.$$('[data-bank-topic]', root).forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        var bank = ensureBank();
        bank.topic = el.getAttribute('data-bank-topic');
        bank.type = 'all';
        bank.page = 1;
        C.navigate('bank');
      });
    });
  }

  C.register('home', function (params, root) {
    root.innerHTML =
      heroHTML() +
      quickHTML() +
      '<div class="section-head"><div><h2>Six topics</h2><p>Each deck has its own notes and a full question pool.</p></div><a class="head-link" href="#/bank">All ' + C.all.length + ' questions ' + C.icon('arrow') + '</a></div>' +
      '<div class="topic-grid">' + C.topics.map(topicCard).join('') + '</div>' +
      '<div class="section-head"><div><h2>Exam alignment</h2><p>What the paper asks for, and where you currently stand.</p></div></div>' +
      '<div class="dash-grid">' + blueprintHTML() + readinessHTML() + '</div>' +
      '<div class="section-head"><div><h2>Source coverage</h2><p>Every provided file is represented in the notes and the bank.</p></div></div>' +
      sourcesHTML() +
      '<div class="section-head"><div><h2>How to use this</h2><p>Three passes, roughly one evening each.</p></div></div>' +
      '<div class="how-grid">' +
        '<div class="how-step"><b>01</b><h4>Read one topic</h4><p>Ten to twenty minutes of tight notes, ending with the pointers the exam actually emphasizes.</p></div>' +
        '<div class="how-step"><b>02</b><h4>Drill its bank</h4><p>Start with 20 questions in guided mode. Read each explanation, then retry only the misses.</p></div>' +
        '<div class="how-step"><b>03</b><h4>Sit the mock final</h4><p>Two hours, 60 points, sections I–IV. Grade the essay against the rubric, then review every item.</p></div>' +
      '</div>';
    bindTopicShortcuts(root);
  });

  /* =========================================================
     NOTES
     ========================================================= */
  C.register('notes', function (params, root) {
    var id = params[0];
    if (!id || !C.topicMap[id]) {
      root.innerHTML =
        '<div class="page-head">' +
          '<p class="eyebrow">Study notes</p>' +
          '<h1>The six topics, distilled.</h1>' +
          '<p class="lede">Short, exam-shaped notes built from the six provided sources. Use the pointers at the end of each deck to decide what to memorize.</p>' +
        '</div>' +
        '<div class="topic-grid">' + C.topics.map(topicCard).join('') + '</div>';
      bindTopicShortcuts(root);
      return;
    }

    var t = C.topicMap[id];
    var idx = C.topics.indexOf(t);
    var next = C.topics[(idx + 1) % C.topics.length];
    var total = C.topicQuestions(id).length;
    var toc = t.notes.map(function (n, i) {
      return '<button class="toc-link" data-scroll="note-' + t.id + '-' + n.id + '"><b>' + String(i + 1).padStart(2, '0') + '</b><span>' + C.esc(n.title) + '</span></button>';
    }).join('');

    root.innerHTML =
      '<div class="page-head">' +
        '<a class="back" href="#/">' + C.icon('left') + ' Dashboard</a>' +
        '<p class="eyebrow">Study notes · ' + C.esc(t.label) + '</p>' +
        '<h1>' + C.esc(t.name) + '</h1>' +
        '<p class="lede">' + C.esc(t.blurb) + '</p>' +
        '<div class="head-chips">' +
          '<span class="chip">' + C.esc(t.source) + '</span>' +
          '<span class="chip">' + total + ' questions</span>' +
          '<span class="chip">' + (t.minutes || 15) + ' min read</span>' +
          '<span class="chip chip-accent">On the exam pointers</span>' +
        '</div>' +
        (t.pointers && t.pointers.length ? '<div class="pointer-list">' + t.pointers.map(function (p) {
          return '<span>' + C.icon('check') + C.esc(p) + '</span>';
        }).join('') + '</div>' : '') +
      '</div>' +
      '<div class="notes-layout">' +
        '<div class="notes-body">' +
          t.notes.map(function (n) {
            return '<section class="note-card" id="note-' + t.id + '-' + n.id + '"><h2>' + C.esc(n.title) + '</h2>' + n.html + '</section>';
          }).join('') +
          '<div class="notes-cta">' +
            '<div><h3>Done reading ' + C.esc(t.label) + '?</h3><p>Turn the notes into recall with a set of ' + Math.min(20, total) + ' questions.</p></div>' +
            '<div class="actions"><button class="btn btn-primary" data-practice-topic="' + t.id + '">' + C.icon('target') + ' Practise this topic</button></div>' +
          '</div>' +
        '</div>' +
        '<aside class="notes-toc">' +
          '<h4>On this page</h4>' + toc +
          '<div style="margin-top:14px;padding-top:12px;border-top:1px solid var(--line);display:grid;gap:7px">' +
            '<a class="toc-link" href="#/bank" data-bank-topic="' + t.id + '"><b>→</b><span>Question bank</span></a>' +
            '<a class="toc-link" href="#/notes/' + next.id + '"><b>→</b><span>Next: ' + C.esc(next.label) + '</span></a>' +
          '</div>' +
        '</aside>' +
      '</div>';

    C.$$('[data-scroll]', root).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var el = document.getElementById(btn.getAttribute('data-scroll'));
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
    bindTopicShortcuts(root);
  });

  /* =========================================================
     QUESTION BANK
     ========================================================= */
  function ensureBank() {
    if (!C.state.bank) C.state.bank = { topic: 'all', type: 'all', diff: 'all', search: '', page: 1, revealed: {} };
    return C.state.bank;
  }
  function bankFiltered() {
    var b = ensureBank();
    var term = b.search.trim().toLowerCase();
    var list = b.topic === 'all' ? C.all.slice() : C.topicQuestions(b.topic).slice();
    if (b.type !== 'all') list = list.filter(function (q) { return q.t === b.type; });
    if (b.diff !== 'all') list = list.filter(function (q) { return String(q.d) === b.diff; });
    if (term) {
      list = list.filter(function (q) {
        var hay = [q.q, q.e || '', topicName(q.topic)].concat(q.o || []).concat(Array.isArray(q.a) ? q.a : []).join(' ').toLowerCase();
        return hay.indexOf(term) !== -1;
      });
    }
    return list;
  }
  function bankItem(q, b) {
    var on = !!b.revealed[q.id];
    var answer = q.t === 'tf' ? (q.a ? 'TRUE' : 'FALSE — replace with “' + q.fix + '”') : C.possibleAnswer(q);
    var opts = '';
    if (q.t === 'mc') {
      opts = '<div class="bank-options">' + q.o.map(function (o, i) {
        return '<div class="bank-option' + (on && i === q.a ? ' is-correct' : '') + '"><i>' + C.letter(i) + '</i><span>' + C.esc(o) + '</span></div>';
      }).join('') + '</div>';
    }
    var qtext = q.t === 'tf' ? C.statement(q.q) : C.esc(q.q);
    return '<article class="bank-item">' +
      '<div class="bank-item-head">' + typeChip(q.t) + topicChip(q.topic) + '<span class="chip">' + safeLabel(q.d) + '</span><span class="faint small" style="margin-left:auto">' + C.esc(q.id) + '</span></div>' +
      '<h3>' + qtext + '</h3>' + opts +
      '<div class="bank-answer-row">' +
        '<button class="bank-reveal" data-reveal="' + C.esc(q.id) + '">' + C.icon(on ? 'check' : 'arrow') + (on ? ' Hide answer' : ' Show answer') + '</button>' +
        (on ? '<span class="bank-answer">' + C.esc(answer) + '</span>' : '') +
      '</div>' +
      (on && q.e ? '<div class="bank-explanation">' + C.esc(q.e) + '</div>' : '') +
    '</article>';
  }
  function bankPageHTML(list, b) {
    var perPage = 10;
    var pages = Math.max(1, Math.ceil(list.length / perPage));
    if (b.page > pages) b.page = pages;
    var start = (b.page - 1) * perPage;
    var slice = list.slice(start, start + perPage);
    var items = slice.length
      ? slice.map(function (q) { return bankItem(q, b); }).join('')
      : '<div class="empty-state" style="margin:40px auto"><p class="eyebrow">No matches</p><h3 style="font-family:var(--font-display);font-size:26px;font-weight:500">Nothing in this slice.</h3><p class="muted">Try a different topic, type, difficulty, or search term.</p><button class="btn btn-ghost btn-small" data-clear-bank>Clear filters</button></div>';
    return '<div class="bank-meta"><span>Showing <b>' + (list.length ? start + 1 : 0) + '–' + Math.min(start + perPage, list.length) + '</b> of ' + list.length + ' questions</span><span>' + (b.revealed ? Object.keys(b.revealed).length : 0) + ' revealed</span></div>' +
      '<div class="bank-list">' + items + '</div>' +
      '<div class="pagination">' +
        '<button class="icon-btn" data-page="' + (b.page - 1) + '" aria-label="Previous page"' + (b.page <= 1 ? ' disabled' : '') + '>' + C.icon('left') + '</button>' +
        '<span>Page ' + b.page + ' of ' + pages + '</span>' +
        '<button class="icon-btn" data-page="' + (b.page + 1) + '" aria-label="Next page"' + (b.page >= pages ? ' disabled' : '') + '>' + C.icon('right') + '</button>' +
      '</div>';
  }
  function refreshBank(root) {
    var b = ensureBank();
    var list = bankFiltered();
    var box = C.$('#bank-results', root);
    if (box) box.innerHTML = bankPageHTML(list, b);
    bindBankResults(root);
  }
  function bindBankResults(root) {
    var box = C.$('#bank-results', root);
    if (!box || box.dataset.bound === '1') return;
    box.dataset.bound = '1';
    box.addEventListener('click', function (e) {
      var reveal = e.target.closest('[data-reveal]');
      if (reveal) {
        var b = ensureBank();
        var id = reveal.getAttribute('data-reveal');
        if (b.revealed[id]) delete b.revealed[id]; else b.revealed[id] = true;
        refreshBank(root);
        return;
      }
      var page = e.target.closest('[data-page]');
      if (page && !page.disabled) {
        var b2 = ensureBank();
        b2.page = Math.max(1, parseInt(page.getAttribute('data-page'), 10) || 1);
        refreshBank(root);
        return;
      }
      if (e.target.closest('[data-clear-bank]')) {
        C.state.bank = { topic: 'all', type: 'all', diff: 'all', search: '', page: 1, revealed: {} };
        C.render();
      }
    });
  }

  C.register('bank', function (params, root) {
    var b = ensureBank();
    root.innerHTML =
      '<div class="page-head" style="margin-bottom:20px">' +
        '<a class="back" href="#/">' + C.icon('left') + ' Dashboard</a>' +
        '<p class="eyebrow">Question bank</p>' +
        '<h1>Every question, with the answer.</h1>' +
        '<p class="lede">Filter by topic, type, or difficulty. Reveal the key when you want to check yourself — the explanation is attached.</p>' +
      '</div>' +
      '<div class="filters">' +
        '<div class="field search-wrap">' + C.icon('search') + '<input class="input" id="bank-search" type="search" placeholder="Search questions, options, answers…" value="' + C.esc(b.search) + '" aria-label="Search questions"></div>' +
        '<div class="field"><label for="bank-topic">Topic</label><select class="select" id="bank-topic"><option value="all">All topics</option>' +
          C.topics.map(function (t) { return '<option value="' + t.id + '"' + (b.topic === t.id ? ' selected' : '') + '>' + C.esc(t.name) + '</option>'; }).join('') +
        '</select></div>' +
        '<div class="field"><label for="bank-type">Type</label><select class="select" id="bank-type">' +
          '<option value="all"' + (b.type === 'all' ? ' selected' : '') + '>All types</option>' +
          '<option value="mc"' + (b.type === 'mc' ? ' selected' : '') + '>Multiple choice</option>' +
          '<option value="id"' + (b.type === 'id' ? ' selected' : '') + '>Identification</option>' +
          '<option value="tf"' + (b.type === 'tf' ? ' selected' : '') + '>True or false</option>' +
        '</select></div>' +
        '<div class="field"><label for="bank-diff">Difficulty</label><select class="select" id="bank-diff">' +
          '<option value="all"' + (b.diff === 'all' ? ' selected' : '') + '>Any level</option>' +
          '<option value="1"' + (b.diff === '1' ? ' selected' : '') + '>Easy</option>' +
          '<option value="2"' + (b.diff === '2' ? ' selected' : '') + '>Medium</option>' +
          '<option value="3"' + (b.diff === '3' ? ' selected' : '') + '>Hard</option>' +
        '</select></div>' +
      '</div>' +
      '<div id="bank-results"></div>';

    refreshBank(root);

    var search = C.$('#bank-search', root);
    var timer = null;
    search.addEventListener('input', function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        var b2 = ensureBank();
        b2.search = search.value;
        b2.page = 1;
        refreshBank(root);
      }, 180);
    });
    C.$('#bank-topic', root).addEventListener('change', function (e) { var b2 = ensureBank(); b2.topic = e.target.value; b2.page = 1; refreshBank(root); });
    C.$('#bank-type', root).addEventListener('change', function (e) { var b2 = ensureBank(); b2.type = e.target.value; b2.page = 1; refreshBank(root); });
    C.$('#bank-diff', root).addEventListener('change', function (e) { var b2 = ensureBank(); b2.diff = e.target.value; b2.page = 1; refreshBank(root); });
  });

  /* =========================================================
     PRACTICE — SETUP
     ========================================================= */
  function ensureSetup() {
    if (!C.state.setup) C.state.setup = { topic: 'mixed', type: 'all', count: 20, mode: 'instant' };
    var s = C.state.setup;
    if (s.topic !== 'mixed' && !C.topicMap[s.topic]) s.topic = 'mixed';
    if (['all', 'mc', 'id', 'tf'].indexOf(s.type) === -1) s.type = 'all';
    if (['instant', 'test'].indexOf(s.mode) === -1) s.mode = 'instant';
    return s;
  }
  function poolFor(setup) {
    var base = setup.topic === 'mixed' ? C.all : C.topicQuestions(setup.topic);
    return setup.type === 'all' ? base.slice() : base.filter(function (q) { return q.t === setup.type; });
  }
  function setupSummaryHTML(setup) {
    var pool = poolFor(setup);
    var actual = Math.min(setup.count, pool.length);
    var counts = { mc: 0, id: 0, tf: 0 };
    pool.forEach(function (q) { counts[q.t] = (counts[q.t] || 0) + 1; });
    var mins = Math.max(3, Math.round(actual * (setup.mode === 'instant' ? 0.8 : 0.55)));
    return '<div class="summary-line"><span>Topic</span><b>' + C.esc(setup.topic === 'mixed' ? 'All six topics' : topicName(setup.topic)) + '</b></div>' +
      '<div class="summary-line"><span>Format</span><b>' + C.esc(setup.type === 'all' ? 'Mixed types' : typeLabel(setup.type)) + '</b></div>' +
      '<div class="summary-line"><span>Questions</span><b>' + actual + '</b></div>' +
      '<div class="summary-line"><span>Mode</span><b>' + (setup.mode === 'instant' ? 'Guided' : 'Test') + '</b></div>' +
      '<div class="summary-line"><span>Estimated time</span><b>~' + mins + ' min</b></div>' +
      '<div class="summary-line"><span>Available pool</span><b>' + pool.length + '</b></div>' +
      '<p class="summary-note" style="margin-top:10px">Pool: ' + counts.mc + ' multiple choice · ' + counts.id + ' identification · ' + counts.tf + ' true or false.</p>' +
      '<p class="summary-note">' + (setup.mode === 'instant'
        ? 'Each answer is checked immediately, with the explanation. Best for learning.'
        : 'Answers stay hidden until the end. Best for simulating the paper.') + '</p>';
  }
  function refreshSetup(root) {
    var setup = ensureSetup();
    C.$$('[data-setup-topic]', root).forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-setup-topic') === setup.topic);
    });
    C.$$('[data-setup-type]', root).forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-setup-type') === setup.type);
    });
    C.$$('[data-setup-count]', root).forEach(function (btn) {
      btn.classList.toggle('active', parseInt(btn.getAttribute('data-setup-count'), 10) === setup.count);
    });
    C.$$('[data-setup-mode]', root).forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-setup-mode') === setup.mode);
    });
    var sum = C.$('#setup-summary', root);
    if (sum) sum.innerHTML = setupSummaryHTML(setup);
    var pool = poolFor(setup);
    var start = C.$('#setup-start', root);
    if (start) {
      start.textContent = 'Start ' + Math.min(setup.count, pool.length) + '-question set';
      start.disabled = pool.length === 0;
    }
  }
  function buildSession(setup) {
    var pool = poolFor(setup);
    var n = Math.min(setup.count, pool.length);
    var questions = C.sample(pool, n);
    var s = {
      config: { topic: setup.topic, type: setup.type, count: setup.count, mode: setup.mode },
      questions: questions,
      index: 0,
      responses: {},
      checked: {},
      correct: {},
      startedAt: Date.now(),
      finished: false
    };
    return s;
  }
  function startPractice(setup) {
    C.state.practice = buildSession(setup);
    C.state.practiceResult = null;
    C.navigate('practice-run');
  }

  C.register('practice', function (params, root) {
    var setup = ensureSetup();
    var pool = poolFor(setup);
    var counts = { mc: 0, id: 0, tf: 0 };
    pool.forEach(function (q) { counts[q.t] = (counts[q.t] || 0) + 1; });
    var active = C.state.practice && !C.state.practice.finished ? C.state.practice : null;

    root.innerHTML =
      '<div class="page-head">' +
        '<a class="back" href="#/">' + C.icon('left') + ' Dashboard</a>' +
        '<p class="eyebrow">Practice</p>' +
        '<h1>Build a practice set.</h1>' +
        '<p class="lede">Pick the topic and format. Guided mode checks every answer with an explanation; test mode holds feedback until the end.</p>' +
      '</div>' +
      (active ? '<div class="resume-banner"><span class="chip chip-accent">In progress</span><div><strong>' + C.esc(topicLabel(active.config.topic) === 'All topics' ? 'All topics' : topicName(active.config.topic)) + '</strong> · question ' + (active.index + 1) + ' of ' + active.questions.length + ' · ' + Object.keys(active.responses).length + ' answered</div><div class="spacer"></div><button class="btn btn-primary btn-small" id="resume-set">Resume</button><button class="btn btn-ghost btn-small" id="discard-set">Discard</button></div>' : '') +
      '<div class="setup-layout">' +
        '<div class="panel setup-panel">' +
          '<div class="setup-block">' +
            '<h3>Topic</h3><p class="hint">One deck, or a mixed set across all six.</p>' +
            '<div class="topic-options">' +
              '<button class="topic-option' + (setup.topic === 'mixed' ? ' active' : '') + '" data-setup-topic="mixed"><span class="dot" style="--tc:var(--accent);background:var(--accent)"></span>All topics<small>' + C.all.length + '</small></button>' +
              C.topics.map(function (t) {
                return '<button class="topic-option' + (setup.topic === t.id ? ' active' : '') + '" data-setup-topic="' + t.id + '"><span class="dot" style="background:' + t.accent + '"></span>' + C.esc(t.label) + '<small>' + C.topicQuestions(t.id).length + '</small></button>';
              }).join('') +
            '</div>' +
          '</div>' +
          '<div class="setup-block">' +
            '<h3>Question type</h3><p class="hint">Use the exam formats so recall transfers directly.</p>' +
            '<div class="seg">' +
              '<button data-setup-type="all" class="' + (setup.type === 'all' ? 'active' : '') + '">Mixed</button>' +
              '<button data-setup-type="mc" class="' + (setup.type === 'mc' ? 'active' : '') + '">Multiple choice</button>' +
              '<button data-setup-type="id" class="' + (setup.type === 'id' ? 'active' : '') + '">Identification</button>' +
              '<button data-setup-type="tf" class="' + (setup.type === 'tf' ? 'active' : '') + '">True or false</button>' +
            '</div>' +
          '</div>' +
          '<div class="setup-block">' +
            '<h3>How many questions</h3><p class="hint">Counts cap automatically if the pool is smaller.</p>' +
            '<div class="seg">' +
              [10, 20, 25, 50].map(function (n) {
                return '<button data-setup-count="' + n + '" class="' + (setup.count === n ? 'active' : '') + '">' + n + '</button>';
              }).join('') +
            '</div>' +
          '</div>' +
          '<div class="setup-block">' +
            '<h3>Mode</h3><p class="hint">Choose how feedback arrives.</p>' +
            '<div class="mode-options">' +
              '<button class="mode-option' + (setup.mode === 'instant' ? ' active' : '') + '" data-setup-mode="instant"><strong>Guided feedback</strong><span>Check each answer as you go. Explanations appear immediately.</span></button>' +
              '<button class="mode-option' + (setup.mode === 'test' ? ' active' : '') + '" data-setup-mode="test"><strong>Test mode</strong><span>Answer the whole set first; see the key and explanations at the end.</span></button>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<aside class="panel setup-summary">' +
          '<div class="panel-head"><h3>Your set</h3>' + C.icon('target') + '</div>' +
          '<div id="setup-summary">' + setupSummaryHTML(setup) + '</div>' +
          '<button class="btn btn-primary btn-block btn-lg" id="setup-start" style="margin-top:14px">Start set</button>' +
          '<p class="summary-note">Progress is saved on this device. You can leave and resume mid-set.</p>' +
          '<a class="btn btn-ghost btn-block btn-small" href="#/exam" style="margin-top:2px">' + C.icon('spark') + ' Or sit the full mock</a>' +
        '</aside>' +
      '</div>';

    C.$$('[data-setup-topic]', root).forEach(function (btn) {
      btn.addEventListener('click', function () { ensureSetup().topic = btn.getAttribute('data-setup-topic'); refreshSetup(root); });
    });
    C.$$('[data-setup-type]', root).forEach(function (btn) {
      btn.addEventListener('click', function () { ensureSetup().type = btn.getAttribute('data-setup-type'); refreshSetup(root); });
    });
    C.$$('[data-setup-count]', root).forEach(function (btn) {
      btn.addEventListener('click', function () { ensureSetup().count = parseInt(btn.getAttribute('data-setup-count'), 10); refreshSetup(root); });
    });
    C.$$('[data-setup-mode]', root).forEach(function (btn) {
      btn.addEventListener('click', function () { ensureSetup().mode = btn.getAttribute('data-setup-mode'); refreshSetup(root); });
    });
    C.$('#setup-start', root).addEventListener('click', function () { startPractice(ensureSetup()); });
    if (active) {
      C.$('#resume-set', root).addEventListener('click', function () { C.navigate('practice-run'); });
      C.$('#discard-set', root).addEventListener('click', function () {
        C.state.practice = null;
        C.render();
      });
    }
  });

  /* =========================================================
     PRACTICE — RUNNER
     ========================================================= */
  var practiceTimer = null;
  function stopPracticeTimer() { if (practiceTimer) { clearInterval(practiceTimer); practiceTimer = null; } }

  function renderRunHTML(s, root) {
    var q = s.questions[s.index];
    var total = s.questions.length;
    var resp = s.responses[q.id] || {};
    var isChecked = !!s.checked[q.id];
    var answeredCount = s.questions.filter(function (x) { return responseFilled(x, s.responses[x.id]); }).length;
    var meta = C.topicMap[q.topic];

    var body = '';
    if (q.t === 'mc') {
      body = '<div class="opt-list">' + q.o.map(function (o, i) {
        var cls = '';
        if (isChecked) {
          if (i === q.a) cls = ' correct';
          else if (resp.value === i) cls = ' wrong';
        } else if (resp.value === i) cls = ' selected';
        return '<button class="opt' + cls + '" data-opt="' + i + '"' + (isChecked ? ' disabled' : '') + '><span class="key">' + C.letter(i) + '</span><span>' + C.esc(o) + '</span></button>';
      }).join('') + '</div>';
    } else if (q.t === 'id') {
      body = '<div class="answer-area"><label class="small muted" for="run-answer" style="display:block;margin-bottom:6px">Type the term, law, or concept</label>' +
        '<input class="answer-input" id="run-answer" type="text" autocomplete="off" placeholder="Your answer…" value="' + C.esc(resp.value || '') + '"' + (isChecked ? ' disabled' : '') + '></div>';
    } else if (q.t === 'tf') {
      var showCorrection = resp.value === false && (!isChecked || !q.a);
      body = '<div class="tf-statement">' + C.statement(q.q) + '</div>' +
        '<div class="tf-buttons">' +
          '<button class="opt' + (resp.value === true ? ' selected' : '') + (isChecked && q.a ? ' correct' : '') + (isChecked && resp.value === true && !q.a ? ' wrong' : '') + '" data-tf="true"' + (isChecked ? ' disabled' : '') + '>' + C.icon('check') + ' TRUE</button>' +
          '<button class="opt' + (resp.value === false ? ' selected' : '') + (isChecked && !q.a ? ' correct' : '') + (isChecked && resp.value === false && q.a ? ' wrong' : '') + '" data-tf="false"' + (isChecked ? ' disabled' : '') + '>' + C.icon('close') + ' FALSE</button>' +
        '</div>' +
        '<div class="correction' + (showCorrection ? '' : ' hidden') + '" id="tf-correction">' +
          '<label for="run-correction">Replace the underlined phrase with the correct term</label>' +
          '<input class="answer-input" id="run-correction" type="text" autocomplete="off" placeholder="Correct replacement…" value="' + C.esc(resp.correction || '') + '"' + (isChecked ? ' disabled' : '') + '>' +
        '</div>';
    }

    var feedback = '';
    if (isChecked) {
      var ok = !!s.correct[q.id];
      var answerLine = '';
      if (q.t === 'tf') {
        answerLine = q.a ? 'The statement is <b>TRUE</b>.' : 'The statement is <b>FALSE</b> — replace the underlined phrase with <b>' + C.esc(q.fix) + '</b>.';
      } else {
        answerLine = '<b>' + C.esc(C.possibleAnswer(q)) + '</b>';
      }
      feedback = '<div class="feedback ' + (ok ? 'ok' : 'bad') + '">' +
        '<div class="fb-head">' + C.icon(ok ? 'check' : 'close') + (ok ? 'Correct' : 'Not quite') + '</div>' +
        (ok ? '' : '<div class="fb-answer">Answer: ' + answerLine + '</div>') +
        (q.e ? '<div class="fb-exp">' + C.esc(q.e) + '</div>' : '') +
      '</div>';
    }

    var canNext = !isChecked && s.config.mode === 'instant' ? false : true;
    var last = s.index === total - 1;
    var primary;
    if (s.config.mode === 'instant' && !isChecked) {
      primary = '<button class="btn btn-primary" id="run-primary">' + C.icon('check') + ' Check answer</button>';
    } else if (s.config.mode === 'instant') {
      primary = '<button class="btn btn-primary" id="run-primary">' + (last ? 'Finish set' : 'Next question') + ' ' + C.icon('arrow') + '</button>';
    } else {
      primary = '<button class="btn btn-primary" id="run-primary">' + (last ? 'Review & finish' : 'Next question') + ' ' + C.icon('arrow') + '</button>';
    }

    root.innerHTML =
      '<div class="run-wrap">' +
        '<div class="run-head">' +
          '<button class="icon-btn" id="run-exit" aria-label="Exit practice" title="Exit">' + C.icon('left') + '</button>' +
          '<div class="run-title"><h1>' + C.esc(s.config.topic === 'mixed' ? 'Mixed practice' : topicName(s.config.topic)) + '</h1>' +
            '<div class="run-sub"><span>' + C.esc(typeLabel(q.t)) + '</span><span>' + (s.config.mode === 'instant' ? 'Guided feedback' : 'Test mode') + '</span><span>' + total + ' questions</span></div>' +
          '</div>' +
          '<div class="spacer"></div>' +
          '<span class="run-timer">' + C.icon('timer') + '<span id="run-timer">' + fmtClock((Date.now() - s.startedAt) / 1000) + '</span></span>' +
        '</div>' +
        '<div class="run-progress">' +
          '<div class="run-progress-top"><span>Question ' + (s.index + 1) + ' of ' + total + '</span><span><span id="run-answered">' + answeredCount + '</span> answered</span></div>' +
          '<div class="progress-track"><i id="run-bar" style="width:' + Math.round(((s.index + 1) / total) * 100) + '%"></i></div>' +
        '</div>' +
        '<div class="quiz-card">' +
          '<div class="quiz-meta">' + typeChip(q.t) + topicChip(q.topic) + '<span class="chip">' + safeLabel(q.d) + '</span></div>' +
          (q.t === 'tf' ? '' : '<h2 class="quiz-q">' + C.esc(q.q) + '</h2>') +
          body +
          feedback +
          '<div class="quiz-foot">' +
            '<button class="btn btn-ghost btn-small" id="run-prev"' + (s.index === 0 ? ' disabled' : '') + '>' + C.icon('left') + ' Previous</button>' +
            '<span class="spacer"></span>' +
            (canNext ? '<span class="kbd-hint"><span class="kbd">Enter</span> next</span>' : '<span class="kbd-hint"><span class="kbd">1–4</span> choose · <span class="kbd">Enter</span> check</span>') +
            primary +
          '</div>' +
        '</div>' +
      '</div>';

    bindRun(s, root);
  }

  function bindRun(s, root) {
    var q = s.questions[s.index];
    var resp = s.responses[q.id];

    function touchResp() {
      if (!s.responses[q.id]) s.responses[q.id] = { value: null, correction: '' };
      return s.responses[q.id];
    }
    function updateAnswered() {
      var n = s.questions.filter(function (x) { return responseFilled(x, s.responses[x.id]); }).length;
      var el = C.$('#run-answered', root);
      if (el) el.textContent = n;
    }

    C.$$('[data-opt]', root).forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (s.checked[q.id]) return;
        var val = parseInt(btn.getAttribute('data-opt'), 10);
        touchResp().value = val;
        C.$$('[data-opt]', root).forEach(function (b) { b.classList.toggle('selected', b === btn); });
        updateAnswered();
      });
    });

    C.$$('[data-tf]', root).forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (s.checked[q.id]) return;
        var val = btn.getAttribute('data-tf') === 'true';
        touchResp().value = val;
        C.$$('[data-tf]', root).forEach(function (b) { b.classList.toggle('selected', b === btn); });
        var corr = C.$('#tf-correction', root);
        if (corr) corr.classList.toggle('hidden', val !== false);
        updateAnswered();
      });
    });

    var answerInput = C.$('#run-answer', root);
    if (answerInput) {
      answerInput.addEventListener('input', function () { touchResp().value = answerInput.value; updateAnswered(); });
      if (!s.checked[q.id]) setTimeout(function () { answerInput.focus(); }, 60);
    }
    var corrInput = C.$('#run-correction', root);
    if (corrInput) {
      corrInput.addEventListener('input', function () { touchResp().correction = corrInput.value; updateAnswered(); });
    }

    C.$('#run-prev', root).addEventListener('click', function () {
      if (s.index > 0) { s.index -= 1; renderRunHTML(s, root); }
    });
    C.$('#run-exit', root).addEventListener('click', function () {
      C.openModal({
        title: 'Leave this set?',
        body: '<p>Your answers stay in this browser tab, so you can resume from the practice page. Nothing is scored until you finish.</p>',
        actions: [
          { label: 'Keep working', kind: 'ghost' },
          { label: 'Leave set', kind: 'primary', onClick: function () { C.navigate('practice'); } }
        ]
      });
    });

    C.$('#run-primary', root).addEventListener('click', function () {
      if (s.config.mode === 'instant' && !s.checked[q.id]) {
        var r = s.responses[q.id];
        if (!responseFilled(q, r)) { C.toast('Choose or type an answer first.'); return; }
        if (q.t === 'tf' && r.value === false && !String(r.correction || '').trim()) {
          C.toast('For FALSE, add the correct replacement phrase.');
          return;
        }
        var ok = gradeResponse(q, r);
        s.checked[q.id] = true;
        s.correct[q.id] = ok;
        C.recordAnswer(q, ok);
        renderRunHTML(s, root);
        return;
      }
      if (s.config.mode === 'test') {
        var resp2 = s.responses[q.id];
        if (q.t === 'tf' && resp2 && resp2.value === false && !String(resp2.correction || '').trim()) {
          C.toast('For FALSE, add the correct replacement phrase.');
          return;
        }
      }
      if (s.index < s.questions.length - 1) {
        s.index += 1;
        renderRunHTML(s, root);
      } else {
        requestFinish(s);
      }
    });

    document.onkeydown = function (e) {
      if (C.state.route !== 'practice-run' || C.state.practice !== s) return;
      var tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.metaKey || e.ctrlKey || e.altKey) {
        if (e.key === 'Enter' && tag === 'input') {
          e.preventDefault();
          var btn = C.$('#run-primary', root);
          if (btn) btn.click();
        }
        return;
      }
      if (q.t === 'mc' && /^[1-4]$/.test(e.key) && !s.checked[q.id]) {
        var opt = C.$('[data-opt="' + (parseInt(e.key, 10) - 1) + '"]', root);
        if (opt) { e.preventDefault(); opt.click(); }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        var primary = C.$('#run-primary', root);
        if (primary) primary.click();
      } else if (e.key === 'ArrowRight' && s.index < s.questions.length - 1) {
        s.index += 1; renderRunHTML(s, root);
      } else if (e.key === 'ArrowLeft' && s.index > 0) {
        s.index -= 1; renderRunHTML(s, root);
      }
    };
  }

  function requestFinish(s) {
    var unanswered = s.questions.filter(function (q) { return !responseFilled(q, s.responses[q.id]); }).length;
    if (!unanswered) { finishPractice(s); return; }
    C.openModal({
      title: unanswered + ' question' + (unanswered > 1 ? 's' : '') + ' unanswered',
      body: '<p>Unanswered items will be marked wrong. You can still go back before submitting.</p><div class="modal-list"><div><span>Answered</span><b>' + (s.questions.length - unanswered) + '</b></div><div><span>Unanswered</span><b>' + unanswered + '</b></div><div><span>Total</span><b>' + s.questions.length + '</b></div></div>',
      actions: [
        { label: 'Keep working', kind: 'ghost' },
        { label: 'Submit set', kind: 'primary', onClick: function () { finishPractice(s); } }
      ]
    });
  }

  function finishPractice(s) {
    if (s.finished) return;
    var correct = 0;
    var byType = {};
    var byTopic = {};
    var results = {};
    s.questions.forEach(function (q) {
      var resp = s.responses[q.id];
      var ok = gradeResponse(q, resp);
      results[q.id] = ok;
      if (ok) correct += 1;
      if (!byType[q.t]) byType[q.t] = { n: 0, c: 0 };
      byType[q.t].n += 1;
      if (ok) byType[q.t].c += 1;
      if (!byTopic[q.topic]) byTopic[q.topic] = { n: 0, c: 0 };
      byTopic[q.topic].n += 1;
      if (ok) byTopic[q.topic].c += 1;
      if (s.config.mode === 'test' && responseFilled(q, resp)) C.recordAnswer(q, ok);
    });
    var durationSec = Math.max(1, Math.round((Date.now() - s.startedAt) / 1000));
    s.finished = true;
    var result = {
      config: s.config,
      date: new Date().toISOString(),
      questions: s.questions,
      responses: s.responses,
      results: results,
      correct: correct,
      total: s.questions.length,
      byType: byType,
      byTopic: byTopic,
      durationSec: durationSec,
      filter: 'all'
    };
    C.state.practiceResult = result;
    C.state.practice = null;
    C.recordSession({
      kind: 'practice',
      topic: s.config.topic,
      type: s.config.type,
      mode: s.config.mode,
      count: s.questions.length,
      correct: correct,
      total: s.questions.length,
      durationSec: durationSec
    });
    stopPracticeTimer();
    document.onkeydown = null;
    C.navigate('practice-result');
  }

  C.register('practice-run', function (params, root) {
    var s = C.state.practice;
    if (!s) { root.innerHTML = '<div class="empty-state"><h1>No set in progress.</h1><p class="muted">Build one first.</p><a class="btn btn-primary" href="#/practice">Open practice setup</a></div>'; return; }
    if (s.finished) { C.navigate('practice-result'); return; }
    if (s.index >= s.questions.length) s.index = s.questions.length - 1;
    renderRunHTML(s, root);
    stopPracticeTimer();
    practiceTimer = setInterval(function () {
      if (C.state.route !== 'practice-run' || C.state.practice !== s) { stopPracticeTimer(); return; }
      var el = document.getElementById('run-timer');
      if (el) el.textContent = fmtClock((Date.now() - s.startedAt) / 1000);
    }, 1000);
  });

  /* =========================================================
     PRACTICE — RESULTS
     ========================================================= */
  function reviewItem(q, resp, ok) {
    var cls = !responseFilled(q, resp) ? ' skipped' : ok ? ' ok' : '';
    var qtext = q.t === 'tf' ? C.statement(q.q) : C.esc(q.q);
    var answer = q.t === 'tf'
      ? (q.a ? 'TRUE' : 'FALSE — replace with “' + C.esc(q.fix) + '”')
      : C.esc(C.possibleAnswer(q));
    return '<div class="review-item' + cls + '">' +
      '<div class="review-top">' + typeChip(q.t) + topicChip(q.topic) + '<span class="chip">' + (ok ? 'Correct' : responseFilled(q, resp) ? 'Missed' : 'Skipped') + '</span></div>' +
      '<div class="review-q">' + qtext + '</div>' +
      '<div class="review-line"><span>Your answer</span><b>' + C.esc(answerText(q, resp)) + '</b></div>' +
      '<div class="review-line answer"><span>Key</span><b>' + answer + '</b></div>' +
      (q.e ? '<div class="review-exp">' + C.esc(q.e) + '</div>' : '') +
    '</div>';
  }
  function reviewListHTML(r) {
    var items = [];
    r.questions.forEach(function (q) {
      var ok = !!r.results[q.id];
      if (r.filter === 'missed' && ok) return;
      if (r.filter === 'correct' && !ok) return;
      items.push(reviewItem(q, r.responses[q.id], ok));
    });
    if (!items.length) return '<p class="muted" style="font-size:12.5px;padding:14px 0">Nothing in this filter.</p>';
    return '<div class="missed-list">' + items.join('') + '</div>';
  }
  function breakdownRows(map, labelFn) {
    var keys = Object.keys(map);
    if (!keys.length) return '<p class="muted small">No data.</p>';
    return keys.map(function (k) {
      var d = map[k];
      var p = Math.round((d.c / d.n) * 100);
      return '<div class="breakdown-row"><span>' + C.esc(labelFn(k)) + '</span><div class="progress-track"><i style="width:' + p + '%"></i></div><b>' + d.c + '/' + d.n + ' · ' + p + '%</b></div>';
    }).join('');
  }

  C.register('practice-result', function (params, root) {
    var r = C.state.practiceResult;
    if (!r) {
      root.innerHTML = '<div class="empty-state"><h1>No result to show.</h1><p class="muted">Finish a practice set first.</p><a class="btn btn-primary" href="#/practice">Build a set</a></div>';
      return;
    }
    var percent = C.pct(r.correct, r.total);
    var headline = percent >= 85 ? 'Sharp work.' : percent >= 65 ? 'Solid progress.' : 'Good start.';
    var sub = percent >= 85
      ? 'That is exam-ready accuracy on this set. Try a harder pool or the full mock next.'
      : percent >= 65
        ? 'Close. Read the explanations below, then retry the missed items before moving on.'
        : 'Read the notes for the weakest topic, then run this set again in guided mode.';

    root.innerHTML =
      '<div class="page-head" style="margin-bottom:20px"><a class="back" href="#/practice">' + C.icon('left') + ' Practice</a></div>' +
      '<div class="result-hero">' +
        '<div class="score-dial">' + ring(percent, 148, 9) + '<div class="ring-label"><b>' + percent + '%</b><small>score</small></div></div>' +
        '<div class="result-copy">' +
          '<p class="eyebrow">Practice complete</p>' +
          '<h1>' + headline + '</h1>' +
          '<p>' + sub + '</p>' +
          '<div class="result-chips">' + chip(r.config.topic === 'mixed' ? 'All topics' : topicName(r.config.topic)) + chip(r.config.type === 'all' ? 'Mixed types' : typeLabel(r.config.type)) + chip(r.config.mode === 'instant' ? 'Guided' : 'Test mode') + chip(r.correct + ' of ' + r.total + ' correct', percent >= 65 ? 'chip-ok' : 'chip-danger') + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="stat-grid">' +
        '<div class="stat-card"><small>Correct</small><b>' + r.correct + '/' + r.total + '</b><span>' + percent + '% accuracy</span></div>' +
        '<div class="stat-card"><small>Time</small><b>' + fmtDuration(r.durationSec) + '</b><span>' + Math.round(r.durationSec / r.total) + 's per item</span></div>' +
        '<div class="stat-card"><small>Topics covered</small><b>' + Object.keys(r.byTopic).length + '</b><span>of 6 in the course</span></div>' +
        '<div class="stat-card"><small>Missed</small><b>' + (r.total - r.correct) + '</b><span>review below</span></div>' +
      '</div>' +
      '<div class="dash-grid">' +
        '<div class="panel"><div class="panel-head"><h3>By question type</h3></div><div class="breakdown">' + breakdownRows(r.byType, typeLabel) + '</div></div>' +
        '<div class="panel"><div class="panel-head"><h3>By topic</h3></div><div class="breakdown">' + breakdownRows(r.byTopic, topicName) + '</div></div>' +
      '</div>' +
      '<div class="section-head"><div><h2>Review</h2><p>Every item, with the key and explanation.</p></div><div class="seg" id="review-filter">' +
        '<button data-filter="all" class="' + (r.filter === 'all' ? 'active' : '') + '">All</button>' +
        '<button data-filter="missed" class="' + (r.filter === 'missed' ? 'active' : '') + '">Missed</button>' +
        '<button data-filter="correct" class="' + (r.filter === 'correct' ? 'active' : '') + '">Correct</button>' +
      '</div></div>' +
      '<div id="review-list">' + reviewListHTML(r) + '</div>' +
      '<div class="actions-row">' +
        '<button class="btn btn-primary" id="retry-set">' + C.icon('reset') + ' Retry this setup</button>' +
        '<a class="btn btn-ghost" href="#/practice">Build another set</a>' +
        '<a class="btn btn-ghost" href="#/exam">' + C.icon('spark') + ' Sit the mock final</a>' +
      '</div>';

    C.$$('#review-filter [data-filter]', root).forEach(function (btn) {
      btn.addEventListener('click', function () {
        r.filter = btn.getAttribute('data-filter');
        C.$$('#review-filter [data-filter]', root).forEach(function (b) { b.classList.toggle('active', b === btn); });
        C.$('#review-list', root).innerHTML = reviewListHTML(r);
      });
    });
    C.$('#retry-set', root).addEventListener('click', function () {
      var setup = ensureSetup();
      setup.topic = r.config.topic;
      setup.type = r.config.type;
      setup.count = r.config.count;
      setup.mode = r.config.mode;
      startPractice(setup);
    });
  });

  /* =========================================================
     PROGRESS
     ========================================================= */
  function readinessPill(acc) {
    if (acc == null) return '<span class="readiness-pill none">Not started</span>';
    if (acc >= 80) return '<span class="readiness-pill good">Strong</span>';
    if (acc >= 60) return '<span class="readiness-pill mid">Building</span>';
    return '<span class="readiness-pill low">Needs work</span>';
  }
  function typeStats() {
    var out = { mc: { n: 0, c: 0 }, id: { n: 0, c: 0 }, tf: { n: 0, c: 0 } };
    Object.keys(C.stats.seen).forEach(function (k) {
      var r = C.stats.seen[k];
      if (!r || !out[r.type]) return;
      out[r.type].n += r.n;
      out[r.type].c += r.c;
    });
    return out;
  }

  C.register('progress', function (params, root) {
    var overall = C.overallStat();
    var coverage = C.pct(overall.seen, C.all.length);
    var acc = overall.acc == null ? 0 : overall.acc;
    var types = typeStats();
    var exams = C.stats.exams || [];
    var best = null;
    exams.forEach(function (e) {
      if (!e.max) return;
      if (!best || e.total / e.max > best.total / best.max) best = e;
    });

    var weakest = null;
    C.topics.forEach(function (t) {
      var st = C.topicStat(t.id);
      var cov = C.pct(seenCount(t.id), C.topicQuestions(t.id).length);
      var score = st.n >= 8 ? (st.acc || 0) : 100 + (100 - cov);
      if (!weakest || score < weakest.score) weakest = { t: t, st: st, cov: cov, score: score };
    });
    var focusLine = weakest
      ? (weakest.st.n >= 8
        ? 'Accuracy is lowest in ' + weakest.t.name + ' (' + weakest.st.acc + '% over ' + weakest.st.n + ' attempts). Re-read that deck, then drill 20 questions.'
        : weakest.t.name + ' is the least explored topic — only ' + weakest.cov + '% of its bank seen. Start there with a 20-question guided set.')
      : '';

    root.innerHTML =
      '<div class="page-head">' +
        '<a class="back" href="#/">' + C.icon('left') + ' Dashboard</a>' +
        '<p class="eyebrow">Readiness report</p>' +
        '<h1>Your progress, honestly.</h1>' +
        '<p class="lede">Everything is stored locally in this browser. Nothing is uploaded. Practice accuracy and mock exam scores stay separate.</p>' +
      '</div>' +
      '<div class="stat-grid" style="margin-top:0">' +
        '<div class="stat-card"><small>Overall accuracy</small><b>' + (overall.acc == null ? '—' : overall.acc + '%') + '</b><span>' + overall.c + ' correct of ' + overall.n + ' attempts</span></div>' +
        '<div class="stat-card"><small>Bank coverage</small><b>' + coverage + '%</b><span>' + overall.seen + ' of ' + C.all.length + ' questions seen</span></div>' +
        '<div class="stat-card"><small>Mock exams</small><b>' + exams.length + '</b><span>' + (best ? 'Best: ' + best.total + '/' + best.max : 'None taken yet') + '</span></div>' +
        '<div class="stat-card"><small>Practice sessions</small><b>' + (C.stats.sessions || []).length + '</b><span>' + (C.stats.sessions && C.stats.sessions.length ? 'Last ' + fmtDateShort(C.stats.sessions[0].date) : 'Start a set today') + '</span></div>' +
      '</div>' +
      '<div class="dash-grid">' +
        '<div class="panel">' +
          '<div class="panel-head"><div><h3>Focus next</h3><p class="sub">The topic that most needs your next study block.</p></div>' + C.icon('target') + '</div>' +
          '<p style="font-size:13.5px;line-height:1.7;color:var(--ink-soft)">' + C.esc(focusLine) + '</p>' +
          '<div class="actions-row"><button class="btn btn-primary btn-small" id="focus-practice">Practise ' + C.esc(weakest ? weakest.t.label : 'a set') + '</button><a class="btn btn-ghost btn-small" href="#/notes/' + (weakest ? weakest.t.id : 'systems') + '">Read the notes</a></div>' +
        '</div>' +
        '<div class="panel">' +
          '<div class="panel-head"><div><h3>Accuracy by format</h3><p class="sub">Which question type costs you points.</p></div></div>' +
          '<div class="breakdown">' +
            Object.keys(types).map(function (k) {
              var d = types[k];
              var p = d.n ? Math.round(d.c / d.n * 100) : 0;
              return '<div class="breakdown-row"><span>' + typeLabel(k) + '</span><div class="progress-track"><i style="width:' + p + '%"></i></div><b>' + (d.n ? p + '%' : '—') + '</b></div>';
            }).join('') +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="section-head"><div><h2>Topic detail</h2><p>Coverage and accuracy across all six decks.</p></div></div>' +
      '<div class="panel table-card">' +
        '<table class="data-table"><thead><tr><th>Topic</th><th class="num">Pool</th><th class="num">Seen</th><th class="num">Coverage</th><th class="num">Attempts</th><th class="num">Accuracy</th><th>Status</th></tr></thead><tbody>' +
          C.topics.map(function (t) {
            var st = C.topicStat(t.id);
            var seen = seenCount(t.id);
            var pool = C.topicQuestions(t.id).length;
            return '<tr><td><strong>' + C.esc(t.name) + '</strong></td><td class="num">' + pool + '</td><td class="num">' + seen + '</td><td class="num">' + C.pct(seen, pool) + '%</td><td class="num">' + st.n + '</td><td class="num">' + (st.acc == null ? '—' : st.acc + '%') + '</td><td>' + readinessPill(st.acc) + '</td></tr>';
          }).join('') +
        '</tbody></table>' +
      '</div>' +
      '<div class="dash-grid">' +
        '<div class="panel"><div class="panel-head"><div><h3>Recent practice</h3><p class="sub">Last 25 sets on this device.</p></div></div><div class="session-list">' +
          ((C.stats.sessions || []).length ? C.stats.sessions.slice(0, 8).map(function (s) {
            return '<div class="session-row"><span class="session-date">' + fmtDateShort(s.date) + '</span><span>' + C.esc(s.topic === 'mixed' ? 'Mixed' : topicName(s.topic)) + ' · ' + C.esc(s.type === 'all' ? 'mixed' : typeShort(s.type)) + ' · ' + (s.mode === 'instant' ? 'guided' : 'test') + '</span><span class="spacer"></span><b>' + s.correct + '/' + s.total + '</b></div>';
          }).join('') : '<p class="muted small" style="padding:10px 0">No practice sets yet.</p>') +
        '</div></div>' +
        '<div class="panel"><div class="panel-head"><div><h3>Mock exams</h3><p class="sub">Objective plus self-graded essay.</p></div></div><div class="session-list">' +
          (exams.length ? exams.slice(0, 8).map(function (e) {
            return '<div class="session-row"><span class="session-date">' + fmtDateShort(e.date) + '</span><span>Objective ' + e.objective + ' · Essay ' + (e.essay == null ? '—' : e.essay) + ' · Bonus ' + (e.bonus || 0) + '</span><span class="spacer"></span><b>' + e.total + '/' + e.max + '</b></div>';
          }).join('') : '<p class="muted small" style="padding:10px 0">No mock exams yet. <a href="#/exam" style="color:var(--accent)">Sit one</a>.</p>') +
        '</div></div>' +
      '</div>' +
      '<div class="danger-zone no-print"><div><h4>Reset all progress</h4><p>Clears accuracy, sessions, and mock exam history from this browser.</p></div><button class="btn btn-ghost btn-small" id="reset-progress">' + C.icon('reset') + ' Reset</button></div>' +
      '<p class="faint small" style="margin-top:14px">Tip: use Print to save this report as a PDF.</p>';

    C.$('#focus-practice', root).addEventListener('click', function () {
      var setup = ensureSetup();
      setup.topic = weakest ? weakest.t.id : 'mixed';
      setup.type = 'all';
      setup.count = 20;
      setup.mode = 'instant';
      C.navigate('practice');
    });
    C.$('#reset-progress', root).addEventListener('click', function () {
      C.openModal({
        title: 'Reset all progress?',
        body: '<p>This erases every practice attempt, session, and mock exam score stored in this browser. It cannot be undone.</p>',
        actions: [
          { label: 'Cancel', kind: 'ghost' },
          { label: 'Reset everything', kind: 'danger', onClick: function () {
            C.resetStats();
            C.toast('Progress cleared.');
            C.render();
          } }
        ]
      });
    });
  });
})();
