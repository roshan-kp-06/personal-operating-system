"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Topbar } from "@/components/layout/topbar";
import { EmptyState } from "@/components/shared/empty-state";
import { getTemplates, createTemplate, deleteTemplate } from "@/lib/supabase/data";
import { Template } from "@/lib/supabase/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileText, Plus, Loader2, Trash2 } from "lucide-react";

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const router = useRouter();

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const data = await getTemplates();
      setTemplates(data);
    } catch {
      // handle
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const tpl = await createTemplate({ name: newName.trim(), description: newDesc.trim() || undefined });
    setNewName("");
    setNewDesc("");
    setShowAdd(false);
    router.push(`/templates/${tpl.id}`);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Delete this template?")) return;
    await deleteTemplate(id);
    loadTemplates();
  };

  return (
    <>
      <Topbar title="Templates" subtitle="Manage onboarding templates">
        <Button size="sm" onClick={() => setShowAdd(true)} className="gap-1.5">
          <Plus className="h-4 w-4" /> New Template
        </Button>
      </Topbar>
      <ScrollArea className="flex-1">
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : templates.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No templates yet"
              description="Create a template to standardize client onboarding."
              action={
                <Button size="sm" onClick={() => setShowAdd(true)}>
                  <Plus className="mr-1.5 h-4 w-4" /> New Template
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {templates.map((tpl) => (
                <Card
                  key={tpl.id}
                  className="group cursor-pointer p-4 transition-all hover:shadow-md hover:border-primary/20"
                  onClick={() => router.push(`/templates/${tpl.id}`)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-semibold">{tpl.name}</h3>
                      {tpl.description && (
                        <p className="mt-1 text-xs text-muted-foreground">{tpl.description}</p>
                      )}
                      <p className="mt-2 text-xs text-muted-foreground">
                        {tpl.template_tasks?.length || 0} tasks
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
                      onClick={(e) => handleDelete(e, tpl.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
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
            <DialogTitle>New Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Template Name</Label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="New Client Onboarding"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Describe this template..."
                rows={2}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={!newName.trim()}>Create</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
