"use client";

import { Topbar } from "@/components/layout/topbar";
import { TaskMatrix } from "@/components/tasks/task-matrix";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function MatrixPage() {
  return (
    <>
      <Topbar
        title="Priority Matrix"
        subtitle="Visualize tasks by leverage vs effort"
      />
      <ScrollArea className="flex-1">
        <div className="p-6">
          <TaskMatrix />
        </div>
      </ScrollArea>
    </>
  );
}
