# IRIS Capability & Product Roadmap

This roadmap is the engineering source of truth for the IRIS build. It tracks **capability state and proof state**, not artifact count, page count, endpoint count, or a percentage-complete impression.

IRIS is **one complete hierarchy intelligence relational ontology financial life state ecosystem**. The UI, user journey, evidence, canonical state, ontology, intelligence, derived intelligence, reports, questions, explanations, education, scenarios, decisions, outcomes, learning, and workspaces are traversal surfaces of the same hierarchy.

There are no architectural two sides. Financial Life is not one side and Intelligence another. Education is not a separate data-free system. Any IRIS surface may expose supported portions of the same hierarchy when evidence, derivation, lineage, uncertainty, runtime and publication rules permit it.

---

# 0. Current authoritative state — 2026-09-13

**Capability infrastructure exists. Authoritative persisted IRIS hierarchy intelligence does not yet exist.**

The clean current persisted hierarchy state is:

```text
iris_user_intelligence_nodes          = 0
iris_user_intelligence_edges         = 0
iris_user_intelligence_compositions  = 0
hierarchy-intelligence lineage       = 0
iris_certifications                  = 0
published certified intelligence     = 0
```

This zero state is intentional after removal of pre-certification hierarchy artifacts. It must not be described as partial persisted intelligence. It is the truthful pre-first-certification state.

The architecture is implemented; the first legitimate runtime-generated hierarchy has not yet been certified.

---

# 1. Authoritative hierarchy

```text
REAL SUPABASE / PLAID EVIDENCE
        ↓
EVIDENCE BOUNDARY
        ↓
CAPABILITY PLANNING
        ↓
RECURSIVE COMPUTATION
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
CERTIFIED INTELLIGENCE
        ↓
UNIFIED IRIS SURFACES
```

This is a graph, not a finite tree. It supports multiple parents, cross-domain relationships, temporal dependencies and recursive ancestry. There is no artificial semantic depth ceiling.

**Hard boundary:** authoritative hierarchy writes are post-certification only.

The recursive executor must not persist hierarchy nodes. Arbitrary recursive composition materialization must independently require an exact certified run. Database certification guards enforce the same boundary independently of application code.

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

## Completed architectural corrections

- [x] One unified hierarchy is the canonical architecture.
- [x] Two-side Financial Life / Intelligence framing is removed.
- [x] User financial content is permitted on any IRIS surface when governed evidence/derivation supports it.
- [x] Evidence and intelligence remain one hierarchy.
- [x] Pre-certification hierarchy artifacts were purged.
- [x] Database certification guards enforce post-certification hierarchy writes.
- [x] Recursive capability execution no longer receives a hierarchy persistence callback.
- [x] Arbitrary recursive composition persistence independently checks exact certification.
- [x] Semantic dependency validation remains enforced.
- [x] The recursive-executor regression fixture was corrected without weakening semantic validation.
- [x] Products and Reports remain independent concepts.
- [x] Fake-data prohibition is explicit and permanent.

## Not yet certified

- [ ] Backend corrected build/deployment is live and verified.
- [ ] Real authenticated recursive run completes against governed Supabase/Plaid evidence.
- [ ] `iris_execution_outputs` contains a valid run-bound output from that corrected runtime.
- [ ] `iris_validation_results` contains passing validation for that run.
- [ ] `iris_certifications` contains the exact certified run.
- [ ] First post-certification hierarchy nodes are materialized.
- [ ] First post-certification hierarchy edges are materialized.
- [ ] First post-certification recursive compositions are materialized where applicable.
- [ ] Exact hierarchy lineage is reconciled forward and backward.
- [ ] Unified Intelligence UI consumes the authoritative persisted hierarchy.
- [ ] Every registered IRIS surface consumes the same authoritative hierarchy where supported.
- [ ] Every user-facing control is authenticated-runtime verified.
- [ ] Full end-to-end certification is complete.

---

# 7. Current backend blocker

The backend build is test-gated. The previous certification-boundary failure was a regression fixture activating real semantic contracts (`analysis`, `behavioral`, etc.) while a structural mock dispatcher did not consume those semantic paths.

The fixture correction is committed. The backend deployment triggered by the latest correction must pass the full test suite before it can become the live runtime.

This blocker must be fixed through the test fixture or underlying implementation contract. **Do not disable tests, bypass semantic validation, or weaken certification to obtain a green build.**

---

# 8. Required first certified hierarchy run

The first legitimate hierarchy generation must prove, with real runtime evidence:

1. Correct authenticated user boundary.
2. Correct selected provider Item/evidence scope.
3. Exact run evidence manifest.
4. Recursive capability planning.
5. Semantic dependency consumption.
6. Correct execution output persistence.
7. Validation persistence.
8. Certification persistence.
9. Post-certification node materialization.
10. Post-certification edge materialization.
11. Post-certification composition materialization where findings qualify.
12. Exact node/edge/composition lineage.
13. Reverse traversal from hierarchy result to evidence.
14. UI display of the same persisted certified hierarchy.
15. No fabricated data at any point.

Only after this proof may the system claim that IRIS hierarchy intelligence is operational.

---

# 9. Unified UI/product roadmap

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
- [ ] Reconcile competing intelligence UI models into one authoritative hierarchy model.
- [ ] Verify mobile interaction.
- [ ] Verify desktop interaction.

### Content correctness

- [ ] Every factual result maps to governed evidence and exact lineage.
- [ ] Every derived result preserves epistemic state.
- [ ] Every report/result/question/explanation/education surface uses supported hierarchy content.
- [ ] Reverse traversal resolves to supporting intelligence and evidence where factual lineage exists.
- [ ] No surface uses fabricated data to fill missing content.

---

# 10. Complete certification chain

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

A definition, file, schema, route, endpoint, component, successful compilation, deployment, persisted row or visible screen is not certification by itself.

---

# 11. Dependency order from here

### Gate A — Runtime build

1. Pass complete backend tests.
2. Deploy corrected backend.
3. Verify live health/version.

### Gate B — Real intelligence execution

4. Execute against the actual governed Supabase/Plaid evidence boundary.
5. Reconcile execution input/evidence manifest.
6. Prove semantic dependency consumption.
7. Prove output persistence.
8. Prove validation persistence.
9. Prove certification persistence.

### Gate C — First hierarchy

10. Materialize hierarchy only after certification.
11. Reconcile nodes, edges, compositions and lineage.
12. Verify database guards remain effective.

### Gate D — Unified product

13. Make Intelligence UI consume the authoritative hierarchy.
14. Connect Reports, Questions, Explanations, Education, Scenarios, Decisions, Action and Outcomes to the same hierarchy where supported.
15. Verify forward and reverse traversal.
16. Verify every route and control.

### Gate E — End-to-end certification

17. Authenticated browser traversal.
18. Backend/runtime reconciliation.
19. Supabase reconciliation.
20. Provider evidence reconciliation.
21. Reverse lineage verification.
22. Mobile and desktop verification.
23. Final no-fabrication audit.
24. Only then declare certification.

---

# 12. Permanent rules

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
17. Authoritative hierarchy writes occur only after certification.
18. Capability infrastructure is not persisted hierarchy intelligence.
19. Zero hierarchy rows remain the truthful state until the first real certified materialization.
20. Documentation never substitutes for runtime proof.
