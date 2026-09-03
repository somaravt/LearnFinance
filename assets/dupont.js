/* Module 02: the DuPont explorer.
   Three sliders, one return on equity. The point is that the learner moves
   each lever on its own and watches which of them actually improves the
   business and which only borrows harder. */

var DU_PRESETS = {
  vardhan: { m: 10.0, t: 1.16, l: 2.35,
    say: "Vardhan Bakers. Middling on all three, and the highest return of the lot." },
  kamala:  { m: 15.0, t: 0.80, l: 1.20,
    say: "Kamala Foods. A fat margin on slow, largely owned assets, with no borrowing." },
  surya:   { m: 3.0,  t: 2.59, l: 2.07,
    say: "Surya Bakehouse. A thin margin spun very fast, on assets funded with debt." }
};

function initDupont() {
  var box = document.querySelector('[data-dupont]');
  if (!box) return;

  var ins = {
    m: box.querySelector('[data-in="m"]'),
    t: box.querySelector('[data-in="t"]'),
    l: box.querySelector('[data-in="l"]')
  };
  var outs = {
    m: box.querySelector('[data-out="m"]'),
    t: box.querySelector('[data-out="t"]'),
    l: box.querySelector('[data-out="l"]')
  };
  var lines = box.querySelectorAll('[data-line]');
  var roeOut = box.querySelector('[data-roe]');
  var barOwn = box.querySelector('[data-bar-own]');
  var barBorrowed = box.querySelector('[data-bar-borrowed]');
  var caution = box.querySelector('[data-caution]');
  var said = box.querySelector('[data-said]');

  function val(k) { return parseFloat(ins[k].value); }

  function render() {
    var m = val('m'), t = val('t'), l = val('l');

    var roa = m * t;          // profit per 100 of assets, in per cent
    var roe = roa * l;        // profit per 100 of owners' money, in per cent
    var ownShare = 100 / l;   // rupees of owner money behind every 100 of assets

    outs.m.textContent = m.toFixed(1) + '%';
    outs.t.textContent = t.toFixed(2) + '\u00d7';
    outs.l.textContent = l.toFixed(2) + '\u00d7';

    lines[0].textContent = 'Every \u20b9100 of sales leaves \u20b9' + m.toFixed(2) + ' of profit.';
    lines[1].textContent = 'Every \u20b9100 of assets produces \u20b9' + (t * 100).toFixed(0) + ' of sales.';
    lines[2].textContent = 'So every \u20b9100 of assets earns \u20b9' + roa.toFixed(2) + ' of profit.';
    lines[3].textContent = 'Of every \u20b9100 of assets, the owners funded \u20b9' + ownShare.toFixed(2)
      + '. Lenders and suppliers funded the other \u20b9' + (100 - ownShare).toFixed(2) + '.';
    lines[4].textContent = 'So every \u20b9100 the owners put in earns \u20b9' + roe.toFixed(2) + '.';

    roeOut.textContent = roe.toFixed(1) + '%';

    // how much of the return is the business, and how much is borrowing
    var fromBusiness = Math.min(roa, roe);
    var fromBorrowing = Math.max(roe - roa, 0);
    var total = fromBusiness + fromBorrowing || 1;
    barOwn.style.width = (100 * fromBusiness / total) + '%';
    barBorrowed.style.width = (100 * fromBorrowing / total) + '%';

    if (l <= 1.1) {
      caution.textContent = 'Nothing here is borrowed. Every point of this return came from the business itself.';
      caution.className = 'caution';
    } else if (fromBorrowing < fromBusiness) {
      caution.textContent = 'Of these ' + roe.toFixed(1) + ' points, ' + fromBusiness.toFixed(1)
        + ' come from the business and ' + fromBorrowing.toFixed(1) + ' from funding it with other people\u2019s money.';
      caution.className = 'caution';
    } else {
      caution.textContent = 'Of these ' + roe.toFixed(1) + ' points, only ' + fromBusiness.toFixed(1)
        + ' come from the business. The other ' + fromBorrowing.toFixed(1)
        + ' come from borrowing. More than half of it was arranged rather than earned.';
      caution.className = 'caution loud';
    }
  }

  Object.keys(ins).forEach(function (k) {
    ins[k].addEventListener('input', function () { said.textContent = ''; render(); });
  });

  box.querySelectorAll('[data-preset]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var p = DU_PRESETS[btn.getAttribute('data-preset')];
      if (!p) return;
      ins.m.value = p.m; ins.t.value = p.t; ins.l.value = p.l;
      said.textContent = p.say;
      render();
    });
  });

  render();
}
