"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TaskForm } from "./task-form";
import { createTask } from "@/lib/supabase/data";

interface QuickAddTaskProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
  defaultClientId?: string;
  defaultProjectId?: string;
}

export function QuickAddTask({ open, onOpenChange, onCreated, defaultClientId, defaultProjectId }: QuickAddTaskProps) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: Parameters<typeof createTask>[0] & { status: string }) => {
    setLoading(true);
    try {
      const { status, ...rest } = data;
      await createTask({ ...rest, status });
      onOpenChange(false);
      onCreated?.();
    } catch (err) {
      console.error("Failed to create task:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        <TaskForm
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          loading={loading}
        />
      </DialogContent>
    </Dialog>
  );
}
