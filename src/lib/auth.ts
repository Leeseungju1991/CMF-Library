const KEY = "soom_auth";

export function isAuthed() {
  return localStorage.getItem(KEY) === "true";
}

export function login(id: string, pw: string) {
  // "test" / "test" is kept as an alias so the credentials printed on the
  // portfolio/resume (test/test) keep working alongside the original soom/soom.
  if ((id === "soom" && pw === "soom") || (id === "test" && pw === "test")) {
    localStorage.setItem(KEY, "true");
    return true;
  }
  return false;
}

export function logout() {
  localStorage.removeItem(KEY);
}
