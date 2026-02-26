"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Topbar } from "@/components/layout/topbar";
import { ClientCard } from "@/components/clients/client-card";
import { EmptyState } from "@/components/shared/empty-state";
import { getClients, createClient } from "@/lib/supabase/data";
import { Client } from "@/lib/supabase/types";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { Users, Plus, Loader2 } from "lucide-react";

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const router = useRouter();

  const loadClients = async () => {
    setLoading(true);
    try {
      const data = await getClients();
      setClients(data);
    } catch {
      // supabase not connected
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await createClient({ name: newName.trim(), notes: newNotes.trim() || undefined });
    setNewName("");
    setNewNotes("");
    setShowAdd(false);
    loadClients();
  };

  return (
    <>
      <Topbar title="Clients" subtitle="Manage your client relationships">
        <Button size="sm" onClick={() => setShowAdd(true)} className="gap-1.5">
          <Plus className="h-4 w-4" /> New Client
        </Button>
      </Topbar>
      <ScrollArea className="flex-1">
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : clients.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No clients yet"
              description="Add your first client to start organizing projects and tasks."
              action={
                <Button size="sm" onClick={() => setShowAdd(true)}>
                  <Plus className="mr-1.5 h-4 w-4" /> Add Client
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {clients.map((client) => (
                <ClientCard
                  key={client.id}
                  client={client}
                  onClick={() => router.push(`/clients/${client.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Client Name</Label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Acme Corp"
              />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="Optional notes about this client..."
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={!newName.trim()}>Create Client</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
