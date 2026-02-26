-- Add custom_fields JSONB column to tasks for flexible custom columns
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}';

-- Saved views (like Notion database views)
CREATE TABLE views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  -- Column configuration: ordered array of column definitions
  -- Each: { key: string, label: string, type: "built-in"|"custom", visible: bool, width?: number }
  columns JSONB NOT NULL DEFAULT '[]',
  -- Filters: array of { field: string, operator: string, value: any }
  filters JSONB NOT NULL DEFAULT '[]',
  -- Sort: { field: string, direction: "asc"|"desc" }
  sort JSONB DEFAULT '{"field": "priority_score", "direction": "desc"}',
  -- Group by field (optional)
  group_by TEXT,
  is_default BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Custom field definitions (reusable across views)
CREATE TABLE custom_field_defs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  field_key TEXT NOT NULL UNIQUE, -- snake_case key used in task.custom_fields JSONB
  field_type TEXT NOT NULL CHECK (field_type IN ('text','number','select','date','checkbox','url')),
  -- Options for select fields: ["Option A", "Option B"]
  options JSONB DEFAULT '[]',
  color TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE views ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_field_defs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for anon" ON views FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON custom_field_defs FOR ALL TO anon USING (true) WITH CHECK (true);

-- Insert default views
INSERT INTO views (name, description, is_default, sort_order, columns, filters, sort) VALUES
(
  'All Tasks',
  'Complete view of all tasks',
  true,
  1,
  '[
    {"key": "title", "label": "Title", "type": "built-in", "visible": true, "width": 280},
    {"key": "status", "label": "Status", "type": "built-in", "visible": true, "width": 120},
    {"key": "domain", "label": "Domain", "type": "built-in", "visible": true, "width": 140},
    {"key": "client", "label": "Client", "type": "built-in", "visible": true, "width": 140},
    {"key": "project", "label": "Project", "type": "built-in", "visible": true, "width": 140},
    {"key": "leverage", "label": "Leverage", "type": "built-in", "visible": true, "width": 90},
    {"key": "urgency", "label": "Urgency", "type": "built-in", "visible": true, "width": 90},
    {"key": "effort", "label": "Effort", "type": "built-in", "visible": true, "width": 90},
    {"key": "priority_score", "label": "Score", "type": "built-in", "visible": true, "width": 80},
    {"key": "due_date", "label": "Due Date", "type": "built-in", "visible": true, "width": 120}
  ]'::jsonb,
  '[]'::jsonb,
  '{"field": "priority_score", "direction": "desc"}'::jsonb
),
(
  'Active Work',
  'Tasks that are in progress or to-do',
  false,
  2,
  '[
    {"key": "title", "label": "Title", "type": "built-in", "visible": true, "width": 300},
    {"key": "status", "label": "Status", "type": "built-in", "visible": true, "width": 120},
    {"key": "domain", "label": "Domain", "type": "built-in", "visible": true, "width": 140},
    {"key": "leverage", "label": "Leverage", "type": "built-in", "visible": true, "width": 90},
    {"key": "urgency", "label": "Urgency", "type": "built-in", "visible": true, "width": 90},
    {"key": "effort", "label": "Effort", "type": "built-in", "visible": true, "width": 90},
    {"key": "priority_score", "label": "Score", "type": "built-in", "visible": true, "width": 80},
    {"key": "due_date", "label": "Due Date", "type": "built-in", "visible": true, "width": 120}
  ]'::jsonb,
  '[{"field": "status", "operator": "in", "value": ["todo", "in_progress"]}]'::jsonb,
  '{"field": "priority_score", "direction": "desc"}'::jsonb
),
(
  'By Client',
  'Tasks grouped by client',
  false,
  3,
  '[
    {"key": "title", "label": "Title", "type": "built-in", "visible": true, "width": 280},
    {"key": "status", "label": "Status", "type": "built-in", "visible": true, "width": 120},
    {"key": "client", "label": "Client", "type": "built-in", "visible": true, "width": 160},
    {"key": "project", "label": "Project", "type": "built-in", "visible": true, "width": 160},
    {"key": "priority_score", "label": "Score", "type": "built-in", "visible": true, "width": 80},
    {"key": "due_date", "label": "Due Date", "type": "built-in", "visible": true, "width": 120}
  ]'::jsonb,
  '[]'::jsonb,
  '{"field": "priority_score", "direction": "desc"}'::jsonb
),
(
  'High Leverage',
  'Focus on high-impact tasks',
  false,
  4,
  '[
    {"key": "title", "label": "Title", "type": "built-in", "visible": true, "width": 300},
    {"key": "status", "label": "Status", "type": "built-in", "visible": true, "width": 120},
    {"key": "domain", "label": "Domain", "type": "built-in", "visible": true, "width": 140},
    {"key": "leverage", "label": "Leverage", "type": "built-in", "visible": true, "width": 90},
    {"key": "effort", "label": "Effort", "type": "built-in", "visible": true, "width": 90},
    {"key": "priority_score", "label": "Score", "type": "built-in", "visible": true, "width": 80}
  ]'::jsonb,
  '[{"field": "leverage", "operator": "gte", "value": 4}]'::jsonb,
  '{"field": "leverage", "direction": "desc"}'::jsonb
);
