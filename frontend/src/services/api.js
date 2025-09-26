const BASE = import.meta.env.VITE_API_BASE || "http://localhost:5073";
// console.log("API BASE =", BASE); Uncomment if required to test

const KEY = "auth_tokens";

export function getSession() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "null");
  } catch {
    return null;
  }
}
function setSession(next) {
  localStorage.setItem(KEY, JSON.stringify(next));
}
export function clearSession() {
  localStorage.removeItem(KEY);
}

function isExpiredOrNear(expiresAt, skewSeconds = 10) {
  if (!expiresAt) return true;
  return Date.now() + skewSeconds * 1000 >= new Date(expiresAt).getTime();
}
function authHeaders() {
  const s = getSession();
  return s?.token ? { Authorization: `Bearer ${s.token}` } : {};
}

// refresh flow
let refreshing = null;
async function refreshIfNeeded() {
  const s = getSession();
  if (!s?.token || !s?.refreshToken) return;
  if (!isExpiredOrNear(s.expiresAt)) return;

  if (!refreshing) {
    refreshing = (async () => {
      const res = await fetch(`${BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: s.token, refreshToken: s.refreshToken }),
      });
      if (!res.ok) {
        refreshing = null;
        throw new Error("Refresh failed");
      }
      const data = await res.json(); // { token, refreshToken, expiresAt }
      setSession({ ...s, ...data });
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

  const doFetch = () =>
    fetch(`${BASE}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

  let res = await doFetch();
  if (res.status === 401 && retry) {
    try {
      await refreshIfNeeded();
      res = await doFetch();
    } catch {
      /* intentionally ignore refresh errors */
    }
  }
  if (!res.ok)
    throw new Error((await res.text().catch(() => "")) || `HTTP ${res.status}`);

  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}

// AUTH
export async function registerUser({ userName, email, password }) {
  return http("/auth/register", {
    method: "POST",
    body: { UserName: userName, Email: email, Password: password },
  });
}
export async function loginUser({ userName, password }) {
  const data = await http("/auth/login", {
    method: "POST",
    body: { UserName: userName, Password: password },
  });
  setSession({ ...data, userName });
  return data;
}
export async function logoutUser() {
  const s = getSession();
  try {
    await http("/auth/logout", {
      method: "POST",
      body: { Token: s?.token, RefreshToken: s?.refreshToken },
    });
  } catch {
    // intentionally ignore refresh errors
  }
  clearSession();
}

export async function authPing() {
  return http("/auth/protected");
}

// AI
export async function generateWorkout(payload) {
  const userInput =
    typeof payload === "string" ? payload : payload.userInput || payload;
  if (!userInput) throw new Error("userInput is required");
  const encoded = encodeURIComponent(userInput);
  return http(`/ai/workout?userInput=${encoded}`);
}

// WORKOUTs
export async function fetchHistory() {
  return http("/workouts");
}
export async function getworkout(id) {
  return http(`/workouts/${id}`);
}
export async function saveworkout(w) {
  return http("/workouts/create", { method: "POST", body: w });
}
export async function deleteWorkout(id) {
  return http(`/workouts/delete/${id}`, { method: "POST" });
}

// const STORAGE = {
//   token: "token",
//   refreshToken: "refreshToken",
//   expiresAt: "expiresAt",
//   userName: "userName",
// };

// // session storage helpers
// function getSession() {
//   const token = localStorage.getItem(STORAGE.token) || "";
//   const refreshToken = localStorage.getItem(STORAGE.refreshToken) || "";
//   const expiresAt = localStorage.getItem(STORAGE.expiresAt) || "";
//   const userName = localStorage.getItem(STORAGE.userName) || "";
//   return { token, refreshToken, expiresAt, userName };
// }

// function setSession({ token, refreshToken, expiresAt, userName }) {
//   if (token) localStorage.setItem(STORAGE.token, token);
//   if (refreshToken) localStorage.setItem(STORAGE.refreshToken, refreshToken);
//   if (expiresAt) localStorage.setItem(STORAGE.expiresAt, expiresAt);
//   if (userName) localStorage.setItem(STORAGE.userName, userName);
// }

// export function clearSession() {
//   Object.values(STORAGE).forEach((k) => localStorage.removeItem(k));
// }

// function isExpiredOrNear(expiresAt, skewSeconds = 10) {
//   if (!expiresAt) return true;
//   const exp = new Date(expiresAt).getTime();
//   return Date.now() + skewSeconds * 1000 >= exp;
// }

// function authHeaders() {
//   const { token } = getSession();
//   return token ? { Authorization: `Bearer ${token}` } : {};
// }

// // refresh flow
// let refreshing = null;

// async function refreshIfNeeded() {
//   const session = getSession();
//   if (!session.token || !session.refreshToken) return;

//   if (!isExpiredOrNear(session.expiresAt)) return; // token good

//   if (!refreshing) {
//     refreshing = (async () => {
//       const res = await fetch(`${BASE}/auth/refresh`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           token: session.token,
//           refreshToken: session.refreshToken,
//         }),
//       });
//       if (!res.ok) {
//         refreshing = null;
//         throw new Error("Refresh failed");
//       }
//       const data = await res.json(); // { token, refreshToken, expiresAt }
//       setSession({
//         token: data.token,
//         refreshToken: data.refreshToken,
//         expiresAt: data.expiresAt,
//       });
//       refreshing = null;
//     })();
//   }
//   return refreshing;
// }

// async function http(
//   path,
//   { method = "GET", body, headers = {} } = {},
//   retry = true
// ) {
//   await refreshIfNeeded();

//   // attempt request
//   let res = await fetch(`${BASE}${path}`, {
//     method,
//     headers: {
//       "Content-Type": "application/json",
//       ...authHeaders(),
//       ...headers,
//     },
//     body: body ? JSON.stringify(body) : undefined,
//   });

//   // if unauthorized, try refresh once and retry the original request
//   if (res.status === 401 && retry) {
//     try {
//       await refreshIfNeeded();
//       res = await fetch(`${BASE}${path}`, {
//         method,
//         headers: {
//           "Content-Type": "application/json",
//           ...authHeaders(),
//           ...headers,
//         },
//         body: body ? JSON.stringify(body) : undefined,
//       });
//     } catch {
//       // blank
//     }
//   }

//   if (!res.ok) {
//     const msg = await res.text().catch(() => "");
//     throw new Error(msg || `HTTP ${res.status}`);
//   }

//   const ct = res.headers.get("content-type") || "";
//   return ct.includes("application/json") ? res.json() : res.text();
// }

// // auth endpoints
// export async function registerUser({ userName, email, password }) {
//   // backend expects { UserName, Email, Password }
//   return http("/auth/register", {
//     method: "POST",
//     body: { UserName: userName, Email: email, Password: password },
//   });
// }

// export async function loginUser({ userName, password }) {
//   // backend expects { UserName, Password }, and returns { token, refreshToken, expiresAt }
//   const data = await http("/auth/login", {
//     method: "POST",
//     body: { UserName: userName, Password: password },
//   });
//   setSession({
//     token: data.token,
//     refreshToken: data.refreshToken,
//     expiresAt: data.expiresAt,
//     userName,
//   });
//   return data;
// }

// export async function logoutUser() {
//   const { token, refreshToken } = getSession();
//   const data = await http("/auth/logout", {
//     method: "POST",
//     body: { Token: token, RefreshToken: refreshToken },
//   });
//   clearSession();
//   return data;
// }

// export async function authPing() {
//   return http("/auth/protected");
// }

// // ai endpoints ( will adjust if needed )
// export async function generateWorkout(payload) {
//   // Handle both string and object inputs
//   const userInput =
//     typeof payload === "string" ? payload : payload.userInput || payload;

//   if (!userInput) {
//     throw new Error("userInput is required");
//   }

//   const encodedInput = encodeURIComponent(userInput);
//   return http(`/ai/workout?userInput=${encodedInput}`);
// }

// // workouts and history
// export async function fetchHistory() {
//   return http("/workouts");
// }

// export async function getworkout(id) {
//   return http(`/workouts/${id}`);
// }

// export async function saveworkout(workout) {
//   return http("/workouts", { method: "POST", body: workout });
// }

// export async function deleteWorkout(id) {
//   return http(`/workouts/${id}`, { method: "DELETE" });
// }
