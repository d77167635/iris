create or replace function public.iris_require_certified_hierarchy_run()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $function$
declare
  v_run public.iris_runs%rowtype;
  v_execution public.iris_execution_records%rowtype;
  v_is_level2 boolean;
begin
  if new.run_id is null or new.user_id is null then
    raise exception 'IRIS_HIERARCHY_CERTIFICATION_REQUIRED: run_id and user_id are required';
  end if;

  select * into v_run
  from public.iris_runs
  where id = new.run_id and user_id = new.user_id;

  if v_run.id is null then
    raise exception 'IRIS_HIERARCHY_CERTIFICATION_REQUIRED: run ownership mismatch';
  end if;

  v_is_level2 := v_run.request_mode = 'level2_domain_intelligence';

  if TG_TABLE_NAME in ('iris_user_intelligence_edges','iris_user_intelligence_compositions') then
    select * into v_execution
    from public.iris_execution_records
    where run_id = new.run_id and user_id = new.user_id
    order by created_at desc
    limit 1;
  else
    if new.execution_id is null then
      raise exception 'IRIS_HIERARCHY_CERTIFICATION_REQUIRED: execution_id is required';
    end if;
    select * into v_execution
    from public.iris_execution_records
    where id = new.execution_id and run_id = new.run_id and user_id = new.user_id;
  end if;

  if v_execution.id is null then
    raise exception 'IRIS_HIERARCHY_CERTIFICATION_REQUIRED: run/execution ownership mismatch';
  end if;

  if v_run.publication_status = 'HIERARCHY_PUBLISHED'
     or v_execution.publication_status = 'HIERARCHY_PUBLISHED' then
    raise exception 'IRIS_HIERARCHY_CERTIFICATION_REQUIRED: certified published runs are immutable';
  end if;

  if TG_TABLE_NAME = 'iris_user_intelligence_compositions' then
    if new.evidence_state = 'OBSERVED' then
      new.evidence_state := 'CALCULATED';
    elsif new.evidence_state = 'LIMITED' then
      new.evidence_state := 'INSUFFICIENT_EVIDENCE';
    end if;
  elsif TG_TABLE_NAME = 'iris_user_intelligence_edges' then
    if new.evidence_state = 'OBSERVED' then
      new.evidence_state := 'CALCULATED';
    elsif new.evidence_state = 'LIMITED' then
      new.evidence_state := 'INSUFFICIENT_EVIDENCE';
    end if;
  end if;

  -- Level 3+ and every non-Level-2 hierarchy writer are authorized only
  -- during the explicit hierarchy publication window. Level 2 retains its
  -- historically established unpublished materialization window separately.
  if not v_is_level2 then
    if v_run.publication_status = 'HIERARCHY_PENDING'
       and v_execution.execution_state = 'EXECUTED'
       and v_execution.validation_status = 'PASS'
       and v_execution.certification_status in ('PENDING','CERTIFIED') then
      return new;
    end if;

    raise exception 'IRIS_HIERARCHY_CERTIFICATION_REQUIRED: hierarchy write requires HIERARCHY_PENDING publication state with an executed, validation-passing, certified-or-pending execution';
  end if;

  -- Legacy Level 2 materialization remains isolated to its own request mode.
  if v_run.publication_status = 'NOT_STARTED'
     and v_run.status in ('VALIDATED','CERTIFIED')
     and v_execution.execution_state = 'EXECUTED'
     and v_execution.validation_status = 'PASS'
     and v_execution.certification_status in ('PENDING','CERTIFIED') then
    return new;
  end if;

  if v_run.publication_status = 'HIERARCHY_PENDING'
     and v_run.status in ('VALIDATED','CERTIFIED')
     and v_execution.execution_state = 'EXECUTED'
     and v_execution.validation_status = 'PASS'
     and v_execution.certification_status in ('PENDING','CERTIFIED') then
    return new;
  end if;

  raise exception 'IRIS_HIERARCHY_CERTIFICATION_REQUIRED: Level 2 hierarchy write is outside its authorized materialization window';
end;
$function$;
