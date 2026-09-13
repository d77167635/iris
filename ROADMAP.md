# IRIS Capability & Product Roadmap

This roadmap is the engineering source of truth for the IRIS build. It tracks **capability state and proof state**, not artifact count, page count, endpoint count, or a percentage-complete impression.

IRIS is **one complete hierarchy intelligence relational ontology financial life state ecosystem**. The UI, user journey, evidence, canonical state, ontology, intelligence, derived intelligence, reports, questions, explanations, education, scenarios, decisions, outcomes, learning, and workspaces are traversal surfaces of the same hierarchy.

There are no architectural two sides. Financial Life is not one side and Intelligence another. Education is not a separate data-free system. Any IRIS surface may expose supported portions of the same hierarchy when evidence, derivation, lineage, uncertainty, runtime and publication rules permit it.

---

# 0. Current authoritative state — 2026-09-13

**Level 1 is certified. Level 2 is certified and the first authoritative user hierarchy is published.**

## Level 1 certification

- 192 authoritative evidence records
- 193 execution-lineage records
- 13/13 validation checks PASS
- 0 financial intelligence nodes, edges or compositions at Level 1
- publication: `NOT_STARTED`
- certification hash: `6b23139e37dd390be34f3895020e0bb3db0c08eed143b6aa44b27006116125a1`

## Level 2 certification

- run: `5a0af473-f2a9-43a4-bbe4-7b0b04aa5df3`
- execution: `9586ea77-9d14-4c1f-8da6-86b99ab77c3c`
- status: `CERTIFIED`
- execution state: `EXECUTED`
- validation: `PASS`
- certification: `CERTIFIED`
- publication: `HIERARCHY_PUBLISHED`
- nodes: `10`
- edges: `4`
- compositions: `10`
- execution lineage: `340`
- Level 2 evidence boundary: exact certified Level 1 boundary

The Level 2 implementation currently contains explicit cross-domain intelligence for Transactions × Balance and Transactions × Liabilities. It does **not** claim every theoretical domain combination is implemented.

## Transaction field-lineage proof

The current certified Level 2 transaction output is independently reconcilable to its selected source records:

- 48 posted transactions selected by the certified evidence gate
- 6 negative records → IRIS inflow `1512.66`
- 42 positive records → IRIS outflow `33448.38`
- net cash flow `-31935.72`
- 48 lineage contributions for posted transaction count
- 48 lineage contributions for net cash flow
- 6 lineage contributions for inflow
- 42 lineage contributions for outflow

The durable database trigger now materializes this field-level lineage for future Level 2 executions as well. The corresponding migration is tracked in GitHub as `088_level2_transaction_field_lineage.sql`.

---

# 1. Authoritative hierarchy

```text
REAL SUPABASE / PLAID EVIDENCE
        ↓
EVIDENCE BOUNDARY
        ↓
LEVEL 1 GOVERNANCE / VALIDATION
        ↓
LEVEL 2 AUTHORITATIVE DOMAINS
        ↓
APPLICABLE RECURSIVE INTELLIGENCE
        ↓
SEMANTIC DEPENDENCY VALIDATION
        ↓
EXECUTION OUTPUT
        ↓
VALIDATION
        ↓
CERTIFICATION
        ↓
AUTHORITATIVE HIERARCHY MATERIALIZATION
        ↓
NODES / EDGES / COMPOSITIONS / LINEAGE
        ↓
UNIFIED IRIS SURFACES
```

This is a graph, not a finite tree. It supports multiple parents, cross-domain relationships, temporal dependencies and recursive ancestry. There is no artificial semantic depth ceiling.

**Hard boundary:** authoritative user hierarchy writes are permitted only through the certified execution/publication lifecycle enforced by the database and runtime.

---

# 2. Eight authoritative evidence domains

1. Authentication
2. Transactions
3. Balance
4. Identity
5. Assets
6. Liabilities
7. Investments
8. Statements

Statements remains architecturally authoritative but is deferred from the current Sandbox evidence boundary until real banking. It must never be simulated or fabricated.

---

