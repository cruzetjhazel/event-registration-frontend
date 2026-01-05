import axios from "axios";

const base = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

const api = axios.create({
  baseURL: `${base}/api`,
  withCredentials: false,
});

// Attach bearer token from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }
  return config;
});

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem("auth_token", token);
  } else {
    localStorage.removeItem("auth_token");
  }
};

export default api;
