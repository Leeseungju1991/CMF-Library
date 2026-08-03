import { DEMO_MODE } from "../lib/env";

/**
 * ✅ 데모 모드 배너
 * - `VITE_DEMO_MODE=true` 로 빌드된 경우에만 렌더링된다(GitHub Pages 데모 빌드).
 * - 실제 프로덕션 시스템(Firebase 연동)과 혼동되지 않도록 항상 상단에 고정 표시.
 */
export default function DemoBanner() {
  if (!DEMO_MODE) return null;

  return (
    <div
      role="status"
      className="sticky top-0 z-[10000] w-full bg-gradient-to-r from-purple-600 to-violet-600 text-white text-center text-xs sm:text-sm font-medium px-3 py-2 shadow-md"
      style={{ paddingTop: "calc(env(safe-area-inset-top) + 0.5rem)" }}
    >
      DEMO 모드 — 실제 Firebase 없이 목데이터로 동작합니다. 새로고침 시 일부 변경사항은 유지되지만, 브라우저 저장소를 지우면 초기화됩니다.
    </div>
  );
}
