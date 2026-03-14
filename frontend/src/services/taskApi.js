import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const taskApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export const getTasks = async (params = {}, config = {}) => {
  const response = await taskApi.get("/tasks", { ...config, params });
  return response.data;
};

export const getTaskById = async (id) => {
  const response = await taskApi.get(`/tasks/${id}`);
  return response.data;
};

export const createTask = async (payload) => {
  const response = await taskApi.post("/tasks", payload);
  return response.data;
};

export const updateTask = async (id, payload) => {
  const response = await taskApi.put(`/tasks/${id}`, payload);
  return response.data;
};

export const deleteTask = async (id) => {
  await taskApi.delete(`/tasks/${id}`);
};

export default taskApi;
