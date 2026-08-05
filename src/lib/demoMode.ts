/**
 * Firebase 미구성(placeholder 값) 이거나 VITE_DEMO_MODE=true 이면 데모 모드로 동작한다.
 * AWS→Vercel 마이그레이션 이후 실제 Firebase 프로젝트/백엔드 연동 없이도
 * test/test 로그인 후 더미 데이터로 전 화면을 클릭 테스트할 수 있게 한다.
 */
export function isDemoMode(): boolean {
  const env = (import.meta as any).env ?? {};
  const key = env.VITE_FIREBASE_API_KEY;
  if (!key || key === "YOUR_FIREBASE_API_KEY") return true;
  return env.VITE_DEMO_MODE === "true";
}
