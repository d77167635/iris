CREATE OR REPLACE FUNCTION public.iris_certification_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare
  v_execution record;
  v_run record;
  v_parent_run record;
  v_parent_execution record;
  v_parent_certification record;
  v_parent_run_id uuid;
  v_parent_level integer;
  v_output_count integer;
  v_validation_count integer;
  v_validation_total integer;
  v_critical_count integer;
  v_evidence_count integer;
  v_check_count integer;
  v_parent_evidence_count integer;
  v_parent_execution_count integer;
begin
  if new.status <> 'CERTIFIED' then return new; end if;
  select * into v_execution from public.iris_execution_records where id=new.execution_id and run_id=new.run_id and user_id=new.user_id;
  if not found or v_execution.execution_state <> 'EXECUTED' or v_execution.validation_status <> 'PASS' or v_execution.certification_status <> 'PENDING' then raise exception 'IRIS_CERTIFICATION_GATE: execution state/ownership/validation gate failed'; end if;
  select * into v_run from public.iris_runs where id=new.run_id and user_id=new.user_id;
  if not found or v_run.evidence_manifest_hash is null or v_run.as_of is null then raise exception 'IRIS_CERTIFICATION_GATE: run evidence boundary missing'; end if;
  select count(*) into v_output_count from public.iris_execution_outputs where execution_id=new.execution_id and hash=v_execution.output_hash;
  if v_output_count=0 then raise exception 'IRIS_CERTIFICATION_GATE: output integrity gate failed'; end if;
  select count(*) into v_validation_total from public.iris_validation_results where run_id=new.run_id and execution_id=new.execution_id and user_id=new.user_id;
  select count(*) into v_validation_count from public.iris_validation_results where run_id=new.run_id and execution_id=new.execution_id and user_id=new.user_id and status='PASS';
  select count(*) into v_critical_count from public.iris_validation_results where run_id=new.run_id and execution_id=new.execution_id and user_id=new.user_id and severity='CRITICAL' and status<>'PASS';
  select count(*) into v_check_count from jsonb_each(coalesce(new.validation_snapshot->'checks','{}'::jsonb));
  if v_validation_total=0 or v_validation_total<>v_validation_count or v_critical_count>0 or v_check_count<>v_validation_total then raise exception 'IRIS_CERTIFICATION_GATE: validation manifest is incomplete or contains failures'; end if;

  v_parent_level := nullif(v_run.execution_policy->>'parent_level','')::integer;
  if v_parent_level=2 then
    v_parent_run_id := nullif(v_run.execution_policy->>'parent_level2_run_id','')::uuid;
    if v_parent_run_id is null then raise exception 'IRIS_CERTIFICATION_GATE: Level 3 parent hierarchy lineage missing'; end if;
    select * into v_parent_run from public.iris_runs where id=v_parent_run_id and user_id=new.user_id;
    if not found or v_parent_run.status<>'CERTIFIED' or v_parent_run.publication_status<>'HIERARCHY_PUBLISHED' then raise exception 'IRIS_CERTIFICATION_GATE: certified Level 2 parent hierarchy is missing'; end if;
    select * into v_parent_execution from public.iris_execution_records where id=nullif(v_run.execution_policy->>'parent_level2_execution_id','')::uuid and run_id=v_parent_run_id and user_id=new.user_id;
    if not found or v_parent_execution.execution_state<>'EXECUTED' or v_parent_execution.validation_status<>'PASS' or v_parent_execution.certification_status<>'CERTIFIED' or v_parent_execution.output_hash is null then raise exception 'IRIS_CERTIFICATION_GATE: certified Level 2 parent execution lineage is missing'; end if;
    select * into v_parent_certification from public.iris_certifications where run_id=v_parent_run_id and execution_id=v_parent_execution.id and user_id=new.user_id and status='CERTIFIED' order by certified_at desc limit 1;
    if not found then raise exception 'IRIS_CERTIFICATION_GATE: certified Level 2 parent certification lineage is missing'; end if;
    if nullif(v_run.execution_policy->>'parent_level2_output_hash','') is distinct from v_parent_execution.output_hash then raise exception 'IRIS_CERTIFICATION_GATE: Level 2 parent output hash binding is invalid'; end if;
    if nullif(v_run.execution_policy->>'parent_level2_certification_hash','') is distinct from v_parent_certification.certification_hash then raise exception 'IRIS_CERTIFICATION_GATE: Level 2 parent certification hash binding is invalid'; end if;
    begin v_parent_run_id := nullif(v_parent_certification.evidence_snapshot->>'parent_level1_run_id','')::uuid; exception when others then v_parent_run_id := null; end;
    if v_parent_run_id is null then raise exception 'IRIS_CERTIFICATION_GATE: Level 2 parent evidence lineage is missing'; end if;
    select count(*) into v_parent_evidence_count from public.iris_run_evidence where run_id=v_parent_run_id and user_id=new.user_id and evidence_hash is not null;
    if v_parent_evidence_count=0 then raise exception 'IRIS_CERTIFICATION_GATE: Level 1 source evidence lineage is missing'; end if;
  elsif v_parent_level=1 then
    begin v_parent_run_id := nullif(new.evidence_snapshot->>'parent_level1_run_id','')::uuid; exception when others then v_parent_run_id := null; end;
    if v_parent_run_id is null then raise exception 'IRIS_CERTIFICATION_GATE: parent evidence lineage missing'; end if;
    select count(*) into v_evidence_count from public.iris_run_evidence where run_id=v_parent_run_id and user_id=new.user_id and evidence_hash is not null;
    if v_evidence_count=0 then raise exception 'IRIS_CERTIFICATION_GATE: parent run evidence not attached'; end if;
  elsif coalesce(v_parent_level,0)>2 then
    v_parent_run_id := nullif(v_run.execution_policy->>'parent_run_id','')::uuid;
    if v_parent_run_id is null then raise exception 'IRIS_CERTIFICATION_GATE: recursive parent hierarchy lineage missing'; end if;
    select * into v_parent_run from public.iris_runs where id=v_parent_run_id and user_id=new.user_id;
    if not found or v_parent_run.status<>'CERTIFIED' or v_parent_run.publication_status<>'HIERARCHY_PUBLISHED' then raise exception 'IRIS_CERTIFICATION_GATE: certified recursive parent hierarchy is missing'; end if;
    select count(*) into v_parent_execution_count from public.iris_execution_records where run_id=v_parent_run_id and user_id=new.user_id and execution_state='EXECUTED' and validation_status='PASS' and certification_status='CERTIFIED';
    if v_parent_execution_count=0 then raise exception 'IRIS_CERTIFICATION_GATE: certified recursive parent execution lineage is missing'; end if;
  end if;

  if new.validation_snapshot is null or coalesce(new.validation_snapshot->>'status','')<>'PASS' then raise exception 'IRIS_CERTIFICATION_GATE: certification validation snapshot failed'; end if;
  if new.reconciliation_snapshot is null or coalesce(new.reconciliation_snapshot->>'status','')<>'PASS' then raise exception 'IRIS_CERTIFICATION_GATE: reconciliation snapshot failed'; end if;
  if new.evidence_snapshot is null or coalesce(new.evidence_snapshot->>'evidence_boundary','')='' or coalesce(new.evidence_snapshot->>'evidence_manifest_hash','')='' or coalesce(new.evidence_snapshot->>'evidence_count','')='' then raise exception 'IRIS_CERTIFICATION_GATE: evidence snapshot failed'; end if;
  return new;
end;
$function$;
