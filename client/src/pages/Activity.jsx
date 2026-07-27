import { AlertCircle, History } from "lucide-react";
import { useActivities } from "../hooks/useActivities.js";
import EmptyState from "../components/Common/EmptyState.jsx";
import { TableSkeleton } from "../components/Common/Skeleton.jsx";

export default function Activity() {
  const { data: activities = [], isLoading, isError, error } = useActivities();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Activity Log</h1>
        <p className="mt-1 text-sm text-slate-500">
          A running history of task changes, newest first.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        {isLoading && <TableSkeleton rows={5} columns={3} />}

        {!isLoading && isError && (
          <EmptyState icon={AlertCircle} title="Couldn't load activity" description={error?.message} />
        )}

        {!isLoading && !isError && activities.length === 0 && (
          <EmptyState
            icon={History}
            title="No activity yet"
            description="Actions like creating, assigning, or updating tasks will show up here."
          />
        )}

        {!isLoading && !isError && activities.length > 0 && (
          <ul className="divide-y divide-slate-100">
            {activities.map((activity) => (
              <li key={activity.id} className="flex items-start gap-4 px-5 py-4">
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700">
                  {activity.user?.charAt(0)?.toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-slate-700">{activity.action}</p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
