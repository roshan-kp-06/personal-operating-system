import { supabase } from "./client";
import type { Domain, Client, Project, Task, Template, TemplateTask, InboxItem, View, ViewColumn, ViewFilter, ViewSort, CustomFieldDef } from "./types";

// ── Domains ──

export async function getDomains(): Promise<Domain[]> {
  const { data, error } = await supabase
    .from("domains")
    .select("*")
    .order("sort_order");
  if (error) throw error;
  return data || [];
}

export async function getDomainsWithChildren(): Promise<Domain[]> {
  const all = await getDomains();
  const parents = all.filter((d) => !d.parent_id);
  return parents.map((p) => ({
    ...p,
    children: all.filter((c) => c.parent_id === p.id),
  }));
}

export async function createDomain(domain: { name: string; parent_id?: string | null; color?: string; sort_order?: number }) {
  const { data, error } = await supabase.from("domains").insert(domain).select().single();
  if (error) throw error;
  return data;
}

export async function deleteDomain(id: string) {
  const { error } = await supabase.from("domains").delete().eq("id", id);
  if (error) throw error;
}

// ── Clients ──

export async function getClients(): Promise<Client[]> {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getClient(id: string): Promise<Client | null> {
  const { data, error } = await supabase.from("clients").select("*").eq("id", id).single();
  if (error) return null;
  return data;
}

export async function createClient(client: { name: string; status?: string; notes?: string }) {
  const { data, error } = await supabase.from("clients").insert(client).select().single();
  if (error) throw error;
  return data;
}

export async function updateClient(id: string, updates: Partial<Client>) {
  const { data, error } = await supabase.from("clients").update(updates).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteClient(id: string) {
  const { error } = await supabase.from("clients").delete().eq("id", id);
  if (error) throw error;
}

// ── Projects ──

export async function getProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("*, client:clients(*), domain:domains(*)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getProject(id: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from("projects")
    .select("*, client:clients(*), domain:domains(*)")
    .eq("id", id)
    .single();
  if (error) return null;
  return data;
}

export async function getProjectsByClient(clientId: string): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("*, domain:domains(*)")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createProject(project: { name: string; client_id?: string | null; domain_id?: string | null; description?: string }) {
  const { data, error } = await supabase.from("projects").insert(project).select().single();
  if (error) throw error;
  return data;
}

export async function updateProject(id: string, updates: Partial<Project>) {
  const { data, error } = await supabase.from("projects").update(updates).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteProject(id: string) {
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw error;
}

// ── Tasks ──

export async function getTasks(filters?: {
  status?: string;
  domain_id?: string;
  client_id?: string;
  project_id?: string;
}): Promise<Task[]> {
  let query = supabase
    .from("tasks")
    .select("*, domain:domains(*), client:clients(*), project:projects(*)")
    .order("priority_score", { ascending: false });

  if (filters?.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }
  if (filters?.domain_id) {
    query = query.eq("domain_id", filters.domain_id);
  }
  if (filters?.client_id) {
    query = query.eq("client_id", filters.client_id);
  }
  if (filters?.project_id) {
    query = query.eq("project_id", filters.project_id);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getTask(id: string): Promise<Task | null> {
  const { data, error } = await supabase
    .from("tasks")
    .select("*, domain:domains(*), client:clients(*), project:projects(*)")
    .eq("id", id)
    .single();
  if (error) return null;
  return data;
}

export async function createTask(task: {
  title: string;
  description?: string;
  project_id?: string | null;
  client_id?: string | null;
  domain_id?: string | null;
  urgency?: number;
  leverage?: number;
  effort?: number;
  due_date?: string | null;
  status?: string;
}) {
  const { data, error } = await supabase.from("tasks").insert(task).select().single();
  if (error) throw error;
  return data;
}

export async function updateTask(id: string, updates: Partial<Task>) {
  // Remove computed field
  const { priority_score, domain, client, project, ...clean } = updates as Record<string, unknown>;
  const { data, error } = await supabase.from("tasks").update(clean).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteTask(id: string) {
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) throw error;
}

// ── Templates ──

export async function getTemplates(): Promise<Template[]> {
  const { data, error } = await supabase
    .from("templates")
    .select("*, template_tasks(*)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getTemplate(id: string): Promise<Template | null> {
  const { data, error } = await supabase
    .from("templates")
    .select("*, template_tasks(*)")
    .eq("id", id)
    .single();
  if (error) return null;
  return data;
}

export async function createTemplate(template: { name: string; description?: string }) {
  const { data, error } = await supabase.from("templates").insert(template).select().single();
  if (error) throw error;
  return data;
}

export async function updateTemplate(id: string, updates: Partial<Template>) {
  const { template_tasks, ...clean } = updates as Record<string, unknown>;
  const { data, error } = await supabase.from("templates").update(clean).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteTemplate(id: string) {
  const { error } = await supabase.from("templates").delete().eq("id", id);
  if (error) throw error;
}

export async function createTemplateTask(task: Partial<TemplateTask> & { template_id: string; title: string }) {
  const { data, error } = await supabase.from("template_tasks").insert(task).select().single();
  if (error) throw error;
  return data;
}

export async function deleteTemplateTask(id: string) {
  const { error } = await supabase.from("template_tasks").delete().eq("id", id);
  if (error) throw error;
}

export async function applyTemplate(templateId: string, clientId: string) {
  const template = await getTemplate(templateId);
  if (!template?.template_tasks) return [];

  const tasks = template.template_tasks.map((tt) => ({
    title: tt.title,
    description: tt.description,
    domain_id: tt.domain_id,
    client_id: clientId,
    urgency: tt.default_urgency,
    leverage: tt.default_leverage,
    effort: tt.default_effort,
    template_task_id: tt.id,
    status: "todo",
  }));

  const { data, error } = await supabase.from("tasks").insert(tasks).select();
  if (error) throw error;

  // Update client status to onboarding
  await supabase
    .from("clients")
    .update({ status: "onboarding", onboarded_at: new Date().toISOString() })
    .eq("id", clientId);

  return data;
}

// ── Inbox ──

export async function getInboxItems(filters?: { status?: string }): Promise<InboxItem[]> {
  let query = supabase
    .from("inbox_items")
    .select("*")
    .order("received_at", { ascending: false });

  if (filters?.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function createInboxItem(item: {
  source: string;
  sender?: string;
  subject?: string;
  content?: string;
}) {
  const { data, error } = await supabase.from("inbox_items").insert(item).select().single();
  if (error) throw error;
  return data;
}

export async function updateInboxItem(id: string, updates: Partial<InboxItem>) {
  const { data, error } = await supabase.from("inbox_items").update(updates).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteInboxItem(id: string) {
  const { error } = await supabase.from("inbox_items").delete().eq("id", id);
  if (error) throw error;
}

// ── Views ──

export async function getViews(): Promise<View[]> {
  const { data, error } = await supabase
    .from("views")
    .select("*")
    .order("sort_order");
  if (error) throw error;
  return data || [];
}

export async function getView(id: string): Promise<View | null> {
  const { data, error } = await supabase.from("views").select("*").eq("id", id).single();
  if (error) return null;
  return data;
}

export async function createView(view: {
  name: string;
  description?: string;
  columns: ViewColumn[];
  filters?: ViewFilter[];
  sort?: ViewSort;
  group_by?: string;
}) {
  const { data, error } = await supabase.from("views").insert(view).select().single();
  if (error) throw error;
  return data;
}

export async function updateView(id: string, updates: Partial<View>) {
  const { data, error } = await supabase.from("views").update(updates).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteView(id: string) {
  const { error } = await supabase.from("views").delete().eq("id", id);
  if (error) throw error;
}

// ── Custom Field Definitions ──

export async function getCustomFieldDefs(): Promise<CustomFieldDef[]> {
  const { data, error } = await supabase
    .from("custom_field_defs")
    .select("*")
    .order("sort_order");
  if (error) throw error;
  return data || [];
}

export async function createCustomFieldDef(field: {
  name: string;
  field_key: string;
  field_type: string;
  options?: string[];
}) {
  const { data, error } = await supabase.from("custom_field_defs").insert(field).select().single();
  if (error) throw error;
  return data;
}

export async function deleteCustomFieldDef(id: string) {
  const { error } = await supabase.from("custom_field_defs").delete().eq("id", id);
  if (error) throw error;
}

// ── Dashboard Stats ──

export async function getDashboardStats() {
  const [
    { count: totalTasks },
    { count: activeTasks },
    { count: doneTasks },
    { count: totalClients },
    { count: unreadInbox },
  ] = await Promise.all([
    supabase.from("tasks").select("*", { count: "exact", head: true }),
    supabase.from("tasks").select("*", { count: "exact", head: true }).in("status", ["todo", "in_progress"]),
    supabase.from("tasks").select("*", { count: "exact", head: true }).eq("status", "done"),
    supabase.from("clients").select("*", { count: "exact", head: true }),
    supabase.from("inbox_items").select("*", { count: "exact", head: true }).eq("status", "unread"),
  ]);

  return {
    totalTasks: totalTasks || 0,
    activeTasks: activeTasks || 0,
    doneTasks: doneTasks || 0,
    totalClients: totalClients || 0,
    unreadInbox: unreadInbox || 0,
  };
}
