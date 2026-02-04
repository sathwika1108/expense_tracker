import axios from "axios";

const DEFAULT_API_URL = "https://expense-tracker-a6m3.onrender.com/api";
const baseURL = import.meta.env.VITE_API_URL || DEFAULT_API_URL;

const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
