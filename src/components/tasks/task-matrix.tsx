"use client";

import { useState, useEffect } from "react";
import { Task, Domain } from "@/lib/supabase/types";
import { getTasks, getDomains } from "@/lib/supabase/data";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const DOMAIN_COLORS: Record<string, string> = {};

function getDomainColor(domainName: string, color?: string | null): string {
  if (color) return color;
  if (DOMAIN_COLORS[domainName]) return DOMAIN_COLORS[domainName];
  const colors = ["#3B82F6", "#8B5CF6", "#22C55E", "#F97316", "#EF4444", "#EC4899", "#6366F1"];
  DOMAIN_COLORS[domainName] = colors[Object.keys(DOMAIN_COLORS).length % colors.length];
  return DOMAIN_COLORS[domainName];
}

interface MatrixPoint {
  id: string;
  title: string;
  effort: number;
  leverage: number;
  urgency: number;
  domainName: string;
  domainColor: string;
}

export function TaskMatrix() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [domainFilter, setDomainFilter] = useState("all");
  const router = useRouter();

  useEffect(() => {
    Promise.all([
      getTasks({ status: "todo" }).catch(() => [] as Task[]),
      getTasks({ status: "in_progress" }).catch(() => [] as Task[]),
      getDomains().catch(() => [] as Domain[]),
    ]).then(([todoTasks, ipTasks, doms]) => {
      setTasks([...todoTasks, ...ipTasks]);
      setDomains(doms);
      setLoading(false);
    });
  }, []);

  const filteredTasks = domainFilter === "all"
    ? tasks
    : tasks.filter((t) => t.domain_id === domainFilter);

  const data: MatrixPoint[] = filteredTasks.map((t) => ({
    id: t.id,
    title: t.title,
    effort: t.effort + (Math.random() * 0.4 - 0.2), // jitter for overlaps
    leverage: t.leverage + (Math.random() * 0.4 - 0.2),
    urgency: t.urgency,
    domainName: t.domain?.name || "Unassigned",
    domainColor: getDomainColor(t.domain?.name || "Unassigned", t.domain?.color),
  }));

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
        <Select value={domainFilter} onValueChange={setDomainFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by domain" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Domains</SelectItem>
            {domains.map((d) => (
              <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">
          {data.length} task{data.length !== 1 ? "s" : ""} shown
        </span>
      </div>

      <div className="relative rounded-xl border bg-card p-4">
        {/* Quadrant labels */}
        <div className="pointer-events-none absolute inset-0 z-10 flex">
          <div className="flex h-full w-1/2 flex-col">
            <div className="flex flex-1 items-start justify-start p-6">
              <span className="rounded-md bg-green-50 px-2 py-1 text-xs font-semibold text-green-700">
                Quick Wins (DO NOW)
              </span>
            </div>
            <div className="flex flex-1 items-end justify-start p-6">
              <span className="rounded-md bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-500">
                Fill-ins (DELEGATE)
              </span>
            </div>
          </div>
          <div className="flex h-full w-1/2 flex-col">
            <div className="flex flex-1 items-start justify-end p-6">
              <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
                Big Projects (SCHEDULE)
              </span>
            </div>
            <div className="flex flex-1 items-end justify-end p-6">
              <span className="rounded-md bg-red-50 px-2 py-1 text-xs font-semibold text-red-600">
                Avoid (ELIMINATE)
              </span>
            </div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={500}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              type="number"
              dataKey="effort"
              name="Effort"
              domain={[0.5, 5.5]}
              tickCount={5}
              label={{ value: "Effort →", position: "bottom", offset: 20, style: { fill: "#64748b", fontSize: 13 } }}
            />
            <YAxis
              type="number"
              dataKey="leverage"
              name="Leverage"
              domain={[0.5, 5.5]}
              tickCount={5}
              label={{ value: "Leverage →", angle: -90, position: "insideLeft", offset: 0, style: { fill: "#64748b", fontSize: 13 } }}
            />
            <ReferenceLine x={3} stroke="#94a3b8" strokeDasharray="8 4" />
            <ReferenceLine y={3} stroke="#94a3b8" strokeDasharray="8 4" />
            <Tooltip
              content={({ payload }) => {
                if (!payload?.[0]) return null;
                const d = payload[0].payload as MatrixPoint;
                return (
                  <div className="rounded-lg border bg-card p-3 shadow-lg">
                    <p className="font-medium text-foreground">{d.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Effort: {Math.round(d.effort)} | Leverage: {Math.round(d.leverage)} | Urgency: {d.urgency}
                    </p>
                    <p className="text-xs" style={{ color: d.domainColor }}>{d.domainName}</p>
                  </div>
                );
              }}
            />
            <Scatter data={data} cursor="pointer" onClick={(point) => router.push(`/tasks/${point.id}`)}>
              {data.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.domainColor}
                  fillOpacity={0.8}
                  r={6 + entry.urgency * 2}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-3 justify-center">
          {Array.from(new Set(data.map((d) => d.domainName))).map((name) => {
            const point = data.find((d) => d.domainName === name);
            return (
              <div key={name} className="flex items-center gap-1.5 text-xs">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: point?.domainColor }} />
                <span className="text-muted-foreground">{name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
