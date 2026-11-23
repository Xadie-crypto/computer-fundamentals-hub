/* Mock final examination: blueprint sampling, timed run, answer sheet, essay rubric. */
(function () {
  'use strict';

  var C = window.C;
  if (!C) return;

  var KEY_PROFILE = 'compf.profile.v1';
  var activeExam = null;
  var examTimer = null;
  var saveTimer = null;

  var DIRECTIONS = {
    id: 'Write the term, law, or concept described by each statement. One point each.',
    mc: 'Choose the best answer from the four options. One point each.',
    tf: 'Write TRUE if the statement is correct. If it is false, replace the underlined word or phrase by writing the correct term. Two points each.',
    essay: 'Answer the prompt in complete sentences, using concrete examples from the lessons. Ten points, scored against the rubric after submission.',
    bonus: 'Optional. Answer as many as you can. Each correct item adds one bonus point, up to five.'
  };

  function fmtClockSec(sec) {
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
  function fmtDate(iso) {
    try {
      return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) +
        ', ' + new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } catch (e) { return ''; }
  }
  function sectionMeta(key) {
    var out = null;
    C.meta.sections.forEach(function (s) { if (s.key === key) out = s; });
    return out;
  }
  function sectionStart(exam, key) {
    for (var i = 0; i < exam.items.length; i++) if (exam.items[i].section === key) return i;
    return 0;
  }
  function localNumber(exam, index) {
    var sec = exam.items[index].section;
    var n = 0;
    for (var i = 0; i <= index; i++) if (exam.items[i].section === sec) n += 1;
    return n;
  }
  function answeredObjective(exam) {
    return exam.items.filter(function (item) {
      var a = exam.answers[item.q.id];
      if (item.q.t === 'mc') return typeof a === 'number';
      return String(a == null ? '' : a).trim().length > 0;
    }).length;
  }
  function sectionAnswered(exam, key) {
    if (key === 'essay') return String(exam.essayText || '').trim() ? 1 : 0;
    if (key === 'bonus') return exam.bonus.filter(function (b) { return String((exam.bonusAnswers || {})[b.id] || '').trim(); }).length;
    return exam.items.filter(function (item) {
      if (item.section !== key) return false;
      var a = exam.answers[item.q.id];
      if (item.q.t === 'mc') return typeof a === 'number';
      return String(a == null ? '' : a).trim().length > 0;
    }).length;
  }
  function remainingMs(exam) { return Math.max(0, exam.endsAt - Date.now()); }

  /* ---------------- exam construction ---------------- */
  function drawByBlueprint(type) {
    var blueprint = C.meta.blueprint[type];
    var out = [];
    Object.keys(blueprint).forEach(function (topic) {
      var n = blueprint[topic];
      var pool = C.topicQuestions(topic).filter(function (q) { return q.t === type; });
      out = out.concat(C.sample(pool, n));
    });
    return C.shuffle(out);
  }
  function buildExam(name, section) {
    var idQs = drawByBlueprint('id');
    var mcQs = drawByBlueprint('mc');
    var tfQs = drawByBlueprint('tf');
    var items = [];
    idQs.forEach(function (q) { items.push({ section: 'id', q: q }); });
    mcQs.forEach(function (q) { items.push({ section: 'mc', q: q }); });
    tfQs.forEach(function (q) { items.push({ section: 'tf', q: q }); });
    var startedAt = Date.now();
    return {
      id: 'E' + startedAt,
      name: name || 'Student',
      section: section || '',
      startedAt: startedAt,
      endsAt: startedAt + C.meta.durationMinutes * 60000,
      durationMinutes: C.meta.durationMinutes,
      items: items,
      essay: C.sample(C.essays, 1)[0],
      bonus: C.sample(C.bonus, Math.min(5, C.bonus.length)),
      answers: {},
      bonusAnswers: {},
      essayText: '',
      flags: {},
      index: 0,
      view: 'objective',
      submitted: false
    };
  }
  function validateExam(exam) {
    if (!exam || !exam.items || !exam.items.length || !exam.startedAt || !exam.endsAt) return null;
    if (!exam.answers) exam.answers = {};
    if (!exam.bonusAnswers) exam.bonusAnswers = {};
    if (!exam.flags) exam.flags = {};
    if (typeof exam.essayText !== 'string') exam.essayText = '';
    if (typeof exam.index !== 'number') exam.index = 0;
    if (!exam.view) exam.view = 'objective';
    if (exam.index >= exam.items.length) exam.index = 0;
    return exam;
  }
  function loadActive() {
    if (activeExam) return activeExam;
    activeExam = validateExam(C.readJSON(C.KEYS.exam, null));
    return activeExam;
  }

  /* ---------------- persistence ---------------- */
  function saveNow(exam) {
    if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; }
    C.writeJSON(C.KEYS.exam, exam);
    var label = document.getElementById('save-label');
    if (label) label.textContent = 'Saved';
  }
  function scheduleSave(exam) {
    var label = document.getElementById('save-label');
    if (label) label.textContent = 'Saving…';
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      C.writeJSON(C.KEYS.exam, exam);
      var el = document.getElementById('save-label');
      if (el) el.textContent = 'Saved just now';
      saveTimer = null;
    }, 400);
  }

  /* ---------------- exam intro ---------------- */
  function coverageHTML() {
    var bp = C.meta.blueprint;
    var totals = { id: 0, mc: 0, tf: 0 };
    var rows = C.topics.map(function (t) {
      var i = bp.id[t.id] || 0, m = bp.mc[t.id] || 0, f = bp.tf[t.id] || 0;
      totals.id += i; totals.mc += m; totals.tf += f;
      return '<tr><td><strong>' + C.esc(t.name) + '</strong></td><td class="num">' + i + '</td><td class="num">' + m + '</td><td class="num">' + f + '</td><td class="num">' + (i + m + f) + '</td></tr>';
    }).join('');
    return '<div class="panel" style="margin-top:16px">' +
      '<div class="panel-head"><div><h3>Objective coverage by topic</h3><p class="sub">Every attempt uses this blueprint, so every topic is covered.</p></div></div>' +
      '<div class="table-card"><table class="data-table" style="min-width:520px"><thead><tr><th>Topic</th><th class="num">Identification</th><th class="num">Multiple choice</th><th class="num">True / false</th><th class="num">Items</th></tr></thead><tbody>' +
        rows +
        '<tr><td><strong>Total</strong></td><td class="num"><strong>' + totals.id + '</strong></td><td class="num"><strong>' + totals.mc + '</strong></td><td class="num"><strong>' + totals.tf + '</strong></td><td class="num"><strong>' + (totals.id + totals.mc + totals.tf) + '</strong></td></tr>' +
      '</tbody></table></div>' +
      '<p class="summary-note" style="margin-top:10px">Plus one essay prompt (10 points) and five optional bonus items (1 point each, max 5).</p>' +
    '</div>';
  }

  C.register('exam', function (params, root) {
    var meta = C.meta;
    var active = loadActive();
    var lastResult = C.readJSON(C.KEYS.result, null);
    var profile = C.readJSON(KEY_PROFILE, { name: '', section: '' });
    var expired = active ? remainingMs(active) <= 0 : false;

    var banner = '';
    if (active) {
      banner = '<div class="resume-banner">' +
        '<span class="chip ' + (expired ? 'chip-danger' : 'chip-accent') + '">' + (expired ? 'Time expired' : 'In progress') + '</span>' +
        '<div><strong>' + C.esc(active.name) + '</strong>, ' + answeredObjective(active) + ' of ' + active.items.length + ' objective items answered. ' + (expired ? 'Time is up.' : '<b>' + fmtClockSec(remainingMs(active) / 1000) + '</b> remaining.') + '</div>' +
        '<div class="spacer"></div>' +
        (expired
          ? '<button class="btn btn-primary btn-small" id="submit-expired">Submit attempt</button>'
          : '<button class="btn btn-primary btn-small" id="resume-exam">Resume</button>') +
        '<button class="btn btn-ghost btn-small" id="discard-exam">Discard</button>' +
      '</div>';
    }
    var lastCard = '';
    if (lastResult && typeof lastResult.total === 'number') {
      lastCard = '<div class="resume-banner" style="border-color:var(--line);background:var(--surface)">' +
        '<span class="chip">Last attempt</span>' +
        '<div><strong>' + lastResult.total + '/' + (lastResult.max || 60) + '</strong>, ' + C.esc(fmtDate(lastResult.date)) + (lastResult.gradingComplete ? ', essay ' + lastResult.essay + '/10' : ', essay awaiting self-score') + (lastResult.bonus ? ', plus ' + lastResult.bonus + ' bonus' : '') + '</div>' +
        '<div class="spacer"></div><a class="btn btn-ghost btn-small" href="#/exam-result">Review result</a>' +
      '</div>';
    }

    root.innerHTML =
      '<div class="exam-intro">' +
        banner + lastCard +
        '<div class="exam-cover">' +
          '<div class="cover-top">' +
            '<p class="eyebrow">Computer Fundamentals</p>' +
            '<h1>Final Exam</h1>' +
            '<p>Practice test based on the exam pointers</p>' +
          '</div>' +
          '<div class="cover-meta">' +
            '<div><small>Date</small><b>' + C.esc(meta.examDateLabel) + '</b></div>' +
            '<div><small>Time</small><b>' + C.esc(meta.examTime) + '</b></div>' +
            '<div><small>Room</small><b>' + C.esc(meta.room) + '</b></div>' +
            '<div><small>Total</small><b>' + meta.totalPoints + ' points plus ' + meta.bonusPoints + ' bonus</b></div>' +
          '</div>' +
          (active ? '' :
            '<div class="exam-name-row">' +
              '<div class="field"><label for="exam-name">Name</label><input class="input" id="exam-name" type="text" autocomplete="name" placeholder="Your name" value="' + C.esc(profile.name || '') + '"></div>' +
              '<div class="field"><label for="exam-section">Section</label><input class="input" id="exam-section" type="text" placeholder="e.g. BSIT 1-A" value="' + C.esc(profile.section || '') + '"></div>' +
              '<div class="field"><label>Date</label><input class="input" type="text" value="' + C.esc(meta.examDateLabel) + '" readonly></div>' +
            '</div>') +
          '<div class="instructions">' +
            '<h3>Instructions</h3>' +
            '<ol>' +
              '<li>This exam has four scored sections and one optional bonus section: Identification (10), Multiple Choice (20), Modified True or False (20), and Essay (10).</li>' +
              '<li>In the modified true-or-false section, write <strong>TRUE</strong> if the statement is correct. If it is false, write the <strong>correct replacement</strong> for the underlined word or phrase.</li>' +
              '<li>The essay is scored after submission against the rubric shown with the prompt. The model answer and outline are available for comparison.</li>' +
              '<li>You have <strong>' + meta.durationMinutes + ' minutes</strong>. The timer starts when you begin and keeps running if you leave the page.</li>' +
              '<li>Answers auto-save in this browser. You may move freely across items and flag questions for review.</li>' +
              '<li>The five bonus items are optional and worth one point each, up to five bonus points above the 60-point total.</li>' +
            '</ol>' +
          '</div>' +
          '<div class="format-table">' +
            '<table><thead><tr><th>Section</th><th>Format</th><th class="num">Items</th><th class="num">Points</th></tr></thead><tbody>' +
              meta.sections.map(function (s) {
                return '<tr><td>' + s.numeral + '. ' + C.esc(s.name) + '</td><td>' + C.esc(s.hint) + '</td><td class="num">' + s.items + '</td><td class="num">' + s.total + '</td></tr>';
              }).join('') +
              '<tr><td>V. Bonus</td><td>Optional short answers, counted above the 60 points</td><td class="num">5</td><td class="num">5</td></tr>' +
              '<tr class="total"><td>Scored total</td><td></td><td class="num">41</td><td class="num">60</td></tr>' +
            '</tbody></table>' +
          '</div>' +
          '<div class="exam-start-row">' +
            '<p class="note">' + (active
              ? (expired ? 'The attempt is past its time limit. Submitting now will grade every saved answer.' : 'An attempt is underway. Resume it to keep the original timer and answers, or discard it to start fresh.')
              : 'No calculators or outside notes are needed. Begin when you are ready.') + '</p>' +
            (active
              ? (expired
                ? '<button class="btn btn-primary btn-lg" id="submit-expired-2">Submit expired attempt</button>'
                : '<button class="btn btn-primary btn-lg" id="resume-exam-2">Resume exam ' + C.icon('arrow') + '</button>')
              : '<button class="btn btn-primary btn-lg" id="exam-start">Begin exam ' + C.icon('arrow') + '</button>') +
          '</div>' +
        '</div>' +
        '<div class="exam-side-cards">' +
          '<div class="exam-tip"><strong>Time is real</strong>The timer keeps running when you leave. The exam submits itself at zero.</div>' +
          '<div class="exam-tip"><strong>Answer everything</strong>There is no penalty for a wrong objective answer. Flag and return to what you cannot decide.</div>' +
          '<div class="exam-tip"><strong>Essay self-score</strong>After submitting, score your essay criterion by criterion; the rubric totals 10 points.</div>' +
          '<div class="exam-tip"><strong>Resume safely</strong>Every keystroke is saved locally in this browser. Refresh or close the tab and continue later.</div>' +
        '</div>' +
        coverageHTML() +
      '</div>';

    function discard() {
      C.openModal({
        title: 'Discard this attempt?',
        body: '<p>The saved answers and the running timer will be erased. A scored result, once submitted, is not affected.</p>',
        actions: [
          { label: 'Keep attempt', kind: 'ghost' },
          { label: 'Discard attempt', kind: 'danger', onClick: function () {
            C.removeKey(C.KEYS.exam);
            activeExam = null;
            C.state.exam = null;
            C.toast('Attempt discarded.');
            C.render();
          } }
        ]
      });
    }

    if (C.$('#exam-start', root)) {
      C.$('#exam-start', root).addEventListener('click', function () {
        var name = (C.$('#exam-name', root).value || '').trim() || 'Student';
        var section = (C.$('#exam-section', root).value || '').trim();
        C.writeJSON(KEY_PROFILE, { name: name, section: section });
        var exam = buildExam(name, section);
        activeExam = exam;
        C.state.exam = exam;
        saveNow(exam);
        C.navigate('exam-run');
      });
    }
    ['#resume-exam', '#resume-exam-2'].forEach(function (sel) {
      var btn = C.$(sel, root);
      if (btn) btn.addEventListener('click', function () {
        C.state.exam = active;
        C.navigate('exam-run');
      });
    });
    ['#submit-expired', '#submit-expired-2'].forEach(function (sel) {
      var btn = C.$(sel, root);
      if (btn) btn.addEventListener('click', function () {
        activeExam = active;
        submitExam(active, true);
      });
    });
    var discardBtn = C.$('#discard-exam', root);
    if (discardBtn) discardBtn.addEventListener('click', discard);
  });

  /* ---------------- exam run ---------------- */
  function paperHeadHTML(exam) {
    return '<div class="paper-head">' +
      '<div class="course">Computer Fundamentals</div>' +
      '<h1>Final Exam</h1>' +
      '<div class="meta"><span>Name: <b>' + C.esc(exam.name) + '</b></span><span>Room: <b>' + C.esc(C.meta.room) + '</b></span><span>Points: <b>60 + 5</b></span></div>' +
    '</div>';
  }

  function itemAnswerHTML(exam, item) {
    var q = item.q;
    var ans = exam.answers[q.id];
    if (q.t === 'mc') {
      return '<div class="exam-options">' + q.o.map(function (o, i) {
        return '<button class="exam-op' + (ans === i ? ' selected' : '') + '" data-mc="' + i + '"><span class="key">' + C.letter(i) + '</span><span>' + C.esc(o) + '</span></button>';
      }).join('') + '</div>';
    }
    var val = ans == null ? '' : String(ans);
    return '<div class="exam-id-input"><label for="exam-answer">' + (q.t === 'tf' ? 'Answer (TRUE or the replacement term)' : 'Answer') + '</label>' +
      '<input class="input" id="exam-answer" type="text" autocomplete="off" value="' + C.esc(val) + '" placeholder="' + (q.t === 'tf' ? 'TRUE or replacement…' : 'Type your answer…') + '"></div>';
  }

  function objectivePaperHTML(exam) {
    var item = exam.items[exam.index];
    var q = item.q;
    var meta = sectionMeta(item.section);
    var localNo = localNumber(exam, exam.index);
    var total = exam.items.filter(function (x) { return x.section === item.section; }).length;
    var last = exam.index === exam.items.length - 1;
    var flagged = !!exam.flags[q.id];
    return paperHeadHTML(exam) +
      '<div class="section-heading"><h2><span>' + meta.numeral + '</span> ' + C.esc(meta.name) + '</h2><small>' + meta.items + ' items, ' + meta.total + ' points</small></div>' +
      '<p class="section-directions">' + C.esc(DIRECTIONS[item.section]) + '</p>' +
      '<div class="exam-item">' +
        '<div class="exam-item-top"><span class="item-no">' + localNo + '.</span><span class="chip">' + (item.section === 'tf' ? '2 points' : '1 point') + '</span><span class="item-points">Item ' + localNo + ' of ' + total + '</span></div>' +
        '<div class="exam-q">' + (q.t === 'tf' ? C.statement(q.q) : C.esc(q.q)) + '</div>' +
        itemAnswerHTML(exam, item) +
        '<div class="exam-foot">' +
          '<button class="flag-btn' + (flagged ? ' on' : '') + '" id="exam-flag">' + C.icon('flag') + (flagged ? ' Flagged' : ' Flag for review') + '</button>' +
          '<span class="spacer"></span>' +
          '<button class="btn btn-ghost btn-small" data-nav="prev"' + (exam.index === 0 ? ' disabled' : '') + '>' + C.icon('left') + ' Previous</button>' +
          '<button class="btn btn-primary btn-small" data-nav="next">' + (last ? 'Go to essay' : 'Next item') + ' ' + C.icon('arrow') + '</button>' +
        '</div>' +
      '</div>';
  }

  function essayPaperHTML(exam) {
    var e = exam.essay;
    var words = String(exam.essayText || '').trim() ? String(exam.essayText).trim().split(/\s+/).length : 0;
    return paperHeadHTML(exam) +
      '<div class="section-heading"><h2><span>IV</span> Essay</h2><small>1 item, 10 points</small></div>' +
      '<p class="section-directions">' + C.esc(DIRECTIONS.essay) + '</p>' +
      '<div class="exam-item exam-essay">' +
        '<div class="exam-item-top"><span class="item-no">1.</span><span class="chip">10 points</span><span class="item-points">Self-scored after submission</span></div>' +
        '<div class="essay-prompt-box"><strong style="display:block;margin-bottom:6px">' + C.esc(e.title) + '</strong>' + C.esc(e.prompt) + '</div>' +
        '<label class="small muted" for="exam-essay" style="display:block;margin-bottom:6px">Your essay</label>' +
        '<textarea id="exam-essay" placeholder="Write your answer in complete sentences…">' + C.esc(exam.essayText || '') + '</textarea>' +
        '<div class="essay-meta"><span><span id="essay-words">' + words + '</span> words</span><span>Rubric: 10 points</span></div>' +
        '<div class="exam-foot">' +
          '<button class="btn btn-ghost btn-small" data-nav="prev">' + C.icon('left') + ' Back to last item</button>' +
          '<span class="spacer"></span>' +
          '<button class="btn btn-ghost btn-small" data-nav="bonus">Bonus section ' + C.icon('arrow') + '</button>' +
          '<button class="btn btn-primary btn-small" id="exam-submit-2">Submit exam</button>' +
        '</div>' +
      '</div>';
  }

  function bonusPaperHTML(exam) {
    return paperHeadHTML(exam) +
      '<div class="section-heading"><h2><span>V</span> Bonus</h2><small>5 items, up to 5 points</small></div>' +
      '<p class="section-directions">' + C.esc(DIRECTIONS.bonus) + '</p>' +
      '<div class="exam-item">' +
        '<div class="exam-item-top"><span class="item-no">+</span><span class="chip chip-accent">Optional</span><span class="item-points">1 point each</span></div>' +
        '<div class="bonus-list">' +
          exam.bonus.map(function (b, i) {
            return '<div class="bonus-item"><label for="bonus-' + C.esc(b.id) + '">B' + (i + 1) + '. ' + C.esc(b.q) + '</label>' +
              '<input class="input" id="bonus-' + C.esc(b.id) + '" data-bonus="' + C.esc(b.id) + '" type="text" autocomplete="off" value="' + C.esc((exam.bonusAnswers || {})[b.id] || '') + '" placeholder="Your answer…"></div>';
          }).join('') +
        '</div>' +
        '<div class="exam-foot">' +
          '<button class="btn btn-ghost btn-small" data-nav="essay">' + C.icon('left') + ' Back to essay</button>' +
          '<span class="spacer"></span>' +
          '<button class="btn btn-primary btn-small" id="exam-submit-3">Submit exam</button>' +
        '</div>' +
      '</div>';
  }

  function sheetHTML(exam, inline) {
    function cells(items, startIndex) {
      return items.map(function (item, i) {
        var global = startIndex + i;
        var a = exam.answers[item.q.id];
        var filled = item.q.t === 'mc' ? typeof a === 'number' : String(a == null ? '' : a).trim().length > 0;
        var cls = 'sheet-cell';
        if (filled) cls += ' answered';
        if (exam.flags[item.q.id]) cls += ' flagged';
        if (exam.view === 'objective' && exam.index === global) cls += ' current';
        return '<button class="' + cls + '" data-jump="' + global + '" aria-label="Question ' + (i + 1) + '">' + (i + 1) + '</button>';
      }).join('');
    }
    var idItems = exam.items.filter(function (x) { return x.section === 'id'; });
    var mcItems = exam.items.filter(function (x) { return x.section === 'mc'; });
    var tfItems = exam.items.filter(function (x) { return x.section === 'tf'; });
    var idStart = sectionStart(exam, 'id');
    var mcStart = sectionStart(exam, 'mc');
    var tfStart = sectionStart(exam, 'tf');
    var essayDone = String(exam.essayText || '').trim().length > 0;
    var bonusDone = exam.bonus.filter(function (b) { return String((exam.bonusAnswers || {})[b.id] || '').trim(); }).length;
    function group(label, count, total, html) {
      return '<div class="sheet-group"><div class="sheet-label"><span>' + label + '</span><span>' + count + '/' + total + '</span></div><div class="sheet-grid">' + html + '</div></div>';
    }
    return '<div class="sheet"' + (inline ? ' style="position:static;border:0;box-shadow:none;padding:0"' : ' id="exam-sheet"') + '>' +
      '<h3>Answer sheet</h3>' +
      '<div id="sheet-body">' +
        group('I. Identification', sectionAnswered(exam, 'id'), 10, cells(idItems, idStart)) +
        group('II. Multiple choice', sectionAnswered(exam, 'mc'), 20, cells(mcItems, mcStart)) +
        group('III. True or false', sectionAnswered(exam, 'tf'), 10, cells(tfItems, tfStart)) +
        '<div class="sheet-group"><div class="sheet-label"><span>Written</span><span>Essay &amp; bonus</span></div>' +
          '<div class="sheet-grid" style="grid-template-columns:1fr 1fr">' +
            '<button class="sheet-cell' + (essayDone ? ' answered' : '') + (exam.view === 'essay' ? ' current' : '') + '" data-jump="essay" aria-label="Essay">Essay</button>' +
            '<button class="sheet-cell' + (bonusDone ? ' answered' : '') + (exam.view === 'bonus' ? ' current' : '') + '" data-jump="bonus" aria-label="Bonus">Bonus ' + bonusDone + '/' + exam.bonus.length + '</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="sheet-legend">' +
        '<span><i class="legend-dot answered"></i>Answered</span>' +
        '<span><i class="legend-dot"></i>Blank</span>' +
        '<span><i class="legend-dot flagged"></i>Flagged</span>' +
      '</div>' +
      '<div class="sheet-progress"><span>Objective complete</span><b>' + answeredObjective(exam) + '/' + exam.items.length + '</b></div>' +
    '</div>';
  }

  function subbarHTML(exam) {
    var tabs = [
      { key: 'id', label: 'I. Identification' },
      { key: 'mc', label: 'II. Multiple choice' },
      { key: 'tf', label: 'III. True or false' },
      { key: 'essay', label: 'IV. Essay' },
      { key: 'bonus', label: 'V. Bonus' }
    ];
    var activeKey = exam.view === 'objective' ? exam.items[exam.index].section : exam.view;
    return tabs.map(function (t) {
      var active = t.key === activeKey;
      var count = t.key === 'essay' ? sectionAnswered(exam, 'essay') + '/1'
        : t.key === 'bonus' ? sectionAnswered(exam, 'bonus') + '/' + exam.bonus.length
          : sectionAnswered(exam, t.key) + '/' + (t.key === 'mc' ? 20 : 10);
      return '<button class="exam-tab' + (active ? ' active' : '') + '" data-goto="' + t.key + '">' + t.label + ' <small data-tab-count="' + t.key + '">' + count + '</small></button>';
    }).join('');
  }

  function renderExamRun(exam, root) {
    var paper = exam.view === 'essay' ? essayPaperHTML(exam)
      : exam.view === 'bonus' ? bonusPaperHTML(exam)
        : objectivePaperHTML(exam);
    root.innerHTML =
      '<div class="exam-shell">' +
        '<header class="exam-top">' +
          '<div class="exam-brand"><span class="mark">C</span><span><strong>COMPF</strong> Final exam</span></div>' +
          '<span class="save-state"><i class="dot"></i><span id="save-label">Saved</span></span>' +
          '<span class="spacer"></span>' +
          '<span class="exam-timer" id="exam-timer">' + fmtClockSec(remainingMs(exam) / 1000) + '</span>' +
          '<button class="btn btn-ghost btn-exit" id="exam-exit">Exit</button>' +
          '<button class="btn btn-submit" id="exam-submit">Submit</button>' +
        '</header>' +
        '<nav class="exam-subbar" aria-label="Exam sections">' + subbarHTML(exam) + '</nav>' +
        '<div class="exam-layout">' +
          '<div class="paper" id="exam-paper">' + paper + '</div>' +
          sheetHTML(exam, false) +
        '</div>' +
        '<div class="exam-mobile-bar">' +
          '<button class="btn btn-ghost btn-small" id="mobile-prev">' + C.icon('left') + ' Prev</button>' +
          '<button class="btn btn-ghost btn-small" id="mobile-sheet">' + C.icon('layers') + ' Answer sheet</button>' +
          '<button class="btn btn-primary btn-small" id="mobile-next">Next ' + C.icon('arrow') + '</button>' +
        '</div>' +
      '</div>';

    bindExamRun(exam, root);
    startExamTimer(exam);
    window.scrollTo(0, 0);
  }

  function updateChrome(exam) {
    var body = document.getElementById('sheet-body');
    if (body) {
      var tmp = document.createElement('div');
      tmp.innerHTML = sheetHTML(exam, false);
      var fresh = tmp.querySelector('#sheet-body');
      if (fresh) body.innerHTML = fresh.innerHTML;
      var prog = document.querySelector('.sheet-progress b');
      if (prog) prog.textContent = answeredObjective(exam) + '/' + exam.items.length;
    }
    C.$$('[data-tab-count]').forEach(function (el) {
      var key = el.getAttribute('data-tab-count');
      if (key === 'essay') el.textContent = sectionAnswered(exam, 'essay') + '/1';
      else if (key === 'bonus') el.textContent = sectionAnswered(exam, 'bonus') + '/' + exam.bonus.length;
      else el.textContent = sectionAnswered(exam, key) + '/' + (key === 'mc' ? 20 : 10);
    });
  }

  function goTo(exam, view, index, root) {
    saveNow(exam);
    exam.view = view;
    if (typeof index === 'number') exam.index = Math.max(0, Math.min(exam.items.length - 1, index));
    saveNow(exam);
    renderExamRun(exam, root);
  }

  function nextStep(exam, root) {
    if (exam.view === 'objective') {
      if (exam.index < exam.items.length - 1) goTo(exam, 'objective', exam.index + 1, root);
      else goTo(exam, 'essay', null, root);
    } else if (exam.view === 'essay') {
      goTo(exam, 'bonus', null, root);
    } else {
      confirmSubmit(exam);
    }
  }
  function prevStep(exam, root) {
    if (exam.view === 'bonus') goTo(exam, 'essay', null, root);
    else if (exam.view === 'essay') goTo(exam, 'objective', exam.items.length - 1, root);
    else if (exam.index > 0) goTo(exam, 'objective', exam.index - 1, root);
    else goTo(exam, 'objective', 0, root);
  }

  function bindSheetClicks(container, exam, root, closeAfter) {
    if (!container) return;
    container.addEventListener('click', function (e) {
      var cell = e.target.closest('[data-jump]');
      if (!cell) return;
      var jump = cell.getAttribute('data-jump');
      if (closeAfter) C.closeModal();
      if (jump === 'essay') goTo(exam, 'essay', null, root);
      else if (jump === 'bonus') goTo(exam, 'bonus', null, root);
      else goTo(exam, 'objective', parseInt(jump, 10), root);
    });
  }

  function bindExamRun(exam, root) {
    var q = exam.view === 'objective' ? exam.items[exam.index].q : null;

    C.$$('[data-mc]', root).forEach(function (btn) {
      btn.addEventListener('click', function () {
        exam.answers[q.id] = parseInt(btn.getAttribute('data-mc'), 10);
        C.$$('[data-mc]', root).forEach(function (b) { b.classList.toggle('selected', b === btn); });
        saveNow(exam);
        updateChrome(exam);
      });
    });

    var answerInput = C.$('#exam-answer', root);
    if (answerInput) {
      answerInput.addEventListener('input', function () {
        exam.answers[q.id] = answerInput.value;
        scheduleSave(exam);
        updateChrome(exam);
      });
      if (exam.view === 'objective') setTimeout(function () { answerInput.focus(); }, 40);
    }

    var flagBtn = C.$('#exam-flag', root);
    if (flagBtn) {
      flagBtn.addEventListener('click', function () {
        if (exam.flags[q.id]) delete exam.flags[q.id]; else exam.flags[q.id] = true;
        var on = !!exam.flags[q.id];
        flagBtn.classList.toggle('on', on);
        flagBtn.innerHTML = C.icon('flag') + (on ? ' Flagged' : ' Flag for review');
        saveNow(exam);
        updateChrome(exam);
      });
    }

    var essayInput = C.$('#exam-essay', root);
    if (essayInput) {
      essayInput.addEventListener('input', function () {
        exam.essayText = essayInput.value;
        var words = essayInput.value.trim() ? essayInput.value.trim().split(/\s+/).length : 0;
        var wc = C.$('#essay-words', root);
        if (wc) wc.textContent = words;
        scheduleSave(exam);
        updateChrome(exam);
      });
    }

    C.$$('[data-bonus]', root).forEach(function (input) {
      input.addEventListener('input', function () {
        exam.bonusAnswers[input.getAttribute('data-bonus')] = input.value;
        scheduleSave(exam);
        updateChrome(exam);
      });
    });

    C.$$('[data-nav]', root).forEach(function (btn) {
      btn.addEventListener('click', function () {
        saveNow(exam);
        var nav = btn.getAttribute('data-nav');
        if (nav === 'next') nextStep(exam, root);
        else if (nav === 'prev') prevStep(exam, root);
        else if (nav === 'bonus') goTo(exam, 'bonus', null, root);
        else if (nav === 'essay') goTo(exam, 'essay', null, root);
      });
    });

    C.$$('[data-goto]', root).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.getAttribute('data-goto');
        saveNow(exam);
        if (key === 'essay' || key === 'bonus') goTo(exam, key, null, root);
        else goTo(exam, 'objective', sectionStart(exam, key), root);
      });
    });

    bindSheetClicks(C.$('#exam-sheet', root), exam, root, false);

    var submit = C.$('#exam-submit', root);
    if (submit) submit.addEventListener('click', function () { saveNow(exam); confirmSubmit(exam); });
    ['#exam-submit-2', '#exam-submit-3'].forEach(function (sel) {
      var b = C.$(sel, root);
      if (b) b.addEventListener('click', function () { saveNow(exam); confirmSubmit(exam); });
    });
    var exit = C.$('#exam-exit', root);
    if (exit) exit.addEventListener('click', function () {
      saveNow(exam);
      C.openModal({
        title: 'Leave the exam?',
        body: '<p>Your answers are saved and the timer keeps running. Choose Resume on the exam page to continue where you left off.</p>',
        actions: [
          { label: 'Stay', kind: 'ghost' },
          { label: 'Leave', kind: 'primary', onClick: function () { C.navigate('exam'); } }
        ]
      });
    });

    var sheetToggle = C.$('#mobile-sheet', root);
    if (sheetToggle) sheetToggle.addEventListener('click', function () {
      C.openModal({ title: 'Answer sheet', body: sheetHTML(exam, true), actions: [{ label: 'Close', kind: 'ghost' }] });
      bindSheetClicks(C.$('.modal-body .sheet'), exam, root, true);
    });
    var mPrev = C.$('#mobile-prev', root);
    if (mPrev) mPrev.addEventListener('click', function () { saveNow(exam); prevStep(exam, root); });
    var mNext = C.$('#mobile-next', root);
    if (mNext) mNext.addEventListener('click', function () { saveNow(exam); nextStep(exam, root); });

    document.onkeydown = function (e) {
      if (C.state.route !== 'exam-run' || activeExam !== exam) return;
      var tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); saveNow(exam); nextStep(exam, root); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); saveNow(exam); prevStep(exam, root); }
    };
  }

  function startExamTimer(exam) {
    if (examTimer) clearInterval(examTimer);
    function tick() {
      if (C.state.route !== 'exam-run' || activeExam !== exam) { clearInterval(examTimer); examTimer = null; return; }
      var rem = remainingMs(exam);
      var el = document.getElementById('exam-timer');
      if (el) {
        el.textContent = fmtClockSec(rem / 1000);
        el.classList.toggle('warning', rem <= 10 * 60000);
      }
      if (rem <= 0) {
        clearInterval(examTimer);
        examTimer = null;
        C.toast('Time is up. Submitting your exam.');
        submitExam(exam, true);
      }
    }
    tick();
    examTimer = setInterval(tick, 1000);
  }

  C.register('exam-run', function (params, root) {
    var exam = loadActive();
    if (!exam) {
      root.innerHTML = '<div class="empty-state"><p class="eyebrow">No exam in progress</p><h1>Nothing to resume.</h1><p class="muted">Start a new attempt from the exam page.</p><a class="btn btn-primary" href="#/exam">Open the exam</a></div>';
      return;
    }
    if (remainingMs(exam) <= 0) {
      submitExam(exam, true);
      return;
    }
    renderExamRun(exam, root);
  });

  /* ---------------- grading & submission ---------------- */
  function confirmSubmit(exam) {
    var objective = answeredObjective(exam);
    var essayDone = String(exam.essayText || '').trim().length > 0;
    var bonusDone = sectionAnswered(exam, 'bonus');
    C.openModal({
      title: 'Submit the exam?',
      body: '<p>Submission ends the timer and grades the objective and bonus sections immediately. The essay is scored by you against its rubric on the next page.</p>' +
        '<div class="modal-list">' +
          '<div><span>Identification</span><b>' + sectionAnswered(exam, 'id') + '/10 answered</b></div>' +
          '<div><span>Multiple choice</span><b>' + sectionAnswered(exam, 'mc') + '/20 answered</b></div>' +
          '<div><span>True or false</span><b>' + sectionAnswered(exam, 'tf') + '/10 answered</b></div>' +
          '<div><span>Essay</span><b>' + (essayDone ? 'Written' : 'Blank') + '</b></div>' +
          '<div><span>Bonus</span><b>' + bonusDone + '/' + exam.bonus.length + ' answered</b></div>' +
          '<div><span>Objective total</span><b>' + objective + '/' + exam.items.length + '</b></div>' +
        '</div>' +
        (objective < exam.items.length ? '<p class="small muted">Unanswered objective items will be marked wrong.</p>' : ''),
      actions: [
        { label: 'Keep working', kind: 'ghost' },
        { label: 'Submit exam', kind: 'primary', onClick: function () { submitExam(exam, false); } }
      ]
    });
  }

  function submitExam(exam, auto) {
    if (!exam || exam.submitting) return;
    exam.submitting = true;
    if (examTimer) { clearInterval(examTimer); examTimer = null; }
    if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; }
    document.onkeydown = null;

    var bySection = {
      id: { n: 0, c: 0, pts: 0, max: 10 },
      mc: { n: 0, c: 0, pts: 0, max: 20 },
      tf: { n: 0, c: 0, pts: 0, max: 20 }
    };
    var correctMap = {};
    exam.items.forEach(function (item) {
      var q = item.q;
      var ans = exam.answers[q.id];
      var ok = false;
      if (q.t === 'mc') ok = typeof ans === 'number' && ans === q.a;
      else ok = String(ans == null ? '' : ans).trim().length > 0 && C.matchAnswer(q, ans);
      correctMap[q.id] = ok;
      bySection[item.section].n += 1;
      if (ok) {
        bySection[item.section].c += 1;
        bySection[item.section].pts += item.section === 'tf' ? 2 : 1;
      }
    });
    var objective = bySection.id.pts + bySection.mc.pts + bySection.tf.pts;

    var bonusCorrect = {};
    var bonusPoints = 0;
    exam.bonus.forEach(function (b) {
      var val = (exam.bonusAnswers || {})[b.id];
      var ok = String(val == null ? '' : val).trim().length > 0 && C.matchAnswer(b, val);
      bonusCorrect[b.id] = ok;
      if (ok) bonusPoints += 1;
    });

    var submittedAt = Date.now();
    var result = {
      examId: exam.id,
      name: exam.name,
      section: exam.section,
      date: new Date(submittedAt).toISOString(),
      startedAt: exam.startedAt,
      submittedAt: submittedAt,
      durationSec: Math.max(1, Math.round((submittedAt - exam.startedAt) / 1000)),
      autoSubmitted: !!auto,
      objective: objective,
      bySection: bySection,
      correctMap: correctMap,
      bonus: bonusPoints,
      bonusMax: exam.bonus.length,
      bonusCorrect: bonusCorrect,
      essay: null,
      essayScores: exam.essay.rubric.map(function () { return null; }),
      gradingComplete: false,
      recorded: false,
      total: objective,
      max: C.meta.totalPoints,
      reviewFilter: 'missed',
      exam: exam
    };

    C.writeJSON(C.KEYS.result, result);
    C.removeKey(C.KEYS.exam);
    C.state.examResult = result;
    C.state.exam = null;
    activeExam = null;
    C.navigate('exam-result');
  }

  /* ---------------- result ---------------- */
  function essayRubricTotal(essay) {
    return essay.rubric.reduce(function (a, r) { return a + r.points; }, 0);
  }
  function answerDisplay(q, ans) {
    if (q.t === 'mc') {
      return typeof ans === 'number' ? C.letter(ans) + '. ' + q.o[ans] : 'No answer';
    }
    var text = String(ans == null ? '' : ans).trim();
    return text || 'No answer';
  }
  function examReviewItem(result, item, index) {
    var q = item.q;
    var exam = result.exam;
    var ok = !!result.correctMap[q.id];
    var meta = sectionMeta(item.section);
    var localNo = 0;
    for (var i = 0; i <= index; i++) if (exam.items[i].section === item.section) localNo += 1;
    var flagged = exam.flags && exam.flags[q.id];
    var key = q.t === 'tf' ? (q.a ? 'TRUE' : 'FALSE. ' + q.fix) : C.possibleAnswer(q);
    return '<div class="review-item' + (ok ? ' ok' : '') + '">' +
      '<div class="review-top"><span class="chip">' + meta.numeral + '-' + localNo + '</span>' + '<span class="chip">' + (item.section === 'tf' ? '2 pts' : '1 pt') + '</span>' +
        (ok ? '<span class="chip chip-ok">Correct</span>' : '<span class="chip chip-danger">Missed</span>') +
        (flagged ? '<span class="chip chip-accent">Flagged</span>' : '') + '</div>' +
      '<div class="review-q">' + (q.t === 'tf' ? C.statement(q.q) : C.esc(q.q)) + '</div>' +
      '<div class="review-line"><span>Your answer</span><b>' + C.esc(answerDisplay(q, exam.answers[q.id])) + '</b></div>' +
      '<div class="review-line answer"><span>Answer</span><b>' + C.esc(key) + '</b></div>' +
      (q.e ? '<div class="review-exp">' + C.esc(q.e) + '</div>' : '') +
    '</div>';
  }
  function reviewListHTML(result) {
    var exam = result.exam;
    var html = '';
    exam.items.forEach(function (item, i) {
      var ok = !!result.correctMap[item.q.id];
      if (result.reviewFilter === 'missed' && ok) return;
      if (result.reviewFilter === 'correct' && !ok) return;
      html += examReviewItem(result, item, i);
    });
    return html ? '<div class="missed-list">' + html + '</div>' : '<p class="muted small" style="padding:12px 0">Nothing in this filter.</p>';
  }
  function essayHTML(result) {
    var exam = result.exam;
    var essay = exam.essay;
    var max = essayRubricTotal(essay) || 10;
    var scores = result.essayScores || [];
    var sum = scores.reduce(function (a, s) { return a + (typeof s === 'number' ? s : 0); }, 0);
    return '<div class="panel" id="essay-grade" style="margin-top:18px">' +
      '<div class="panel-head"><div><h3>Section IV. Essay</h3><p class="sub">Score each criterion, then save the final result.</p></div>' +
        (result.gradingComplete ? '<span class="chip chip-ok">Scored ' + result.essay + '/' + max + '</span>' : '<span class="chip chip-accent">Awaiting self-score</span>') + '</div>' +
      '<div class="essay-prompt-box"><strong style="display:block;margin-bottom:6px">' + C.esc(essay.title) + '</strong>' + C.esc(essay.prompt) + '</div>' +
      '<h4 style="font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:6px">Your answer</h4>' +
      '<div class="essay-answer-view">' + (String(exam.essayText || '').trim() ? C.esc(exam.essayText) : '<span class="faint">(No answer submitted.)</span>') + '</div>' +
      '<div class="rubric" style="margin-top:18px">' +
        essay.rubric.map(function (r, i) {
          var current = scores[i];
          var pills = '';
          for (var n = 0; n <= r.points; n++) {
            pills += '<button data-criterion="' + i + '" data-score="' + n + '" class="' + (current === n ? 'active' : '') + '">' + n + '</button>';
          }
          return '<div class="rubric-row"><div><strong>' + C.esc(r.criterion) + '</strong><small>' + r.points + ' point' + (r.points > 1 ? 's' : '') + ' possible</small></div><div class="score-pills" data-pills="' + i + '">' + pills + '</div></div>';
        }).join('') +
      '</div>' +
      '<div class="exam-start-row" style="margin-top:16px;padding-top:16px">' +
        '<div><span class="small muted">Essay score</span> <strong id="essay-score-now" style="font-family:var(--font-display);font-size:24px;font-weight:500">' + sum + '</strong><span class="small muted">/' + max + '</span></div>' +
        '<button class="btn btn-primary" id="save-essay">' + (result.gradingComplete ? 'Update final score' : 'Save final score') + '</button>' +
      '</div>' +
      '<details class="model-answer"><summary>' + C.icon('book') + ' Model answer and outline</summary><div class="model-body">' +
        '<strong style="display:block;margin-bottom:6px">Outline</strong><ul style="margin:0 0 14px;padding-left:18px">' +
          essay.outline.map(function (o) { return '<li>' + C.esc(o) + '</li>'; }).join('') +
        '</ul>' +
        '<strong style="display:block;margin-bottom:6px">Model answer</strong><p style="margin:0">' + C.esc(essay.model) + '</p>' +
      '</div></details>' +
    '</div>';
  }
  function bonusHTML(result) {
    var exam = result.exam;
    return '<div class="panel" style="margin-top:18px">' +
      '<div class="panel-head"><div><h3>Section V. Bonus</h3><p class="sub">Optional. ' + result.bonus + ' of ' + result.bonusMax + ' correct.</p></div><span class="chip ' + (result.bonus ? 'chip-ok' : '') + '">+' + result.bonus + ' point' + (result.bonus === 1 ? '' : 's') + '</span></div>' +
      '<div class="missed-list">' +
        exam.bonus.map(function (b, i) {
          var ok = !!result.bonusCorrect[b.id];
          var ans = (exam.bonusAnswers || {})[b.id];
          return '<div class="review-item' + (ok ? ' ok' : ' skipped') + '">' +
            '<div class="review-top"><span class="chip">B' + (i + 1) + '</span>' + (ok ? '<span class="chip chip-ok">Correct</span>' : '<span class="chip">No point</span>') + '</div>' +
            '<div class="review-q">' + C.esc(b.q) + '</div>' +
            '<div class="review-line"><span>Your answer</span><b>' + C.esc(String(ans || '').trim() || 'No answer') + '</b></div>' +
            '<div class="review-line answer"><span>Answer</span><b>' + C.esc(b.a[0]) + '</b></div>' +
          '</div>';
        }).join('') +
      '</div>' +
    '</div>';
  }

  C.register('exam-result', function (params, root) {
    var result = C.state.examResult || C.readJSON(C.KEYS.result, null);
    if (!result || !result.exam || !result.exam.items) {
      root.innerHTML = '<div class="empty-state"><h1>No result yet.</h1><p class="muted">Take the mock exam first. Your scored result appears here.</p><a class="btn btn-primary" href="#/exam">Open the mock exam</a></div>';
      return;
    }
    C.state.examResult = result;
    if (!result.essayScores) result.essayScores = result.exam.essay.rubric.map(function () { return null; });
    var exam = result.exam;
    var essayMax = essayRubricTotal(exam.essay) || 10;
    var graded = !!result.gradingComplete;
    var basePct = Math.round((result.total / (result.max || 60)) * 100);
    var finalPct = Math.round(((result.total + (result.bonus || 0)) / (result.max || 60)) * 100);
    var pctForRing = graded ? basePct : Math.round((result.objective / 50) * 100);
    var headline = !graded ? 'Objective graded' : basePct >= 90 ? 'Excellent result' : basePct >= 78 ? 'Good result' : basePct >= 60 ? 'Passing result' : 'Needs more review';
    var sub = !graded
      ? 'Score your essay below to finish the 60-point exam. The objective score is already saved.'
      : basePct >= 78
        ? 'Review the missed items below, then compare the model essay with your answer.'
        : 'Read the explanations for the missed items, then retake the exam after reviewing the notes.';
    var sec = result.bySection;

    root.innerHTML =
      '<div class="exam-result">' +
        '<div class="result-banner">' +
          '<div class="score-dial">' + C.ring(pctForRing, 148, 9) + '<div class="ring-label"><b>' + (graded ? basePct + '%' : result.objective + '<small style="font-size:14px">/50</small>') + '</b><small>' + (graded ? 'of 60 points' : 'objective') + '</small></div></div>' +
          '<div>' +
            '<p class="eyebrow">Mock exam, ' + C.esc(fmtDate(result.date)) + '</p>' +
            '<h1>' + C.esc(headline) + '</h1>' +
            '<p>' + C.esc(sub) + '</p>' +
            '<div class="result-chips">' +
              '<span class="chip">' + C.esc(result.name || 'Student') + '</span>' +
              (result.autoSubmitted ? '<span class="chip chip-danger">Auto-submitted at time</span>' : '<span class="chip">' + fmtDuration(result.durationSec) + '</span>') +
              (graded ? '<span class="chip chip-ok">' + result.total + '/' + (result.max || 60) + ' base</span>' : '<span class="chip chip-accent">Essay pending</span>') +
              '<span class="chip">Bonus ' + result.bonus + '</span>' +
            '</div>' +
            '<div class="score-split">' +
              '<div><small>Objective</small><b>' + result.objective + '/50</b></div>' +
              '<div><small>Essay</small><b>' + (graded ? result.essay + '/' + essayMax : 'Not scored') + '</b></div>' +
              '<div><small>Bonus</small><b>' + result.bonus + '/' + result.bonusMax + '</b></div>' +
              '<div><small>With bonus</small><b>' + (graded ? finalPct + '%' : 'n/a') + '</b></div>' +
            '</div>' +
          '</div>' +
        '</div>' +

        '<div class="stat-grid">' +
          '<div class="stat-card"><small>Identification</small><b>' + sec.id.pts + '/10</b><span>' + sec.id.c + ' of 10 correct</span></div>' +
          '<div class="stat-card"><small>Multiple choice</small><b>' + sec.mc.pts + '/20</b><span>' + sec.mc.c + ' of 20 correct</span></div>' +
          '<div class="stat-card"><small>True or false</small><b>' + sec.tf.pts + '/20</b><span>' + sec.tf.c + ' of 10 correct</span></div>' +
          '<div class="stat-card"><small>Essay</small><b>' + (graded ? result.essay + '/10' : 'n/a') + '</b><span>' + (graded ? 'self-scored' : 'awaiting rubric') + '</span></div>' +
        '</div>' +

        (graded ? '' : '<div class="resume-banner" style="border-color:var(--accent);margin-top:16px"><span class="chip chip-accent">Essay not scored</span><div>Score the essay below to finish the exam and save the result to your progress page.</div><div class="spacer"></div><button class="btn btn-primary btn-small" id="jump-essay">Score essay</button></div>') +

        '<div class="panel" style="margin-top:18px">' +
          '<div class="panel-head"><div><h3>Section breakdown</h3><p class="sub">Points earned, with the essay and bonus shown separately.</p></div></div>' +
          '<div class="table-card"><table class="data-table" style="min-width:540px"><thead><tr><th>Section</th><th class="num">Items</th><th class="num">Points</th><th class="num">Percent</th></tr></thead><tbody>' +
            '<tr><td>I. Identification</td><td class="num">10</td><td class="num">' + sec.id.pts + '/10</td><td class="num">' + Math.round(sec.id.pts / 10 * 100) + '%</td></tr>' +
            '<tr><td>II. Multiple choice</td><td class="num">20</td><td class="num">' + sec.mc.pts + '/20</td><td class="num">' + Math.round(sec.mc.pts / 20 * 100) + '%</td></tr>' +
            '<tr><td>III. Modified true or false</td><td class="num">10</td><td class="num">' + sec.tf.pts + '/20</td><td class="num">' + Math.round(sec.tf.pts / 20 * 100) + '%</td></tr>' +
            '<tr><td>IV. Essay</td><td class="num">1</td><td class="num">' + (graded ? result.essay + '/10' : 'n/a') + '</td><td class="num">' + (graded ? Math.round(result.essay / 10 * 100) + '%' : 'n/a') + '</td></tr>' +
            '<tr><td><strong>Scored total</strong></td><td class="num">' + (graded ? 41 : 40) + '</td><td class="num"><strong>' + (graded ? result.total + '/' + (result.max || 60) : result.objective + '/50 objective') + '</strong></td><td class="num"><strong>' + (graded ? basePct + '%' : Math.round(result.objective / 50 * 100) + '% obj') + '</strong></td></tr>' +
            '<tr><td>V. Bonus</td><td class="num">5</td><td class="num">+' + result.bonus + '/' + result.bonusMax + '</td><td class="num">' + Math.round(result.bonus / result.bonusMax * 100) + '%</td></tr>' +
          '</tbody></table></div>' +
        '</div>' +

        essayHTML(result) +
        bonusHTML(result) +

        '<div class="section-head"><div><h2>Objective review</h2><p>Every scored item, its answer, and an explanation.</p></div><div class="seg" id="exam-review-filter">' +
          '<button data-filter="missed" class="' + (result.reviewFilter === 'missed' ? 'active' : '') + '">Missed</button>' +
          '<button data-filter="all" class="' + (result.reviewFilter === 'all' ? 'active' : '') + '">All</button>' +
          '<button data-filter="correct" class="' + (result.reviewFilter === 'correct' ? 'active' : '') + '">Correct</button>' +
        '</div></div>' +
        '<div id="exam-review-list">' + reviewListHTML(result) + '</div>' +

        '<div class="actions-row" style="margin-top:26px">' +
          '<a class="btn btn-primary" href="#/exam">' + C.icon('reset') + ' Retake the exam</a>' +
          '<button class="btn btn-ghost" id="print-result">' + C.icon('printer') + ' Print result</button>' +
          '<a class="btn btn-ghost" href="#/">Back to dashboard</a>' +
        '</div>' +
      '</div>';

    C.$$('#exam-review-filter [data-filter]', root).forEach(function (btn) {
      btn.addEventListener('click', function () {
        result.reviewFilter = btn.getAttribute('data-filter');
        C.$$('#exam-review-filter [data-filter]', root).forEach(function (b) { b.classList.toggle('active', b === btn); });
        C.$('#exam-review-list', root).innerHTML = reviewListHTML(result);
      });
    });

    C.$$('[data-criterion]', root).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var i = parseInt(btn.getAttribute('data-criterion'), 10);
        var n = parseInt(btn.getAttribute('data-score'), 10);
        result.essayScores[i] = n;
        var pills = C.$('[data-pills="' + i + '"]', root);
        if (pills) C.$$('button', pills).forEach(function (b) { b.classList.toggle('active', b === btn); });
        var sum = result.essayScores.reduce(function (a, s) { return a + (typeof s === 'number' ? s : 0); }, 0);
        var now = C.$('#essay-score-now', root);
        if (now) now.textContent = sum;
      });
    });

    var jumpEssay = C.$('#jump-essay', root);
    if (jumpEssay) jumpEssay.addEventListener('click', function () {
      var el = C.$('#essay-grade', root);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    var saveEssayBtn = C.$('#save-essay', root);
    if (saveEssayBtn) saveEssayBtn.addEventListener('click', function () {
      var missing = result.essayScores.filter(function (s) { return typeof s !== 'number'; }).length;
      if (missing) { C.toast('Score every rubric criterion first.'); return; }
      var essayScore = result.essayScores.reduce(function (a, s) { return a + s; }, 0);
      result.essay = essayScore;
      result.total = result.objective + essayScore;
      result.gradingComplete = true;
      C.recordExamResult({
        date: result.date,
        objective: result.objective,
        essay: essayScore,
        bonus: result.bonus,
        total: result.total,
        max: result.max || 60,
        name: result.name
      });
      result.recorded = true;
      C.writeJSON(C.KEYS.result, result);
      C.state.examResult = result;
      C.toast('Final score saved: ' + result.total + '/' + (result.max || 60) + ' plus ' + result.bonus + ' bonus.');
      C.render();
      setTimeout(function () {
        var el = document.getElementById('essay-grade');
        if (el) el.scrollIntoView({ block: 'start' });
      }, 60);
    });

    var printBtn = C.$('#print-result', root);
    if (printBtn) printBtn.addEventListener('click', function () { window.print(); });
  });

  /* expose a hint for debugging only */
  window.COMPF_EXAM = { loadActive: loadActive };
})();
