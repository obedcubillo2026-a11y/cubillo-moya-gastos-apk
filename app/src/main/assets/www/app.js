const STORAGE_KEY = 'cubillo_moya_apk_v1';
const SEED = {"transactions":[{"title":"Supermercado","amount":25,"type":"expense","category":"supermercado","paidBy":"obed","splitMode":"personal","mariaSharePct":0,"date":"2026-11-19","id":"tx_1795110402621_7fpf","createdAt":"2026-11-19T17:46:42.621Z"},{"id":"tx_cm_1","title":"Alquiler apartamento Cubillo Moya","amount":850,"type":"expense","category":"hogar","paidBy":"obed","splitMode":"shared_50","mariaSharePct":50,"date":"2026-11-01","notes":"Mensualidad de noviembre","createdAt":"2026-11-01T09:10:00.000Z"},{"id":"tx_cm_2","title":"Ingreso quincena María","amount":1650,"type":"income","category":"otros","paidBy":"maria","splitMode":"personal","mariaSharePct":100,"date":"2026-11-01","createdAt":"2026-11-01T10:00:00.000Z"},{"id":"tx_cm_3","title":"Ingreso quincena Obed","amount":1750,"type":"income","category":"otros","paidBy":"obed","splitMode":"personal","mariaSharePct":0,"date":"2026-11-01","createdAt":"2026-11-01T10:05:00.000Z"},{"id":"tx_cm_4","title":"Compra semanal supermercado","amount":164.5,"type":"expense","category":"supermercado","paidBy":"maria","splitMode":"shared_50","mariaSharePct":50,"date":"2026-11-03","notes":"Frutas, verduras y despensa","createdAt":"2026-11-03T18:20:00.000Z"},{"id":"tx_cm_5","title":"Fibra óptica e internet hogar","amount":48,"type":"expense","category":"servicios","paidBy":"maria","splitMode":"shared_50","mariaSharePct":50,"date":"2026-11-05","createdAt":"2026-11-05T11:15:00.000Z"},{"id":"tx_cm_6","title":"Cena viernes juntos","amount":68,"type":"expense","category":"restaurantes","paidBy":"obed","splitMode":"shared_50","mariaSharePct":50,"date":"2026-11-07","createdAt":"2026-11-07T21:40:00.000Z"},{"id":"tx_cm_7","title":"Combustible y peajes","amount":54,"type":"expense","category":"transporte","paidBy":"obed","splitMode":"shared_50","mariaSharePct":50,"date":"2026-11-10","createdAt":"2026-11-10T08:30:00.000Z"},{"id":"tx_cm_8","title":"Electricidad y agua municipal","amount":76.4,"type":"expense","category":"servicios","paidBy":"obed","splitMode":"shared_50","mariaSharePct":50,"date":"2026-11-12","createdAt":"2026-11-12T14:00:00.000Z"},{"id":"tx_cm_9","title":"Farmacia y vitaminas","amount":42.8,"type":"expense","category":"salud","paidBy":"maria","splitMode":"shared_50","mariaSharePct":50,"date":"2026-11-14","createdAt":"2026-11-14T16:10:00.000Z"},{"id":"tx_cm_10","title":"Supermercado reposición y café","amount":129.2,"type":"expense","category":"supermercado","paidBy":"maria","splitMode":"shared_50","mariaSharePct":50,"date":"2026-11-16","createdAt":"2026-11-16T19:05:00.000Z"},{"id":"tx_cm_11","title":"Cine y helado de fin de semana","amount":38.5,"type":"expense","category":"ocio","paidBy":"maria","splitMode":"shared_50","mariaSharePct":50,"date":"2026-11-18","createdAt":"2026-11-18T20:15:00.000Z"}],"budgets":[{"category":"hogar","limit":900},{"category":"supermercado","limit":450},{"category":"servicios","limit":180},{"category":"restaurantes","limit":220},{"category":"transporte","limit":160},{"category":"salud","limit":120},{"category":"ocio","limit":150},{"category":"otros","limit":120}],"recurring":[{"id":"rec_alquiler","title":"Alquiler del apartamento","amount":850,"category":"hogar","paidBy":"obed","splitMode":"shared_50","dayOfMonth":1,"lastPaidMonth":"2026-11"},{"id":"rec_internet","title":"Fibra Óptica Hogar","amount":48,"category":"servicios","paidBy":"maria","splitMode":"shared_50","dayOfMonth":5,"lastPaidMonth":"2026-11"},{"id":"rec_luz","title":"Electricidad y Agua","amount":76.4,"category":"servicios","paidBy":"obed","splitMode":"shared_50","dayOfMonth":12,"lastPaidMonth":"2026-11"}],"settings":{"currency":"CRC","monthlyBudget":2300,"activeUser":"maria"},"updatedAt":"2026-11-19T17:50:46.249Z"};
let state = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') || SEED;
let activeFilter = 'all';
let formType = 'expense';

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function money(n) {
  const sym = state.settings?.currency === 'CRC' ? '₡' : state.settings?.currency === 'EUR' ? '€' : '$';
  return sym + Number(n || 0).toFixed(state.settings?.currency === 'CRC' ? 0 : 2);
}

function calcCoupleBalance() {
  let bal = 0;
  state.transactions.forEach(t => {
    if (t.type === 'expense' && t.splitMode !== 'personal') {
      const mShare = t.amount * ((t.mariaSharePct ?? 50) / 100);
      const oShare = t.amount - mShare;
      if (t.paidBy === 'maria') bal += oShare;
      else bal -= mShare;
    } else if (t.type === 'settlement') {
      if (t.paidBy === 'obed') bal -= t.amount;
      else bal += t.amount;
    }
  });
  return Math.round(bal * 100) / 100;
}

