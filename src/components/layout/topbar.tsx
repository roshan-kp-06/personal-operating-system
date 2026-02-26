"use client";

import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TopbarProps {
  title: string;
  subtitle?: string;
  onQuickAdd?: () => void;
  children?: React.ReactNode;
}

export function Topbar({ title, subtitle, onQuickAdd, children }: TopbarProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        {children}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="h-9 w-64 pl-9 text-sm"
          />
        </div>
        {onQuickAdd && (
          <Button size="sm" onClick={onQuickAdd} className="gap-1.5">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Quick Add</span>
          </Button>
        )}
      </div>
    </header>
  );
}
