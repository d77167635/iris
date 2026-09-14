create or replace function public.iris_publication_mark_hierarchy_published(p_run_id uuid, p_execution_id uuid, p_user_id uuid)
returns table(run_id uuid, execution_id uuid, publication_status text, hierarchy_published_at timestamptz)
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_ts timestamptz := now();
begin
  perform * from public.iris_publication_lock_pair(p_run_id,p_execution_id,p_user_id);

  if not exists (
    select 1 from public.iris_runs r
    where r.id=p_run_id and r.user_id=p_user_id
      and r.status='CERTIFIED'
      and r.publication_status='HIERARCHY_PENDING'
  ) then
    raise exception 'INVALID_RUN_PUBLICATION_TRANSITION';
  end if;

  if not exists (
    select 1 from public.iris_execution_records e
    where e.id=p_execution_id and e.run_id=p_run_id and e.user_id=p_user_id
      and e.execution_state='EXECUTED'
      and e.validation_status='PASS'
      and e.certification_status='CERTIFIED'
      and e.publication_status='HIERARCHY_PENDING'
  ) then
    raise exception 'INVALID_EXECUTION_PUBLICATION_TRANSITION';
  end if;

  update public.iris_execution_records
  set publication_status='HIERARCHY_PUBLISHED', hierarchy_published_at=v_ts,
      publication_error_code=null, publication_error_message=null
  where id=p_execution_id;

  update public.iris_runs
  set publication_status='HIERARCHY_PUBLISHED', hierarchy_published_at=v_ts,
      publication_error_code=null, publication_error_message=null, updated_at=now()
  where id=p_run_id;

  return query select p_run_id,p_execution_id,'HIERARCHY_PUBLISHED'::text,v_ts;
end;
$function$;

create or replace function public.iris_publication_mark_report_pending(p_run_id uuid, p_execution_id uuid, p_user_id uuid)
returns table(run_id uuid, execution_id uuid, publication_status text)
language plpgsql
security definer
set search_path = public
as $function$
begin
  perform * from public.iris_publication_lock_pair(p_run_id,p_execution_id,p_user_id);

  if not exists (
    select 1 from public.iris_runs r
    where r.id=p_run_id and r.user_id=p_user_id
      and r.status='CERTIFIED'
      and r.publication_status='HIERARCHY_PUBLISHED'
      and r.hierarchy_published_at is not null
  ) then
    raise exception 'INVALID_RUN_PUBLICATION_TRANSITION';
  end if;

  if not exists (
    select 1 from public.iris_execution_records e
    where e.id=p_execution_id and e.run_id=p_run_id and e.user_id=p_user_id
      and e.execution_state='EXECUTED'
      and e.validation_status='PASS'
      and e.certification_status='CERTIFIED'
      and e.publication_status='HIERARCHY_PUBLISHED'
      and e.hierarchy_published_at is not null
  ) then
    raise exception 'INVALID_EXECUTION_PUBLICATION_TRANSITION';
  end if;

  update public.iris_execution_records
  set publication_status='REPORT_PENDING', publication_error_code=null, publication_error_message=null
  where id=p_execution_id;

  update public.iris_runs
  set publication_status='REPORT_PENDING', publication_error_code=null, publication_error_message=null, updated_at=now()
  where id=p_run_id;

  return query select p_run_id,p_execution_id,'REPORT_PENDING'::text;
end;
$function$;

create or replace function public.iris_publication_mark_published(p_run_id uuid, p_execution_id uuid, p_user_id uuid)
returns table(run_id uuid, execution_id uuid, publication_status text, reports_published_at timestamptz)
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_ts timestamptz := now();
begin
  perform * from public.iris_publication_lock_pair(p_run_id,p_execution_id,p_user_id);

  if not exists (
    select 1 from public.iris_runs r
    where r.id=p_run_id and r.user_id=p_user_id
      and r.status='CERTIFIED'
      and r.publication_status='REPORT_PENDING'
      and r.hierarchy_published_at is not null
      and r.reports_published_at is null
  ) then
    raise exception 'INVALID_RUN_PUBLICATION_TRANSITION';
  end if;

  if not exists (
    select 1 from public.iris_execution_records e
    where e.id=p_execution_id and e.run_id=p_run_id and e.user_id=p_user_id
      and e.execution_state='EXECUTED'
      and e.validation_status='PASS'
      and e.certification_status='CERTIFIED'
      and e.publication_status='REPORT_PENDING'
      and e.hierarchy_published_at is not null
      and e.reports_published_at is null
  ) then
    raise exception 'INVALID_EXECUTION_PUBLICATION_TRANSITION';
  end if;

  update public.iris_execution_records
  set publication_status='PUBLISHED', reports_published_at=v_ts,
      publication_error_code=null, publication_error_message=null
  where id=p_execution_id;

  update public.iris_runs
  set publication_status='PUBLISHED', reports_published_at=v_ts,
      publication_error_code=null, publication_error_message=null, updated_at=now()
  where id=p_run_id;

  return query select p_run_id,p_execution_id,'PUBLISHED'::text,v_ts;
end;
$function$;
