import { apiClient } from "./client.js";

export async function login(email, password) {
  const { data } = await apiClient.post("/auth/login", { email, password });
  return data; // { token, user }
}

export async function fetchMe() {
  const { data } = await apiClient.get("/auth/me");
  return data.user;
}
