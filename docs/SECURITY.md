# 보안 정책 (SOOM CMF Library)

본 문서는 SOOM CMF Library(이하 "본 도구")의 현재 보안 자세(security posture)와
V2 마이그레이션 계획을 정리한다. 본 도구는 SOOM 디자인팀이 사용하는 사내 어드민
전용 라이브러리이며, 일반 사용자에게 공개되지 않는다.

## 1. 위협 모델 (현재 V1.0)

- **사용 환경**: 사내 디자인팀 전용. 공개 검색에 노출되지 않는 Firebase Hosting URL.
- **데이터 민감도**: 원단/색상/공정 라이브러리 메타데이터. 개인정보 없음.
- **공격 표면**:
  - 누군가가 Hosting URL을 알아내 접근하는 경우
  - 빌드 산출물에 포함된 Firebase Web Config 키가 외부로 유출되는 경우
  - 공유 자격증명("soom/soom")이 사외로 알려지는 경우

## 2. 인증 (Authentication)

- 현재 로그인은 클라이언트 측 **공유 자격증명 1개**(`soom/soom`)이며 통과 시
  `localStorage` 플래그가 설정된다. Firebase Authentication 미사용.
- 이는 사내 도구의 편의성과 V1.0 마감 일정을 우선해 의도적으로 채택한 절충안이다.

## 3. 권한 / 규칙 (Authorization)

- **Firestore 규칙** (`firestore.rules`): 화이트리스트된 컬렉션(`cmfItems`,
  `cmfTrash`, `cmfLogs`, `cmfPopular`, `cmfMeta`)에 한해 읽기는 공개,
  쓰기는 `2099-01-01` sunset 기한까지 임시 허용. 그 외 경로는 기본 거부.
- **Storage 규칙** (`storage.rules`): 모든 객체 읽기 허용,
  `cmf/{itemId}/outfit/{file}` 경로에 한해 `image/*` 컨텐츠 타입과
  10 MB 미만 사이즈만 업로드 허용.

## 4. Firebase Web Config가 "공개"인 이유

`VITE_FIREBASE_*` 값은 빌드 산출물에 포함되므로 사실상 공개 값으로 간주한다.
Firebase 보안 모델은 **API 키 비공개**가 아니라 **보안 규칙(rules) 기반**
이라는 점에 유의. 따라서 본 도구의 실질적 보안 경계는 위 §3 규칙이다.

## 5. 비밀 관리

- `serviceAccountKey*.json`, `**/serviceAccount*.json`은 `.gitignore`로 차단.
- `.env`, `.env.local`, `.env.*.local`도 커밋 금지.
- 배포 시 GitHub Secrets로 `FIREBASE_SERVICE_ACCOUNT`, `FIREBASE_PROJECT_ID`,
  `VITE_FIREBASE_*` 주입.

## 6. V2 후속 작업 (계획)

1. Firebase Authentication 도입 (Google Workspace SSO 우선 검토).
2. `firestore.rules` / `storage.rules`의 `openWriteAllowed()` 헬퍼와
   sunset 시간 분기를 제거하고 `request.auth != null` 강제.
3. `cmfLogs`에 `uid` 필드를 기록하도록 클라이언트 수정 + 감사 추적 강화.
4. `soom/soom` 로컬스토리지 플래그 제거.

## 7. 사고 대응

- 자격증명 유출 의심 시: 디자인팀 슬랙 `#cmf-admin` 채널에 즉시 알리고,
  Firebase Console에서 새로운 Hosting site로 리디렉션 후 기존 URL 폐기.
- 데이터 손상 의심 시: Firestore Point-in-Time Recovery 사용
  (Blaze 요금제 활성화 필요).
