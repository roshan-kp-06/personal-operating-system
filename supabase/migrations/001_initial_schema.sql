-- Personal Operating System - Initial Schema
-- Run this in Supabase SQL Editor

-- Domains (with self-referencing hierarchy)
CREATE TABLE domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  parent_id UUID REFERENCES domains(id) ON DELETE SET NULL,
  color TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Clients
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','onboarding','paused','completed')),
  onboarded_at TIMESTAMPTZ,
  notes TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  domain_id UUID REFERENCES domains(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','paused','completed','archived')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tasks
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  domain_id UUID REFERENCES domains(id) ON DELETE SET NULL,
  urgency INT DEFAULT 3 CHECK (urgency BETWEEN 1 AND 5),
  leverage INT DEFAULT 3 CHECK (leverage BETWEEN 1 AND 5),
  effort INT DEFAULT 3 CHECK (effort BETWEEN 1 AND 5),
  priority_score NUMERIC GENERATED ALWAYS AS ((leverage * 2.0 + urgency) / effort) STORED,
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo','in_progress','done','archived')),
  due_date DATE,
  template_task_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Templates
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Template Tasks
CREATE TABLE template_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES templates(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  domain_id UUID REFERENCES domains(id) ON DELETE SET NULL,
  default_urgency INT DEFAULT 3,
  default_leverage INT DEFAULT 3,
  default_effort INT DEFAULT 3,
  sort_order INT DEFAULT 0
);

-- Inbox Items
CREATE TABLE inbox_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT CHECK (source IN ('slack','email','manual')),
  sender TEXT,
  subject TEXT,
  content TEXT,
  received_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'unread' CHECK (status IN ('unread','read','actioned','archived')),
  linked_task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_domain ON tasks(domain_id);
CREATE INDEX idx_tasks_client ON tasks(client_id);
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_priority ON tasks(priority_score DESC);
CREATE INDEX idx_projects_client ON projects(client_id);
CREATE INDEX idx_projects_domain ON projects(domain_id);
CREATE INDEX idx_domains_parent ON domains(parent_id);
CREATE INDEX idx_inbox_status ON inbox_items(status);
CREATE INDEX idx_template_tasks_template ON template_tasks(template_id);

-- Disable RLS for single-user app (no auth)
ALTER TABLE domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE inbox_items ENABLE ROW LEVEL SECURITY;

-- Allow all operations for anon (single-user, no auth)
CREATE POLICY "Allow all for anon" ON domains FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON clients FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON projects FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON tasks FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON templates FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON template_tasks FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON inbox_items FOR ALL TO anon USING (true) WITH CHECK (true);
