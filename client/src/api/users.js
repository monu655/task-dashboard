import { apiClient } from "./client.js";

export async function fetchUsers() {
  const { data } = await apiClient.get("/users");
  return data;
}
