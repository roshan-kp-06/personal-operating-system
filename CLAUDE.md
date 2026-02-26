# Personal Operating System

A personal task/client/project management web app for Roshan at Airr Digital.

## Tech Stack
- **Next.js 15** (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- **Supabase** (PostgreSQL) for database
- **Recharts** for data visualization
- **Lucide React** for icons

## Project Structure
```
src/
  app/
    (dashboard)/          # All authenticated pages share sidebar layout
      dashboard/          # Overview with stats, top tasks, clients
      tasks/              # Task list, matrix view, detail pages
      clients/            # Client list, detail, onboarding
      projects/           # Project list and detail
      inbox/              # Unified inbox
      templates/          # Onboarding templates
      settings/           # Domain management
  components/
    layout/               # Sidebar, Topbar
    tasks/                # TaskCard, TaskForm, TaskList, TaskMatrix, QuickAddTask
    clients/              # ClientCard
    inbox/                # InboxList
    shared/               # DomainBadge, StatusBadge, EmptyState
    ui/                   # shadcn/ui components
  lib/
    supabase/
      client.ts           # Supabase client instance
      data.ts             # All data fetching/mutation functions
      types.ts            # TypeScript types for all tables
supabase/
  migrations/             # SQL schema
  seed.sql                # Domain seed data
```

## Key Patterns
- Single-user app: no authentication, direct to dashboard
- All data functions in `src/lib/supabase/data.ts`
- All types in `src/lib/supabase/types.ts`
- Client components use `"use client"` directive
- Task priority: `priority_score = (leverage * 2 + urgency) / effort` (computed column in DB)
- Domains are hierarchical (self-referencing `parent_id`)
- Templates create task copies (not linked references)

## Database
- Schema in `supabase/migrations/001_initial_schema.sql`
- Seed data in `supabase/seed.sql`
- Tables: domains, clients, projects, tasks, templates, template_tasks, inbox_items
- RLS enabled with permissive policies for anon (single-user)

## Commands
- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run lint` — Run ESLint

## Design
- Primary: Blue (#3B82F6) + White
- Sidebar: Dark blue (#1E3A5F)
- Accents: Green (done), Purple (in progress), Orange (urgency), Red (overdue)
- Card-based layouts, inspired by Netswick HQ

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```
