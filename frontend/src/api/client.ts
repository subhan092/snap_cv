import axios from "axios";


// Vite provides MODE: 'development', 'production', 'test'
const mode = import.meta.env.MODE;
const localUrl = import.meta.env.VITE_API_URL ;
const prodUrl = import.meta.env.VITE_API_PRODUCTION_URL ;

// Dynamic URL based on mode
const API_URL = mode === "production" ? prodUrl : localUrl;

console.log(`Environment: ${mode}, API URL: ${API_URL}`);

const apiClient = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => Promise.reject(err)
);

export default apiClient;