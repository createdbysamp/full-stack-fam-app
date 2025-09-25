const KEY = "auth_tokens";

export function getTokens() {
  try { return JSON.parse(localStorage.getItem(KEY) || "null"); }
  catch { return null; }
}
export function isAuthed() {
  const t = getTokens();
  return !!t?.token;
}
export function clearSession() {
  localStorage.removeItem(KEY);
}