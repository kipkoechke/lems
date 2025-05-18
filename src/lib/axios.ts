import axios from "axios";

const instance = axios.create({
  baseURL: "https://vemsapi.azurewebsites.net/api",
  //   withCredentials: true,
  timeout: 10000,
});

// instance.interceptors.request.use((config) => {
//   const token = store.getState().auth.token;
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

instance.interceptors.response.use(
  (res) => res,
  (err) => {
    return Promise.reject(err);
  }
);

export default instance;
