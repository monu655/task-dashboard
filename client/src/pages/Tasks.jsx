import { useState } from "react";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";

import { useAuth } from "../context/AuthContext.jsx";
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from "../hooks/useTasks.js";
import { useUsers } from "../hooks/useUsers.js";
import TaskTable from "../components/Tasks/TaskTable.jsx";
import TaskFormModal from "../components/Tasks/TaskFormModal.jsx";
import DeleteConfirmModal from "../components/Tasks/DeleteConfirmModal.jsx";

export default function Tasks() {
  const { isAdmin } = useAuth();
  const { data: tasks = [], isLoading, isError, error } = useTasks();
  const { data: users = [] } = useUsers();

  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const [formTask, setFormTask] = useState(null); // null = create mode, object = edit mode
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  function openCreateForm() {
    setFormTask(null);
    setIsFormOpen(true);
  }

  function openEditForm(task) {
    setFormTask(task);
    setIsFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
    setFormTask(null);
  }

  function handleFormSubmit(values) {
    if (formTask) {
      updateTask.mutate(
        { id: formTask.id, payload: values },
        { onSuccess: closeForm }
      );
    } else {
      createTask.mutate(values, { onSuccess: closeForm });
    }
  }

  function handleStatusChange(task, newStatus) {
    updateTask.mutate({ id: task.id, payload: { status: newStatus } });
  }

  function handleDeleteConfirm() {
    if (!taskToDelete) return;
    deleteTask.mutate(taskToDelete.id, {
      onSuccess: () => setTaskToDelete(null),
      onError: (err) => toast.error(err.message),
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tasks</h1>
          <p className="mt-1 text-sm text-slate-500">
            {isAdmin ? "Manage tasks across your whole team." : "Tasks assigned to you."}
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={openCreateForm}
            className="flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
          >
            <Plus size={16} />
            New Task
          </button>
        )}
      </div>

      <TaskTable
        tasks={tasks}
        users={users}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onEdit={openEditForm}
        onDelete={setTaskToDelete}
        onStatusChange={handleStatusChange}
      />

      {isFormOpen && (
        <TaskFormModal
          task={formTask}
          users={users}
          onClose={closeForm}
          onSubmit={handleFormSubmit}
          isSaving={createTask.isPending || updateTask.isPending}
        />
      )}

      <DeleteConfirmModal
        task={taskToDelete}
        onCancel={() => setTaskToDelete(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteTask.isPending}
      />
    </div>
  );
}
