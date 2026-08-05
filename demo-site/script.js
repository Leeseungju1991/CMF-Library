// ============== MOCK DATA (더미 데이터) ============== //
const colorHex = { WH:'#f4f4f2', BK:'#1c1c1e', PK:'#f4b8c6', GY:'#9a9a9a', KH:'#b9ab84', BL:'#3a5a8c', GN:'#5e8c5a' };
const items = [
  { id:'demo-1', weight:'180g', vendor:'㈜동양섬유', comp:'Cotton 100%', width:'150cm', cost:'3,200원/y', color:'WH', archive:'완료', date:'2026-07-06' },
  { id:'demo-2', weight:'220g', vendor:'삼일방직', comp:'Polyester 100%', width:'160cm', cost:'2,800원/y', color:'BK', archive:'완료', date:'2026-07-08' },
  { id:'demo-3', weight:'150g', vendor:'㈜백양', comp:'Cotton/Poly 65/35', width:'145cm', cost:'3,500원/y', color:'PK', archive:'진행중', date:'2026-07-16' },
  { id:'demo-4', weight:'300g', vendor:'한일텍스', comp:'Wool 80% / Nylon 20%', width:'150cm', cost:'8,900원/y', color:'GY', archive:'완료', date:'2026-06-06' },
  { id:'demo-5', weight:'95g', vendor:'㈜대성니트', comp:'Rayon 100%', width:'170cm', cost:'4,100원/y', color:'KH', archive:'완료', date:'2026-05-07' },
  { id:'demo-6', weight:'410g', vendor:'㈜동양섬유', comp:'Denim Cotton 100%', width:'148cm', cost:'5,600원/y', color:'BL', archive:'완료', date:'2026-07-21' },
  { id:'demo-7', weight:'130g', vendor:'삼일방직', comp:'Cotton 95% / Spandex 5%', width:'155cm', cost:'3,900원/y', color:'PK', archive:'진행중', date:'2026-07-28' },
  { id:'demo-8', weight:'260g', vendor:'㈜백양', comp:'Polyester 90% / Spandex 10%', width:'150cm', cost:'4,700원/y', color:'GN', archive:'완료', date:'2026-06-16' },
];
const topSearches = [
  { name: '㈜동양섬유 · 180g', count: 2 },
  { name: '㈜백양 · 150g', count: 1 },
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

function swatchCard(it) {
  return `
    <div class="swatch-card">
      <div class="swatch-color" style="background:${colorHex[it.color] || '#888'}"></div>
      <div class="swatch-name">${it.vendor}</div>
      <div class="swatch-meta">${it.comp}<br/>${it.weight} · ${it.width} · ${it.cost}</div>
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
    <tr><td class="strong">${it.vendor}</td><td>${it.weight} · ${it.width}</td></tr>`).join('');
}

function renderSearch(filterText = '', colorFilter = '') {
  const q = filterText.trim().toLowerCase();
  const filtered = items.filter(it =>
    (!q || it.vendor.toLowerCase().includes(q) || it.comp.toLowerCase().includes(q)) &&
    (!colorFilter || it.color === colorFilter)
  );
  document.getElementById('swatch-grid').innerHTML = filtered.map(swatchCard).join('') || '<p style="color:var(--text-3);font-size:13px">검색 결과가 없습니다.</p>';
}

function renderCompare() {
  document.getElementById('compare-rows').innerHTML = items.map(it => `
    <tr>
      <td class="strong">${it.vendor}</td><td>${it.weight}</td><td>${it.comp}</td><td>${it.width}</td><td>${it.cost}</td>
      <td><span style="display:inline-flex;align-items:center;gap:6px"><span style="width:14px;height:14px;border-radius:4px;background:${colorHex[it.color]||'#888'};display:inline-block;border:1px solid var(--border-2)"></span>${it.color}</span></td>
    </tr>`).join('');
}

function renderTrash() {
  document.getElementById('trash-rows').innerHTML = trash.map(t => `
    <tr><td class="strong">${t.vendor}</td><td>${t.weight}</td><td>${t.deletedAt}</td>
    <td><button class="tag" style="cursor:pointer" onclick="alert('데모 환경에서는 복구되지 않습니다.')">복구</button></td></tr>`).join('')
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
});
document.getElementById('logout-btn').addEventListener('click', () => {
  sessionStorage.removeItem(SESSION_KEY);
  document.getElementById('app').classList.remove('is-active');
  document.getElementById('login-screen').classList.remove('hidden');
});
(function initSession() {
  const u = sessionStorage.getItem(SESSION_KEY);
  if (u) showApp(u);
})();
