<style>
  @page {
    size: letter;
    margin: 0.45in 0.5in;
  }
  body {
    font-family: 'Helvetica Neue', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;
    color: #1f2937;
    font-size: 11pt;
    line-height: 1.55;
    background: #ffffff;
  }
  h1, h2, h3, p, ul, ol, table, pre { margin: 0; padding: 0; }

  /* ─── HERO BANNER ────────────────────────────────────────── */
  .hero {
    background: linear-gradient(135deg, #6D5DFE 0%, #8B5CF6 55%, #EC4899 100%);
    color: white;
    padding: 22px 28px;
    border-radius: 18px;
    margin-bottom: 18px;
  }
  .hero .title {
    font-size: 26pt;
    font-weight: 800;
    letter-spacing: -0.02em;
    line-height: 1.1;
  }
  .hero .subtitle {
    font-size: 11pt;
    opacity: 0.92;
    margin-top: 4px;
  }
  .hero .chips { margin-top: 14px; }
  .hero .chip {
    display: inline-block;
    background: rgba(255,255,255,0.22);
    border: 1px solid rgba(255,255,255,0.35);
    padding: 3px 10px;
    border-radius: 999px;
    font-size: 9pt;
    font-weight: 600;
    margin-right: 5px;
    margin-bottom: 4px;
  }

  /* ─── SECTION HEADER ────────────────────────────────────── */
  .sec {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 16px 0 12px;
  }
  .sec .num {
    width: 36px; height: 36px;
    border-radius: 10px;
    background: linear-gradient(135deg, #6D5DFE, #EC4899);
    color: white;
    font-weight: 800;
    font-size: 16pt;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .sec .name { font-size: 17pt; font-weight: 800; color: #111827; letter-spacing: -0.01em; }
  .sec .tag { font-size: 9pt; color: #6b7280; margin-left: auto; }

  /* ─── INTRO LEAD ───────────────────────────────────────── */
  .lead {
    font-size: 11.5pt;
    line-height: 1.65;
    color: #374151;
    padding: 0 4px;
    margin-bottom: 14px;
  }
  .lead b { color: #6D5DFE; font-weight: 700; }

  /* ─── INFO TABLE ───────────────────────────────────────── */
  .info {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid #e5e7eb;
    font-size: 10pt;
    margin-bottom: 14px;
  }
  .info td {
    padding: 9px 14px;
    border-bottom: 1px solid #f3f4f6;
    vertical-align: top;
  }
  .info tr:last-child td { border-bottom: 0; }
  .info td:first-child {
    width: 130px;
    font-weight: 700;
    color: #4b5563;
    background: #f9fafb;
  }

  /* ─── 5 IMPROVEMENT CARDS ─────────────────────────────── */
  .kpis { display: flex; flex-wrap: wrap; gap: 8px; }
  .kpi {
    flex: 1 1 calc(20% - 8px);
    min-width: 95px;
    border-radius: 12px;
    padding: 12px 12px;
    color: white;
    box-shadow: 0 6px 14px rgba(15,23,42,0.10);
  }
  .kpi .icon { font-size: 18pt; line-height: 1; margin-bottom: 5px; font-weight: 800; }
  .kpi .label { font-size: 9.5pt; font-weight: 800; letter-spacing: 0.01em; }
  .kpi .desc { font-size: 8.5pt; opacity: 0.92; margin-top: 4px; line-height: 1.35; }
  .kpi-1 { background: linear-gradient(135deg, #6D5DFE, #4F46E5); }
  .kpi-2 { background: linear-gradient(135deg, #EC4899, #DB2777); }
  .kpi-3 { background: linear-gradient(135deg, #60A5FA, #2563EB); }
  .kpi-4 { background: linear-gradient(135deg, #10B981, #059669); }
  .kpi-5 { background: linear-gradient(135deg, #F59E0B, #D97706); }

  /* ─── DIAGRAM CARD ───────────────────────────────────── */
  .diagram {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 10px 14px;
    margin-bottom: 10px;
  }
  .diagram pre {
    font-family: 'JetBrains Mono', 'Consolas', monospace;
    font-size: 8pt;
    line-height: 1.4;
    color: #1f2937;
    white-space: pre;
  }
  .diagram .title {
    font-size: 9.5pt;
    font-weight: 800;
    color: #6D5DFE;
    margin-bottom: 6px;
  }

  /* ─── FEATURE GRID (page 3) ─────────────────────────── */
  .features { display: flex; flex-wrap: wrap; gap: 9px; }
  .feat {
    flex: 1 1 calc(50% - 9px);
    min-width: 230px;
    border: 1px solid #e5e7eb;
    border-left: 4px solid #6D5DFE;
    border-radius: 10px;
    padding: 10px 13px;
    background: white;
  }
  .feat .head {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 10.5pt;
    font-weight: 800;
    color: #111827;
    margin-bottom: 5px;
  }
  .feat .head .id {
    background: #EDE9FE;
    color: #6D5DFE;
    padding: 1px 6px;
    border-radius: 5px;
    font-size: 8.5pt;
    font-weight: 800;
  }
  .feat .head .new {
    background: #FCE7F3;
    color: #DB2777;
    padding: 1px 6px;
    border-radius: 5px;
    font-size: 7.5pt;
    font-weight: 800;
    letter-spacing: 0.04em;
  }
  .feat p { font-size: 9pt; line-height: 1.5; color: #4b5563; }
  .feat-2  { border-left-color: #EC4899; }
  .feat-3  { border-left-color: #60A5FA; }
  .feat-4  { border-left-color: #10B981; }
  .feat-5  { border-left-color: #F59E0B; }
  .feat-6  { border-left-color: #8B5CF6; }
  .feat-7  { border-left-color: #DB2777; }
  .feat-8  { border-left-color: #2563EB; }
  .feat-9  { border-left-color: #059669; }
  .feat-10 { border-left-color: #D97706; }

  .br { page-break-after: always; }

  /* footer pageno is added by make-pdf */
</style>

<div class="hero">
  <div class="title">숨코리아 CMF Library</div>
  <div class="subtitle">패브릭 CMF 자료를 한 곳에서 검색·비교·편집하는 내부 관리자 SPA · v2.1.0</div>
  <div class="chips">
    <span class="chip">React 18</span>
    <span class="chip">TypeScript</span>
    <span class="chip">Vite 5</span>
    <span class="chip">Tailwind 3</span>
    <span class="chip">Firebase</span>
    <span class="chip">PWA</span>
    <span class="chip">GitHub Actions</span>
  </div>
</div>

<div class="sec">
  <div class="num">1</div>
  <div class="name">프로젝트 설명</div>
  <div class="tag">github.com/Leeseungju1991/CMF-Library · main</div>
</div>

<div class="lead">
숨코리아 내부 디자인·기획팀이 패브릭 자료(<b>C</b>olor · <b>M</b>aterial · <b>F</b>inish)를 한 곳에서 다루기 위한 단일 관리자 SPA. CSV로 적재된 원단 데이터를 Firestore에 두고, <b>무게 · comp · color</b> 축으로 필터링한 뒤 카드 그리드 → 비교 표 → 상세 편집 → 의상사진 업로드 → 활동 로그 → 휴지통 → CSV/JSON 내보내기까지 처리한다.
</div>

<table class="info">
  <tr><td>사용자</td><td>내부 디자인·기획·생산 관리자 (공유 계정 <code>soom / soom</code>)</td></tr>
  <tr><td>데이터 단위</td><td><code>cmfItems</code> 1건 = 원단 1종 (무게/업체명/No/comp/width/mount/cost/color + 상세정보 + 의상사진 배열)</td></tr>
  <tr><td>배포</td><td>Firebase Hosting + Service Worker · 설치형 PWA · GitHub Actions main 자동 배포</td></tr>
  <tr><td>안전 가드</td><td>Firestore Rules · Storage 10MB / <code>image/*</code> · 전역 ErrorBoundary · 복합 인덱스 4개</td></tr>
</table>

<div style="font-size:11pt; font-weight:800; color:#111827; margin: 10px 0 10px;">
  V2.1.0 핵심 개선 5가지
</div>

<div class="kpis">
  <div class="kpi kpi-1">
    <div class="icon">①</div>
    <div class="label">신뢰성</div>
    <div class="desc">Compare 삭제 ReferenceError · Dashboard 라우팅 · 사진 미렌더 등 5종 수정</div>
  </div>
  <div class="kpi kpi-2">
    <div class="icon">②</div>
    <div class="label">운영 기능</div>
    <div class="desc">/logs 활동로그 · /export CSV·JSON · 전체텍스트 검색 · 사진 확대</div>
  </div>
  <div class="kpi kpi-3">
    <div class="icon">③</div>
    <div class="label">안전성</div>
    <div class="desc">ErrorBoundary · Firestore Rules · Storage 10MB·image/* · env 기반</div>
  </div>
  <div class="kpi kpi-4">
    <div class="icon">④</div>
    <div class="label">자동화</div>
    <div class="desc">GitHub Actions CI + Firebase Hosting main → live 자동 배포</div>
  </div>
  <div class="kpi kpi-5">
    <div class="icon">⑤</div>
    <div class="label">성능</div>
    <div class="desc">라우트 lazy + manualChunks → 단일 648KB → 청크 17개</div>
  </div>
</div>

<div class="br"></div>

<div class="sec">
  <div class="num">2</div>
  <div class="name">프로젝트 구조도</div>
</div>

<div class="diagram">
  <div class="title">디렉터리 트리</div>
  <pre>CMF-Library/
├─ src/
│   ├─ main.tsx · App.tsx        ReactDOM + ErrorBoundary + lazy Routes
│   ├─ pages/                    Login · Dashboard · Search · Filter · Compare
│   │                            CompareView · Add · Detail · Trash
│   │                            Logs[NEW] · Export[NEW]
│   ├─ components/               Layout · RequireAuth · Swatch · Snackbar
│   │                            LineChart · ErrorBoundary[NEW]
│   ├─ lib/                      firebase · firestore · storage · auth
│   │                            filterContext · pageCache · types
│   └─ styles/index.css          Tailwind + glass + @media print
├─ scripts/import_csv_to_firestore.mjs   CSV 1회 적재 (firebase-admin)
├─ public/  manifest.webmanifest · sw.js · icons/*
├─ firestore.rules · firestore.indexes.json · storage.rules     [NEW]
├─ firebase.json                 hosting + firestore + storage + 캐시 헤더
├─ .github/workflows/            ci.yml · firebase-hosting.yml  [NEW]
└─ docs/SECURITY.md · CHANGELOG.md · .env.example · README · v2.1.0</pre>
</div>

<div class="diagram" style="background:linear-gradient(135deg,#EEF2FF,#FDF2F8); border-color:#DDD6FE;">
  <div class="title" style="color:#DB2777;">데이터 모델 (Firestore · Cloud Storage)</div>
  <pre>cmfItems    원단 본 데이터 · colorCodes[] 자동 분해 → array-contains
cmfTrash    softDelete 격리소 · originalId 보존 → ID 그대로 복구
cmfLogs     CREATE / UPDATE / DELETE / RESTORE 자동 적재
cmfPopular  비교 선택 시 적재 → 대시보드 Top5 학습
cmf/{itemId}/outfit/*    의상사진 (10MB · image/*)</pre>
</div>

<div class="sec">
  <div class="num">3</div>
  <div class="name">프로젝트 전체 플로우</div>
</div>

<div class="diagram">
  <div class="title">사용자 여정 · 라우트 트리</div>
  <pre>┌─────────┐ soom/soom  ┌────────────────────┐
│ /login  │ ─────────► │ RequireAuth→Layout │   사이드바 7 메뉴 · 모바일 햄버거
└─────────┘            └──────────┬─────────┘
                                  │
  ┌──────────┬──────────┬─────────┼─────────┬──────────┬───────────┐
  ▼          ▼          ▼         ▼         ▼          ▼           ▼
/dashboard /search   /compare   /add     /logs     /export      /trash
 KPI·Top5  1차+텍스트  2~5 선택  신규+사진  배지 필터  CSV·JSON     복구/완전삭제
 14일 차트 + 사이드바  비교 표    →detail   상세 이동  다운로드     originalId 보존
                                     │
                                     ▼
                          /detail/:id   편집 · 사진 갤러리 · softDelete → /trash</pre>
</div>

<div class="diagram" style="background:linear-gradient(135deg,#ECFDF5,#EFF6FF); border-color:#A7F3D0;">
  <div class="title" style="color:#059669;">CI/CD &nbsp;&middot;&nbsp; 런타임 캐시 방어</div>
  <pre>git push main ─► ci.yml(build) ─► firebase-hosting.yml ─► live
              · firestore.rules / storage.rules / indexes 동기화
              · 정적자산 immutable · sw.js no-cache

런타임 : localStorage 캐시(10~30분) → Firestore → resource-exhausted
        시 stale fallback (카드 "쿼터초과" 라벨, 앱은 계속 동작)</pre>
</div>

<div class="br"></div>

<div class="sec">
  <div class="num">4</div>
  <div class="name">프로젝트 주요 기능</div>
  <div class="tag">10개 기능 그룹 · NEW = v2.1.0 신규</div>
</div>

<div class="features">

  <div class="feat feat-1">
    <div class="head"><span class="id">4.1</span>인증 · 진입</div>
    <p><code>/login</code> · soom/soom · 비밀번호 토글 · Enter 제출. <code>RequireAuth</code> 라우트 가드, 미인증 시 자동 리다이렉트.</p>
  </div>

  <div class="feat feat-2">
    <div class="head"><span class="id">4.2</span>대시보드</div>
    <p>KPI 카드 4개 · 자주 검색 Top5 · 최근 추가 5건 · 14일 라인차트 2개(SVG) · <code>resource-exhausted</code> stale fallback.</p>
  </div>

  <div class="feat feat-3">
    <div class="head"><span class="id">4.3</span>검색 · 필터 <span class="new">NEW</span></div>
    <p>1차 드롭다운(무게→comp→color) + 사이드바 2단 체크박스(8필드) + <b>전체텍스트 검색</b>(9필드). 그리드 12/페이지.</p>
  </div>

  <div class="feat feat-4">
    <div class="head"><span class="id">4.4</span>색상 비교</div>
    <p>2~5개 동시 비교 · 20/페이지(afterId 스택) · 비교 표(color/cost/width/mount/comp/무게) + 스와치 확대.</p>
  </div>

  <div class="feat feat-5">
    <div class="head"><span class="id">4.5</span>추가 · 상세 편집</div>
    <p>12필드 인플레이스 + 더티 체크. color → <code>colorCodes[]</code> 자동 분해. 의상사진 갤러리(10MB·<code>image/*</code>).</p>
  </div>

  <div class="feat feat-6">
    <div class="head"><span class="id">4.6</span>휴지통</div>
    <p>softDelete 격리 · <b>originalId 보존</b> 복구로 참조 링크 유지 · 완전삭제 확인 팝업 · 세션 캐시.</p>
  </div>

  <div class="feat feat-7">
    <div class="head"><span class="id">4.7</span>활동 로그 <span class="new">NEW</span></div>
    <p>최근 200건 시간역순 · 액션 배지 4종(CREATE/UPDATE/DELETE/RESTORE) · 필터 토글 · 대상 상세 이동.</p>
  </div>

  <div class="feat feat-8">
    <div class="head"><span class="id">4.8</span>내보내기 <span class="new">NEW</span></div>
    <p><b>CSV</b> UTF-8 BOM + CRLF + RFC4180(Excel 한글 안전) · <b>JSON</b> · 22컬럼 · 최대 10,000건.</p>
  </div>

  <div class="feat feat-9">
    <div class="head"><span class="id">4.9</span>안정성 · 보안 <span class="new">NEW</span></div>
    <p>전역 ErrorBoundary · Firestore/Storage Rules · 인덱스 4개 · GitHub Actions CI+배포 · <code>.gitignore</code> 강화.</p>
  </div>

  <div class="feat feat-10">
    <div class="head"><span class="id">4.10</span>공통 UX · 성능</div>
    <p>글래스 모피즘 · 모바일 햄버거 · Snackbar · PWA · 인쇄 모드 · 라우트 lazy + manualChunks 청크 분할.</p>
  </div>

</div>
