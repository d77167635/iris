# Iris Master Project State

> Authoritative continuity document. Direct live GitHub, Render, and Supabase evidence outranks this document. This file records the verified state so future work does not reconstruct an obsolete architecture.

## Current authority

- Product: **IRIS**
- Repository: `d77167635/iris`
- Branch: `main`
- Current main tip verified during this workstream: `c00760cf8ace90571574ba0753a1831246261dd5`
- Connected Supabase project: `uhcrdehjwaghqvydaqnn`
- Current Render workspace: `tea-dai0jth42hec73araong`
- Frontend: `iris-frontend-cuy3.onrender.com`
- Backend: `iris-backend-u60o.onrender.com`
- Scope: read-only intelligence; no money movement.

## Architectural truth

IRIS is **one complete hierarchy intelligence relational ontology financial life state ecosystem**.

There are no two IRIS sides, no separate Financial Life side, no separate Intelligence side, and no separate data-free Education side. Every surface traverses or represents the same governed hierarchy.

`IRIS → Financial-Life Reality/State → governed evidence → observed state → canonical Financial-Life State → relational ontology → intelligence → higher-order intelligence → recursive derived intelligence → features/reports/questions/explanations/education/workspaces → user`

Forward and reverse traversal are first-class. Evidence state, derivation state, provenance, lineage, uncertainty, authorization, execution state, and certification/publication state determine what may be shown.

## Provider/evidence boundary

The specifically tested Plaid Sandbox → Supabase Item/data path remains verified for its exact tested boundary. That does not automatically certify every Item or future sync.

The current canonical Sandbox Item used by the full-intelligence boundary has 14 observed accounts, 48 current observed transactions, 14 current balances, 3 current liabilities, and 7 observed provider domains. Statements is Domain 8 architecturally but is deferred until real banking.

Actual Plaid Sandbox observations are allowed as governed Sandbox evidence. Fabricated AI/financial values are strictly prohibited.

## Runtime state observed after the latest audit

Current live Supabase counts:

- `iris_runs`: 22
- `iris_execution_records`: 22
- `iris_certifications`: 0
- `iris_execution_outputs`: 0
- `iris_intelligence_nodes`: 0
- `iris_intelligence_edges`: 0
- `iris_semantic_dependency_proofs`: 19

The latest failed runs exposed a new, exact database contract defect after the earlier evidence-manifest fix:

`SEMANTIC_DEPENDENCY_PROOF_PERSIST_FAILED: invalid input syntax for type uuid: "temporal"`

The live schema showed `iris_semantic_dependency_proofs.consumed_dependency_ids` was incorrectly typed as `uuid[]`, while the authoritative capability graph uses semantic capability identifiers such as `temporal` and the application contract defines dependency IDs as strings.

## Runtime fix completed

The authoritative Supabase schema was corrected with migration `fix_semantic_dependency_id_type`:

`iris_semantic_dependency_proofs.consumed_dependency_ids: uuid[] → text[]`

The migration was applied successfully and the live schema was re-read and verified as `_text` (`text[]`). No financial/provider data was fabricated or inserted.

This was the smallest dependency-complete correction because the failure occurred at the database type boundary, not in the capability semantics.

### Earlier evidence-binding fix remains in force

The full-intelligence executor now:

1. inserts only governed parent Plaid product observations;
2. lets the authoritative database trigger expand exact transaction/balance/liability evidence;
3. re-reads the complete `iris_run_evidence` set;
4. binds all expanded evidence IDs;
5. recomputes the complete evidence-manifest hash;
6. passes the complete evidence boundary into recursive execution and lineage; and
7. preserves structured errors instead of reducing objects to `[object Object]`.

A fresh authenticated full-intelligence execution is still required to prove that both runtime corrections work together. Certification remains **not achieved** until that run succeeds and passes every certification gate.

## User-experience defect fixed in this workstream

A concrete routing defect was found in `frontend/src/App.tsx`.

Navigation generated hashes such as `#workspace/money/overview`, but `readIrisPage()` only recognized `#workspace/iris` and `#workspace/iris/...`. Consequently, navigating into non-Iris workspace destinations could appear to work momentarily but the application would resolve the route back to `iris` on hash synchronization/reload. This directly explains a major part of the reported “does not work to the end” experience.

The route parser now accepts every `workspace/<registered-or-traversable-path>` route and preserves the exact path during hash synchronization and reload.

The corrected frontend commit was deployed through Render. The subsequent continuity deployment containing that change is currently live.

## Current UI requirements

Every registered destination must have:

- its own correct function and visual hierarchy;
- the correct governed source content;
- real provider/evidence-backed observations where observed;
- certified intelligence only when certification exists;
- explicit insufficient/unsupported states otherwise;
- working controls;
- working forward navigation;
- working reverse navigation;
- provenance/explanation where applicable;
- no fake financial or AI content;
- no dead-end buttons;
- no silent route substitution;
- consistent IRIS cognition and visual language.

Products and Reports are independent concepts:

`Provider Product count ≠ IRIS Report Product count ≠ produced result count ≠ certified result count`

No count is fabricated for visual symmetry.

## Deployment state

The frontend Render deployment for the route fix reached `live`. The backend Render deployment containing the evidence-binding/runtime code reached `live`; the latest continuity commit was subsequently deployed to the backend and is now `live` as well.

Deployment success is not runtime certification.

## Certification blockers still open

1. Fresh authenticated recursive full-intelligence execution after the two runtime corrections.
2. Successful materialization of `iris_execution_outputs` and intelligence graph state.
3. Certification record creation and certified read-model publication.
4. Complete authenticated route-by-route traversal.
5. Complete control-by-control interaction verification.
6. Complete visual/cognition verification across responsive states.
7. Full authenticated end-to-end journey with forward and reverse lineage proof.

## Absolute anti-fabrication rule

**Fake AI data is strictly prohibited.**

Never fabricate users, accounts, transactions, balances, income, debt, spending, provider observations, intelligence results, reports, outcomes, probabilities, confidence values, or missing evidence. Unknown is not zero. Provider capability availability is not provider observation. Plaid Sandbox records are acceptable only as governed Sandbox test evidence.

## Mandatory continuity protocol

Before every material change:

1. Read `docs/DOCUMENTATION_AUTHORITY.md`, README, ROADMAP, MASTER_STATE, and SESSION_HANDOFF.
2. Inspect the exact current source.
3. Inspect the relevant live Render service/deployment.
4. Inspect the relevant live Supabase schema/state.
5. Identify the exact defect and dependency boundary.
6. Make the smallest dependency-complete change.

After every material change:

1. Re-read the changed artifact.
2. Verify the resulting GitHub commit.
3. Run applicable builds/tests/static checks.
4. Verify Render deployment state.
5. Verify affected Supabase state.
6. Exercise the affected authenticated runtime path where credentials/session access permits.
7. Reconcile forward/reverse lineage where applicable.
8. Search for stale contradictory terminology.
9. Update continuity state with verified facts.
10. Never claim more than the proven boundary.

## Definition of done

IRIS is not done until an authenticated user can traverse the complete hierarchy through governed evidence, canonical state, relational ontology, intelligence, recursive intelligence, reports/features/questions/explanations/education/scenarios/decisions/actions/outcomes/learning, with every route and control functioning, every factual result traceable backward where lineage exists, and no fabricated content anywhere.
