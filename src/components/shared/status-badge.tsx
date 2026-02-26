"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; className: string }> = {
  todo: { label: "To Do", className: "bg-slate-100 text-slate-700 border-slate-200" },
  in_progress: { label: "In Progress", className: "bg-purple-50 text-purple-700 border-purple-200" },
  done: { label: "Done", className: "bg-green-50 text-green-700 border-green-200" },
  archived: { label: "Archived", className: "bg-gray-50 text-gray-500 border-gray-200" },
  active: { label: "Active", className: "bg-blue-50 text-blue-700 border-blue-200" },
  onboarding: { label: "Onboarding", className: "bg-amber-50 text-amber-700 border-amber-200" },
  paused: { label: "Paused", className: "bg-orange-50 text-orange-700 border-orange-200" },
  completed: { label: "Completed", className: "bg-green-50 text-green-700 border-green-200" },
  unread: { label: "Unread", className: "bg-blue-50 text-blue-700 border-blue-200" },
  read: { label: "Read", className: "bg-slate-50 text-slate-600 border-slate-200" },
  actioned: { label: "Actioned", className: "bg-green-50 text-green-700 border-green-200" },
};

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, className: "bg-gray-50 text-gray-600" };
  return (
    <Badge variant="outline" className={cn("text-xs font-medium", config.className)}>
      {config.label}
    </Badge>
  );
}
