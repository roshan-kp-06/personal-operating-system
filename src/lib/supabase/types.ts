export type Domain = {
  id: string;
  name: string;
  parent_id: string | null;
  color: string | null;
  sort_order: number;
  created_at: string;
  children?: Domain[];
};

export type Client = {
  id: string;
  name: string;
  status: "active" | "onboarding" | "paused" | "completed";
  onboarded_at: string | null;
  notes: string | null;
  avatar_url: string | null;
  created_at: string;
};

export type Project = {
  id: string;
  name: string;
  client_id: string | null;
  domain_id: string | null;
  status: "active" | "paused" | "completed" | "archived";
  description: string | null;
  created_at: string;
  client?: Client;
  domain?: Domain;
};

export type Task = {
  id: string;
  title: string;
  description: string | null;
  project_id: string | null;
  client_id: string | null;
  domain_id: string | null;
  urgency: number;
  leverage: number;
  effort: number;
  priority_score: number;
  status: "todo" | "in_progress" | "done" | "archived";
  due_date: string | null;
  template_task_id: string | null;
  created_at: string;
  completed_at: string | null;
  custom_fields: Record<string, unknown>;
  domain?: Domain;
  client?: Client;
  project?: Project;
};

export type Template = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  template_tasks?: TemplateTask[];
};

export type TemplateTask = {
  id: string;
  template_id: string;
  title: string;
  description: string | null;
  domain_id: string | null;
  default_urgency: number;
  default_leverage: number;
  default_effort: number;
  sort_order: number;
};

// ── Views & Custom Fields ──

export type ViewColumn = {
  key: string;
  label: string;
  type: "built-in" | "custom";
  visible: boolean;
  width?: number;
};

export type ViewFilter = {
  field: string;
  operator: "eq" | "neq" | "in" | "gte" | "lte" | "contains";
  value: unknown;
};

export type ViewSort = {
  field: string;
  direction: "asc" | "desc";
};

export type View = {
  id: string;
  name: string;
  description: string | null;
  columns: ViewColumn[];
  filters: ViewFilter[];
  sort: ViewSort;
  group_by: string | null;
  is_default: boolean;
  sort_order: number;
  created_at: string;
};

export type CustomFieldDef = {
  id: string;
  name: string;
  field_key: string;
  field_type: "text" | "number" | "select" | "date" | "checkbox" | "url";
  options: string[];
  color: string | null;
  sort_order: number;
  created_at: string;
};

export type InboxItem = {
  id: string;
  source: "slack" | "email" | "manual";
  sender: string | null;
  subject: string | null;
  content: string | null;
  received_at: string;
  status: "unread" | "read" | "actioned" | "archived";
  linked_task_id: string | null;
  created_at: string;
};
