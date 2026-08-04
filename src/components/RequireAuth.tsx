import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { isAuthed } from "../lib/auth";
import { DEMO_MODE } from "../lib/env";

export default function RequireAuth({ children }: { children: ReactNode }) {
  // ✅ 데모 모드: 실제 계정/로그인 백엔드가 없으므로 데모 사용자로 자동 인증한다.
  if (!DEMO_MODE && !isAuthed()) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
