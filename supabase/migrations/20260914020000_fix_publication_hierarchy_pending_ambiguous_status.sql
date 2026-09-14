CREATE OR REPLACE FUNCTION public.iris_publication_mark_hierarchy_pending(p_run_id uuid, p_execution_id uuid, p_user_id uuid)
RETURNS TABLE(run_id uuid, execution_id uuid, publication_status text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  PERFORM * FROM public.iris_publication_lock_pair(p_run_id,p_execution_id,p_user_id);

  IF NOT EXISTS (
    SELECT 1
    FROM public.iris_runs r
    WHERE r.id=p_run_id
      AND r.user_id=p_user_id
      AND r.status='CERTIFIED'
      AND r.publication_status='NOT_STARTED'
  ) THEN
    RAISE EXCEPTION 'INVALID_PUBLICATION_TRANSITION: CERTIFIED → HIERARCHY_PENDING';
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
      AND e.publication_status='NOT_STARTED'
  ) THEN
    RAISE EXCEPTION 'INVALID_EXECUTION_PUBLICATION_TRANSITION';
  END IF;

  UPDATE public.iris_execution_records
  SET publication_status='HIERARCHY_PENDING',
      publication_error_code=NULL,
      publication_error_message=NULL
  WHERE id=p_execution_id;

  UPDATE public.iris_runs
  SET publication_status='HIERARCHY_PENDING',
      publication_error_code=NULL,
      publication_error_message=NULL,
      updated_at=now()
  WHERE id=p_run_id;

  RETURN QUERY
  SELECT p_run_id AS run_id,
         p_execution_id AS execution_id,
         'HIERARCHY_PENDING'::text AS publication_status;
END;
$function$;
