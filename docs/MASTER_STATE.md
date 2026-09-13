# Iris Master Project State

> Authoritative continuity document. This file describes verified current repository/runtime state and never overrides direct live evidence. Continuity rules are defined in `docs/DOCUMENTATION_AUTHORITY.md`.

## Current authority

- Product: **IRIS**
- Repository: `d77167635/iris`
- Branch: `main`
- Latest implementation commit in this workstream: `2f4a503e935f1e49833dca2d82cdc5e2d80866a0`
- Connected Supabase project: `uhcrdehjwaghqvydaqnn`
- Current Render workspace: `tea-dai0jth42hec73araong`
- Current scope: read-only intelligence; no money movement.

## Architectural truth

IRIS is **one complete hierarchy intelligence relational ontology financial life state ecosystem**.

There are no two IRIS sides, no separate Financial Life side, no separate Intelligence side, and no separate data-free Education side.

The hierarchy is:

`IRIS → Financial-Life Reality/State → governed evidence → observed state → canonical Financial-Life State → relational ontology → intelligence → higher-order intelligence → recursive derived intelligence → features/reports/questions/explanations/education/workspaces → user`

Every surface is a traversal or representation of the same hierarchy. Evidence state, derivation state, provenance, lineage, uncertainty, authorization, execution state, and certification/publication state determine what may be shown.

Forward and reverse traversal are first-class requirements.

## Provider/evidence boundary

The specifically reconciled Plaid Sandbox → Supabase Item/data path is verified for the tested path. That result does not automatically certify every current Item or every future synchronization run.

The live user currently has multiple active Items. The current full-intelligence execution path therefore uses the independently governed canonical Item selected by the evidence-scope resolver; it does not silently combine Items when a canonical Item is available.

The latest current Item with seven observed provider domains has 14 accounts, 48 current observed transactions, 14 current observed balances and 3 current observed liabilities. Statements remains architecturally authoritative but deferred from the Sandbox evidence boundary until real banking.

## Current intelligence runtime state

The live database snapshot observed during the audit contained:

- `iris_runs`: 20
- `iris_execution_records`: 20
- `iris_certifications`: 0
- `iris_execution_outputs`: 0
- persisted intelligence graph nodes: 0
- persisted intelligence graph edges: 0
- persisted user intelligence nodes: 0
- persisted user intelligence edges: 0
- persisted user intelligence compositions: 0
- certified intelligence read model: 0
- `iris_report_products`: 70
- `iris_report_product_dependencies`: 267
- `iris_semantic_dependency_proofs`: 19

Recent failed runs included `RECURSIVE_CAPABILITY_EXECUTION_FAILED` and `DERIVED_INTELLIGENCE_UPSTREAM_REQUIRED`.

### Exact runtime defect found

The live Supabase audit proved that `iris_run_evidence` has an authoritative database trigger named `trg_expand_iris_run_evidence_raw_financial` that expands inserted Plaid product-observation evidence into typed raw financial evidence.

The current full-intelligence executor inserted the parent `provider_raw_observation` rows but then used only the IDs returned by that initial insert for its execution manifest, lineage, and recursive executor context. It did **not** re-read the trigger-expanded evidence set or recompute the evidence-manifest hash from that complete set.

The independent capability executor already contained the correct pattern: insert parent product observations, re-read complete `iris_run_evidence`, build the complete manifest, hash that manifest, and bind the complete evidence set to execution.

This mismatch is the actual verified full-intelligence evidence-binding defect.

### Current fix

The current full-intelligence implementation now:

1. inserts only the governed parent Plaid product observations;
2. allows the authoritative database trigger to expand exact transaction/balance/liability evidence;
3. re-reads the complete run-evidence set after expansion;
4. binds all expanded evidence record IDs into the execution manifest;
5. computes `evidence_manifest_hash` from the complete evidence manifest;
6. updates the run's evidence manifest binding;
7. passes the complete evidence IDs and manifest hash into recursive execution, lineage and arbitrary recursive composition; and
8. serializes structured errors instead of reducing object errors to `[object Object]`.

The current live run evidence for the previously failed run already demonstrates the trigger behavior: 14 `provider_raw_balance`, 3 `provider_raw_liability`, 48 `provider_raw_transaction`, and 67 `provider_raw_observation` records were present for that run.

This code correction is **not yet an intelligence certification**. A fresh authenticated execution must prove the corrected full-intelligence path.

