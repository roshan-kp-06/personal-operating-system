"use client";

import { useState, useEffect } from "react";
import { Topbar } from "@/components/layout/topbar";
import { TaskTable, BUILT_IN_COLUMNS } from "@/components/tasks/task-table";
import { TaskList } from "@/components/tasks/task-list";
import { TaskMatrix } from "@/components/tasks/task-matrix";
import { QuickAddTask } from "@/components/tasks/quick-add-task";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";
import { Task, View, ViewColumn } from "@/lib/supabase/types";
import { getViews, createView, deleteView } from "@/lib/supabase/data";
import { Table2, LayoutGrid, Target, Plus, Trash2, Eye } from "lucide-react";

export default function TasksPage() {
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState("table");
  const [views, setViews] = useState<View[]>([]);
  const [activeViewId, setActiveViewId] = useState<string | null>(null);
  const [showCreateView, setShowCreateView] = useState(false);
  const [newViewName, setNewViewName] = useState("");
  const [newViewColumns, setNewViewColumns] = useState<Record<string, boolean>>(
    Object.fromEntries(BUILT_IN_COLUMNS.map((c) => [c.key, c.visible]))
  );
  const router = useRouter();

  const loadViews = async () => {
    try {
      const data = await getViews();
      setViews(data);
      if (!activeViewId && data.length > 0) {
        const defaultView = data.find((v) => v.is_default) || data[0];
        setActiveViewId(defaultView.id);
      }
    } catch {
      // supabase not connected yet
    }
  };

  useEffect(() => {
    loadViews();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const activeView = views.find((v) => v.id === activeViewId) || null;

  const handleCreateView = async () => {
    if (!newViewName.trim()) return;
    const columns: ViewColumn[] = BUILT_IN_COLUMNS.map((c) => ({
      ...c,
      visible: newViewColumns[c.key] ?? c.visible,
    }));
    const view = await createView({
      name: newViewName.trim(),
      columns,
    });
    setNewViewName("");
    setShowCreateView(false);
    await loadViews();
    setActiveViewId(view.id);
  };

  const handleDeleteView = async (id: string) => {
    if (!confirm("Delete this view?")) return;
    await deleteView(id);
    const remaining = views.filter((v) => v.id !== id);
    if (activeViewId === id) {
      setActiveViewId(remaining[0]?.id || null);
    }
    await loadViews();
  };

  return (
    <>
      <Topbar
        title="Tasks"
        subtitle="Manage and prioritize your work"
        onQuickAdd={() => setShowQuickAdd(true)}
      />
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <TabsList>
                <TabsTrigger value="table" className="gap-1.5 text-xs">
                  <Table2 className="h-3.5 w-3.5" /> Table
                </TabsTrigger>
                <TabsTrigger value="cards" className="gap-1.5 text-xs">
                  <LayoutGrid className="h-3.5 w-3.5" /> Cards
                </TabsTrigger>
                <TabsTrigger value="matrix" className="gap-1.5 text-xs">
                  <Target className="h-3.5 w-3.5" /> Matrix
                </TabsTrigger>
              </TabsList>

              {/* View selector — table mode only */}
              {activeTab === "table" && (
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <Select value={activeViewId || ""} onValueChange={setActiveViewId}>
                    <SelectTrigger className="h-8 w-48 text-xs">
                      <SelectValue placeholder="Select view" />
                    </SelectTrigger>
                    <SelectContent>
                      {views.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.name}
                          {v.is_default ? " (default)" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs gap-1"
                    onClick={() => setShowCreateView(true)}
                  >
                    <Plus className="h-3 w-3" /> View
                  </Button>
                  {activeView && !activeView.is_default && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteView(activeView.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              )}
            </div>

            <TabsContent value="table" className="mt-4">
              <TaskTable
                key={`${activeViewId}-${refreshKey}`}
                view={activeView}
                onRefresh={() => setRefreshKey((k) => k + 1)}
              />
            </TabsContent>

            <TabsContent value="cards" className="mt-4">
              <TaskList
                key={refreshKey}
                onTaskClick={(task: Task) => router.push(`/tasks/${task.id}`)}
              />
            </TabsContent>

            <TabsContent value="matrix" className="mt-4">
              <TaskMatrix />
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>

      <QuickAddTask
        open={showQuickAdd}
        onOpenChange={setShowQuickAdd}
        onCreated={() => setRefreshKey((k) => k + 1)}
      />

      {/* Create View Dialog */}
      <Dialog open={showCreateView} onOpenChange={setShowCreateView}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New View</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>View Name</Label>
              <Input
                value={newViewName}
                onChange={(e) => setNewViewName(e.target.value)}
                placeholder="My Custom View"
              />
            </div>
            <div className="space-y-2">
              <Label>Visible Columns</Label>
              <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                {BUILT_IN_COLUMNS.map((col) => (
                  <label
                    key={col.key}
                    className="flex items-center gap-2 text-sm cursor-pointer rounded-md border p-2 hover:bg-muted/50"
                  >
                    <Checkbox
                      checked={newViewColumns[col.key] ?? col.visible}
                      onCheckedChange={(checked) =>
                        setNewViewColumns({ ...newViewColumns, [col.key]: !!checked })
                      }
                      className="h-3.5 w-3.5"
                    />
                    {col.label}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateView(false)}>Cancel</Button>
              <Button onClick={handleCreateView} disabled={!newViewName.trim()}>Create View</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
