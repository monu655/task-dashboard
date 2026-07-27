import { PRIORITY_STYLES } from "../../utils/constants.js";
import { ArrowUp, ArrowRight, ArrowDown } from "lucide-react";

const ICONS = {
  High: ArrowUp,
  Medium: ArrowRight,
  Low: ArrowDown,
};

export default function PriorityBadge({ priority }) {
  const style = PRIORITY_STYLES[priority] || "bg-slate-100 text-slate-700 ring-slate-200";
  const Icon = ICONS[priority] || ArrowRight;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${style}`}
    >
      <Icon size={12} strokeWidth={2.5} />
      {priority}
    </span>
  );
}
