"use client";

import { Client } from "@/lib/supabase/types";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

interface ClientCardProps {
  client: Client;
  taskStats?: { total: number; completed: number };
  projectCount?: number;
  onClick?: () => void;
}

export function ClientCard({ client, taskStats, projectCount, onClick }: ClientCardProps) {
  const initials = client.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const progress = taskStats && taskStats.total > 0
    ? Math.round((taskStats.completed / taskStats.total) * 100)
    : 0;

  return (
    <Card
      className="cursor-pointer p-4 transition-all hover:shadow-md hover:border-primary/20"
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-foreground truncate">{client.name}</h3>
            <StatusBadge status={client.status} />
          </div>
          {client.notes && (
            <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{client.notes}</p>
          )}
        </div>
      </div>

      {taskStats && taskStats.total > 0 && (
        <div className="mt-3 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Onboarding Progress</span>
            <span className="font-medium">{taskStats.completed}/{taskStats.total} tasks</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      )}

      <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
        {projectCount !== undefined && (
          <span>{projectCount} project{projectCount !== 1 ? "s" : ""}</span>
        )}
        {client.onboarded_at && (
          <span>Onboarded {new Date(client.onboarded_at).toLocaleDateString()}</span>
        )}
      </div>
    </Card>
  );
}
