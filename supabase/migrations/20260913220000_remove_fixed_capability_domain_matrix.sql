-- The 19 capabilities are reusable operators/families, not a fixed Cartesian
-- product of every domain. A prior implementation materialized 8 x 19 = 152
-- domain->capability edges. That was an artificial finite relationship count
-- and contradicted the unbounded recursive graph architecture.
--
-- This migration removes those structural edges. Capability applicability is
-- determined at runtime from governed evidence, dependencies, domain state,
-- lineage and operator contracts. No financial/user/provider data is changed.

DELETE FROM public.iris_hierarchy_catalog_edges
WHERE relation = 'applies_to';

COMMENT ON TABLE public.iris_hierarchy_catalog_edges IS 'Structural IRIS hierarchy relationships. The catalog does not precompute a finite domain-to-capability Cartesian matrix; capability applicability is resolved from governed runtime evidence and dependencies.';
