const BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

const STORAGE = {
  token: "token",
  refreshToken: "refreshToken",
  expiresAt: "expiresAt",
  userName: "userName",
};

// session storage helpers
function getSession() {
  const token = localStorage.getItem(STORAGE.token) || "";
  const refreshToken = localStorage.getItem(STORAGE.refreshToken) || "";
  const expiresAt = localStorage.getItem(STORAGE.expiresAt) || "";
  const userName = localStorage.getItem(STORAGE.userName) || "";
  return { token, refreshToken, expiresAt, userName };
}

function setSession({ token, refreshToken, expiresAt, userName }) {
  if (token) localStorage.setItem(STORAGE.token, token);
  if (refreshToken) localStorage.setItem(STORAGE.refreshToken, refreshToken);
  if (expiresAt) localStorage.setItem(STORAGE.expiresAt, expiresAt);
  if (userName) localStorage.setItem(STORAGE.userName, userName);
}

export function clearSession() {
  Object.values(STORAGE).forEach((k) => localStorage.removeItem(k));
}

function isExpiredOrNear(expiresAt, skewSeconds = 10) {
  if (!expiresAt) return true;
  const exp = new Date(expiresAt).getTime();
  return Date.now() + skewSeconds * 1000 >= exp;
}

function authHeaders() {
  const { token } = getSession();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// refresh flow
let refreshing = null;

async function refreshIfNeeded() {
  const session = getSession();
  if (!session.token || !session.refreshToken) return;

  if (!isExpiredOrNear(session.expiresAt)) return; // token good

  if (!refreshing) {
    refreshing = (async () => {
      const res = await fetch(`${BASE}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: session.token,
          refreshToken: session.refreshToken,
        }),
      });
      if (!res.ok) {
        refreshing = null;
        throw new Error("Refresh failed");
      }
      const data = await res.json(); // { token, refreshToken, expiresAt }
      setSession({
        token: data.token,
        refreshToken: data.refreshToken,
        expiresAt: data.expiresAt,
      });
      refreshing = null;
    })();
  }
  return refreshing;
}

async function http(
  path,
  { method = "GET", body, headers = {} } = {},
  retry = true
) {
  await refreshIfNeeded();

  // attempt request
  let res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  // if unauthorized, try refresh once and retry the original request
  if (res.status === 401 && retry) {
    try {
      await refreshIfNeeded();
      res = await fetch(`${BASE}${path}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch {
      // blank
    }
  }

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(msg || `HTTP ${res.status}`);
  }

  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}

// auth endpoints
export async function registerUser({ userName, email, password }) {
  // backend expects { UserName, Email, Password }
  return http("/auth/register", {
    method: "POST",
    body: { UserName: userName, Email: email, Password: password },
  });
}

export async function loginUser({ userName, password }) {
  // backend expects { UserName, Password }, and returns { token, refreshToken, expiresAt }
  const data = await http("/auth/login", {
    method: "POST",
    body: { UserName: userName, Password: password },
  });
  setSession({
    token: data.token,
    refreshToken: data.refreshToken,
    expiresAt: data.expiresAt,
    userName,
  });
  return data;
}

export function logoutUser() {
  clearSession();
}

export async function authPing() {
  return http("/auth/protected");
}

// ai endpoints ( will adjust if needed )
export async function generateWorkout(payload) {
  return http("/ai/workout", { method: "POST", body: payload });
}

export async function generateMeal(payload) {
  return http("/ai/meal", { method: "POST", body: payload });
}

// plans and history
export async function fetchHistory() {
  return http("/plans");
}

export async function savePlan(plan) {
  return http("/plans", { method: "POST", body: plan });
}

export async function deletePlan(id) {
  return http(`/plans/${id}`, { method: "DELETE" });
}
