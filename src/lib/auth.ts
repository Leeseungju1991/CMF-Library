const KEY = "soom_auth";

export function isAuthed() {
  return localStorage.getItem(KEY) === "true";
}

// 2026-08 — AWS→Vercel 마이그레이션. 데모 안내문(test/test)과 실제 로그인이
// 어긋나 있던 문제를 고쳐, 데모 계정 test/test 도 함께 허용한다.
const VALID_CREDENTIALS: Array<[string, string]> = [
  ["soom", "soom"],
  ["test", "test"],
];

export function login(id: string, pw: string) {
  const ok = VALID_CREDENTIALS.some(([u, p]) => u === id && p === pw);
  if (ok) {
    localStorage.setItem(KEY, "true");
    return true;
  }
  return false;
}

export function logout() {
  localStorage.removeItem(KEY);
}
