"use client";

import { Task } from "@/lib/supabase/types";
import { Card } from "@/components/ui/card";
import { DomainBadge } from "@/components/shared/domain-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { Calendar, TrendingUp, Zap, Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer p-4 transition-all hover:shadow-md hover:border-primary/20",
        task.status === "done" && "opacity-60"
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className={cn(
            "text-sm font-medium text-foreground truncate",
            task.status === "done" && "line-through"
          )}>
            {task.title}
          </h3>
          {task.description && (
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
              {task.description}
            </p>
          )}
        </div>
        <StatusBadge status={task.status} />
      </div>

      <div className="mt-3 flex items-center gap-3 flex-wrap">
        {task.domain && (
          <DomainBadge name={task.domain.name} color={task.domain.color} />
        )}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-0.5" title="Leverage">
            <TrendingUp className="h-3 w-3 text-purple-500" />
            {task.leverage}
          </span>
          <span className="flex items-center gap-0.5" title="Urgency">
            <Zap className="h-3 w-3 text-orange-500" />
            {task.urgency}
          </span>
          <span className="flex items-center gap-0.5" title="Effort">
            <Dumbbell className="h-3 w-3 text-blue-500" />
            {task.effort}
          </span>
        </div>
        {task.due_date && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {new Date(task.due_date).toLocaleDateString()}
          </span>
        )}
        {task.priority_score && (
          <span className="ml-auto text-xs font-semibold text-primary">
            Score: {Number(task.priority_score).toFixed(1)}
          </span>
        )}
      </div>
    </Card>
  );
}
