import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  Search,
  ArrowUpDown,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";

import StatusBadge from "./StatusBadge.jsx";
import PriorityBadge from "./PriorityBadge.jsx";
import { TableSkeleton } from "../Common/Skeleton.jsx";
import EmptyState from "../Common/EmptyState.jsx";
import { STATUSES, PRIORITIES } from "../../utils/constants.js";
import { useAuth } from "../../context/AuthContext.jsx";

export default function TaskTable({
  tasks,
  users,
  isLoading,
  isError,
  error,
  onEdit,
  onDelete,
  onStatusChange,
}) {
  const { isAdmin } = useAuth();
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [sorting, setSorting] = useState([]);

  const usersById = useMemo(() => {
    const map = {};
    (users || []).forEach((u) => (map[u.id] = u));
    return map;
  }, [users]);

  const filteredData = useMemo(() => {
    return (tasks || []).filter((task) => {
      if (statusFilter && task.status !== statusFilter) return false;
      if (priorityFilter && task.priority !== priorityFilter) return false;
      if (globalFilter) {
        const haystack = `${task.title} ${task.description}`.toLowerCase();
        if (!haystack.includes(globalFilter.toLowerCase())) return false;
      }
      return true;
    });
  }, [tasks, statusFilter, priorityFilter, globalFilter]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "title",
        header: "Title",
        cell: (info) => <span className="font-medium text-slate-800">{info.getValue()}</span>,
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: (info) => (
          <span className="line-clamp-1 max-w-xs text-slate-500">{info.getValue()}</span>
        ),
      },
      {
        accessorKey: "assignedTo",
        header: "Assigned To",
        cell: (info) => usersById[info.getValue()]?.name || "Unassigned",
      },
      {
        accessorKey: "priority",
        header: "Priority",
        cell: (info) => <PriorityBadge priority={info.getValue()} />,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: (info) => {
          const task = info.row.original;
          if (isAdmin) return <StatusBadge status={info.getValue()} />;
          return (
            <select
              value={task.status}
              onChange={(e) => onStatusChange(task, e.target.value)}
              className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-medium focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          );
        },
      },
      {
        accessorKey: "dueDate",
        header: "Due Date",
        cell: (info) => new Date(info.getValue()).toLocaleDateString(),
        sortingFn: "datetime",
      },
      {
        accessorKey: "createdAt",
        header: "Created At",
        cell: (info) => new Date(info.getValue()).toLocaleDateString(),
      },
      {
        id: "actions",
        header: "Actions",
        cell: (info) => {
          if (!isAdmin) return <span className="text-xs text-slate-400">Status only</span>;
          const task = info.row.original;
          return (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onEdit(task)}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-brand-600"
                aria-label={`Edit ${task.title}`}
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={() => onDelete(task)}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                aria-label={`Delete ${task.title}`}
              >
                <Trash2 size={16} />
              </button>
            </div>
          );
        },
      },
    ],
    [usersById, isAdmin, onEdit, onDelete, onStatusChange]
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 8 } },
  });

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Toolbar: search + filters */}
      <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search title or description..."
            className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="">All Priorities</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Body states */}
      {isLoading && <TableSkeleton />}

      {!isLoading && isError && (
        <EmptyState
          icon={AlertCircle}
          title="Couldn't load tasks"
          description={error?.message || "Something went wrong while fetching tasks."}
        />
      )}

      {!isLoading && !isError && filteredData.length === 0 && (
        <EmptyState
          title="No tasks found"
          description="Try adjusting your search or filters, or create a new task."
        />
      )}

      {!isLoading && !isError && filteredData.length > 0 && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="border-b border-slate-100 bg-slate-50/60">
                    {headerGroup.headers.map((header) => {
                      const canSort = header.column.id === "dueDate";
                      return (
                        <th
                          key={header.id}
                          className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500"
                        >
                          {canSort ? (
                            <button
                              className="flex items-center gap-1 hover:text-slate-800"
                              onClick={header.column.getToggleSortingHandler()}
                            >
                              {flexRender(header.column.columnDef.header, header.getContext())}
                              <ArrowUpDown size={12} />
                            </button>
                          ) : (
                            flexRender(header.column.columnDef.header, header.getContext())
                          )}
                        </th>
                      );
                    })}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row">
            <p className="text-xs text-slate-500">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {Math.max(table.getPageCount(), 1)} &middot; {filteredData.length} task
              {filteredData.length === 1 ? "" : "s"}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={14} /> Prev
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
