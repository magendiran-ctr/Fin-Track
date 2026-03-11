// API client for making authenticated requests

import { Expense, CreateExpenseInput, UpdateExpenseInput, ExpenseFilters, AnalyticsSummary } from "./types";

const API_BASE = "/api";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("expense_tracker_token");
}

function getAuthHeaders(): HeadersInit {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

type ApiError = Error & { status?: number; details?: string };

async function handleResponse<T>(response: Response): Promise<T> {
  let data: any = null;
  try {
    data = await response.json();
  } catch {
    // ignore JSON parse errors and fall back to generic message
  }

  if (!response.ok) {
    const errorMsg = data?.details
      ? `${data.error}: ${data.details}`
      : (data?.error || response.statusText || "An error occurred");
    const error: ApiError = new Error(errorMsg);
    error.status = response.status;
    error.details = data?.details;
    throw error;
  }

  return data as T;
}

// Auth API
export const authApi = {
  async register(name: string, email: string, password: string) {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    return handleResponse<{ token: string; user: { id: string; User_id: string | null; name: string; email: string; avatar?: string | null; createdAt: string } }>(response);
  },

  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse<{ token: string; user: { id: string; User_id: string | null; name: string; email: string; avatar?: string | null; createdAt: string } }>(response);
  },

  async updateAvatar(avatar: string) {
    const response = await fetch(`${API_BASE}/auth/avatar`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ avatar }),
    });
    return handleResponse<{ user: { id: string; User_id: string | null; name: string; email: string; avatar?: string | null; createdAt: string } }>(response);
  },

  async updateProfile(updates: { name: string; email: string }) {
    const response = await fetch(`${API_BASE}/auth/profile`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    return handleResponse<{ user: { id: string; User_id: string | null; name: string; email: string; avatar?: string | null; createdAt: string } }>(response);
  },

  async getMe() {
    const response = await fetch(`${API_BASE}/auth/me`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return handleResponse<{ user: { id: string; User_id: string | null; name: string; email: string; avatar?: string | null; createdAt: string } }>(response);
  },
};

// Expenses API
export const expensesApi = {
  async getAll(filters?: ExpenseFilters) {
    const params = new URLSearchParams();
    if (filters?.category && filters.category !== "All") params.set("category", filters.category);
    if (filters?.startDate) params.set("startDate", filters.startDate);
    if (filters?.endDate) params.set("endDate", filters.endDate);
    if (filters?.search) params.set("search", filters.search);

    const url = `${API_BASE}/expenses${params.toString() ? `?${params}` : ""}`;
    const response = await fetch(url, { headers: getAuthHeaders() });
    return handleResponse<{ expenses: Expense[] }>(response);
  },

  async create(data: CreateExpenseInput) {
    const response = await fetch(`${API_BASE}/expenses`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<{ expense: Expense }>(response);
  },

  async update(id: string, data: Omit<UpdateExpenseInput, "id">) {
    const response = await fetch(`${API_BASE}/expenses/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<{ expense: Expense }>(response);
  },

  async delete(id: string) {
    const response = await fetch(`${API_BASE}/expenses/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse<{ message: string }>(response);
  },
};

// Analytics API
export const analyticsApi = {
  async getMonthly() {
    const response = await fetch(`${API_BASE}/analytics/monthly`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<{ analytics: AnalyticsSummary }>(response);
  },
};
