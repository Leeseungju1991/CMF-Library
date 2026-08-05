// ============== MOCK DATA (더미 데이터 · 인형원단) ============== //
const colorHex = { WH:'#f4f4f2', BK:'#1c1c1e', PK:'#f4b8c6', GY:'#9a9a9a', KH:'#b9ab84', BL:'#3a5a8c', GN:'#5e8c5a' };
const items = [
  { id:'demo-1', weight:'320g', vendor:'㈜대성니트', comp:'극세사 플러시 100%', width:'150cm', cost:'6,200원/y', color:'WH', doll:'대형 곰인형', pile:'8mm', wash:'손세탁 권장', archive:'완료', date:'2026-07-06' },
  { id:'demo-2', weight:'180g', vendor:'삼일방직', comp:'밍크사(Minky) 95% / 스판 5%', width:'160cm', cost:'8,900원/y', color:'PK', doll:'아기 애착인형', pile:'3mm', wash:'세탁기 가능 (30℃)', archive:'완료', date:'2026-07-08' },
  { id:'demo-3', weight:'150g', vendor:'㈜백양', comp:'융(Fleece) 100%', width:'145cm', cost:'3,500원/y', color:'GN', doll:'소형 캐릭터인형', pile:'-', wash:'세탁기 가능', archive:'진행중', date:'2026-07-16' },
  { id:'demo-4', weight:'480g', vendor:'한일텍스', comp:'극세모 롱파일 90% / 폴리 10%', width:'150cm', cost:'14,900원/y', color:'GY', doll:'대형 동물인형 (곰/토끼)', pile:'25mm', wash:'드라이클리닝 권장', archive:'완료', date:'2026-06-06' },
  { id:'demo-5', weight:'210g', vendor:'㈜동양섬유', comp:'벨보아(Velboa) 100%', width:'170cm', cost:'4,900원/y', color:'KH', doll:'캐릭터 인형 (짱구·코난 등)', pile:'2mm', wash:'세탁기 가능', archive:'완료', date:'2026-05-07' },
  { id:'demo-6', weight:'190g', vendor:'㈜동양섬유', comp:'스판 벨벳 95% / 스판 5%', width:'148cm', cost:'5,600원/y', color:'BL', doll:'인형 의상 · 소품용', pile:'-', wash:'손세탁', archive:'완료', date:'2026-07-21' },
  { id:'demo-7', weight:'260g', vendor:'삼일방직', comp:'캐시미어터치 극세사 100%', width:'155cm', cost:'11,300원/y', color:'PK', doll:'프리미엄 애착인형', pile:'5mm', wash:'세탁망 사용', archive:'진행중', date:'2026-07-28' },
  { id:'demo-8', weight:'90g', vendor:'㈜백양', comp:'PP솜 안감용 부직포', width:'150cm', cost:'2,100원/y', color:'BK', doll:'인형 내피 (안감)', pile:'-', wash:'해당없음', archive:'완료', date:'2026-06-16' },
];
const topSearches = [
  { name: '㈜대성니트 · 극세사 플러시 320g', count: 3 },
  { name: '삼일방직 · 밍크사 180g', count: 2 },
];
const trash = [
  { vendor: '한일텍스', weight: '210g', deletedAt: '2026-07-30' },
];
const logs = [
  { at: '2026-08-05 05:14', type: 'CREATE', target: 'demo-1' },
  { at: '2026-08-03 09:02', type: 'UPDATE', target: 'demo-1 (color)' },
  { at: '2026-08-01 16:40', type: 'UPDATE', target: 'demo-3 (archive status)' },
  { at: '2026-07-28 11:05', type: 'CREATE', target: 'demo-7' },
];

function itemById(id) { return items.find(it => it.id === id); }

function swatchCard(it) {
  return `
    <div class="swatch-card" data-id="${it.id}">
      <div class="swatch-color" style="background:${colorHex[it.color] || '#888'}"></div>
      <div class="swatch-name">${it.vendor}</div>
      <div class="swatch-meta">${it.comp}<br/>${it.weight} · ${it.width} · ${it.cost}<br/>적용: ${it.doll}</div>
      <div class="swatch-tags"><span class="tag">${it.color}</span><span class="tag">${it.archive}</span></div>
    </div>`;
}

