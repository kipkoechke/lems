import axios from "axios";
import { clearAuthData } from "@/services/apiAuth";

/**
 * API base URL, by environment.
 *
 * `next dev` talks to UAT, which carries production-derived data to work
 * against. Production builds keep the live API. Either can be overridden with
 * NEXT_PUBLIC_API_URL, which is baked into the bundle at build time — set it
 * in `.env.local` for a one-off (a local API, say), or in the server's `.env`
 * for a deployment.
 */
const UAT_API_URL = "https://uat.vems.co.ke/api/v1";
const PRODUCTION_API_URL = "https://api.vems.co.ke/api/v1";

const baseURL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "development" ? UAT_API_URL : PRODUCTION_API_URL);

const instance = axios.create({
  baseURL,
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
