"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Topbar } from "@/components/layout/topbar";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { DomainBadge } from "@/components/shared/domain-badge";
import { getProjects, createProject, getDomains, getClients } from "@/lib/supabase/data";
import { Project, Domain, Client } from "@/lib/supabase/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { FolderKanban, Plus, Loader2 } from "lucide-react";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", client_id: "", domain_id: "" });
  const router = useRouter();

  const loadData = async () => {
    setLoading(true);
    try {
      const [p, d, c] = await Promise.all([getProjects(), getDomains(), getClients()]);
      setProjects(p);
      setDomains(d);
      setClients(c);
    } catch {
      // handle
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    await createProject({
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      client_id: form.client_id || null,
      domain_id: form.domain_id || null,
    });
    setForm({ name: "", description: "", client_id: "", domain_id: "" });
    setShowAdd(false);
    loadData();
  };

  return (
    <>
      <Topbar title="Projects" subtitle="Organize work by project">
        <Button size="sm" onClick={() => setShowAdd(true)} className="gap-1.5">
          <Plus className="h-4 w-4" /> New Project
        </Button>
      </Topbar>
      <ScrollArea className="flex-1">
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : projects.length === 0 ? (
            <EmptyState
              icon={FolderKanban}
              title="No projects yet"
              description="Create your first project to start organizing tasks."
              action={
                <Button size="sm" onClick={() => setShowAdd(true)}>
                  <Plus className="mr-1.5 h-4 w-4" /> New Project
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <Card
                  key={project.id}
                  className="cursor-pointer p-4 transition-all hover:shadow-md hover:border-primary/20"
                  onClick={() => router.push(`/projects/${project.id}`)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold truncate">{project.name}</h3>
                    <StatusBadge status={project.status} />
                  </div>
                  {project.description && (
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{project.description}</p>
                  )}
                  <div className="mt-3 flex items-center gap-2">
                    {project.domain && <DomainBadge name={project.domain.name} color={project.domain.color} />}
                    {project.client && (
                      <span className="text-xs text-muted-foreground">{project.client.name}</span>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Project Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Website Redesign"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Optional description..."
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Client</Label>
                <Select value={form.client_id} onValueChange={(v) => setForm({ ...form, client_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Domain</Label>
                <Select value={form.domain_id} onValueChange={(v) => setForm({ ...form, domain_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select domain" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {domains.map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={!form.name.trim()}>Create</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
