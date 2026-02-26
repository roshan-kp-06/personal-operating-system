"use client";

import { useState, useEffect } from "react";
import { Topbar } from "@/components/layout/topbar";
import { getDomainsWithChildren, createDomain, deleteDomain } from "@/lib/supabase/data";
import { Domain } from "@/lib/supabase/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DomainBadge } from "@/components/shared/domain-badge";
import { Plus, Trash2, Loader2, ChevronRight } from "lucide-react";

export default function SettingsPage() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#3B82F6");
  const [newParent, setNewParent] = useState("");

  const loadDomains = async () => {
    setLoading(true);
    try {
      const data = await getDomainsWithChildren();
      setDomains(data);
    } catch {
      // handle
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDomains();
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await createDomain({
      name: newName.trim(),
      color: newColor,
      parent_id: newParent || null,
    });
    setNewName("");
    setNewColor("#3B82F6");
    setNewParent("");
    loadDomains();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this domain?")) return;
    await deleteDomain(id);
    loadDomains();
  };

  return (
    <>
      <Topbar title="Settings" subtitle="Manage domains and preferences" />
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-2xl p-6 space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Domains</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Organize your tasks and projects by domain. Domains can have sub-domains.
            </p>

            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-2 mb-6">
                {domains.map((domain) => (
                  <div key={domain.id}>
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-3">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: domain.color || "#64748B" }} />
                        <span className="text-sm font-medium">{domain.name}</span>
                        <DomainBadge name={domain.name} color={domain.color} />
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(domain.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    {domain.children && domain.children.length > 0 && (
                      <div className="ml-6 mt-1 space-y-1">
                        {domain.children.map((child) => (
                          <div key={child.id} className="flex items-center justify-between rounded-lg border border-dashed p-2.5">
                            <div className="flex items-center gap-2">
                              <ChevronRight className="h-3 w-3 text-muted-foreground" />
                              <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: child.color || "#64748B" }} />
                              <span className="text-sm">{child.name}</span>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                              onClick={() => handleDelete(child.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Add domain form */}
            <div className="border-t pt-4 space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Plus className="h-4 w-4" /> Add Domain
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="space-y-1">
                  <Label className="text-xs">Name</Label>
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Domain name"
                    onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Parent (optional)</Label>
                  <Select value={newParent} onValueChange={setNewParent}>
                    <SelectTrigger><SelectValue placeholder="Top level" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Top Level</SelectItem>
                      {domains.map((d) => (
                        <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={newColor}
                      onChange={(e) => setNewColor(e.target.value)}
                      className="h-9 w-12 p-1 cursor-pointer"
                    />
                    <Button onClick={handleCreate} disabled={!newName.trim()} className="flex-1">
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </ScrollArea>
    </>
  );
}
