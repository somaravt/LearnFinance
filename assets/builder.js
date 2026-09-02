/* Module 01: build a balance sheet one transaction at a time.
   The point is that the learner watches both sides move together and
   works out for themselves why they always match. */

var STEPS = [
  {
    say: "Nothing exists yet. No business, no bank account, no oven. Press the button below to open the bakery.",
    assets: {}, liab: {}, eq: {}
  },
  {
    say: "You take \u20b910,00,000 out of your own savings and put it into a new bank account that belongs to the business.",
    note: "The business now has money. But it is not the business's money in any deep sense \u2014 it is yours. It owes it to you.",
    assets: { "Cash in bank": 1000000 },
    liab: {},
    eq: { "Money you put in": 1000000 }
  },
  {
    say: "You buy a commercial oven for \u20b94,00,000, paid from the business account.",
    note: "Look at the totals. They did not change. You swapped one thing you owned (cash) for another thing you own (an oven). Nobody new has a claim on the business.",
    assets: { "Cash in bank": 600000, "Oven": 400000 },
    liab: {},
    eq: { "Money you put in": 1000000 }
  },
  {
    say: "A bank lends the business \u20b95,00,000. The money lands in the account.",
    note: "This time both columns grew by \u20b95,00,000. The business has more cash, and the bank now has a claim on the business. Growth on one side always shows up on the other.",
    assets: { "Cash in bank": 1100000, "Oven": 400000 },
    liab: { "Bank loan": 500000 },
    eq: { "Money you put in": 1000000 }
  },
  {
    say: "You buy flour, sugar and butter worth \u20b91,00,000. The supplier trusts you and gives you 30 days to pay.",
    note: "No cash moved at all. You received goods and gave a promise. The goods are yours now, so they are an asset; the promise is a claim against you, so it sits on the right.",
    assets: { "Cash in bank": 1100000, "Oven": 400000, "Stock of ingredients": 100000 },
    liab: { "Bank loan": 500000, "Owed to supplier": 100000 },
    eq: { "Money you put in": 1000000 }
  },
  {
    say: "You sell cakes over the counter for \u20b980,000 in cash. Making them used up \u20b930,000 of your ingredients.",
    note: "Cash went up \u20b980,000, stock went down \u20b930,000. The business is \u20b950,000 better off, and that gain belongs to you \u2014 so a new line appears in your column. This is profit, and profit is simply the owner's claim getting bigger.",
    assets: { "Cash in bank": 1180000, "Oven": 400000, "Stock of ingredients": 70000 },
    liab: { "Bank loan": 500000, "Owed to supplier": 100000 },
    eq: { "Money you put in": 1000000, "Profit you have earned": 50000 }
  },
  {
    say: "A hotel orders \u20b91,20,000 of cakes for a wedding. You deliver them. The hotel will pay you in 60 days. The cakes used \u20b945,000 of ingredients.",
    note: "Read this one twice. Your profit went up by \u20b975,000 and not one rupee entered your bank account. The money the hotel owes you is real and it is an asset \u2014 but it is not cash. This single gap is why a third statement has to exist.",
    assets: { "Cash in bank": 1180000, "Oven": 400000, "Stock of ingredients": 25000, "Owed to you by hotel": 120000 },
    liab: { "Bank loan": 500000, "Owed to supplier": 100000 },
    eq: { "Money you put in": 1000000, "Profit you have earned": 125000 }
  }
];

function rupees(n) {
  // Indian grouping: last three digits, then pairs
  var s = String(n);
  if (s.length <= 3) return "\u20b9" + s;
  var last3 = s.slice(-3), rest = s.slice(0, -3);
  rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return "\u20b9" + rest + "," + last3;
}

function sum(o) { var t = 0; for (var k in o) t += o[k]; return t; }

function initBuilder() {
  var root = document.querySelector('[data-builder]');
  if (!root) return;

  var i = 0;
  var maxTotal = 0;
  STEPS.forEach(function (s) { maxTotal = Math.max(maxTotal, sum(s.assets)); });

  var say   = root.querySelector('[data-say]');
  var note  = root.querySelector('[data-note]');
  var colA  = root.querySelector('[data-col-assets]');
  var colF  = root.querySelector('[data-col-funding]');
  var totA  = root.querySelector('[data-tot-assets]');
  var totF  = root.querySelector('[data-tot-funding]');
  var prev  = root.querySelector('[data-prev]');
  var next  = root.querySelector('[data-next]');
  var count = root.querySelector('[data-count]');

  function segments(container, obj, cls) {
    container.innerHTML = '';
    var total = 0;
    for (var k in obj) total += obj[k];
    for (var key in obj) {
      var v = obj[key];
      var row = document.createElement('div');
      row.className = 'seg ' + cls;
      row.style.height = Math.max((v / maxTotal) * 260, 22) + 'px';
      row.innerHTML = '<span class="seg-name">' + key + '</span><span class="seg-val">' + rupees(v) + '</span>';
      container.appendChild(row);
    }
    if (!total) {
      var empty = document.createElement('div');
      empty.className = 'seg empty';
      empty.innerHTML = '<span class="seg-name">nothing yet</span>';
      container.appendChild(empty);
    }
    return total;
  }

  function render() {
    var s = STEPS[i];
    say.textContent = s.say;
    if (s.note) { note.textContent = s.note; note.style.display = 'block'; }
    else { note.style.display = 'none'; }

    var a = segments(colA, s.assets, 'asset');
    var funding = {};
    for (var k in s.liab) funding[k] = s.liab[k];
    for (var k2 in s.eq) funding[k2] = s.eq[k2];
    var f = segments(colF, funding, 'funding');

    // mark the owner's lines differently
    var idx = Object.keys(s.liab).length;
    Array.prototype.slice.call(colF.children).forEach(function (el, n) {
      if (n >= idx) el.classList.add('owner');
    });

    totA.textContent = a ? rupees(a) : '\u2014';
    totF.textContent = f ? rupees(f) : '\u2014';
    count.textContent = 'Step ' + i + ' of ' + (STEPS.length - 1);
    prev.disabled = i === 0;
    next.disabled = i === STEPS.length - 1;
    next.textContent = i === 0 ? 'Open the bakery' : 'Next transaction';
  }

  prev.addEventListener('click', function () { if (i > 0) { i--; render(); } });
  next.addEventListener('click', function () { if (i < STEPS.length - 1) { i++; render(); } });
  render();
}
