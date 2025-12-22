import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5001/api",
});

// Request interceptor → token attach
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor → auto logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Ignore 401 from login page (invalid credentials should not reload page)
    if (error.response && error.response.status === 401 && !error.config.url.includes("/auth/login")) {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
