"use client";

import { useState, useEffect } from "react";
import { Task, Domain, Client, Project } from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getDomains, getClients, getProjects } from "@/lib/supabase/data";

interface TaskFormProps {
  task?: Task | null;
  onSubmit: (data: {
    title: string;
    description?: string;
    domain_id?: string | null;
    client_id?: string | null;
    project_id?: string | null;
    urgency: number;
    leverage: number;
    effort: number;
    status: string;
    due_date?: string | null;
  }) => void;
  onCancel?: () => void;
  loading?: boolean;
}

export function TaskForm({ task, onSubmit, onCancel, loading }: TaskFormProps) {
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [domainId, setDomainId] = useState(task?.domain_id || "");
  const [clientId, setClientId] = useState(task?.client_id || "");
  const [projectId, setProjectId] = useState(task?.project_id || "");
  const [urgency, setUrgency] = useState(task?.urgency || 3);
  const [leverage, setLeverage] = useState(task?.leverage || 3);
  const [effort, setEffort] = useState(task?.effort || 3);
  const [status, setStatus] = useState<string>(task?.status || "todo");
  const [dueDate, setDueDate] = useState(task?.due_date || "");

  const [domains, setDomains] = useState<Domain[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    getDomains().then(setDomains).catch(() => {});
    getClients().then(setClients).catch(() => {});
    getProjects().then(setProjects).catch(() => {});
  }, []);

  const priorityScore = ((leverage * 2 + urgency) / effort).toFixed(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      domain_id: domainId || null,
      client_id: clientId || null,
      project_id: projectId || null,
      urgency,
      leverage,
      effort,
      status,
      due_date: dueDate || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="title">Task Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add details..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label>Domain</Label>
          <Select value={domainId} onValueChange={setDomainId}>
            <SelectTrigger><SelectValue placeholder="Select domain" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {domains.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.parent_id ? "  " : ""}{d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Client</Label>
          <Select value={clientId} onValueChange={setClientId}>
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
          <Label>Project</Label>
          <Select value={projectId} onValueChange={setProjectId}>
            <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-purple-600">Leverage</Label>
            <span className="text-sm font-semibold text-purple-600">{leverage}/5</span>
          </div>
          <Slider
            value={[leverage]}
            onValueChange={([v]) => setLeverage(v)}
            min={1}
            max={5}
            step={1}
            className="[&_[role=slider]]:bg-purple-500"
          />
          <p className="text-xs text-muted-foreground">How much impact will this have?</p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-orange-600">Urgency</Label>
            <span className="text-sm font-semibold text-orange-600">{urgency}/5</span>
          </div>
          <Slider
            value={[urgency]}
            onValueChange={([v]) => setUrgency(v)}
            min={1}
            max={5}
            step={1}
            className="[&_[role=slider]]:bg-orange-500"
          />
          <p className="text-xs text-muted-foreground">How soon does this need to happen?</p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-blue-600">Effort</Label>
            <span className="text-sm font-semibold text-blue-600">{effort}/5</span>
          </div>
          <Slider
            value={[effort]}
            onValueChange={([v]) => setEffort(v)}
            min={1}
            max={5}
            step={1}
            className="[&_[role=slider]]:bg-blue-500"
          />
          <p className="text-xs text-muted-foreground">How much work is involved?</p>
        </div>
      </div>

      <div className="rounded-lg bg-primary/5 p-3 text-center">
        <span className="text-sm text-muted-foreground">Priority Score: </span>
        <span className="text-lg font-bold text-primary">{priorityScore}</span>
        <span className="ml-1 text-xs text-muted-foreground">(higher = do first)</span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="done">Done</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="due_date">Due Date</Label>
          <Input
            id="due_date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading || !title.trim()}>
          {loading ? "Saving..." : task ? "Update Task" : "Create Task"}
        </Button>
      </div>
    </form>
  );
}
