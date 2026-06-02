# 숨코리아 CMF Library

**저장소** github.com/Leeseungju1991/CMF-Library · `main` · **v2.1.0**   **스택** React 18 + TypeScript · Vite 5 · Tailwind 3 · Firebase(Firestore · Storage · Hosting) · PWA

## 1. 프로젝트 설명

내부 디자인·기획팀이 패브릭 자료(Color · Material · Finish)를 한 곳에서 **검색 · 비교 · 편집**하기 위한 단일 관리자 SPA. CSV로 적재된 원단 데이터를 Firestore 에 두고, 무게 · comp · color 축으로 필터링한 뒤 **카드 그리드 → 비교 표 → 상세 편집 → 의상사진 업로드 → 활동 로그 → 휴지통(복구) → CSV·JSON 내보내기** 까지 수행한다.

| 항목 | 값 |
| --- | --- |
| 사용자 | 숨코리아 내부 디자인·기획·생산 관리자 (공유 계정 `soom/soom`) |
| 데이터 단위 | `cmfItems` 1건 = 원단 1종 (무게/업체명/No/comp/width/mount/cost/color/조직/장소/아카이빙 + 상세정보 + 의상사진 배열) |
| 배포 형태 | Firebase Hosting + Service Worker · 설치형 PWA · GitHub Actions main 자동 |
| 안전 가드 | Firestore Rules · Storage 10MB·`image/*` · 전역 ErrorBoundary · 복합 인덱스 4개 |
| 번들 | 라우트 lazy + manualChunks → 단일 648KB → react 164KB · firebase 398KB · 페이지 청크 2~13KB |

**V2.1.0 핵심 개선 5가지**

```
① 신뢰성   Compare 삭제 ReferenceError · Dashboard 최근 라우팅 · CompareView 빈 타이틀
          Detail 사진 미렌더 · storage/types OutfitPhoto 형 불일치 — 모두 수정
② 운영기능 /logs 활동 로그(액션 배지 4종) · /export CSV·JSON · 전체텍스트 검색 · 사진 확대
③ 안전성   전역 ErrorBoundary · Firestore Rules · Storage 10MB·image/* · VITE_* env 기반
④ 자동화   GitHub Actions ci.yml(빌드) + firebase-hosting.yml(main → live 자동 배포)
⑤ 성능    라우트 lazy import + react/firebase manualChunks · 정적 자산 immutable 캐시
```

<div style="page-break-after: always;"></div>

## 2. 프로젝트 구조도

```
CMF-Library/
├─ src/
│   ├─ main.tsx · App.tsx          ReactDOM + ErrorBoundary + lazy Routes
│   ├─ pages/      Login · Dashboard · Search · Filter · Compare · CompareView
│   │              Add · Detail · Trash · Logs[NEW] · Export[NEW]
│   ├─ components/ Layout · RequireAuth · Swatch · Snackbar · LineChart · ErrorBoundary[NEW]
│   ├─ lib/        firebase · firestore · storage · auth · filterContext · pageCache · types
│   └─ styles/index.css            Tailwind + glass + @media print
├─ scripts/import_csv_to_firestore.mjs       CSV 1회 적재 (firebase-admin)
├─ public/  manifest.webmanifest · sw.js · icons/*
├─ firestore.rules[NEW] · firestore.indexes.json[NEW] · storage.rules[NEW]
├─ firebase.json                   hosting + firestore + storage + 캐시 헤더
├─ .github/workflows/  ci.yml[NEW] · firebase-hosting.yml[NEW]
└─ docs/SECURITY.md[NEW] · CHANGELOG.md[NEW] · .env.example[NEW] · README · package.json v2.1.0
```

**Firestore 컬렉션 / Cloud Storage** —  `cmfItems`(원단 본 데이터, `colorCodes[]` 자동 분해 → array-contains 인덱스) · `cmfTrash`(softDelete 격리 + `originalId` 보존) · `cmfLogs`(CREATE/UPDATE/DELETE/RESTORE 자동 적재) · `cmfPopular`(비교 선택 시 적재 → Top5 학습) · `cmfMeta/filters`(사이드바 옵션 캐시) · `cmf/{itemId}/outfit/{ts}_{filename}`(의상사진).

## 3. 프로젝트 전체 플로우

```
┌─────────┐ soom/soom ┌────────────────────┐
│ /login  │──────────►│ RequireAuth→Layout │  사이드바 7 메뉴 · 모바일 햄버거
└─────────┘           └──────────┬─────────┘
                                 │
  ┌──────────┬──────────┬────────┼────────┬──────────┬───────────┐
  ▼          ▼          ▼        ▼        ▼          ▼           ▼
/dashboard /search   /compare  /add     /logs     /export      /trash
 KPI·Top5  1차+텍스트  2~5선택   신규+사진 배지필터  CSV·JSON     복구/완전삭제
 14일차트  사이드바    비교 표    →detail  상세이동  다운로드      originalId 보존
                                    │
                                    ▼
                          /detail/:id   편집 · 사진 갤러리 · softDelete → /trash
```

