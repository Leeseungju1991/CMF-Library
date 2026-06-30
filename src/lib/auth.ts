const KEY = "soom_auth";

export function isAuthed() {
  return localStorage.getItem(KEY) === "true";
}

export function login(id: string, pw: string) {
  // 뷰어 계정 — 화면 열람 전용 (test/test). 기존 soom/soom 도 유지.
  if ((id === "test" && pw === "test") || (id === "soom" && pw === "soom")) {
    localStorage.setItem(KEY, "true");
    return true;
  }
  return false;
}

export function logout() {
  localStorage.removeItem(KEY);
}
