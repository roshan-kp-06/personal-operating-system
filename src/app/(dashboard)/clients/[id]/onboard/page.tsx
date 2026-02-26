"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Topbar } from "@/components/layout/topbar";
import { getClient, getTemplates, applyTemplate } from "@/lib/supabase/data";
import { Client, Template } from "@/lib/supabase/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, CheckCircle, Loader2 } from "lucide-react";

export default function OnboardClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [client, setClient] = useState<Client | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const router = useRouter();

  useEffect(() => {
    Promise.all([getClient(id), getTemplates()])
      .then(([c, t]) => {
        setClient(c);
        setTemplates(t);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleApply = async () => {
    if (!selectedTemplate) return;
    setApplying(true);
    try {
      await applyTemplate(selectedTemplate, id);
      setApplied(true);
    } catch (err) {
      console.error(err);
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const selectedTpl = templates.find((t) => t.id === selectedTemplate);

  return (
    <>
      <Topbar title="Onboard Client" subtitle={client?.name || ""}>
        <Button variant="ghost" size="sm" onClick={() => router.push(`/clients/${id}`)} className="gap-1.5">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
      </Topbar>
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-2xl p-6 space-y-6">
          {applied ? (
            <Card className="p-8 text-center">
              <CheckCircle className="mx-auto mb-3 h-12 w-12 text-green-500" />
              <h2 className="text-lg font-semibold">Template Applied!</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {selectedTpl?.template_tasks?.length || 0} tasks have been created for {client?.name}.
              </p>
              <Button className="mt-4" onClick={() => router.push(`/clients/${id}`)}>
                View Client
              </Button>
            </Card>
          ) : (
            <>
              <div>
                <h2 className="text-lg font-semibold mb-1">Select Onboarding Template</h2>
                <p className="text-sm text-muted-foreground">
                  Choose a template to create standardized tasks for {client?.name}.
                </p>
              </div>

              {templates.length === 0 ? (
                <Card className="p-8 text-center">
                  <FileText className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No templates yet.</p>
                  <Button variant="link" onClick={() => router.push("/templates")} className="mt-2">
                    Create a template first
                  </Button>
                </Card>
              ) : (
                <div className="space-y-3">
                  {templates.map((tpl) => (
                    <Card
                      key={tpl.id}
                      className={`cursor-pointer p-4 transition-all ${
                        selectedTemplate === tpl.id
                          ? "border-primary bg-primary/5 shadow-md"
                          : "hover:border-primary/20"
                      }`}
                      onClick={() => setSelectedTemplate(tpl.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{tpl.name}</h3>
                          {tpl.description && (
                            <p className="text-sm text-muted-foreground mt-0.5">{tpl.description}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {tpl.template_tasks?.length || 0} tasks
                          </p>
                        </div>
                        {selectedTemplate === tpl.id && (
                          <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                        )}
                      </div>

                      {selectedTemplate === tpl.id && tpl.template_tasks && tpl.template_tasks.length > 0 && (
                        <div className="mt-3 border-t pt-3 space-y-1.5">
                          <p className="text-xs font-medium text-muted-foreground">Tasks to create:</p>
                          {tpl.template_tasks.map((tt) => (
                            <div key={tt.id} className="flex items-center gap-2 text-sm">
                              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                              {tt.title}
                            </div>
                          ))}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}

              {selectedTemplate && (
                <Button onClick={handleApply} disabled={applying} className="w-full">
                  {applying ? "Applying..." : `Apply Template (${selectedTpl?.template_tasks?.length || 0} tasks)`}
                </Button>
              )}
            </>
          )}
        </div>
      </ScrollArea>
    </>
  );
}
