# Changelog

All notable changes to this project will be documented here. Format based on Keep a Changelog.

## [2.1.0] - 2026-06-02

### Fixed
- Compare 페이지 삭제 버튼 ReferenceError 해결
- Dashboard 최근추가 항목 클릭 시 detail 라우팅 오류 수정
- CompareView 빈 타이틀 및 중복 `type` 속성 정리
- Detail 페이지 의상사진 섹션 렌더링 누락 복구
- `storage.ts` `OutfitPhoto` 타입 불일치 정정
- NEORm 오타 수정

### Added
- 전체텍스트 검색 (제목/코드/메모 통합 검색)
- CSV 내보내기 (현재 필터 결과 그대로 다운로드)
- 활동 로그(Logs) 페이지 — `cmfLogs` 컬렉션 기반
- 의상사진 갤러리(Carousel) 모달
- React `ErrorBoundary` 도입
- 로딩 스켈레톤 UI
- 환경변수(`VITE_FIREBASE_*`) 기반 Firebase 설정
- Firestore / Storage 보안 규칙 (`firestore.rules`, `storage.rules`)
- GitHub Actions CI 및 Firebase Hosting 배포 워크플로

### Security
- 서비스 계정 키 `.gitignore` 강화 (`serviceAccount*.json`, `**/serviceAccount*.json`)
- Firestore 인덱스 매니페스트 추가 (`firestore.indexes.json`)

### Changed
- README 동작 흐름 / 기능 구조 중심으로 재작성

## [2.0.0] - earlier

Initial public version.