## Current UI state

Verified defects found in the prior audit were addressed in the current implementation:

- registered financial-life routes no longer intentionally collapse into the generic command surface;
- `IrisWorkspaceSurface` now derives route-specific content from governed overview/intelligence/provider contracts;
- derived values remain gated by certification;
- unsupported routes are explicitly rejected;
- navigation descriptions are visible rather than hidden;
- route metrics, records, child navigation and truth-state messaging use the shared IRIS visual grammar;
- Products and Reports remain independent concepts.

The frontend and backend both successfully deployed the current implementation through Render. Authenticated route-by-route traversal and every-control end-to-end proof are still required.

## Current Render state

Current authoritative services:

- `iris-backend-u60o.onrender.com` — Web Service, branch `main`.
- `iris-frontend-cuy3.onrender.com` — Static Site, branch `main`.

The latest Render deployments for the current workstream reached `live` status. Deployment success is not itself end-to-end certification.

An older Docker service remains in the workspace and must not be treated as authoritative unless independently verified.

## Current verification status

### Verified

- Documentation authority/continuity protocol updated.
- README architecture framing is the single-system hierarchy.
- ROADMAP architecture framing is the single-system hierarchy.
- Stale two-side/product-side terminology in the audited continuity documents was removed or superseded.
- Plaid Sandbox → Supabase tested mapping path remains verified within its exact tested boundary.
- Current canonical Item candidates were reconciled against current accounts/transactions/balances/liabilities/provider domains.
- The actual full-intelligence evidence-binding defect was identified by reconciling source code with the live Supabase trigger and live run evidence.
- Frontend route-specific workspace behavior corrected.
- Navigation cognition/style defect corrected.
- Frontend deployment passed.
- Backend deployment passed.
- Repository search found no `cognity` references.
- Repository search found no matches for the audited fake/mock/sample/placeholder/hardcoded-data search terms.

### Not yet certified

- Fresh authenticated recursive full-intelligence execution after the evidence-binding fix.
- Certified intelligence output materialization.
- Full current multi-Item provider reconciliation as a user-level aggregate.
- Complete route-by-route authenticated traversal.
- Complete control-by-control interaction verification.
- Complete visual/cognition verification across every screen and responsive state.
- Full authenticated end-to-end journey.

## Product/report rule

Provider Products, IRIS Report Products, intelligence nodes, produced results, and certified results are independent concepts.

`Provider Product count ≠ Report Product count ≠ produced result count ≠ certified result count`

No count is fabricated for visual symmetry.

## Absolute anti-fabrication rule

**Fake AI data is strictly prohibited.**

Never create or present as financial truth:

- fake AI-generated financial values;
- fabricated users/accounts/transactions/balances/income/debt/spending;
- fabricated provider observations;
- invented report results;
- invented outcomes;
- invented probabilities/confidence values;
- provider capability metadata represented as observation;
- missing evidence represented as zero.

Actual Plaid Sandbox observations are permitted only as explicitly governed Sandbox evidence. Technical mocks may isolate infrastructure tests but must never become production financial evidence.

## Mandatory continuity protocol

Before every material change:

1. Read `docs/DOCUMENTATION_AUTHORITY.md`.
2. Read the current README and ROADMAP.
3. Read `MASTER_STATE.md`, `ARCHITECTURE.md`, `DECISIONS.md`, and `SESSION_HANDOFF.md`.
4. Inspect exact current source files.
5. Inspect the relevant live Render service/deployment.
6. Inspect the relevant live Supabase schema/state.
7. Identify the exact defect and dependency boundary.
8. Make the smallest dependency-complete change that fixes the actual defect.

After every material change:

1. Re-read every changed artifact.
2. Verify the resulting GitHub commit.
3. Run applicable build/tests/static checks.
4. Verify the affected Render deployment.
5. Verify affected Supabase state.
6. Exercise the affected runtime path where authenticated execution is available.
7. Reconcile forward and reverse lineage where applicable.
8. Search for stale contradictory terminology.
9. Update continuity documents with the actual verified state.
10. Never claim more than the proven boundary.

## Definition of done

IRIS is not done until the authenticated user can traverse the complete hierarchy through real governed evidence, canonical state, relational ontology, intelligence, recursive intelligence, reports/features/questions/explanations/education/scenarios/decisions/actions/outcomes/learning, with every route and control functioning, every factual result traceable backward where lineage exists, and no fabricated content anywhere.
