import axios from "axios";

function redirectToLogin() {
  if (typeof window === "undefined") return;
  if (window.location.pathname === "/auth/login") return;

  const redirect = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  const target = `/auth/login?redirect=${encodeURIComponent(redirect)}`;
  window.location.replace(target);
}

const api = axios.create({
  baseURL: process.env.VUE_APP_API_URL || "http://localhost:8080/api",
  headers: {
    Accept: "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("graduation_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("graduation_token");
      localStorage.removeItem("graduation_admin");
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("user");
      redirectToLogin();
    }
    return Promise.reject(error);
  }
);

export function apiMessage(error, fallback = "Terjadi kesalahan") {
  return error?.response?.data?.message || error?.message || fallback;
}

export default api;
