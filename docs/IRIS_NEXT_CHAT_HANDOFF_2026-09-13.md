# IRIS NEXT-CHAT HANDOFF — 2026-09-13

## Current objective

Complete and certify **Level 1 — IRIS Master Intelligence / Master Governor**. Do not advance to Level 2 until Level 1 is verified on the authenticated user screen and the reverse-lineage test passes.

## Critical finding: resync vs reconnect

The active Plaid Item is the newest active Item:

- Institution: First Platypus Bank
- Item created: 2026-09-13 11:09:54 UTC
- Accounts: 14
- Transactions: 48
- Balance observations: 28
- Liability observations: 6
- Provider response receipts: 10

The normal refresh/resync path is executing successfully. The latest refresh produced successful 200 receipts for item, accounts, balance, transactions/sync, and liabilities. `/transactions/sync` processed 2 pages and completed with 0 added, 0 modified, and 0 removed. The transaction sync cursor/checkpoint was persisted.

Therefore the provider refresh path is not simply broken. The important failure boundary is downstream:

`successful resync response/observation → governed IRIS evidence registration → Level 1 run`

Reconnect appears to retrigger evidence because reconnect creates a **new Plaid Item** and performs a fresh Link exchange. The latest reconnect created 48 transaction additions. That is not an acceptable substitute for a working resync-to-evidence path.

## Required fix

A valid successful resync/provider observation must be capable of entering the governed IRIS evidence path without requiring a reconnect. Do not delete source data or historical Items merely to clean counts.

Required proof:

`Plaid resync → provider receipt → raw observation/persisted state → iris_run_evidence → Level 1 execution input → Level 1 output → validation → certification → hierarchy materialization → UI → reverse lineage`

## Current Level 1 state

Authoritative user hierarchy remains empty:

- `iris_user_intelligence_nodes = 0`
- `iris_user_intelligence_edges = 0`
- `iris_user_intelligence_compositions = 0`
- `iris_certifications = 0`
- published certified intelligence = 0

Two stalled Level-1 runs were explicitly superseded by the batching fix. They each contained 2,499 evidence records but produced zero outputs/nodes and are `FAILED / NOT_CERTIFIED`.

The latest backend deployment containing the Level-1 node batching fix is live, but **Level 1 is not certified**.

## Current source Item boundary

There are 10 Items for the user. Nine are disconnected/ITEM_REMOVED and were created repeatedly during Sep 11–13 testing/reconnection. The newest active Item is the current certification candidate. No deletion or source mutation is authorized merely for cleanup.

## Non-negotiables

- No fake AI data.
- No fabricated financial facts.
- No placeholder financial values.
- No unknown-as-zero conversion.
- Sandbox observations are evidence only and must remain explicitly Sandbox evidence.
- One complete IRIS hierarchy; never describe two sides.
- Capability metadata is not user intelligence.
- Authoritative hierarchy writes are post-certification only.
- Persistence is not proof.
- Deployment is not certification.
- Do not advance levels until the current level is actually verified on screen.

## Documentation authority

Architecture authority: Master Build Prompt.
Capability execution order: Iris Capability Roadmap.
Backend reality check: current backend audit/current-state documents.
Runtime truth: live GitHub main + Render + Supabase.
Continuity: this handoff and the latest verified Library records.

## Next exact actions

1. Audit the resync-to-evidence registration code path.
2. Identify why a successful resync receipt/observation does not create/refresh the required governed evidence boundary.
3. Make the smallest correct change only after inspecting the exact current implementation/schema.
4. Deploy and audit after the change.
5. Trigger resync on the current active Item — **do not reconnect** for the verification test.
6. Confirm new/updated provider evidence is registered into the Level-1 manifest when applicable.
7. Run Level 1.
8. Verify execution/output/validation/certification records.
9. Verify post-certification hierarchy materialization.
10. Reverse-lineage a displayed field all the way back to its exact Supabase source observation/provider receipt.
11. User verifies the actual Level-1 screen.
12. Stop. Do not start Level 2.
