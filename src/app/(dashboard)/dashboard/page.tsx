"use client";

import { useState, useEffect } from "react";
import { Topbar } from "@/components/layout/topbar";
import { QuickAddTask } from "@/components/tasks/quick-add-task";
import { TaskCard } from "@/components/tasks/task-card";
import { ClientCard } from "@/components/clients/client-card";
import { Card } from "@/components/ui/card";
import { getDashboardStats, getTasks, getClients } from "@/lib/supabase/data";
import { Task, Client } from "@/lib/supabase/types";
import { useRouter } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckSquare, Users, Inbox, TrendingUp, ListTodo, CheckCircle } from "lucide-react";

export default function DashboardPage() {
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [stats, setStats] = useState({ totalTasks: 0, activeTasks: 0, doneTasks: 0, totalClients: 0, unreadInbox: 0 });
  const [topTasks, setTopTasks] = useState<Task[]>([]);
  const [recentClients, setRecentClients] = useState<Client[]>([]);
  const router = useRouter();

  const loadData = () => {
    getDashboardStats().then(setStats).catch(() => {});
    getTasks({ status: "todo" }).then((tasks) => setTopTasks(tasks.slice(0, 5))).catch(() => {});
    getClients().then((clients) => setRecentClients(clients.slice(0, 4))).catch(() => {});
  };

  useEffect(() => {
    loadData();
  }, []);

  const statCards = [
    { label: "Active Tasks", value: stats.activeTasks, icon: ListTodo, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Completed", value: stats.doneTasks, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
    { label: "Total Clients", value: stats.totalClients, icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Unread Inbox", value: stats.unreadInbox, icon: Inbox, color: "text-orange-600", bg: "bg-orange-50" },
  ];

  return (
    <>
      <Topbar
        title="Dashboard"
        subtitle="Your personal operating system overview"
        onQuickAdd={() => setShowQuickAdd(true)}
      />
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((stat) => (
              <Card key={stat.label} className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`rounded-lg p-2.5 ${stat.bg}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Top Priority Tasks */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Top Priority Tasks
                </h2>
                <button
                  onClick={() => router.push("/tasks")}
                  className="text-xs text-primary hover:underline"
                >
                  View all
                </button>
              </div>
              <div className="space-y-2">
                {topTasks.length === 0 ? (
                  <Card className="p-8 text-center">
                    <CheckSquare className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No active tasks. Create one to get started!</p>
                  </Card>
                ) : (
                  topTasks.map((task) => (
                    <TaskCard key={task.id} task={task} onClick={() => router.push(`/tasks/${task.id}`)} />
                  ))
                )}
              </div>
            </div>

            {/* Recent Clients */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Clients
                </h2>
                <button
                  onClick={() => router.push("/clients")}
                  className="text-xs text-primary hover:underline"
                >
                  View all
                </button>
              </div>
              <div className="space-y-2">
                {recentClients.length === 0 ? (
                  <Card className="p-8 text-center">
                    <Users className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No clients yet. Add your first client!</p>
                  </Card>
                ) : (
                  recentClients.map((client) => (
                    <ClientCard
                      key={client.id}
                      client={client}
                      onClick={() => router.push(`/clients/${client.id}`)}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>

      <QuickAddTask
        open={showQuickAdd}
        onOpenChange={setShowQuickAdd}
        onCreated={loadData}
      />
    </>
  );
}
