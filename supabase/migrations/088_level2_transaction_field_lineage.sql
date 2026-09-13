-- Level 2 transaction field lineage is derived only from the exact certified Level 1
-- evidence boundary selected by the Level 2 execution manifest. It creates lineage
-- around existing observations; it never creates or mutates financial observations.

create or replace function public.iris_materialize_level2_transaction_field_lineage(p_execution_id uuid)
returns void
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_execution public.iris_execution_records%rowtype;
  v_output public.iris_execution_outputs%rowtype;
  v_parent_run_id uuid;
  v_tx record;
  v_destination_prefix text := 'domains[domain_key=transactions].derived_fields';
  v_source_hash text;
  v_lineage_hash text;
begin
  select * into v_execution from public.iris_execution_records where id = p_execution_id;
  if v_execution.id is null then raise exception 'LEVEL2_TRANSACTION_LINEAGE_EXECUTION_NOT_FOUND'; end if;

  v_parent_run_id := nullif(v_execution.input_manifest->>'parent_level1_run_id','')::uuid;
  if v_parent_run_id is null then raise exception 'LEVEL2_TRANSACTION_LINEAGE_PARENT_RUN_NOT_FOUND'; end if;

  select * into v_output
  from public.iris_execution_outputs
  where execution_id = p_execution_id
    and output_key = 'level2_domain_intelligence'
  order by created_at desc
  limit 1;
  if v_output.id is null then raise exception 'LEVEL2_TRANSACTION_LINEAGE_OUTPUT_NOT_FOUND'; end if;

  for v_tx in
    select distinct t.id, t.amount, t.pending, t.is_active, t.raw_transaction_id
    from public.iris_run_evidence e
    join public.transactions t
      on t.user_id = e.user_id
     and t.raw_transaction_id::text = e.source_id
    where e.run_id = v_parent_run_id
      and e.user_id = v_execution.user_id
      and e.product = 'plaid_raw_transactions'
      and not coalesce(t.pending, false)
      and t.is_active is distinct from false
  loop
    v_source_hash := encode(
      extensions.digest(
        concat_ws('|', v_tx.id::text, v_tx.raw_transaction_id::text, v_tx.amount::text,
          coalesce(v_tx.pending::text,''), coalesce(v_tx.is_active::text,'')),
        'sha256'
      ), 'hex');

    v_lineage_hash := encode(
      extensions.digest(
        concat_ws('|', p_execution_id::text, 'posted_transaction_count', v_tx.id::text,
          'transactions.id', 'count'),
        'sha256'
      ), 'hex');

    insert into public.iris_execution_lineage(
      user_id, run_id, execution_id, lineage_role, source_type, source_id,
      source_field_path, destination_type, destination_id, destination_field_path,
      evidence_state, transformation, source_hash, lineage_hash, metadata
    )
    values(
      v_execution.user_id, v_execution.run_id, p_execution_id, 'OUTPUT_DERIVATION',
      'transactions', v_tx.id::text, 'id', 'iris_execution_output', p_execution_id::text,
      v_destination_prefix || '[field_key=posted_transaction_count].value', 'OBSERVED',
      'count', v_source_hash, v_lineage_hash,
      jsonb_build_object('field_role','selection_gate','parent_level1_run_id',v_parent_run_id,
        'raw_transaction_id',v_tx.raw_transaction_id,'pending',v_tx.pending,'is_active',v_tx.is_active)
    ) on conflict do nothing;

    v_lineage_hash := encode(
      extensions.digest(
        concat_ws('|', p_execution_id::text, 'net_cash_flow', v_tx.id::text,
          'transactions.amount', 'inflow_minus_outflow'),
        'sha256'
      ), 'hex');

    insert into public.iris_execution_lineage(
      user_id, run_id, execution_id, lineage_role, source_type, source_id,
      source_field_path, destination_type, destination_id, destination_field_path,
      evidence_state, transformation, source_hash, lineage_hash, metadata
    )
    values(
      v_execution.user_id, v_execution.run_id, p_execution_id, 'OUTPUT_DERIVATION',
      'transactions', v_tx.id::text, 'amount', 'iris_execution_output', p_execution_id::text,
      v_destination_prefix || '[field_key=net_cash_flow].value', 'OBSERVED',
      'inflow_minus_outflow', v_source_hash, v_lineage_hash,
      jsonb_build_object('amount',v_tx.amount,
        'net_contribution',case when v_tx.amount < 0 then abs(v_tx.amount) else -v_tx.amount end,
        'posted',true,'parent_level1_run_id',v_parent_run_id)
    ) on conflict do nothing;

    if v_tx.amount < 0 then
      v_lineage_hash := encode(
        extensions.digest(
          concat_ws('|', p_execution_id::text, 'inflow', v_tx.id::text,
            'transactions.amount', 'signed_transaction_aggregation'),
          'sha256'
        ), 'hex');

      insert into public.iris_execution_lineage(
        user_id, run_id, execution_id, lineage_role, source_type, source_id,
        source_field_path, destination_type, destination_id, destination_field_path,
        evidence_state, transformation, source_hash, lineage_hash, metadata
      )
      values(
        v_execution.user_id, v_execution.run_id, p_execution_id, 'OUTPUT_DERIVATION',
        'transactions', v_tx.id::text, 'amount', 'iris_execution_output', p_execution_id::text,
        v_destination_prefix || '[field_key=inflow].value', 'OBSERVED',
        'signed_transaction_aggregation', v_source_hash, v_lineage_hash,
        jsonb_build_object('amount',v_tx.amount,'inflow_contribution',abs(v_tx.amount),
          'posted',true,'parent_level1_run_id',v_parent_run_id)
      ) on conflict do nothing;
    elsif v_tx.amount > 0 then
      v_lineage_hash := encode(
        extensions.digest(
          concat_ws('|', p_execution_id::text, 'outflow', v_tx.id::text,
            'transactions.amount', 'signed_transaction_aggregation'),
          'sha256'
        ), 'hex');

      insert into public.iris_execution_lineage(
        user_id, run_id, execution_id, lineage_role, source_type, source_id,
        source_field_path, destination_type, destination_id, destination_field_path,
        evidence_state, transformation, source_hash, lineage_hash, metadata
      )
      values(
        v_execution.user_id, v_execution.run_id, p_execution_id, 'OUTPUT_DERIVATION',
        'transactions', v_tx.id::text, 'amount', 'iris_execution_output', p_execution_id::text,
        v_destination_prefix || '[field_key=outflow].value', 'OBSERVED',
        'signed_transaction_aggregation', v_source_hash, v_lineage_hash,
        jsonb_build_object('amount',v_tx.amount,'outflow_contribution',v_tx.amount,
          'posted',true,'parent_level1_run_id',v_parent_run_id)
      ) on conflict do nothing;
    end if;
  end loop;
end;
$$;

create or replace function public.iris_trg_materialize_level2_transaction_field_lineage()
returns trigger
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
begin
  if new.output_key = 'level2_domain_intelligence' then
    perform public.iris_materialize_level2_transaction_field_lineage(new.execution_id);
  end if;
  return new;
end;
$$;

drop trigger if exists trg_iris_level2_transaction_field_lineage on public.iris_execution_outputs;
create trigger trg_iris_level2_transaction_field_lineage
after insert on public.iris_execution_outputs
for each row execute function public.iris_trg_materialize_level2_transaction_field_lineage();

revoke all on function public.iris_materialize_level2_transaction_field_lineage(uuid) from public, anon, authenticated;
revoke all on function public.iris_trg_materialize_level2_transaction_field_lineage() from public, anon, authenticated;
grant execute on function public.iris_materialize_level2_transaction_field_lineage(uuid) to service_role;
grant execute on function public.iris_trg_materialize_level2_transaction_field_lineage() to service_role;
