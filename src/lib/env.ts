/**
 * ✅ 데모 모드 플래그
 * - GitHub Pages 등 백엔드(Firebase) 없이 정적 호스팅할 때 사용.
 * - `VITE_DEMO_MODE=true` 로 빌드하면 Firebase(Firestore/Storage/Auth) 대신
 *   로컬(in-memory + localStorage) 목데이터로 동작한다.
 * - 빌드 스크립트: `npm run build:demo` (package.json 참고)
 */
export const DEMO_MODE = ((import.meta as any).env?.VITE_DEMO_MODE ?? "") === "true";
