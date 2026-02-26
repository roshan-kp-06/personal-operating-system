"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Task, Domain, View, ViewColumn, CustomFieldDef } from "@/lib/supabase/types";
import { getTasks, getDomains, updateTask, deleteTask, getCustomFieldDefs } from "@/lib/supabase/data";
import { DomainBadge } from "@/components/shared/domain-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Trash2,
  ExternalLink,
  CheckCircle,
  Circle,
  Loader2,
  TrendingUp,
  Zap,
  Dumbbell,
} from "lucide-react";

// All available built-in columns
export const BUILT_IN_COLUMNS: ViewColumn[] = [
  { key: "title", label: "Title", type: "built-in", visible: true, width: 280 },
  { key: "status", label: "Status", type: "built-in", visible: true, width: 120 },
  { key: "domain", label: "Domain", type: "built-in", visible: true, width: 140 },
  { key: "client", label: "Client", type: "built-in", visible: true, width: 140 },
  { key: "project", label: "Project", type: "built-in", visible: true, width: 140 },
  { key: "leverage", label: "Leverage", type: "built-in", visible: true, width: 90 },
  { key: "urgency", label: "Urgency", type: "built-in", visible: true, width: 90 },
  { key: "effort", label: "Effort", type: "built-in", visible: true, width: 90 },
  { key: "priority_score", label: "Score", type: "built-in", visible: true, width: 80 },
  { key: "due_date", label: "Due Date", type: "built-in", visible: true, width: 120 },
  { key: "description", label: "Description", type: "built-in", visible: false, width: 200 },
  { key: "created_at", label: "Created", type: "built-in", visible: false, width: 120 },
];

interface TaskTableProps {
  view?: View | null;
  onRefresh?: () => void;
}

type SortConfig = { field: string; direction: "asc" | "desc" } | null;

