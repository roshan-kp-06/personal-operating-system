"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Topbar } from "@/components/layout/topbar";
import { getTemplate, updateTemplate, createTemplateTask, deleteTemplateTask } from "@/lib/supabase/data";
import { Template, TemplateTask } from "@/lib/supabase/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Plus, Trash2, Loader2, GripVertical } from "lucide-react";

export default function TemplateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskLeverage, setNewTaskLeverage] = useState(3);
  const [newTaskUrgency, setNewTaskUrgency] = useState(3);
  const [newTaskEffort, setNewTaskEffort] = useState(3);
  const router = useRouter();

  const loadTemplate = async () => {
    try {
      const t = await getTemplate(id);
      setTemplate(t);
    } catch {
      // handle
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplate();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;
    await createTemplateTask({
      template_id: id,
      title: newTaskTitle.trim(),
      default_leverage: newTaskLeverage,
      default_urgency: newTaskUrgency,
      default_effort: newTaskEffort,
      sort_order: (template?.template_tasks?.length || 0) + 1,
    });
    setNewTaskTitle("");
    setNewTaskLeverage(3);
    setNewTaskUrgency(3);
    setNewTaskEffort(3);
    loadTemplate();
  };

  const handleDeleteTask = async (taskId: string) => {
    await deleteTemplateTask(taskId);
    loadTemplate();
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Template not found</p>
        <Button variant="outline" onClick={() => router.push("/templates")}>Back</Button>
      </div>
    );
  }

  const tasks = template.template_tasks || [];

  return (
    <>
      <Topbar title={template.name} subtitle={`${tasks.length} tasks in template`}>
        <Button variant="ghost" size="sm" onClick={() => router.push("/templates")} className="gap-1.5">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
      </Topbar>
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-2xl p-6 space-y-6">
          {/* Template info */}
          <Card className="p-4">
            <h2 className="text-lg font-bold">{template.name}</h2>
            {template.description && (
              <p className="mt-1 text-sm text-muted-foreground">{template.description}</p>
            )}
          </Card>

          {/* Task list */}
          <div>
            <h3 className="text-base font-semibold mb-3">Template Tasks</h3>
            {tasks.length === 0 ? (
              <Card className="p-6 text-center text-sm text-muted-foreground">
                No tasks yet. Add tasks below to build this template.
              </Card>
            ) : (
              <div className="space-y-2">
                {tasks
                  .sort((a, b) => a.sort_order - b.sort_order)
                  .map((task, i) => (
                    <Card key={task.id} className="flex items-center gap-3 p-3">
                      <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-xs font-mono text-muted-foreground w-5">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{task.title}</p>
                        <div className="flex gap-3 text-xs text-muted-foreground mt-0.5">
                          <span>Leverage: {task.default_leverage}</span>
                          <span>Urgency: {task.default_urgency}</span>
                          <span>Effort: {task.default_effort}</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive shrink-0"
                        onClick={() => handleDeleteTask(task.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </Card>
                  ))}
              </div>
            )}
          </div>

          {/* Add task form */}
          <Card className="p-4 space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Plus className="h-4 w-4" /> Add Task to Template
            </h3>
            <Input
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Task title"
              onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
            />
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <Label className="text-purple-600">Leverage</Label>
                  <span className="font-semibold text-purple-600">{newTaskLeverage}</span>
                </div>
                <Slider
                  value={[newTaskLeverage]}
                  onValueChange={([v]) => setNewTaskLeverage(v)}
                  min={1}
                  max={5}
                  step={1}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <Label className="text-orange-600">Urgency</Label>
                  <span className="font-semibold text-orange-600">{newTaskUrgency}</span>
                </div>
                <Slider
                  value={[newTaskUrgency]}
                  onValueChange={([v]) => setNewTaskUrgency(v)}
                  min={1}
                  max={5}
                  step={1}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <Label className="text-blue-600">Effort</Label>
                  <span className="font-semibold text-blue-600">{newTaskEffort}</span>
                </div>
                <Slider
                  value={[newTaskEffort]}
                  onValueChange={([v]) => setNewTaskEffort(v)}
                  min={1}
                  max={5}
                  step={1}
                />
              </div>
            </div>
            <Button onClick={handleAddTask} disabled={!newTaskTitle.trim()} className="w-full">
              Add Task
            </Button>
          </Card>
        </div>
      </ScrollArea>
    </>
  );
}
