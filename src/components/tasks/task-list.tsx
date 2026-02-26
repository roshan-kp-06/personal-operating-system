"use client";

import { useState, useEffect, useCallback } from "react";
import { Task, Domain } from "@/lib/supabase/types";
import { getTasks, getDomains, updateTask, deleteTask } from "@/lib/supabase/data";
import { TaskCard } from "./task-card";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TaskListProps {
  initialFilters?: {
    status?: string;
    domain_id?: string;
    client_id?: string;
    project_id?: string;
  };
  onTaskClick?: (task: Task) => void;
  showFilters?: boolean;
}

export function TaskList({ initialFilters, onTaskClick, showFilters = true }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(initialFilters?.status || "all");
  const [domainFilter, setDomainFilter] = useState(initialFilters?.domain_id || "all");

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const filters: Record<string, string> = {};
      if (statusFilter !== "all") filters.status = statusFilter;
      if (domainFilter !== "all") filters.domain_id = domainFilter;
      if (initialFilters?.client_id) filters.client_id = initialFilters.client_id;
      if (initialFilters?.project_id) filters.project_id = initialFilters.project_id;
      const data = await getTasks(filters);
      setTasks(data);
    } catch {
      // silently handle — supabase may not be connected yet
    } finally {
      setLoading(false);
    }
  }, [statusFilter, domainFilter, initialFilters?.client_id, initialFilters?.project_id]);

  useEffect(() => {
    loadTasks();
    getDomains().then(setDomains).catch(() => {});
  }, [loadTasks]);

  const handleStatusToggle = async (task: Task) => {
    const nextStatus = task.status === "done" ? "todo" : "done";
    await updateTask(task.id, {
      status: nextStatus,
      completed_at: nextStatus === "done" ? new Date().toISOString() : null,
    } as Partial<Task>);
    loadTasks();
  };

  const handleDelete = async (taskId: string) => {
    await deleteTask(taskId);
    loadTasks();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showFilters && (
        <div className="flex gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="done">Done</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>

          <Select value={domainFilter} onValueChange={setDomainFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Domain" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Domains</SelectItem>
              {domains.map((d) => (
                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {tasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No tasks yet"
          description="Create your first task to get started with organizing your work."
        />
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div key={task.id} className="group relative">
              <TaskCard
                task={task}
                onClick={() => onTaskClick?.(task)}
              />
              <div className="absolute right-2 top-2 hidden gap-1 group-hover:flex">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusToggle(task);
                  }}
                >
                  {task.status === "done" ? "Undo" : "Done"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(task.id);
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