**쓰기 시퀀스** — 모든 변경(Add / Edit / Delete / Restore)은 자동으로 `cmfLogs` 에 적재되어 대시보드 14일 차트와 `/logs` 페이지에 반영. 삭제는 `cmfTrash` 격리(`originalId` 보존) → 복구 시 원본 ID 그대로 복원.

**CI/CD + 캐시 방어** — `git push main` → `ci.yml` 빌드 → `firebase-hosting.yml` → live(rules · indexes 동기화 · 정적자산 immutable). 런타임은 localStorage 캐시(10~30분) → Firestore 조회 → `resource-exhausted` 시 stale fallback.

<div style="page-break-after: always;"></div>

## 4. 프로젝트 주요 기능

**4.1 인증·진입** — `/login`(soom/soom · 비밀번호 토글 · Enter 제출) · `RequireAuth` 라우트 가드 · 미인증 시 `/login` 강제 · 로그아웃 버튼(데스크톱/모바일).

**4.2 대시보드** — KPI 카드 4개(총 DB · 마지막 업데이트 · Top1 검색수 · 수정기록수) · 자주 검색되는 항목 Top 5 · 최근 추가 DB 5건(v2.1 `id` 라우팅 버그 수정) · 14일 라인차트 2개(SVG · 외부 deps 0) · `resource-exhausted` 시 stale 캐시 fallback.

**4.3 검색·필터** — 1차 드롭다운(무게 → comp → color, 상위 변경 시 하위 자동 초기화) + 사이드바 2단 체크박스(8 필드 다중) + **전체텍스트 검색[NEW]**(업체명/No/comp/color/조직/장소/아카이빙/컬렉션/샘플위치) · 그리드 12/페이지 · 카드별 상세/삭제(softDelete) · 라우트 이동 시 필터 자동 초기화.

**4.4 색상 비교 (2~5 동시)** — 색상 선택 → 20/페이지(afterId 스택) · 카드 안 체크박스(최대 5 잠금) · 비교 표(color · cost · width · mount · comp · 무게) + 스와치 확대(ESC 닫기) · 선택 시 `cmfPopular` 적재 → Top5 학습 · v2.1 삭제 ReferenceError 수정 + Snackbar 피드백 + 전체 카운트 표시.

**4.5 CMF 추가·상세 편집** — 기본 12 필드 인플레이스 편집(더티 체크 — 변경 없으면 저장 비활성) · 상세정보(사용여부 / 사용 프로젝트 THE GEM·IDEALIAN·NEOR·NEORm·ICONIA / 캐릭터) · color 입력 시 `colorCodes[]` 자동 분해(`KH/GY/GN/PK`) · **의상사진 갤러리[NEW]**(다중 업로드 · 미리보기 · 저장 대기/저장됨 분리 · 클릭 확대 모달 · 개별 제거) · 10MB · `image/*` MIME 검증 · 파일명 sanitize.

**4.6 휴지통 (softDelete·복구)** — 카드 그리드(12/페이지) · 새로고침 · 페이지네이션 · 복구는 `originalId` 보존 복원으로 기존 참조 링크 유지 · 완전삭제는 확인 팝업 + Snackbar · 세션 캐시(뒤로가기 시 화면 유지).

**4.7 활동 로그[NEW] `/logs`** — 최근 200건 시간 역순(`cmfLogs.createdAt DESC`) · 액션별 색상 배지(CREATE emerald · UPDATE blue · DELETE rose · RESTORE amber) · 필터 토글 5종 · 대상 ID 클릭 → 상세 이동(DELETE 비활성).

**4.8 내보내기[NEW] `/export`** — **CSV** UTF-8 BOM + CRLF + RFC4180 이스케이프(Excel 한글 안전) · **JSON** 들여쓰기 직렬화 · 22 컬럼 고정 · 최대 10,000건 · 파일명 자동 타임스탬프.

**4.9 안정성·보안·운영[NEW]** — 전역 **ErrorBoundary**(흰화면 방지 + 새로고침/로그아웃 옵션) · Firebase config → `VITE_*` 환경변수(레거시 fallback) · **firestore.rules**(컬렉션별 read 개방 · write 가드 + 기본 deny) · **storage.rules**(`cmf/{itemId}/outfit/*` 만 10MB·image/* 허용) · 복합 인덱스 4개 · GitHub Actions ci.yml + firebase-hosting.yml · firebase.json immutable 캐시 · `.gitignore` 강화(serviceAccountKey·env·.firebase) · `docs/SECURITY.md` · `CHANGELOG.md`.

**4.10 공통 UX·성능** — 글래스 모피즘 디자인 시스템(Tailwind + 커스텀 유틸) · 모바일 사이드바 햄버거(라우트 이동 시 자동 닫힘) · Snackbar 토스트(2.2s) · ESC 모달 + body 스크롤 잠금 · PWA(navigate 네트워크 우선 · 정적 캐시 우선 · 동일 출처만) · 인쇄 모드 @media print(배경/그림자/사이드바 제거) · 이미지 lazy 로딩 · iOS 자동확대 방지 · 라우트 lazy + manualChunks 청크 분할.