export function TaskTable({ view, onRefresh }: TaskTableProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [customFields, setCustomFields] = useState<CustomFieldDef[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortConfig>(
    view?.sort ? { field: view.sort.field, direction: view.sort.direction } : { field: "priority_score", direction: "desc" }
  );
  const [statusFilter, setStatusFilter] = useState("all");
  const [domainFilter, setDomainFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [editingCell, setEditingCell] = useState<{ taskId: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState("");
  const router = useRouter();

  // Determine visible columns from view or defaults
  const columns = useMemo(() => {
    if (view?.columns && view.columns.length > 0) {
      return view.columns.filter((c) => c.visible);
    }
    return BUILT_IN_COLUMNS.filter((c) => c.visible);
  }, [view]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [taskData, domainData, fieldData] = await Promise.all([
        getTasks().catch(() => [] as Task[]),
        getDomains().catch(() => [] as Domain[]),
        getCustomFieldDefs().catch(() => [] as CustomFieldDef[]),
      ]);
      setTasks(taskData);
      setDomains(domainData);
      setCustomFields(fieldData);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Apply view filters
  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    // Apply view-level filters
    if (view?.filters) {
      for (const filter of view.filters) {
        result = result.filter((task) => {
          const val = task[filter.field as keyof Task];
          switch (filter.operator) {
            case "eq": return val === filter.value;
            case "neq": return val !== filter.value;
            case "in": return Array.isArray(filter.value) && (filter.value as string[]).includes(val as string);
            case "gte": return typeof val === "number" && val >= (filter.value as number);
            case "lte": return typeof val === "number" && val <= (filter.value as number);
            case "contains": return typeof val === "string" && val.toLowerCase().includes((filter.value as string).toLowerCase());
            default: return true;
          }
        });
      }
    }

    // Apply UI filters
    if (statusFilter !== "all") {
      result = result.filter((t) => t.status === statusFilter);
    }
    if (domainFilter !== "all") {
      result = result.filter((t) => t.domain_id === domainFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q) ||
          t.domain?.name.toLowerCase().includes(q) ||
          t.client?.name.toLowerCase().includes(q) ||
          t.project?.name.toLowerCase().includes(q)
      );
    }

    // Apply sort
    if (sort) {
      result.sort((a, b) => {
        let aVal = a[sort.field as keyof Task];
        let bVal = b[sort.field as keyof Task];

        // Handle nested fields
        if (sort.field === "domain") { aVal = a.domain?.name; bVal = b.domain?.name; }
        if (sort.field === "client") { aVal = a.client?.name; bVal = b.client?.name; }
        if (sort.field === "project") { aVal = a.project?.name; bVal = b.project?.name; }

        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return 1;
        if (bVal == null) return -1;

        let cmp = 0;
        if (typeof aVal === "number" && typeof bVal === "number") {
          cmp = aVal - bVal;
        } else {
          cmp = String(aVal).localeCompare(String(bVal));
        }
        return sort.direction === "desc" ? -cmp : cmp;
      });
    }

    return result;
  }, [tasks, view, statusFilter, domainFilter, searchQuery, sort]);

  const toggleSort = (field: string) => {
    if (sort?.field === field) {
      if (sort.direction === "asc") {
        setSort({ field, direction: "desc" });
      } else {
        setSort(null);
      }
    } else {
      setSort({ field, direction: "asc" });
    }
  };

  const handleStatusToggle = async (task: Task) => {
    const nextStatus = task.status === "done" ? "todo" : "done";
    await updateTask(task.id, {
      status: nextStatus,
      completed_at: nextStatus === "done" ? new Date().toISOString() : null,
    } as Partial<Task>);
    loadData();
  };

  const handleDelete = async (id: string) => {
    await deleteTask(id);
    loadData();
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedRows.size} tasks?`)) return;
    await Promise.all(Array.from(selectedRows).map(deleteTask));
    setSelectedRows(new Set());
    loadData();
  };

  const handleBulkStatusChange = async (status: string) => {
    await Promise.all(
      Array.from(selectedRows).map((id) =>
        updateTask(id, {
          status,
          completed_at: status === "done" ? new Date().toISOString() : null,
        } as Partial<Task>)
      )
    );
    setSelectedRows(new Set());
    loadData();
  };

  const handleInlineEdit = async (taskId: string, field: string, value: string) => {
    setEditingCell(null);
    if (field === "title" && !value.trim()) return;

    const updates: Record<string, unknown> = {};
    if (["urgency", "leverage", "effort"].includes(field)) {
      const num = parseInt(value);
      if (isNaN(num) || num < 1 || num > 5) return;
      updates[field] = num;
    } else {
      updates[field] = value || null;
    }

    await updateTask(taskId, updates as Partial<Task>);
    loadData();
  };

  const handleInlineStatusChange = async (taskId: string, newStatus: string) => {
    await updateTask(taskId, {
      status: newStatus,
      completed_at: newStatus === "done" ? new Date().toISOString() : null,
    } as Partial<Task>);
    loadData();
  };

  const toggleRowSelection = (id: string) => {
    const next = new Set(selectedRows);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedRows(next);
  };

  const toggleAllSelection = () => {
    if (selectedRows.size === filteredTasks.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredTasks.map((t) => t.id)));
    }
  };

  // Render a cell value based on column key
  const renderCell = (task: Task, col: ViewColumn) => {
    const key = col.key;

    switch (key) {
      case "title":
        return editingCell?.taskId === task.id && editingCell?.field === "title" ? (
          <Input
            autoFocus
            defaultValue={task.title}
            className="h-7 text-sm"
            onBlur={(e) => handleInlineEdit(task.id, "title", e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleInlineEdit(task.id, "title", (e.target as HTMLInputElement).value);
              if (e.key === "Escape") setEditingCell(null);
            }}
          />
        ) : (
          <div
            className={cn(
              "flex items-center gap-2 cursor-pointer group/title",
              task.status === "done" && "line-through text-muted-foreground"
            )}
            onClick={() => { setEditingCell({ taskId: task.id, field: "title" }); setEditValue(task.title); }}
          >
            <button
              onClick={(e) => { e.stopPropagation(); handleStatusToggle(task); }}
              className="shrink-0"
            >
              {task.status === "done" ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
              )}
            </button>
            <span className="truncate text-sm font-medium">{task.title}</span>
            <ExternalLink
              className="h-3 w-3 text-muted-foreground opacity-0 group-hover/title:opacity-100 shrink-0 cursor-pointer"
              onClick={(e) => { e.stopPropagation(); router.push(`/tasks/${task.id}`); }}
            />
          </div>
        );

      case "status":
        return (
          <Select value={task.status} onValueChange={(v) => handleInlineStatusChange(task.id, v)}>
            <SelectTrigger className="h-7 border-none bg-transparent px-0 shadow-none text-xs">
              <StatusBadge status={task.status} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="done">Done</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        );

      case "domain":
        return task.domain ? (
          <DomainBadge name={task.domain.name} color={task.domain.color} />
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        );

      case "client":
        return task.client ? (
          <button
            onClick={() => router.push(`/clients/${task.client!.id}`)}
            className="text-xs text-primary hover:underline truncate"
          >
            {task.client.name}
          </button>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        );

      case "project":
        return task.project ? (
          <button
            onClick={() => router.push(`/projects/${task.project!.id}`)}
            className="text-xs text-primary hover:underline truncate"
          >
            {task.project.name}
          </button>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        );

      case "leverage":
        return (
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-purple-500" />
            <span className={cn("text-xs font-semibold", task.leverage >= 4 ? "text-purple-600" : "text-muted-foreground")}>
              {task.leverage}
            </span>
          </div>
        );

      case "urgency":
        return (
          <div className="flex items-center gap-1">
            <Zap className="h-3 w-3 text-orange-500" />
            <span className={cn("text-xs font-semibold", task.urgency >= 4 ? "text-orange-600" : "text-muted-foreground")}>
              {task.urgency}
            </span>
          </div>
        );

      case "effort":
        return (
          <div className="flex items-center gap-1">
            <Dumbbell className="h-3 w-3 text-blue-500" />
            <span className={cn("text-xs font-semibold", task.effort >= 4 ? "text-blue-600" : "text-muted-foreground")}>
              {task.effort}
            </span>
          </div>
        );

      case "priority_score":
        return (
          <span className="text-xs font-bold text-primary">
            {Number(task.priority_score).toFixed(1)}
          </span>
        );

      case "due_date":
        if (!task.due_date) return <span className="text-xs text-muted-foreground">—</span>;
        const date = new Date(task.due_date);
        const isOverdue = date < new Date() && task.status !== "done";
        return (
          <span className={cn("text-xs", isOverdue ? "text-red-600 font-medium" : "text-muted-foreground")}>
            {date.toLocaleDateString()}
          </span>
        );

      case "description":
        return (
          <span className="text-xs text-muted-foreground truncate block max-w-[200px]">
            {task.description || "—"}
          </span>
        );

      case "created_at":
        return (
          <span className="text-xs text-muted-foreground">
            {new Date(task.created_at).toLocaleDateString()}
          </span>
        );

      default:
        // Custom field
        if (col.type === "custom" && task.custom_fields) {
          const val = task.custom_fields[key];
          if (val === undefined || val === null) return <span className="text-xs text-muted-foreground">—</span>;
          return <span className="text-xs">{String(val)}</span>;
        }
        return <span className="text-xs text-muted-foreground">—</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <Input
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-8 w-64 text-sm"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-8 w-36 text-xs">
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
          <SelectTrigger className="h-8 w-36 text-xs">
            <SelectValue placeholder="Domain" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Domains</SelectItem>
            {domains.map((d) => (
              <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="text-xs text-muted-foreground ml-auto">
          {filteredTasks.length} task{filteredTasks.length !== 1 ? "s" : ""}
        </span>

        {/* Bulk actions */}
        {selectedRows.size > 0 && (
          <div className="flex items-center gap-2 border-l pl-3">
            <span className="text-xs text-muted-foreground">{selectedRows.size} selected</span>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleBulkStatusChange("done")}>
              Mark Done
            </Button>
            <Button size="sm" variant="outline" className="h-7 text-xs text-destructive hover:text-destructive" onClick={handleBulkDelete}>
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="w-10 px-3 py-2">
                <Checkbox
                  checked={selectedRows.size === filteredTasks.length && filteredTasks.length > 0}
                  onCheckedChange={toggleAllSelection}
                  className="h-3.5 w-3.5"
                />
              </th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-3 py-2 text-left cursor-pointer hover:bg-muted/50 transition-colors select-none"
                  style={{ width: col.width, minWidth: col.width }}
                  onClick={() => toggleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {col.label}
                    </span>
                    {sort?.field === col.key ? (
                      sort.direction === "asc" ? (
                        <ArrowUp className="h-3 w-3 text-primary" />
                      ) : (
                        <ArrowDown className="h-3 w-3 text-primary" />
                      )
                    ) : (
                      <ArrowUpDown className="h-3 w-3 text-muted-foreground/40" />
                    )}
                  </div>
                </th>
              ))}
              <th className="w-10 px-2 py-2" />
            </tr>
          </thead>
          <tbody>
            {filteredTasks.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 2} className="py-12 text-center text-sm text-muted-foreground">
                  No tasks match your filters
                </td>
              </tr>
            ) : (
              filteredTasks.map((task) => (
                <tr
                  key={task.id}
                  className={cn(
                    "border-b last:border-0 hover:bg-muted/20 transition-colors group",
                    selectedRows.has(task.id) && "bg-primary/5"
                  )}
                >
                  <td className="px-3 py-2">
                    <Checkbox
                      checked={selectedRows.has(task.id)}
                      onCheckedChange={() => toggleRowSelection(task.id)}
                      className="h-3.5 w-3.5"
                    />
                  </td>
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="px-3 py-2"
                      style={{ maxWidth: col.width }}
                    >
                      {renderCell(task, col)}
                    </td>
                  ))}
                  <td className="px-2 py-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                        >
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/tasks/${task.id}`)}>
                          <ExternalLink className="mr-2 h-3.5 w-3.5" /> Open
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusToggle(task)}>
                          <CheckCircle className="mr-2 h-3.5 w-3.5" />
                          {task.status === "done" ? "Mark Undone" : "Mark Done"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(task.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
