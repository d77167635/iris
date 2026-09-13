# Iris Session Handoff

This file is the compact bridge between sessions. It must reflect verified repository/runtime state, not older chat assumptions.

## Current authority

- Product: **IRIS**
- Repository: `d77167635/iris`
- Branch: `main`
- Continuity protocol: `docs/DOCUMENTATION_AUTHORITY.md`
- Connected Supabase: `uhcrdehjwaghqvydaqnn`
- Current Render workspace: `tea-dai0jth42hec73araong`
- Scope: read-only intelligence; no money movement.

## Single-system architecture

IRIS is one complete hierarchy intelligence relational ontology financial life state ecosystem.

There are no two IRIS sides. Financial Life, evidence, ontology, intelligence, reports, questions, explanations, education, scenarios, decisions, outcomes, learning, and workspaces are all connected representations and traversal surfaces of the same hierarchy.

Any supported IRIS surface may expose supported user-specific evidence and/or derived intelligence when the governing evidence, lineage, uncertainty, authorization, runtime, and certification/publication state permits it.

## Provider boundary

The specifically reconciled Plaid Sandbox → Supabase Item/data path is verified for the tested path. The claim does not automatically certify the broader current multi-Item population.

The current full-intelligence execution path uses the independently governed canonical Item selected by the evidence-scope resolver when available. It does not silently combine Items when a canonical Item is available. Statements remains architecturally authoritative but is deferred from the current Sandbox evidence boundary until real banking.

## Runtime defect found and fixed

The live database proved that inserting parent Plaid product observations into `iris_run_evidence` invokes the authoritative `trg_expand_iris_run_evidence_raw_financial` trigger, which creates typed transaction/balance/liability evidence.

The full-intelligence executor previously kept only the parent insert IDs and original evidence hash. The independent capability executor already re-read the expanded evidence set and bound that complete manifest.

The current full-intelligence implementation now follows that trigger-aware pattern: insert governed parent observations, re-read complete run evidence, compute the complete evidence manifest/hash, update the run binding, and pass the complete evidence IDs/hash into recursive execution and lineage. Structured object errors are also preserved instead of becoming `[object Object]`.

The backend and frontend deployments for the implementation workstream reached `live` status.

**Fresh authenticated execution is still required to prove that the corrected runtime produces persisted intelligence output and certification.**

## UI defects found and fixed

- Registered Financial-Life destinations now receive route-specific governed content instead of intentionally collapsing into a generic command surface.
- Unsupported routes are explicitly rejected.
- Navigation descriptions are visible again.
- Route metrics, records, child traversal and truth-state messaging use the shared IRIS visual grammar.
- Derived values remain certification-gated.

Authenticated route-by-route and control-by-control verification is still required.

## Current observed Supabase certification state

The audited live snapshot contained:

- `iris_runs`: 20
- `iris_execution_records`: 20
- `iris_certifications`: 0
- `iris_execution_outputs`: 0
- intelligence graph nodes: 0
- user intelligence graph nodes: 0
- certified intelligence read model: 0
- report products: 70
- report dependencies: 267
- semantic dependency proofs: 19

The previously failed run's `iris_run_evidence` contained 67 parent provider observations plus 48 transaction, 14 balance and 3 liability evidence records, proving the database expansion trigger is active.

These are observations, not completion claims.

## Required next verification sequence

1. Verify the current backend deployment contains the trigger-aware full-intelligence evidence-manifest fix.
2. Trigger/observe a fresh authenticated full-intelligence run against the current canonical Item.
3. Verify the fresh run's evidence manifest includes all expanded evidence records and a matching manifest hash.
4. Verify every capability consumes only its declared upstream dependencies.
5. Verify recursive graph nodes and lineage persist.
6. Verify execution output persists.
7. Verify certification gate behavior.
8. Verify report publication state separately from report definitions.
9. Traverse the UI route-by-route and control-by-control.
10. Verify forward and reverse lineage.
11. Update README/ROADMAP/MASTER_STATE/session continuity only from verified results.

## Anti-fabrication rule

Fake AI financial data is strictly prohibited. Never invent financial values, provider observations, report results, outcomes, confidence, probabilities, causal claims, or missing evidence. Unknown is never zero.

Actual Plaid Sandbox observations are allowed only as explicitly governed Sandbox evidence. Technical mocks may remain isolated to infrastructure tests and must never become production financial evidence.

## Continuity rule

Always inspect current GitHub, Render, and Supabase before making a material claim or change. Prior chat is context, never proof.
