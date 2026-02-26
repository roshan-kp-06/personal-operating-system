"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Topbar } from "@/components/layout/topbar";
import { TaskList } from "@/components/tasks/task-list";
import { QuickAddTask } from "@/components/tasks/quick-add-task";
import { StatusBadge } from "@/components/shared/status-badge";
import { getClient, updateClient, deleteClient, getProjectsByClient, getTasks } from "@/lib/supabase/data";
import { Client, Project, Task } from "@/lib/supabase/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Trash2, FolderKanban, FileText, Loader2, Pencil, Save, X } from "lucide-react";

export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [client, setClient] = useState<Client | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [onboardingProgress, setOnboardingProgress] = useState({ total: 0, completed: 0 });
  const [refreshKey, setRefreshKey] = useState(0);
  const router = useRouter();

  const loadData = async () => {
    try {
      const [c, p, tasks] = await Promise.all([
        getClient(id),
        getProjectsByClient(id),
        getTasks({ client_id: id }),
      ]);
      setClient(c);
      setProjects(p);
      if (c) {
        setEditName(c.name);
        setEditNotes(c.notes || "");
        setEditStatus(c.status);
      }
      // Calculate onboarding progress from template tasks
      const templateTasks = tasks.filter((t: Task) => t.template_task_id);
      const completedTemplate = templateTasks.filter((t: Task) => t.status === "done");
      setOnboardingProgress({ total: templateTasks.length, completed: completedTemplate.length });
    } catch {
      // handle
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async () => {
    if (!editName.trim()) return;
    await updateClient(id, {
      name: editName.trim(),
      notes: editNotes.trim() || null,
      status: editStatus as Client["status"],
    });
    setEditing(false);
    loadData();
  };

  const handleDelete = async () => {
    if (!confirm("Delete this client and all associated data?")) return;
    await deleteClient(id);
    router.push("/clients");
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Client not found</p>
        <Button variant="outline" onClick={() => router.push("/clients")}>Back to Clients</Button>
      </div>
    );
  }

  const initials = client.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const progressPercent = onboardingProgress.total > 0
    ? Math.round((onboardingProgress.completed / onboardingProgress.total) * 100)
    : 0;

  return (
    <>
      <Topbar title={client.name} subtitle="Client details">
        <Button variant="ghost" size="sm" onClick={() => router.push("/clients")} className="gap-1.5">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Button variant="ghost" size="sm" onClick={() => router.push(`/clients/${id}/onboard`)} className="gap-1.5">
          <FileText className="h-4 w-4" /> Onboard
        </Button>
        <Button variant="ghost" size="sm" onClick={handleDelete} className="gap-1.5 text-destructive hover:text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </Topbar>
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          {/* Client Info */}
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <Avatar className="h-14 w-14">
                <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                {editing ? (
                  <div className="space-y-3">
                    <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                    <Select value={editStatus} onValueChange={setEditStatus}>
                      <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="onboarding">Onboarding</SelectItem>
                        <SelectItem value="paused">Paused</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} placeholder="Notes..." rows={2} />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSave} className="gap-1"><Save className="h-3.5 w-3.5" /> Save</Button>
                      <Button size="sm" variant="outline" onClick={() => setEditing(false)} className="gap-1"><X className="h-3.5 w-3.5" /> Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-bold">{client.name}</h2>
                      <StatusBadge status={client.status} />
                      <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    {client.notes && <p className="mt-1 text-sm text-muted-foreground">{client.notes}</p>}
                    <p className="mt-1 text-xs text-muted-foreground">
                      Added {new Date(client.created_at).toLocaleDateString()}
                    </p>
                  </>
                )}
              </div>
            </div>

            {onboardingProgress.total > 0 && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Onboarding Progress</span>
                  <span className="text-muted-foreground">{onboardingProgress.completed}/{onboardingProgress.total} ({progressPercent}%)</span>
                </div>
                <Progress value={progressPercent} className="h-2" />
              </div>
            )}
          </Card>

          {/* Projects */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold flex items-center gap-2">
                <FolderKanban className="h-4 w-4 text-primary" /> Projects
              </h3>
              <Button size="sm" variant="outline" onClick={() => router.push("/projects")}>
                View All
              </Button>
            </div>
            {projects.length === 0 ? (
              <Card className="p-6 text-center text-sm text-muted-foreground">
                No projects for this client yet.
              </Card>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {projects.map((p) => (
                  <Card
                    key={p.id}
                    className="cursor-pointer p-4 hover:shadow-md transition-all"
                    onClick={() => router.push(`/projects/${p.id}`)}
                  >
                    <h4 className="font-medium text-sm">{p.name}</h4>
                    {p.description && <p className="text-xs text-muted-foreground mt-1">{p.description}</p>}
                    <StatusBadge status={p.status} />
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Tasks */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold">Tasks</h3>
              <Button size="sm" onClick={() => setShowQuickAdd(true)}>Add Task</Button>
            </div>
            <TaskList
              key={refreshKey}
              initialFilters={{ client_id: id }}
              onTaskClick={(task) => router.push(`/tasks/${task.id}`)}
              showFilters={false}
            />
          </div>
        </div>
      </ScrollArea>

      <QuickAddTask
        open={showQuickAdd}
        onOpenChange={setShowQuickAdd}
        onCreated={() => { setRefreshKey((k) => k + 1); loadData(); }}
        defaultClientId={id}
      />
    </>
  );
}
