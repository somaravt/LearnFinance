/* Course helpers: mock test grading + progress tracking.
   Storage is wrapped in try/catch so the pages still work when opened
   directly from the filesystem or in a sandboxed preview. */

var Store = {
  get: function (k, fallback) {
    try {
      var v = window.localStorage.getItem(k);
      return v === null ? fallback : JSON.parse(v);
    } catch (e) { return fallback; }
  },
  set: function (k, v) {
    try { window.localStorage.setItem(k, JSON.stringify(v)); return true; }
    catch (e) { return false; }
  }
};

/* ---------- mock test ---------- */

function initTest(moduleId) {
  var form = document.querySelector('[data-test]');
  if (!form) return;

  var questions = Array.prototype.slice.call(form.querySelectorAll('.q'));
  var submit = form.querySelector('[data-submit]');
  var reset = form.querySelector('[data-reset]');
  var scoreBox = form.querySelector('.score');
  var graded = false;

  questions.forEach(function (q) {
    q.querySelectorAll('.opt').forEach(function (label) {
      label.addEventListener('click', function () {
        if (graded) return;
        q.querySelectorAll('.opt').forEach(function (o) { o.classList.remove('picked'); });
        label.classList.add('picked');
      });
    });
  });

  submit.addEventListener('click', function () {
    if (graded) return;
    var correct = 0;
    var unanswered = 0;

    questions.forEach(function (q) {
      var answer = q.getAttribute('data-answer');
      var picked = q.querySelector('input:checked');
      if (!picked) unanswered++;

      q.querySelectorAll('.opt').forEach(function (label) {
        var val = label.querySelector('input').value;
        label.classList.add('locked');
        label.querySelector('input').disabled = true;
        if (val === answer) label.classList.add('correct');
        else if (picked && picked.value === val) label.classList.add('wrong');
      });

      if (picked && picked.value === answer) correct++;
      var why = q.querySelector('.why');
      if (why) why.classList.add('show');
    });

    graded = true;
    submit.disabled = true;

    var pct = Math.round((correct / questions.length) * 100);
    scoreBox.querySelector('.big').textContent = correct + ' / ' + questions.length;
    scoreBox.querySelector('[data-verdict]').textContent = verdict(pct, unanswered);
    scoreBox.classList.add('show');
    scoreBox.scrollIntoView({ behavior: 'smooth', block: 'center' });

    if (moduleId) {
      var done = Store.get('course.done', {});
      done[moduleId] = pct;
      Store.set('course.done', done);
    }
  });

  if (reset) {
    reset.addEventListener('click', function () { window.location.reload(); });
  }
}

function verdict(pct, unanswered) {
  var tail = unanswered ? ' You left ' + unanswered + ' unanswered — attempt every question next time, guessing forces you to commit to a reading.' : '';
  if (pct >= 90) return 'Solid. Move on to the next module.' + tail;
  if (pct >= 70) return 'Passing, but re-read the explanations for the ones you missed before moving on.' + tail;
  if (pct >= 50) return 'Shaky. Re-read the lesson, then retake this in two days rather than pushing ahead.' + tail;
  return 'Re-read the lesson from the top. This one needs a second pass, not a retake.' + tail;
}

/* ---------- progress on the index ---------- */

function initProgress(total) {
  var box = document.querySelector('[data-progress]');
  if (!box) return;
  var done = Store.get('course.done', {});
  var n = Object.keys(done).length;
  box.querySelector('[data-count]').textContent = n + ' of ' + total + ' modules attempted';
  box.querySelector('.bar span').style.width = ((n / total) * 100) + '%';

  document.querySelectorAll('[data-module]').forEach(function (row) {
    var id = row.getAttribute('data-module');
    if (done[id] !== undefined) {
      var cell = row.querySelector('[data-status]');
      if (cell) cell.innerHTML = '<span class="tag ready">scored ' + done[id] + '%</span>';
    }
  });
}

/* ---------- offline ---------- */

function initOffline(swPath) {
  if (!('serviceWorker' in navigator)) return;
  if (location.protocol === 'file:') return;   // service workers need http(s)
  window.addEventListener('load', function () {
    navigator.serviceWorker.register(swPath).catch(function () { /* offline reading unavailable; site still works */ });
  });
}

function initOfflineBadge() {
  var el = document.querySelector('[data-net]');
  if (!el) return;
  function paint() { el.textContent = navigator.onLine ? '' : 'Offline — showing saved pages'; }
  window.addEventListener('online', paint);
  window.addEventListener('offline', paint);
  paint();
}
