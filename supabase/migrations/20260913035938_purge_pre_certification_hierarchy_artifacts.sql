-- The runtime audit established that every row currently present in the
-- user hierarchy tables was created by pre-certification execution paths.
-- There are no certified runs in the current database, so none of these rows
-- can represent legitimate authoritative hierarchy intelligence.
-- Preserve execution records, validation diagnostics, run evidence and
-- capability-output lineage; remove only invalid hierarchy artifacts.

DELETE FROM public.iris_execution_lineage
WHERE source_type = 'intelligence_node'
   OR destination_type = 'intelligence_node';

DELETE FROM public.iris_user_intelligence_compositions;
DELETE FROM public.iris_user_intelligence_edges;
DELETE FROM public.iris_user_intelligence_nodes;

COMMENT ON TABLE public.iris_user_intelligence_nodes IS
  'Authoritative user hierarchy intelligence. Rows are permitted only for exact certified Iris runs.';
COMMENT ON TABLE public.iris_user_intelligence_edges IS
  'Authoritative user hierarchy relationships. Rows are permitted only for exact certified Iris runs.';
COMMENT ON TABLE public.iris_user_intelligence_compositions IS
  'Authoritative user hierarchy compositions. Rows are permitted only for exact certified Iris runs.';