function renderDashboard() {
  document.getElementById('kpi-grid').innerHTML = `
    <div class="kpi-card"><div class="kpi-label">총 DB 개수</div><div class="kpi-value">${items.length}</div></div>
    <div class="kpi-card"><div class="kpi-label">마지막 수정</div><div class="kpi-value" style="font-size:16px">2026.08.05</div></div>
    <div class="kpi-card"><div class="kpi-label">수정기록 건수</div><div class="kpi-value">${logs.filter(l=>l.type==='UPDATE').length}</div></div>
    <div class="kpi-card"><div class="kpi-label">휴지통</div><div class="kpi-value">${trash.length}</div></div>
  `;
  document.getElementById('top-searches').innerHTML = topSearches.map(t => `
    <tr><td class="strong">${t.name}</td><td style="text-align:right">${t.count}회</td></tr>`).join('');
  const recent = [...items].sort((a,b) => b.date.localeCompare(a.date)).slice(0,5);
  document.getElementById('recent-added').innerHTML = recent.map(it => `
    <tr><td class="strong">${it.vendor}</td><td>${it.weight} · ${it.doll}</td></tr>`).join('');
  renderColorDonut();
}

function renderColorDonut() {
  const counts = {};
  items.forEach(it => { counts[it.color] = (counts[it.color] || 0) + 1; });
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const total = items.length;
  let acc = 0;
  const stops = entries.map(([color, count]) => {
    const start = (acc / total) * 360; acc += count; const end = (acc / total) * 360;
    return `${colorHex[color] || '#888'} ${start}deg ${end}deg`;
  }).join(', ');
  document.getElementById('color-donut').style.background = `conic-gradient(${stops})`;
  document.getElementById('donut-total').textContent = total;
  document.getElementById('color-donut-legend').innerHTML = entries.map(([color, count]) => `
    <div class="legend-row"><span class="legend-dot" style="background:${colorHex[color] || '#888'}"></span>${color}<b>${count}</b></div>`).join('');
}

function renderShowcaseSwatches() {
  const el = document.getElementById('showcase-swatches');
  if (!el) return;
  const colors = Object.values(colorHex);
  el.innerHTML = [...colors, ...colors].slice(0, 14).map(c => `<span style="background:${c}"></span>`).join('');
}
renderShowcaseSwatches();

function renderSearch(filterText = '', colorFilter = '') {
  const q = filterText.trim().toLowerCase();
  const filtered = items.filter(it =>
    (!q || it.vendor.toLowerCase().includes(q) || it.comp.toLowerCase().includes(q) || it.doll.toLowerCase().includes(q)) &&
    (!colorFilter || it.color === colorFilter)
  );
  document.getElementById('swatch-grid').innerHTML = filtered.map(swatchCard).join('') || '<p style="color:var(--text-3);font-size:13px">검색 결과가 없습니다.</p>';
}

function renderCompare() {
  document.getElementById('compare-rows').innerHTML = items.map(it => `
    <tr class="clickable" data-id="${it.id}">
      <td class="strong">${it.vendor}</td><td>${it.weight}</td><td>${it.comp}</td><td>${it.doll}</td><td>${it.pile}</td><td>${it.cost}</td>
      <td><span style="display:inline-flex;align-items:center;gap:6px"><span style="width:14px;height:14px;border-radius:4px;background:${colorHex[it.color]||'#888'};display:inline-block;border:1px solid var(--border-2)"></span>${it.color}</span></td>
    </tr>`).join('');
}

function renderTrash() {
  document.getElementById('trash-rows').innerHTML = trash.map(t => `
    <tr><td class="strong">${t.vendor}</td><td>${t.weight}</td><td>${t.deletedAt}</td>
    <td><button class="tag js-restore" style="cursor:pointer">복구</button></td></tr>`).join('')
    || '<tr><td colspan="4" style="color:var(--text-3)">휴지통이 비어 있습니다.</td></tr>';
}

function renderLogs() {
  document.getElementById('log-rows').innerHTML = logs.map(l => `
    <tr><td>${l.at}</td><td><span class="badge mute">${l.type}</span></td><td class="strong">${l.target}</td></tr>`).join('');
}

function populateColorFilter() {
  const sel = document.getElementById('cmf-color-filter');
  const colors = [...new Set(items.map(it => it.color))].sort();
  colors.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c; opt.textContent = c;
    sel.appendChild(opt);
  });
}

function renderAll() {
  renderDashboard(); renderSearch(); renderCompare(); renderTrash(); renderLogs(); populateColorFilter();
}

// ============== SNACKBAR ============== //
function showSnackbar(message, type = 'ok') {
  const stack = document.getElementById('snackbar-stack');
  if (!stack) return;
  const el = document.createElement('div');
  el.className = `snackbar ${type}`;
  el.innerHTML = `<span class="sb-dot"></span>${message}`;
  stack.appendChild(el);
  setTimeout(() => {
    el.classList.add('leaving');
    setTimeout(() => el.remove(), 200);
  }, 2400);
}

