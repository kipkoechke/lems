import axios from "axios";

const instance = axios.create({
  baseURL: "https://vems.datasystems.co.ke/api/v1/",
  // baseURL: "https://api.lems.mcomps.africa/api/v1",
  //   withCredentials: true,
  // timeout: 10000,
});

// Request interceptor to attach bearer token
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
instance.interceptors.response.use(
  (res) => res,
  (err) => {
    return Promise.reject(err);
  }
);

export default instance;
