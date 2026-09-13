# IRIS Current State

**State date:** 2026-09-13

This document records the current implementation/proof boundary. It does not substitute for live runtime verification.

## 1. Canonical architecture

IRIS is **one complete hierarchy intelligence relational ontology financial life state ecosystem**.

There are no two sides. Financial Life, Evidence, Understand, Intelligence, Reports, Scenarios, Decisions, Action, Outcomes, Connect, questions, explanations, education and workspaces are traversal surfaces of the same hierarchy.

## 2. Current hierarchy truth

Capability infrastructure exists. **Authoritative persisted hierarchy intelligence does not yet exist.**

Current legitimate persisted state:

```text
iris_user_intelligence_nodes          = 0
iris_user_intelligence_edges         = 0
iris_user_intelligence_compositions  = 0
hierarchy-intelligence lineage       = 0
iris_certifications                  = 0
published certified intelligence     = 0
```

This zero state is intentional after pre-certification hierarchy artifacts were removed. It must remain zero until a real governed run is certified and its hierarchy is materialized after certification.

## 3. Required runtime boundary

```text
REAL SUPABASE / PLAID EVIDENCE
→ EVIDENCE BOUNDARY
→ CAPABILITY PLANNING
→ RECURSIVE COMPUTATION
→ SEMANTIC DEPENDENCY VALIDATION
→ EXECUTION OUTPUT
→ VALIDATION
→ CERTIFICATION
→ AUTHORITATIVE HIERARCHY MATERIALIZATION
→ NODES / EDGES / COMPOSITIONS / LINEAGE
→ CERTIFIED INTELLIGENCE
→ UNIFIED IRIS SURFACES
```

Any authoritative hierarchy write before certification is a defect.

## 4. Current Plaid resync/evidence finding — 2026-09-13

The current active Plaid Item is:

```text
institution: First Platypus Bank
Item status: active
Item created: 2026-09-13 11:09:54 UTC
accounts: 14
transactions: 48
balance observations: 28
liability observations: 6
provider response receipts: 10
```

The normal refresh/resync path **is executing successfully**. The latest refresh produced successful provider receipts for:

- `/item/get`
- `/accounts/get`
- `/accounts/balance/get`
- `/transactions/sync`
- `/liabilities/get`

The latest `/transactions/sync` processed two pages and completed successfully with:

```text
added     = 0
modified  = 0
removed   = 0
```

The transaction sync cursor and successful checkpoint were persisted. Therefore the resync mechanism is not currently failing at the provider-call/sync-state layer merely because no transactions changed.

However, reconnecting creates a new Plaid Item and performs a fresh Link exchange, which generated a new ingestion event and 48 transaction additions. This explains why reconnecting appeared to retrigger downstream evidence while resync did not.

The unresolved defect is therefore **not proven to be Plaid resync itself**. The remaining boundary is whether a successful resync response/observation is automatically registered into the IRIS governed evidence manifest and causes the required Level-1 execution path. That must be fixed and proven without requiring a reconnect.

Important distinction:

```text
provider refresh/resync succeeds
≠
new transaction observations exist
≠
new IRIS evidence manifest exists
≠
Level 1 executes
≠
Level 1 certifies
```

Current receipts prove provider responses were received and persisted. Current Level-1 certification does not exist.

## 5. Historical/reconnect contamination boundary

The database currently contains 10 Plaid Items for this user. Nine are disconnected with `ITEM_REMOVED`; the newest Item is active. They were created repeatedly from September 11–13 and are historical/test reconnect artifacts except for the currently active Item, which is the intended current evidence candidate.

No historical Item or source record is to be deleted or rewritten merely to make the counts look clean. Item selection and cleanup require explicit reconciliation and an auditable decision.

The current active Item is the only Item that should be used as the Level-1 certification candidate unless a later authenticated action explicitly changes that boundary.

## 6. Corrections now committed

- Recursive capability execution no longer receives a hierarchy-node persistence callback.
- Arbitrary recursive composition materialization independently requires an exact certified run.
- Pre-certification hierarchy artifacts were purged.
- Database certification guards enforce the certification boundary.
- The recursive-executor regression fixture was corrected without weakening semantic validation.
- Fake AI/financial data remains strictly prohibited.
- Any IRIS surface may expose supported evidence-derived intelligence; intelligence/education surfaces are not a separate data boundary.
- Products and Reports remain independent concepts and independently sourced counts.
- Level-1 node persistence was changed to batched writes so a large real evidence scope does not stall on one-node-at-a-time database writes.

## 7. Current unverified boundary

The first corrected real runtime execution has **not yet** been proven end-to-end through:

`resync → governed evidence registration → execution → output → validation → certification → first hierarchy materialization → reverse lineage → unified UI consumption`.

Therefore no current documentation may claim that authoritative hierarchy intelligence has already been generated.

## 8. Next gates

1. Prove resync-created provider responses/observations enter the exact IRIS evidence manifest without reconnecting.
2. Prove the active Item is the sole bounded Level-1 certification candidate.
3. Execute Level 1 against that exact evidence boundary.
4. Execution output persists.
5. Validation persists and passes.
6. Certification persists and passes.
7. First hierarchy nodes/edges/compositions materialize only after certification.
8. Exact lineage reconciles forward and backward.
9. Unified IRIS surfaces consume the same persisted hierarchy.
10. User verifies Level 1 on the actual authenticated screen.
11. Only after Level 1 passes may Level 2 begin.

## 9. Permanent truth rules

- No fake AI data.
- No fabricated financial facts.
- No fabricated provider observations.
- No unknown-as-zero substitution.
- No capability metadata treated as observation.
- No prediction treated as observation.
- No scenario treated as observation.
- No causal claim without supported causal reasoning.
- No lineage claim without exact persisted lineage.
- No hierarchy write before certification.
- No certification claim without runtime proof.
- No artificial semantic depth ceiling.
- No two-side architecture.
- Reconnect must not be required merely to regenerate governed evidence when the provider resync path already returned a valid response/observation.

## 10. Source hierarchy

Use, in order:

1. live runtime/database evidence;
2. current GitHub implementation;
3. `docs/DOCUMENTATION_AUTHORITY.md`;
4. `docs/ARCHITECTURE.md`, `README.md`, and `ROADMAP.md`;
5. other active documentation;
6. prior conversation/history.

If a historical document conflicts with this current state, the current authority chain wins and the historical document must be corrected before it is treated as current truth.
