-- Structural ontology only. This migration creates no user financial facts, provider observations, balances, transactions, or AI-generated values.

CREATE TABLE IF NOT EXISTS public.iris_hierarchy_catalog_nodes (
  node_key text PRIMARY KEY,
  level integer NOT NULL CHECK (level >= 1),
  node_type text NOT NULL CHECK (node_type IN ('root','domain','capability')),
  label text NOT NULL,
  parent_key text REFERENCES public.iris_hierarchy_catalog_nodes(node_key),
  domain_key text,
  capability_id text,
  sort_order integer NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS public.iris_hierarchy_catalog_edges (
  from_node_key text NOT NULL REFERENCES public.iris_hierarchy_catalog_nodes(node_key) ON DELETE CASCADE,
  to_node_key text NOT NULL REFERENCES public.iris_hierarchy_catalog_nodes(node_key) ON DELETE CASCADE,
  relation text NOT NULL CHECK (relation IN ('contains','applies_to')),
  PRIMARY KEY (from_node_key, to_node_key, relation)
);

ALTER TABLE public.iris_hierarchy_catalog_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iris_hierarchy_catalog_edges ENABLE ROW LEVEL SECURITY;

REVOKE INSERT, UPDATE, DELETE ON public.iris_hierarchy_catalog_nodes FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.iris_hierarchy_catalog_edges FROM anon, authenticated;
GRANT SELECT ON public.iris_hierarchy_catalog_nodes TO authenticated;
GRANT SELECT ON public.iris_hierarchy_catalog_edges TO authenticated;

DROP POLICY IF EXISTS iris_hierarchy_catalog_nodes_read ON public.iris_hierarchy_catalog_nodes;
CREATE POLICY iris_hierarchy_catalog_nodes_read ON public.iris_hierarchy_catalog_nodes
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS iris_hierarchy_catalog_edges_read ON public.iris_hierarchy_catalog_edges;
CREATE POLICY iris_hierarchy_catalog_edges_read ON public.iris_hierarchy_catalog_edges
  FOR SELECT TO authenticated USING (true);

INSERT INTO public.domains (key, label, sort_order)
VALUES
  ('authentication', 'Authentication', 1),
  ('transactions', 'Transactions', 2),
  ('balance', 'Balance', 3),
  ('identity', 'Identity', 4),
  ('assets', 'Assets', 5),
  ('liabilities', 'Liabilities', 6),
  ('investments', 'Investments', 7),
  ('statements', 'Statements', 8)
ON CONFLICT (key) DO UPDATE SET label = EXCLUDED.label, sort_order = EXCLUDED.sort_order;

INSERT INTO public.iris_hierarchy_catalog_nodes (node_key, level, node_type, label, parent_key, domain_key, capability_id, sort_order, metadata)
VALUES
  ('iris', 1, 'root', 'IRIS', NULL, NULL, NULL, 1, jsonb_build_object('semantic_role','master_intelligence','governance_role','master_governor')),
  ('domain.authentication', 2, 'domain', 'Authentication', 'iris', 'authentication', NULL, 1, jsonb_build_object('authoritative_domain',true)),
  ('domain.transactions', 2, 'domain', 'Transactions', 'iris', 'transactions', NULL, 2, jsonb_build_object('authoritative_domain',true)),
  ('domain.balance', 2, 'domain', 'Balance', 'iris', 'balance', NULL, 3, jsonb_build_object('authoritative_domain',true)),
  ('domain.identity', 2, 'domain', 'Identity', 'iris', 'identity', NULL, 4, jsonb_build_object('authoritative_domain',true)),
  ('domain.assets', 2, 'domain', 'Assets', 'iris', 'assets', NULL, 5, jsonb_build_object('authoritative_domain',true)),
  ('domain.liabilities', 2, 'domain', 'Liabilities', 'iris', 'liabilities', NULL, 6, jsonb_build_object('authoritative_domain',true)),
  ('domain.investments', 2, 'domain', 'Investments', 'iris', 'investments', NULL, 7, jsonb_build_object('authoritative_domain',true)),
  ('domain.statements', 2, 'domain', 'Statements', 'iris', 'statements', NULL, 8, jsonb_build_object('authoritative_domain',true,'current_runtime_evidence','deferred')),
  ('capability.temporal', 3, 'capability', 'Temporal', NULL, NULL, 'temporal', 1, jsonb_build_object('registered_capability',true)),
  ('capability.financial_life_state', 3, 'capability', 'Financial Life State', NULL, NULL, 'financial_life_state', 2, jsonb_build_object('registered_capability',true)),
  ('capability.relational_ontology', 3, 'capability', 'Relational Ontology', NULL, NULL, 'relational_ontology', 3, jsonb_build_object('registered_capability',true)),
  ('capability.analysis', 3, 'capability', 'Analysis', NULL, NULL, 'analysis', 4, jsonb_build_object('registered_capability',true)),
  ('capability.behavioral', 3, 'capability', 'Behavioral', NULL, NULL, 'behavioral', 5, jsonb_build_object('registered_capability',true)),
  ('capability.pattern', 3, 'capability', 'Pattern', NULL, NULL, 'pattern', 6, jsonb_build_object('registered_capability',true)),
  ('capability.relationship', 3, 'capability', 'Relationship', NULL, NULL, 'relationship', 7, jsonb_build_object('registered_capability',true)),
  ('capability.anomaly', 3, 'capability', 'Anomaly', NULL, NULL, 'anomaly', 8, jsonb_build_object('registered_capability',true)),
  ('capability.causal', 3, 'capability', 'Causal', NULL, NULL, 'causal', 9, jsonb_build_object('registered_capability',true)),
  ('capability.predictive', 3, 'capability', 'Predictive', NULL, NULL, 'predictive', 10, jsonb_build_object('registered_capability',true)),
  ('capability.scenario', 3, 'capability', 'Scenario', NULL, NULL, 'scenario', 11, jsonb_build_object('registered_capability',true)),
  ('capability.decision', 3, 'capability', 'Decision', NULL, NULL, 'decision', 12, jsonb_build_object('registered_capability',true)),
  ('capability.recommendation', 3, 'capability', 'Recommendation', NULL, NULL, 'recommendation', 13, jsonb_build_object('registered_capability',true)),
  ('capability.risk', 3, 'capability', 'Risk', NULL, NULL, 'risk', 14, jsonb_build_object('registered_capability',true)),
  ('capability.opportunity', 3, 'capability', 'Opportunity', NULL, NULL, 'opportunity', 15, jsonb_build_object('registered_capability',true)),
  ('capability.consequence', 3, 'capability', 'Consequence', NULL, NULL, 'consequence', 16, jsonb_build_object('registered_capability',true)),
  ('capability.outcome', 3, 'capability', 'Outcome', NULL, NULL, 'outcome', 17, jsonb_build_object('registered_capability',true)),
  ('capability.learning', 3, 'capability', 'Learning', NULL, NULL, 'learning', 18, jsonb_build_object('registered_capability',true)),
  ('capability.emergent', 3, 'capability', 'Emergent', NULL, NULL, 'emergent', 19, jsonb_build_object('registered_capability',true))
ON CONFLICT (node_key) DO UPDATE SET
  level = EXCLUDED.level,
  node_type = EXCLUDED.node_type,
  label = EXCLUDED.label,
  parent_key = EXCLUDED.parent_key,
  domain_key = EXCLUDED.domain_key,
  capability_id = EXCLUDED.capability_id,
  sort_order = EXCLUDED.sort_order,
  metadata = EXCLUDED.metadata;

INSERT INTO public.iris_hierarchy_catalog_edges (from_node_key, to_node_key, relation)
VALUES
  ('iris','domain.authentication','contains'),
  ('iris','domain.transactions','contains'),
  ('iris','domain.balance','contains'),
  ('iris','domain.identity','contains'),
  ('iris','domain.assets','contains'),
  ('iris','domain.liabilities','contains'),
  ('iris','domain.investments','contains'),
  ('iris','domain.statements','contains')
ON CONFLICT DO NOTHING;

INSERT INTO public.iris_hierarchy_catalog_edges (from_node_key, to_node_key, relation)
SELECT d.node_key, c.node_key, 'applies_to'
FROM public.iris_hierarchy_catalog_nodes d
CROSS JOIN public.iris_hierarchy_catalog_nodes c
WHERE d.node_type = 'domain' AND c.node_type = 'capability'
ON CONFLICT DO NOTHING;

COMMENT ON TABLE public.iris_hierarchy_catalog_nodes IS 'Authoritative IRIS structural ontology: Level 1 root, Level 2 authoritative domains, Level 3 registered intelligence capabilities. Structural metadata only; contains no user financial observations.';
COMMENT ON TABLE public.iris_hierarchy_catalog_edges IS 'Authoritative structural relationships between IRIS hierarchy levels. Capability nodes apply to every authoritative domain; this does not create financial evidence or user intelligence.';