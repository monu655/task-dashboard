import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { createTask, deleteTask, fetchTasks, updateTask } from "../api/tasks.js";

const TASKS_KEY = ["tasks"];
const ACTIVITIES_KEY = ["activities"];

export function useTasks() {
  return useQuery({
    queryKey: TASKS_KEY,
    queryFn: fetchTasks,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY });
      queryClient.invalidateQueries({ queryKey: ACTIVITIES_KEY });
      toast.success("Task created.");
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updateTask(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY });
      queryClient.invalidateQueries({ queryKey: ACTIVITIES_KEY });
      toast.success("Task updated.");
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY });
      queryClient.invalidateQueries({ queryKey: ACTIVITIES_KEY });
      toast.success("Task deleted.");
    },
    onError: (error) => toast.error(error.message),
  });
}
