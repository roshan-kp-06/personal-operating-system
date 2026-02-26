"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Topbar } from "@/components/layout/topbar";
import { TaskList } from "@/components/tasks/task-list";
import { QuickAddTask } from "@/components/tasks/quick-add-task";
import { StatusBadge } from "@/components/shared/status-badge";
import { DomainBadge } from "@/components/shared/domain-badge";
import { getProject, updateProject, deleteProject } from "@/lib/supabase/data";
import { Project } from "@/lib/supabase/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2, Loader2 } from "lucide-react";

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const router = useRouter();

  useEffect(() => {
    getProject(id).then((p) => {
      setProject(p);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Delete this project?")) return;
    await deleteProject(id);
    router.push("/projects");
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Project not found</p>
        <Button variant="outline" onClick={() => router.push("/projects")}>Back to Projects</Button>
      </div>
    );
  }

  return (
    <>
      <Topbar title={project.name} subtitle="Project details">
        <Button variant="ghost" size="sm" onClick={() => router.push("/projects")} className="gap-1.5">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Button variant="ghost" size="sm" onClick={handleDelete} className="gap-1.5 text-destructive hover:text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </Topbar>
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-bold">{project.name}</h2>
              <StatusBadge status={project.status} />
            </div>
            {project.description && (
              <p className="text-sm text-muted-foreground">{project.description}</p>
            )}
            <div className="mt-3 flex items-center gap-3">
              {project.domain && <DomainBadge name={project.domain.name} color={project.domain.color} />}
              {project.client && (
                <button
                  onClick={() => router.push(`/clients/${project.client!.id}`)}
                  className="text-xs text-primary hover:underline"
                >
                  {project.client.name}
                </button>
              )}
            </div>
          </Card>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold">Tasks</h3>
              <Button size="sm" onClick={() => setShowQuickAdd(true)}>Add Task</Button>
            </div>
            <TaskList
              key={refreshKey}
              initialFilters={{ project_id: id }}
              onTaskClick={(task) => router.push(`/tasks/${task.id}`)}
              showFilters={false}
            />
          </div>
        </div>
      </ScrollArea>

      <QuickAddTask
        open={showQuickAdd}
        onOpenChange={setShowQuickAdd}
        onCreated={() => setRefreshKey((k) => k + 1)}
        defaultProjectId={id}
      />
    </>
  );
}
