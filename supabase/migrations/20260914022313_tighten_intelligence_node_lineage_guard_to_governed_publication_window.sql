create or replace function public.iris_require_certified_intelligence_lineage()
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
  if new.destination_type <> 'intelligence_node' then
    return new;
  end if;

  select * into v_run
  from public.iris_runs
  where id = new.run_id and user_id = new.user_id;

  if v_run.id is null then
    raise exception 'IRIS_HIERARCHY_LINEAGE_CERTIFICATION_REQUIRED: run ownership mismatch';
  end if;

  select * into v_execution
  from public.iris_execution_records
  where id = new.execution_id
    and run_id = new.run_id
    and user_id = new.user_id;

  if v_execution.id is null then
    raise exception 'IRIS_HIERARCHY_LINEAGE_CERTIFICATION_REQUIRED: run/execution ownership mismatch';
  end if;

  if v_run.publication_status = 'HIERARCHY_PUBLISHED'
     or v_execution.publication_status = 'HIERARCHY_PUBLISHED' then
    raise exception 'IRIS_HIERARCHY_LINEAGE_CERTIFICATION_REQUIRED: certified published runs are immutable';
  end if;

  v_is_level2 := v_run.request_mode = 'level2_domain_intelligence';

  -- Level 3+ and all non-Level-2 intelligence-node lineage are authorized
  -- only inside the explicit hierarchy publication window. This must match
  -- the hierarchy-write authorization boundary exactly.
  if not v_is_level2 then
    if v_run.publication_status = 'HIERARCHY_PENDING'
       and v_execution.execution_state = 'EXECUTED'
       and v_execution.validation_status = 'PASS'
       and v_execution.certification_status in ('PENDING','CERTIFIED') then
      return new;
    end if;

    raise exception 'IRIS_HIERARCHY_LINEAGE_CERTIFICATION_REQUIRED: intelligence-node lineage requires HIERARCHY_PENDING publication state with an executed, validation-passing, certified-or-pending execution';
  end if;

  -- Level 2 retains its historically established unpublished materialization
  -- window, isolated by its exact request mode.
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

  raise exception 'IRIS_HIERARCHY_LINEAGE_CERTIFICATION_REQUIRED: Level 2 intelligence-node lineage is outside its authorized materialization window';
end;
$function$;
