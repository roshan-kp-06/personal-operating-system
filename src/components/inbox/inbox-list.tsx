"use client";

import { useState, useEffect, useCallback } from "react";
import { InboxItem } from "@/lib/supabase/types";
import { getInboxItems, updateInboxItem, deleteInboxItem, createInboxItem } from "@/lib/supabase/data";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Inbox, Mail, MessageSquare, Plus, Archive, CheckCircle, Loader2, Trash2 } from "lucide-react";

const sourceIcons: Record<string, typeof Mail> = {
  email: Mail,
  slack: MessageSquare,
  manual: Inbox,
};

export function InboxList() {
  const [items, setItems] = useState<InboxItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({ source: "manual", sender: "", subject: "", content: "" });

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getInboxItems(statusFilter !== "all" ? { status: statusFilter } : undefined);
      setItems(data);
    } catch {
      // supabase not connected
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleMarkRead = async (id: string) => {
    await updateInboxItem(id, { status: "read" });
    loadItems();
  };

  const handleAction = async (id: string) => {
    await updateInboxItem(id, { status: "actioned" });
    loadItems();
  };

  const handleArchive = async (id: string) => {
    await updateInboxItem(id, { status: "archived" });
    loadItems();
  };

  const handleDelete = async (id: string) => {
    await deleteInboxItem(id);
    loadItems();
  };

  const handleAdd = async () => {
    if (!newItem.subject && !newItem.content) return;
    await createInboxItem({
      source: newItem.source,
      sender: newItem.sender || undefined,
      subject: newItem.subject || undefined,
      content: newItem.content || undefined,
    });
    setNewItem({ source: "manual", sender: "", subject: "", content: "" });
    setShowAdd(false);
    loadItems();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="unread">Unread</SelectItem>
            <SelectItem value="read">Read</SelectItem>
            <SelectItem value="actioned">Actioned</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <Button size="sm" onClick={() => setShowAdd(true)} className="gap-1.5">
          <Plus className="h-4 w-4" /> Add Item
        </Button>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Inbox is empty"
          description="No items to show. Add items manually or connect Slack/email later."
          action={
            <Button size="sm" onClick={() => setShowAdd(true)}>
              <Plus className="mr-1.5 h-4 w-4" /> Add Item
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">
          {items.map((item) => {
            const Icon = sourceIcons[item.source] || Inbox;
            return (
              <Card key={item.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-md bg-muted p-1.5">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium text-foreground truncate">
                        {item.subject || "(No subject)"}
                      </h4>
                      <StatusBadge status={item.status} />
                      <Badge variant="outline" className="text-xs capitalize">{item.source}</Badge>
                    </div>
                    {item.sender && (
                      <p className="text-xs text-muted-foreground">From: {item.sender}</p>
                    )}
                    {item.content && (
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{item.content}</p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(item.received_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {item.status === "unread" && (
                      <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => handleMarkRead(item.id)}>
                        Read
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => handleAction(item.id)}>
                      <CheckCircle className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => handleArchive(item.id)}>
                      <Archive className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-destructive" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Inbox Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={newItem.source} onValueChange={(v) => setNewItem({ ...newItem, source: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="slack">Slack</SelectItem>
                <SelectItem value="email">Email</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="From (sender)"
              value={newItem.sender}
              onChange={(e) => setNewItem({ ...newItem, sender: e.target.value })}
            />
            <Input
              placeholder="Subject"
              value={newItem.subject}
              onChange={(e) => setNewItem({ ...newItem, subject: e.target.value })}
            />
            <Textarea
              placeholder="Content"
              value={newItem.content}
              onChange={(e) => setNewItem({ ...newItem, content: e.target.value })}
              rows={4}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button onClick={handleAdd}>Add Item</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
