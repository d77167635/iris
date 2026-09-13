-- Certification is the sole authorization boundary for durable user hierarchy intelligence.
-- Failed/uncertified execution may retain execution/audit evidence, but may not
-- create user intelligence nodes, edges, compositions, or intelligence-node lineage.

CREATE OR REPLACE FUNCTION public.iris_require_certified_hierarchy_run()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_certified boolean;
BEGIN
  IF NEW.run_id IS NULL OR NEW.execution_id IS NULL OR NEW.user_id IS NULL THEN
    RAISE EXCEPTION 'IRIS_HIERARCHY_CERTIFICATION_REQUIRED: run_id, execution_id and user_id are required';
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM public.iris_certifications c
    JOIN public.iris_runs r ON r.id = c.run_id
    JOIN public.iris_execution_records e ON e.id = c.execution_id
    WHERE c.status = 'CERTIFIED'
      AND c.run_id = NEW.run_id
      AND c.execution_id = NEW.execution_id
      AND c.user_id = NEW.user_id
      AND r.id = NEW.run_id
      AND r.user_id = NEW.user_id
      AND r.status = 'CERTIFIED'
      AND e.id = NEW.execution_id
      AND e.run_id = NEW.run_id
      AND e.user_id = NEW.user_id
      AND e.execution_state = 'EXECUTED'
      AND e.validation_status = 'PASS'
      AND e.certification_status = 'CERTIFIED'
  ) INTO v_certified;

  IF NOT v_certified THEN
    RAISE EXCEPTION 'IRIS_HIERARCHY_CERTIFICATION_REQUIRED: authoritative hierarchy writes require a matching certified run';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_iris_user_intelligence_nodes_certification_guard ON public.iris_user_intelligence_nodes;
CREATE TRIGGER trg_iris_user_intelligence_nodes_certification_guard
BEFORE INSERT OR UPDATE ON public.iris_user_intelligence_nodes
FOR EACH ROW EXECUTE FUNCTION public.iris_require_certified_hierarchy_run();

DROP TRIGGER IF EXISTS trg_iris_user_intelligence_edges_certification_guard ON public.iris_user_intelligence_edges;
CREATE TRIGGER trg_iris_user_intelligence_edges_certification_guard
BEFORE INSERT OR UPDATE ON public.iris_user_intelligence_edges
FOR EACH ROW EXECUTE FUNCTION public.iris_require_certified_hierarchy_run();

DROP TRIGGER IF EXISTS trg_iris_user_intelligence_compositions_certification_guard ON public.iris_user_intelligence_compositions;
CREATE TRIGGER trg_iris_user_intelligence_compositions_certification_guard
BEFORE INSERT OR UPDATE ON public.iris_user_intelligence_compositions
FOR EACH ROW EXECUTE FUNCTION public.iris_require_certified_hierarchy_run();

CREATE OR REPLACE FUNCTION public.iris_require_certified_intelligence_lineage()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_certified boolean;
BEGIN
  IF NEW.destination_type <> 'intelligence_node' THEN
    RETURN NEW;
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM public.iris_certifications c
    JOIN public.iris_runs r ON r.id = c.run_id
    JOIN public.iris_execution_records e ON e.id = c.execution_id
    WHERE c.status = 'CERTIFIED'
      AND c.run_id = NEW.run_id
      AND c.execution_id = NEW.execution_id
      AND c.user_id = NEW.user_id
      AND r.status = 'CERTIFIED'
      AND e.execution_state = 'EXECUTED'
      AND e.validation_status = 'PASS'
      AND e.certification_status = 'CERTIFIED'
  ) INTO v_certified;

  IF NOT v_certified THEN
    RAISE EXCEPTION 'IRIS_HIERARCHY_LINEAGE_CERTIFICATION_REQUIRED: intelligence-node lineage requires a matching certified run';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_iris_execution_lineage_intelligence_certification_guard ON public.iris_execution_lineage;
CREATE TRIGGER trg_iris_execution_lineage_intelligence_certification_guard
BEFORE INSERT OR UPDATE ON public.iris_execution_lineage
FOR EACH ROW EXECUTE FUNCTION public.iris_require_certified_intelligence_lineage();

COMMENT ON FUNCTION public.iris_require_certified_hierarchy_run() IS
  'Hard database boundary: durable user hierarchy intelligence may only be written for an exact certified Iris run/execution/user tuple.';
COMMENT ON FUNCTION public.iris_require_certified_intelligence_lineage() IS
  'Hard database boundary: execution lineage may precede certification, but lineage whose destination is an intelligence node requires certification.';