function render() {
  const exps = state.transactions.filter(t => t.type === 'expense');
  const incs = state.transactions.filter(t => t.type === 'income');
  const totalExp = exps.reduce((s, t) => s + t.amount, 0);
  const totalInc = incs.reduce((s, t) => s + t.amount, 0);
  const mPaid = exps.filter(t => t.paidBy === 'maria').reduce((s, t) => s + t.amount, 0);
  const oPaid = exps.filter(t => t.paidBy === 'obed').reduce((s, t) => s + t.amount, 0);
  const budget = Math.max(1, state.settings?.monthlyBudget || 2300);
  const pct = Math.min(100, (totalExp / budget) * 100);

  document.getElementById('totalExpense').textContent = money(totalExp);
  document.getElementById('budgetBar').style.width = pct + '%';
  document.getElementById('budgetInfo').textContent = 'Presupuesto: ' + money(budget) + ' (' + Math.round(pct) + '%)';
  document.getElementById('incomeInfo').textContent = 'Ingresos: ' + money(totalInc);
  document.getElementById('mariaPaid').textContent = money(mPaid);
  document.getElementById('obedPaid').textContent = money(oPaid);

  const coupleBal = calcCoupleBalance();
  const settleText = document.getElementById('settleText');
  const settleBtn = document.getElementById('settleBtn');
  if (Math.abs(coupleBal) < 0.01) {
    settleText.textContent = 'María y Obed están 100% al día';
    settleBtn.hidden = true;
  } else if (coupleBal > 0) {
    settleText.textContent = 'Obed debe ' + money(coupleBal) + ' a María';
    settleBtn.hidden = false;
  } else {
    settleText.textContent = 'María debe ' + money(Math.abs(coupleBal)) + ' a Obed';
    settleBtn.hidden = false;
  }

  const list = document.getElementById('txList');
  list.innerHTML = '';
  const visible = state.transactions.filter(t => activeFilter === 'all' ? true : t.paidBy === activeFilter);
  visible.slice(0, 30).forEach(t => {
    const li = document.createElement('li');
    li.className = 'tx-item';
    const who = t.paidBy === 'maria' ? 'María' : 'Obed';
    const split = t.type === 'income' ? 'Ingreso' : t.splitMode === 'personal' ? 'Personal' : '50/50';
    li.innerHTML = '<div class="tx-info"><strong>' + t.title + '</strong><span>' + t.date + ' · Pagó ' + who + ' · ' + split + '</span></div>' +
      '<span class="tx-amt ' + (t.type === 'income' ? 'pos' : 'neg') + '">' + (t.type === 'income' ? '+' : '-') + money(t.amount) + '</span>';
    list.appendChild(li);
  });
}

document.querySelectorAll('[data-user]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('[data-user]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.settings.activeUser = btn.dataset.user;
    document.getElementById('txPaidBy').value = btn.dataset.user;
    save();
    if (window.WebDroid) window.WebDroid.vibrate(12);
  });
});

document.querySelectorAll('.f-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.f-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.dataset.filter;
    render();
  });
});

document.querySelectorAll('.t-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.t-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    formType = btn.dataset.type;
  });
});

const backdrop = document.getElementById('sheetBackdrop');
document.getElementById('openAddBtn').addEventListener('click', () => {
  document.getElementById('txPaidBy').value = state.settings?.activeUser || 'maria';
  backdrop.hidden = false;
  if (window.WebDroid) window.WebDroid.vibrate(10);
});
document.getElementById('closeSheet').addEventListener('click', () => { backdrop.hidden = true; });
backdrop.addEventListener('click', (e) => { if (e.target === backdrop) backdrop.hidden = true; });

document.getElementById('txForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const title = document.getElementById('txTitle').value.trim();
  const amount = Math.abs(Number(document.getElementById('txAmount').value));
  const category = document.getElementById('txCat').value;
  const paidBy = document.getElementById('txPaidBy').value;
  const splitMode = document.getElementById('txSplit').value;
  if (!title || !amount) return;
  const today = new Date().toISOString().slice(0, 10);
  state.transactions.unshift({
    id: 'tx_' + Date.now(),
    title,
    amount,
    type: formType,
    category,
    paidBy,
    splitMode: formType === 'income' ? 'personal' : splitMode,
    mariaSharePct: splitMode === 'shared_50' ? 50 : paidBy === 'maria' ? 100 : 0,
    date: today,
    createdAt: new Date().toISOString()
  });
  save();
  render();
  e.target.reset();
  backdrop.hidden = true;
  if (window.WebDroid) {
    window.WebDroid.vibrate(18);
    window.WebDroid.toast('Movimiento guardado');
  }
});

document.getElementById('settleBtn').addEventListener('click', () => {
  const bal = calcCoupleBalance();
  if (Math.abs(bal) < 0.01) return;
  const payer = bal > 0 ? 'obed' : 'maria';
  state.transactions.unshift({
    id: 'tx_' + Date.now(),
    title: 'Liquidación de cuentas pareja',
    amount: Math.abs(bal),
    type: 'settlement',
    category: 'otros',
    paidBy: payer,
    splitMode: 'personal',
    mariaSharePct: 50,
    date: new Date().toISOString().slice(0, 10),
    createdAt: new Date().toISOString()
  });
  save();
  render();
  if (window.WebDroid) window.WebDroid.toast('Cuentas saldadas');
});

render();