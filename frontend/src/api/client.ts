import axios from "axios";

const API_URL = "http://localhost:5000";

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