# 3. Evidence truth contract

```text
available
≠ consented
≠ authorized
≠ provider response received
≠ observation persisted
≠ evidence certified
≠ normalized
≠ intelligence-consumable
≠ intelligence consumed
```

And:

```text
unknown
≠ unavailable
≠ unobserved
≠ hypothetical
≠ predicted
≠ inferred
≠ derived
≠ observed
```

Unknown is never zero. Provider capability is not observation. Persistence is not semantic proof. Prediction is not observation. Scenario is not observation. Correlation is not causation.

---

# 4. Products and Reports

Provider Products, IRIS Report Products, produced results, certified results and intelligence nodes are independent concepts.

```text
Provider Product count ≠ Report Product count
Report Product count ≠ produced result count
produced result count ≠ certified result count
```

No matching count is fabricated for visual symmetry.

---

# 5. Anti-fabrication gate — permanent

**Fake AI data is strictly prohibited.**

Never manufacture or present as user financial truth:

- fake users;
- fake/mock production accounts;
- fabricated transactions;
- fabricated balances;
- fabricated income, debt or spending;
- fabricated provider observations;
- invented report results;
- invented outcomes;
- invented probabilities or confidence values;
- invented causal claims;
- hardcoded financial facts presented as user truth; or
- missing evidence represented as zero.

Actual Plaid Sandbox records are allowed only when genuinely returned by Sandbox and explicitly treated as Sandbox evidence. Technical test fixtures may isolate infrastructure behavior but must never become production financial evidence.

---

# 6. Build and proof state

## Completed and certified

- [x] One unified hierarchy is the canonical architecture.
- [x] Two-side Financial Life / Intelligence framing is removed.
- [x] User financial content is permitted on any IRIS surface when governed evidence/derivation supports it.
- [x] Evidence and intelligence remain one hierarchy.
- [x] Pre-certification hierarchy artifacts were purged.
- [x] Database certification/publication guards enforce the authoritative write boundary.
- [x] Recursive capability execution does not receive a hierarchy persistence callback.
- [x] Arbitrary recursive composition persistence independently checks exact certification.
- [x] Semantic dependency validation remains enforced.
- [x] Products and Reports remain independent concepts.
- [x] Fake-data prohibition is explicit and permanent.
- [x] Level 1 evidence boundary and lineage are certified.
- [x] Level 2 domain intelligence execution is certified.
- [x] Level 2 hierarchy nodes, edges and compositions are published.
- [x] Level 2 transaction field lineage is persisted and reconciled.
- [x] Level 2 transaction lineage persistence is hardened against public/anonymous/authenticated direct execution.

## Remaining certification work

- [ ] Verify the live authenticated UI displays the published hierarchy without raw-content/black-screen failure.
- [ ] Verify every displayed factual value resolves through the published hierarchy and exact lineage.
- [ ] Verify reverse traversal from each user-facing factual result to its persisted intelligence node, execution output and governed source evidence.
- [ ] Continue to the next hierarchy level only after the current level passes live-screen and reverse-lineage certification.
- [ ] Expand recursive intelligence only when real governed evidence, applicable operators, dependencies and validation justify it.
- [ ] Complete unified Reports, Questions, Explanations, Education, Scenarios, Decisions, Action and Outcomes traversal where supported.
- [ ] Final authenticated browser, deployment, provider, Supabase and no-fabrication certification.

---

# 7. Required proof for every hierarchy level

For each level, IRIS must prove:

1. Correct authenticated user boundary.
2. Correct governed evidence scope.
3. Exact evidence boundary and manifest.
4. Applicable intelligence/operator selection.
5. Semantic dependency consumption.
6. Correct execution output persistence.
7. Passing validation persistence.
8. Certification persistence.
9. Correct post-certification materialization.
10. Exact node/edge/composition lineage.
11. Forward traversal from evidence to user-facing content.
12. Reverse traversal from user-facing content back to evidence.
13. No fabricated financial data.
14. Live authenticated UI presentation of the same persisted state.

A level is not certified merely because its code compiles, its endpoint responds, rows exist, or a screen renders.

