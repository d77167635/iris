# Iris Session Handoff

This file is the compact bridge between sessions. It reflects verified repository/runtime state, not older chat assumptions.

## Current authority

- Product: **IRIS**
- Repository: `d77167635/iris`
- Branch: `main`
- Current main workstream includes the verified route fix, runtime schema correction, and internal RPC privilege hardening.
- Continuity protocol: `docs/DOCUMENTATION_AUTHORITY.md`
- Connected Supabase: `uhcrdehjwaghqvydaqnn`
- Current Render workspace: `tea-dai0jth42hec73araong`
- Frontend: `iris-frontend-cuy3.onrender.com`
- Backend: `iris-backend-u60o.onrender.com`
- Scope: read-only intelligence; no money movement.

## Single-system architecture

IRIS is **one complete hierarchy intelligence relational ontology financial life state ecosystem**.

There are no two IRIS sides. Financial Life, evidence, canonical state, ontology, intelligence, recursive intelligence, reports, questions, explanations, education, scenarios, decisions, actions, outcomes, learning, and workspaces are all connected representations and traversal surfaces of the same hierarchy.

## Provider boundary

The specifically reconciled Plaid Sandbox → Supabase Item/data path is verified for the tested path. That does not automatically certify the broader multi-Item population.

The current full-intelligence execution path uses the independently governed canonical Item selected by the evidence-scope resolver when available. It does not silently combine Items. Statements is architecturally Domain 8 but deferred from the Sandbox evidence boundary until real banking.

## Runtime corrections completed

### Evidence-manifest correction

The live database proved that inserting governed parent Plaid product observations into `iris_run_evidence` invokes `trg_expand_iris_run_evidence_raw_financial`, which creates exact transaction/balance/liability evidence. The full-intelligence executor now re-reads the trigger-expanded evidence set, computes the complete evidence manifest/hash, binds every evidence ID, and passes that complete boundary into recursive execution and lineage.

### Semantic dependency proof correction

A fresh audit exposed the next exact runtime defect:

`SEMANTIC_DEPENDENCY_PROOF_PERSIST_FAILED: invalid input syntax for type uuid: "temporal"`

The live schema showed `iris_semantic_dependency_proofs.consumed_dependency_ids` was `uuid[]`, while capability dependency identifiers are semantic text IDs such as `temporal`. The schema was corrected with the applied migration `fix_semantic_dependency_id_type`, changing the column to `text[]`. The live schema was re-read and verified as `_text`.

No financial/provider data was fabricated or inserted during the correction.

### Internal RPC security correction

Live Supabase security advisors identified two internal `SECURITY DEFINER` functions exposed to `anon` and `authenticated`. Their privileges were corrected so both functions are executable by `service_role` only. Live privilege queries verified `anon=false`, `authenticated=false`, `service_role=true` for both functions.

The remaining security-advisor finding is Supabase Auth leaked-password protection being disabled. The currently available database tool surface does not expose that Auth setting, so it remains an explicit environment-level blocker rather than being falsely marked complete.

### Current certification state

Live counts after the latest audit:

- `iris_runs`: 22
- `iris_execution_records`: 22
- `iris_certifications`: 0
- `iris_execution_outputs`: 0
- intelligence nodes: 0
- intelligence edges: 0
- semantic dependency proofs: 19

The latest failed runs pre-date the schema correction. A **fresh authenticated full-intelligence run is still required** to prove the corrected runtime and obtain certification. Do not call the system certified before that proof exists.

## User-experience correction completed

A concrete route persistence defect was found in `frontend/src/App.tsx`: navigation generated `#workspace/money/overview`, `#workspace/cashflow/...`, and other valid paths, but `readIrisPage()` only recognized `#workspace/iris` and `#workspace/iris/...`. This caused non-Iris destinations to resolve back to `iris` during hash synchronization/reload.

The parser now accepts every `workspace/<path>` destination and preserves the exact route. The fix is in `main` and the resulting frontend deployment is live.

The previously identified UI fixes also remain in force: route-specific governed surfaces, visible navigation descriptions, certification-gated derived values, explicit unsupported/insufficient states, shared IRIS visual grammar, and independent Products vs Reports.

## Remaining end-to-end proof

1. Authenticate as the current test user.
2. Start a fresh full-intelligence run against the current canonical Sandbox Item.
3. Verify complete run evidence and manifest hash.
4. Verify every recursive capability reads its declared dependencies.
5. Verify semantic dependency proofs and transformation edges persist.
6. Verify intelligence graph nodes/edges persist.
7. Verify execution output persists.
8. Verify certification gate and certified read model.
9. Traverse every registered workspace route without silent substitution.
10. Exercise every actionable control, including forward/reverse navigation, account controls, Iris widget controls, scenario/decision/outcome controls, and sign-out.
11. Verify responsive visual/cognition consistency.
12. Verify forward and reverse lineage for displayed derived results.

## Absolute anti-fabrication rule

**Fake AI data is strictly prohibited.** Never invent users, accounts, transactions, balances, income, debt, spending, provider observations, intelligence, reports, outcomes, probabilities, confidence, causal claims, or missing evidence. Unknown is never zero. Provider capability availability is not provider observation.

Actual Plaid Sandbox observations are permitted only as governed Sandbox evidence. Technical mocks may isolate infrastructure tests but must never become production financial evidence.

## Continuity rule

Always inspect current GitHub, Render, and Supabase before making a material claim or change. Prior chat is context, never proof. Make the smallest dependency-complete change, then audit the changed source, deployment, schema, and runtime path before claiming completion.
