import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const apiClient = axios.create({
  baseURL: API_URL,
});

// Attach the stored token to every outgoing request.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("task_dashboard_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalize errors so callers can read `error.message` consistently,
// and force a logout on 401 (expired/invalid session).
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.message ||
      "Something went wrong. Please try again.";

    if (error.response?.status === 401) {
      localStorage.removeItem("task_dashboard_token");
      localStorage.removeItem("task_dashboard_user");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(new Error(message));
  }
);