---

# 8. Unified UI/product roadmap

The consumer journey is one traversal system:

`Financial Life → Change → Understand → Evidence → Intelligence → Reports → Scenarios → Decisions → Action → Outcomes → Connect`

This is not an architectural division.

### UI correctness

- [ ] Normalize IRIS visual cognition across all screens.
- [ ] Verify every route resolves to its intended surface.
- [ ] Verify every button/control has a real supported handler.
- [ ] Verify loading, empty, insufficient-evidence, unavailable, deferred and error states.
- [ ] Keep Products and Reports counts independently sourced.
- [ ] Remove any remaining stale two-side terminology.
- [x] Reconcile competing intelligence UI models into one authoritative hierarchy model.
- [ ] Verify mobile interaction.
- [ ] Verify desktop interaction.

### Content correctness

- [ ] Every factual result maps to governed evidence and exact lineage.
- [ ] Every derived result preserves epistemic state.
- [ ] Every report/result/question/explanation/education surface uses supported hierarchy content.
- [ ] Reverse traversal resolves to supporting intelligence and evidence where factual lineage exists.
- [ ] No surface uses fabricated data to fill missing content.

---

# 9. Complete certification chain

```text
Architecture Defined
→ Contract Defined
→ Schema Implemented
→ Runtime Implemented
→ Independently Executable
→ Evidence Verified
→ Exact Evidence Boundary Verified
→ Semantic Lineage Verified
→ Product/Report Defined
→ Product/Report User-Controlled
→ Product/Report Surfaced
→ Interaction Verified
→ Deployment Verified
→ End-to-End Certified
```

Definitions, files, schemas, routes, endpoints, components, successful compilation, deployment, persisted rows and visible screens are evidence for certification gates, not substitutes for the gates themselves.

---

# 10. Dependency order from here

### Gate A — Current published hierarchy verification

1. Verify live backend version and health.
2. Verify live frontend deployment.
3. Verify authenticated Level 2 fetch.
4. Verify the published hierarchy renders as hierarchy intelligence rather than raw source content.

### Gate B — Reverse lineage

5. Select every user-facing factual Level 2 result.
6. Trace result → hierarchy node/composition → execution output → execution lineage → Level 1 evidence → exact Supabase source observation.
7. Recompute independently and compare.

### Gate C — Next hierarchy level

8. Only after Gate B passes, execute the next applicable recursive intelligence level.
9. Validate dependencies.
10. Certify.
11. Materialize.
12. Reconcile forward and backward.
13. Verify the live screen.

### Gate D — Unified product

14. Connect Reports, Questions, Explanations, Education, Scenarios, Decisions, Action and Outcomes to the same authoritative hierarchy where supported.
15. Verify every route and control.
16. Verify mobile and desktop interaction.

### Gate E — Final end-to-end certification

17. Authenticated browser traversal.
18. Backend/runtime reconciliation.
19. Supabase reconciliation.
20. Provider evidence reconciliation.
21. Reverse lineage verification.
22. Publication-state verification.
23. Final no-fabrication audit.
24. Only then declare complete certification.

---

# 11. Permanent rules

1. One IRIS system.
2. One complete hierarchy.
3. One relational ontology financial-life state ecosystem.
4. No two-side architecture.
5. Any IRIS surface may expose supported hierarchy content.
6. Education is contextual hierarchy traversal, not a separate data-free side.
7. No fake AI data.
8. No fabricated financial facts.
9. No unknown-as-zero substitution.
10. No provider capability/evidence confusion.
11. No observation/derivation/prediction/scenario confusion.
12. No lineage claim without exact persisted lineage.
13. No artificial semantic depth ceiling.
14. Forward and reverse traversal are mandatory.
15. Provider Product and Report Product counts remain independent.
16. Read-only money movement boundaries remain enforced.
17. Authoritative hierarchy writes remain certification/publication gated.
18. Capability infrastructure is not itself user-specific hierarchy intelligence.
19. Documentation must remain synchronized with live runtime/database proof.
20. Documentation never substitutes for runtime proof.
