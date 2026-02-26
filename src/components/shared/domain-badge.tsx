"use client";

import { Badge } from "@/components/ui/badge";

interface DomainBadgeProps {
  name: string;
  color?: string | null;
}

export function DomainBadge({ name, color }: DomainBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className="text-xs font-medium"
      style={color ? { backgroundColor: `${color}18`, color, borderColor: `${color}30` } : undefined}
    >
      {name}
    </Badge>
  );
}
