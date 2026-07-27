import { ListTodo, Clock, CheckCircle2, LayoutList } from "lucide-react";
import { CardSkeleton } from "../Common/Skeleton.jsx";

const CARD_CONFIG = [
  { key: "total", label: "Total Tasks", icon: LayoutList, accent: "bg-brand-50 text-brand-600" },
  { key: "todo", label: "To Do", icon: ListTodo, accent: "bg-slate-100 text-slate-600" },
  { key: "inProgress", label: "In Progress", icon: Clock, accent: "bg-amber-50 text-amber-600" },
  { key: "completed", label: "Completed", icon: CheckCircle2, accent: "bg-emerald-50 text-emerald-600" },
];

// Counts are always derived from the live TanStack Query task list -
// never hardcoded - so they update the instant tasks change.
export default function SummaryCards({ tasks, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CARD_CONFIG.map((c) => (
          <CardSkeleton key={c.key} />
        ))}
      </div>
    );
  }

  const counts = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === "To Do").length,
    inProgress: tasks.filter((t) => t.status === "In Progress").length,
    completed: tasks.filter((t) => t.status === "Completed").length,
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {CARD_CONFIG.map(({ key, label, icon: Icon, accent }) => (
        <div
          key={key}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">{label}</p>
            <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${accent}`}>
              <Icon size={16} />
            </span>
          </div>
          <p className="text-3xl font-bold tracking-tight text-slate-900">{counts[key]}</p>
        </div>
      ))}
    </div>
  );
}
