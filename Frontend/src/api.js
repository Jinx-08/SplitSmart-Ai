import axios from "axios";

// In dev: empty string (Vite proxy handles routing)
// In prod: set VITE_API_BASE to your Railway Express URL (e.g. https://splitsmart-backend.up.railway.app)
const API_BASE = import.meta.env.VITE_API_BASE || "";

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Token Management ──────────────────────────────────────────────
export function getToken() {
  return localStorage.getItem("splitsmart_token");
}

export function setToken(token) {
  localStorage.setItem("splitsmart_token", token);
}

export function clearToken() {
  localStorage.removeItem("splitsmart_token");
}

// Attach auth token to every request automatically
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Auth API ──────────────────────────────────────────────────────
export const authApi = {
  register: (first_name, last_name, email, password) =>
    api.post("/api/auth/register", { first_name, last_name, email, password }),

  login: (email, password) =>
    api.post("/api/auth/login", { email, password }),

  logout: () => api.post("/api/auth/logout"),

  getCurrentUser: () => api.get("/api/auth/me"),

  updateProfile: (data) => api.put("/api/auth/profile", data),
};

// ── Bills API ─────────────────────────────────────────────────────
export const billsApi = {
  save: (title, data, grand_total) =>
    api.post("/api/bills", { title, data, grand_total }),

  getAll: () => api.get("/api/bills"),

  delete: (id) => api.delete(`/api/bills/${id}`),
};

// ── Groups API ────────────────────────────────────────────────────
export const groupsApi = {
  getAll: () => api.get("/api/groups/groups"),

  create: (name, members) =>
    api.post("/api/groups/groups", { name, members }),

  getById: (id) => api.get(`/api/groups/group/${id}`),

  update: (id, name) => api.put(`/api/groups/group/${id}`, { name }),

  inviteMember: (groupId, user_id, role = "member") =>
    api.post(`/api/groups/groups/${groupId}/invite`, { user_id, role }),

  removeMember: (groupId, userId) =>
    api.delete(`/api/groups/groups/${groupId}/members/${userId}`),
};

// ── Expenses API ──────────────────────────────────────────────────
export const expensesApi = {
  add: (group_id, amount, split_type, date, category, participants) =>
    api.post("/api/expenses/expenses", { group_id, amount, split_type, date, category, participants }),

  getByGroup: (groupId) =>
    api.get(`/api/expenses/group/${groupId}/expenses`),

  getById: (id) => api.get(`/api/expenses/expenses/${id}`),

  update: (id, data) => api.put(`/api/expenses/expenses/${id}`, data),

  delete: (id) => api.delete(`/api/expenses/expenses/${id}`),

  split: (id, recipients) =>
    api.post(`/api/expenses/expenses/${id}/recipients`, { recipients }),
};

// ── Settlements API ───────────────────────────────────────────────
export const settlementsApi = {
  getUserSettlements: () => api.get("/api/settlements/settlements"),

  getGroupSettlements: (groupId) =>
    api.get(`/api/settlements/group/${groupId}/settlements`),

  markPaid: (expenseId) =>
    api.post("/api/settlements/settlements/mark-paid", { expenseId }),
};

// ── AI API Base ───────────────────────────────────────────────────
// In dev: empty (Vite proxy handles it)
// In prod: set VITE_AI_BASE to your Railway FastAPI URL (e.g. https://splitsmart-ai.up.railway.app)
export const AI_BASE = import.meta.env.VITE_AI_BASE || "";

export { api };
