import axios from "axios";
import { clearAuthData } from "@/services/apiAuth";

const instance = axios.create({
  baseURL: "https://api.vems.co.ke/api/v1",
  // baseURL: "https://api.lems.mcomps.africa/api/v1",
  //   withCredentials: true,
  // timeout: 10000,
});

// Request interceptor to attach bearer token
instance.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor for error handling
instance.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      if (!window.location.pathname.includes("/login")) {
        // Clear auth cookie + localStorage so middleware doesn't redirect
        // the user back from /login → / → infinite loop
        clearAuthData();
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  },
);

export default instance;
