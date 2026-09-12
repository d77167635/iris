-- IRIS user report inventory.
-- Stores only report products that IRIS actually composed for a user from
-- an execution-scoped governed hierarchy. No synthetic financial content is inserted.

create table if not exists public.iris_user_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  run_id uuid not null references public.iris_runs(id) on delete cascade,
  execution_id uuid not null references public.iris_execution_records(id) on delete cascade,
  report_id text not null,
  title text not null,
  description text not null,
  primary_content_kind text not null,
  primary_content_id uuid,
  content_node_ids uuid[] not null default '{}'::uuid[],
  source_evidence_ids uuid[] not null default '{}'::uuid[],
  source_report_ids text[] not null default '{}'::text[],
  content jsonb not null default '{}'::jsonb,
  composition jsonb not null default '{}'::jsonb,
  composition_hash text not null,
  certification_hash text not null,
  status text not null default 'PUBLISHED',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint iris_user_reports_status_check check (status in ('PUBLISHED','RETIRED')),
  constraint iris_user_reports_content_object_check check (jsonb_typeof(content) = 'object'),
  constraint iris_user_reports_composition_object_check check (jsonb_typeof(composition) = 'object'),
  constraint iris_user_reports_unique_composition unique (user_id, run_id, composition_hash)
);

alter table public.iris_user_reports enable row level security;

create policy iris_user_reports_owner_select
  on public.iris_user_reports
  for select
  using (auth.uid() = user_id);

create index if not exists iris_user_reports_user_created_idx
  on public.iris_user_reports(user_id, created_at desc);

create index if not exists iris_user_reports_run_idx
  on public.iris_user_reports(user_id, run_id, execution_id);

create index if not exists iris_user_reports_report_id_idx
  on public.iris_user_reports(user_id, report_id);

comment on table public.iris_user_reports is
  'User-specific IRIS report inventory. Each row is an execution-scoped composed report built only from governed runtime content and exact lineage.';
comment on column public.iris_user_reports.content is
  'Snapshot of actual composed report content. It must contain only governed observed or legitimately derived values from the referenced execution.';
comment on column public.iris_user_reports.composition is
  'Exact composition metadata describing which hierarchy content was combined to form the report.';
comment on column public.iris_user_reports.title is
  'IRIS-generated report name selected from the most important or empowering certified content in the composition.';
comment on column public.iris_user_reports.description is
  'IRIS-generated report description derived from the actual composition; never a fabricated financial claim.';
