CREATE OR REPLACE FUNCTION public.iris_publication_mark_failed(p_run_id uuid, p_execution_id uuid, p_user_id uuid, p_error_code text, p_error_message text)
 RETURNS TABLE(run_id uuid, execution_id uuid, publication_status text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF p_error_code NOT IN ('HIERARCHY_PUBLICATION_FAILED','REPORT_PUBLICATION_FAILED','PUBLICATION_STATE_PERSISTENCE_FAILED') THEN
    RAISE EXCEPTION 'INVALID_PUBLICATION_ERROR_CODE';
  END IF;

  PERFORM * FROM public.iris_publication_lock_pair(p_run_id,p_execution_id,p_user_id);

  IF NOT EXISTS (
    SELECT 1
    FROM public.iris_runs r
    WHERE r.id=p_run_id
      AND r.user_id=p_user_id
      AND r.status='CERTIFIED'
      AND r.publication_status IN ('HIERARCHY_PENDING','REPORT_PENDING')
  ) THEN
    RAISE EXCEPTION 'INVALID_RUN_PUBLICATION_FAILURE_TRANSITION';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.iris_execution_records e
    WHERE e.id=p_execution_id
      AND e.run_id=p_run_id
      AND e.user_id=p_user_id
      AND e.execution_state='EXECUTED'
      AND e.validation_status='PASS'
      AND e.certification_status='CERTIFIED'
      AND e.publication_status IN ('HIERARCHY_PENDING','REPORT_PENDING')
  ) THEN
    RAISE EXCEPTION 'INVALID_EXECUTION_PUBLICATION_FAILURE_TRANSITION';
  END IF;

  UPDATE public.iris_execution_records
  SET publication_status='FAILED',
      publication_error_code=p_error_code,
      publication_error_message=p_error_message
  WHERE id=p_execution_id;

  UPDATE public.iris_runs
  SET publication_status='FAILED',
      publication_error_code=p_error_code,
      publication_error_message=p_error_message,
      updated_at=now()
  WHERE id=p_run_id;

  RETURN QUERY
  SELECT p_run_id AS run_id,
         p_execution_id AS execution_id,
         'FAILED'::text AS publication_status;
END;
$function$;