// ============== MODAL ============== //
function openModal(html) {
  document.getElementById('modal-body').innerHTML = html;
  document.getElementById('modal-overlay').classList.add('is-open');
}
function closeModal() {
  document.getElementById('modal-overlay').classList.remove('is-open');
}
document.getElementById('modal-close')?.addEventListener('click', closeModal);
document.getElementById('modal-overlay')?.addEventListener('click', (e) => {
  if (e.target.id === 'modal-overlay') closeModal();
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

function openFabricModal(id) {
  const it = itemById(id);
  if (!it) return;
  openModal(`
    <div class="modal-swatch" style="background:${colorHex[it.color] || '#888'}"></div>
    <h3 class="modal-title">${it.vendor}</h3>
    <p class="modal-sub">${it.comp}</p>
    <div class="modal-fields">
      <div><div class="modal-field-label">무게</div><div class="modal-field-value">${it.weight}</div></div>
      <div><div class="modal-field-label">Width</div><div class="modal-field-value">${it.width}</div></div>
      <div><div class="modal-field-label">파일 길이</div><div class="modal-field-value">${it.pile}</div></div>
      <div><div class="modal-field-label">단가</div><div class="modal-field-value">${it.cost}</div></div>
      <div><div class="modal-field-label">적용 인형</div><div class="modal-field-value">${it.doll}</div></div>
      <div><div class="modal-field-label">세탁 방법</div><div class="modal-field-value">${it.wash}</div></div>
      <div><div class="modal-field-label">색상 코드</div><div class="modal-field-value">${it.color}</div></div>
      <div><div class="modal-field-label">아카이브 상태</div><div class="modal-field-value">${it.archive}</div></div>
    </div>
  `);
}

document.getElementById('swatch-grid')?.addEventListener('click', (e) => {
  const card = e.target.closest('.swatch-card');
  if (card) openFabricModal(card.dataset.id);
});
document.getElementById('compare-rows')?.addEventListener('click', (e) => {
  const row = e.target.closest('tr[data-id]');
  if (row) openFabricModal(row.dataset.id);
});
document.getElementById('trash-rows')?.addEventListener('click', (e) => {
  if (e.target.classList.contains('js-restore')) {
    showSnackbar('데모 환경에서는 복구가 저장되지 않습니다.', 'warn');
  }
});
document.getElementById('cmf-add-btn')?.addEventListener('click', () => {
  showSnackbar('CMF 항목이 저장되었습니다. (데모 환경 — 실제 반영되지 않음)');
});

// ============== NAV ============== //
const pageTitles = { dashboard:'대시보드', search:'검색 / 필터', compare:'색상 비교', add:'CMF 추가', trash:'휴지통', logs:'활동 로그' };
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('is-active'));
    item.classList.add('is-active');
    const page = item.dataset.page;
    document.querySelectorAll('.page').forEach(p => p.classList.remove('is-active'));
    document.getElementById('page-' + page).classList.add('is-active');
    document.getElementById('topbar-title').textContent = pageTitles[page];
  });
});

document.getElementById('cmf-search')?.addEventListener('input', (e) => {
  renderSearch(e.target.value, document.getElementById('cmf-color-filter').value);
});
document.getElementById('cmf-color-filter')?.addEventListener('change', (e) => {
  renderSearch(document.getElementById('cmf-search').value, e.target.value);
});

// ============== AUTH ============== //
const SESSION_KEY = 'cmf_demo_session';
function showApp(username) {
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('app').classList.add('is-active');
  document.getElementById('user-name').textContent = username;
  document.querySelector('.avatar').textContent = username.slice(0, 1).toUpperCase();
  renderAll();
}
document.getElementById('login-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const u = document.getElementById('u').value.trim();
  const p = document.getElementById('p').value.trim();
  const err = document.getElementById('login-error');
  const valid = (u === 'test' && p === 'test') || (u === 'soom' && p === 'soom');
  if (!valid) { err.textContent = '아이디 또는 비밀번호가 올바르지 않습니다. (test / test)'; return; }
  err.textContent = '';
  sessionStorage.setItem(SESSION_KEY, u);
  showApp(u);
  showSnackbar(`${u}님, CMF Library에 로그인되었습니다.`);
});
document.getElementById('logout-btn').addEventListener('click', () => {
  sessionStorage.removeItem(SESSION_KEY);
  document.getElementById('app').classList.remove('is-active');
  document.getElementById('login-screen').classList.remove('hidden');
  showSnackbar('로그아웃되었습니다.');
});
(function initSession() {
  const u = sessionStorage.getItem(SESSION_KEY);
  if (u) showApp(u);
})();
