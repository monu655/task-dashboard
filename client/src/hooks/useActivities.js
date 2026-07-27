import { useQuery } from "@tanstack/react-query";
import { fetchActivities } from "../api/activities.js";

export function useActivities() {
  return useQuery({
    queryKey: ["activities"],
    queryFn: fetchActivities,
  });
}
