import { AlertCircle } from "lucide-react";
import { useTasks } from "../hooks/useTasks.js";
import { useAuth } from "../context/AuthContext.jsx";
import SummaryCards from "../components/Dashboard/SummaryCards.jsx";
import EmptyState from "../components/Common/EmptyState.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: tasks = [], isLoading, isError, error } = useTasks();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.name}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {user?.role === "admin"
            ? "Here's an overview of every task across the team."
            : "Here's an overview of the tasks assigned to you."}
        </p>
      </div>

      {isError ? (
        <EmptyState
          icon={AlertCircle}
          title="Couldn't load dashboard data"
          description={error?.message}
        />
      ) : (
        <SummaryCards tasks={tasks} isLoading={isLoading} />
      )}
    </div>
  );
}
