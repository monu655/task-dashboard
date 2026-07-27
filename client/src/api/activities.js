import { apiClient } from "./client.js";

export async function fetchActivities() {
  const { data } = await apiClient.get("/activities");
  return data;
}
