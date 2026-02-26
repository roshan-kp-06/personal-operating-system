"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Topbar } from "@/components/layout/topbar";
import { TaskForm } from "@/components/tasks/task-form";
import { getTask, updateTask, deleteTask } from "@/lib/supabase/data";
import { Task } from "@/lib/supabase/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2, Loader2 } from "lucide-react";

export default function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    getTask(id).then((t) => {
      setTask(t);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const handleUpdate = async (data: Record<string, unknown>) => {
    setSaving(true);
    try {
      await updateTask(id, data as Partial<Task>);
      router.push("/tasks");
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this task?")) return;
    await deleteTask(id);
    router.push("/tasks");
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Task not found</p>
        <Button variant="outline" onClick={() => router.push("/tasks")}>
          Back to Tasks
        </Button>
      </div>
    );
  }

  return (
    <>
      <Topbar title="Edit Task" subtitle={task.title}>
        <Button variant="ghost" size="sm" onClick={() => router.push("/tasks")} className="gap-1.5">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Button variant="ghost" size="sm" onClick={handleDelete} className="gap-1.5 text-destructive hover:text-destructive">
          <Trash2 className="h-4 w-4" /> Delete
        </Button>
      </Topbar>
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-2xl p-6">
          <TaskForm
            task={task}
            onSubmit={handleUpdate}
            onCancel={() => router.push("/tasks")}
            loading={saving}
          />
        </div>
      </ScrollArea>
    </>
  );
}
