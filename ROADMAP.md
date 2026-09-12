# IRIS Capability & Product Roadmap

This roadmap is the engineering source of truth for the IRIS build. It tracks **capability state and proof state**, not artifact count, page count, endpoint count, or a percentage-complete impression.

IRIS is one complete intelligence hierarchy, relational ontology, and financial-life state ecosystem. The UI, user journey, evidence, canonical state, ontology, intelligence, derived intelligence, reports, questions, explanations, education, scenarios, decisions, outcomes, learning, and workspaces are traversal surfaces of the same hierarchy.

Nothing in this roadmap creates separate architectural sides or separate intelligence systems.

---

# 0. Authoritative architecture

```text
IRIS
  ↓
Financial-Life Reality / State
  ↓
Provider / User / Authoritative Evidence
  ↓
Observed State
  ↓
Canonical Financial-Life State
  ↓
Relational Ontology
  ↓
Temporal / Statistical / Behavioral / Causal Intelligence
  ↓
Risk / Opportunity / Prediction / Scenario
  ↓
Decision / Consequence / Outcome / Learning
  ↓
Cross-Domain Intelligence
  ↓
Higher-Order Intelligence
  ↓
Recursive Derived Intelligence
  ↓
Reports / Features / Questions / Explanations / Education / Workspaces
  ↓
User
```

This is a graph, not a finite tree. Nodes may have multiple parents, multiple children, cross-domain relationships, temporal dependencies, and recursive ancestry. There is no artificial semantic depth ceiling.

The UI and user journey are part of the hierarchy. A user may enter at any supported point, traverse forward into deeper intelligence, or traverse backward from a result to its exact supporting evidence where factual lineage exists.

---

# 1. Eight authoritative domains

1. Authentication
2. Transactions
3. Balance
4. Identity
5. Assets
6. Liabilities
7. Investments
8. Statements

The current executable Sandbox boundary is seven domains: Authentication, Transactions, Balance, Identity, Assets, Liabilities, and Investments. Statements remains architecturally present but is deferred until real banking. Statements must not be simulated, fabricated, or displayed as observed Sandbox evidence.

---

# 2. Evidence-state contract

These states are always distinct:

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

Epistemic states are also distinct:

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

Unknown is never zero. Prediction is not observation. Scenario is not observation. Correlation is not causation. Persistence is not semantic proof.

---

# 3. Products and Reports

Provider Products and IRIS Report Products are different concepts.

```text
Provider Product count ≠ Report Product count
Report Product count ≠ produced result count
produced result count ≠ certified result count
```

The UI must never manufacture matching counts. Each displayed count must come from its own governed catalog or runtime source.

A report definition is not a user-specific result. A catalog entry is not evidence. A runtime output is not automatically certified.

---

# 4. Governing execution/certification chain

Every capability and user-facing result is tracked through:

`Architecture Defined → Contract Defined → Schema Implemented → Runtime Implemented → Independently Executable → Evidence Verified → Exact Evidence Boundary Verified → Semantic Lineage Verified → Product/Report Defined → Product/Report User-Controlled → Product/Report Surfaced → Interaction Verified → Deployment Verified → End-to-End Certified`

A file, table, endpoint, component, route, build, persisted row, rendered screen, or visible button is not certification.

---

# 5. Build-order rule

Build order follows dependency and proof requirements, not product-side divisions.

The complete UI, user journey, Financial-Life state, evidence pipeline, relational ontology, intelligence hierarchy, reports, education, questions, explanations, scenarios, decisions, outcomes, and recursive intelligence must remain synchronized as one system.

No consumer surface may become a disconnected mock of a deeper layer.

No backend intelligence may be treated as complete while the UI cannot faithfully traverse and explain it.

No UI surface may claim state or intelligence that governed evidence and runtime do not support.

---

# 6. P1 — Complete UI, route, identity, and journey audit

### Required

- Inventory every registered workspace route.
- Inventory every screen, modal, drawer, tab, button, link and interactive control.
- Remove stale product-side terminology.
- Keep IRIS as the single current product identity.
- Give every screen an explicit hierarchy role.
- Ensure every supported screen can traverse deeper where the graph permits.
- Ensure supported surfaces can return to upstream context.
- Reject unknown routes instead of silently rendering another page.
- Preserve forward and reverse traversal.

### Implemented in current build

- The authoritative `irisWorkspaceRegistry` defines the reachable workspace graph.
- Every registered workspace node is exposed by navigation.
- Registered Financial-Life workspace destinations now use an evidence-backed workspace renderer.
- Unknown workspace destinations render an explicit unsupported-route state instead of silently falling back to the Command page.

### Remaining proof

Authenticated browser traversal of every registered route remains required before declaring the entire UI end-to-end certified.

---

# 7. P2 — Visual system normalization

- [ ] One authoritative IRIS visual grammar.
- [ ] Typography normalized.
- [ ] Spacing normalized.
- [ ] Containers/cards/panels normalized.
- [ ] Headings normalized.
- [ ] Buttons and button states normalized.
- [ ] Inputs and controls normalized.
- [ ] Status indicators normalized.
- [ ] Loading states normalized.
- [ ] Empty states normalized.
- [ ] Insufficient-evidence states normalized.
- [ ] Unavailable/deferred states normalized.
- [ ] Error/retry states normalized.
- [ ] Responsive behavior verified.

Visual consistency is not allowed to conceal a missing function or missing evidence.

---

# 8. P3 — Interaction correctness

Every user-facing interaction must have a real supported behavior.

- [ ] Inventory every interactive control.
- [ ] Verify every button handler.
- [ ] Verify every navigation destination.
- [ ] Verify every form submission.
- [ ] Verify search/filter behavior against governed sources.
- [ ] Verify retry behavior.
- [ ] Verify modal/drawer close behavior.
- [ ] Verify back/return context.
- [ ] Verify keyboard/accessibility interaction.
- [ ] Verify mobile interaction.
- [ ] Verify desktop interaction.
- [ ] Remove controls for unsupported actions.

A visible button is not functional proof.

---

# 9. P4 — Evidence and Financial-Life state

- [ ] Authentication.
- [ ] Provider connection state.
- [ ] Evidence formation.
- [ ] Transactions.
- [ ] Balance.
- [ ] Identity.
- [ ] Assets.
- [ ] Liabilities.
- [ ] Investments.
- [ ] Statements deferred state.
- [ ] Canonical account semantics.
- [ ] Canonical transaction semantics.
- [ ] Classification/economic semantics.
- [ ] Temporal state.
- [ ] Economic flow state.
- [ ] Unknown/insufficient-evidence semantics.
- [ ] Merchant/domain/category/entity relationships.
- [ ] Evidence-gated income.
- [ ] Recurring activity.
- [ ] Obligation candidates distinct from verified obligations.
- [ ] Debt/liability state.
- [ ] Asset/investment state.
- [ ] Provider lifecycle/freshness.
- [ ] Field-level evidence lineage.
- [ ] Cross-domain relational state.
- [ ] Exact state-to-intelligence bindings.

---

# 10. P5 — Relational ontology

- [ ] Authoritative entities.
- [ ] Relationships.
- [ ] Relationship directionality.
- [ ] Temporal relationships.
- [ ] Cross-domain relationships.
- [ ] Semantic transformations.
- [ ] Exact node identity.
- [ ] Recursive ancestry.
- [ ] Evidence/provenance bindings.
- [ ] Uncertainty and limitations.
- [ ] Forward traversal.
- [ ] Reverse traversal.
- [ ] Conceptual relationships prevented from masquerading as factual lineage.

---

# 11. P6 — Intelligence hierarchy

All active executable capabilities must remain mapped to the unified hierarchy and real upstream evidence.

Current active capability families include:

- temporal
- financial_life_state
- relational_ontology
- analysis
- behavioral
- pattern
- relationship
- anomaly
- causal
- predictive
- scenario
- decision
- recommendation
- risk
- opportunity
- consequence
- outcome
- learning
- emergent

Required intelligence states remain explicit: calculated, inferred, predicted, scenario, and insufficient evidence.

### Non-negotiable capability rules

- Real upstream evidence is required.
- Missing upstream evidence must not produce substitute intelligence.
- Correlation must not become causation.
- Prediction must not become observation.
- Scenario must use explicit supplied assumptions and must not invent them.
- Decision/recommendation must remain evidence-bound and read-only.
- Outcomes require independently observed outcomes.
- Learning requires qualified outcomes.
- Higher-order synthesis may consume only sufficiently evidenced upstream intelligence.
- Recursive nodes must preserve exact upstream identity and lineage.

---

# 12. P7 — Reports, features, questions, explanations, education, and workspaces

These are presentation/traversal forms of the same hierarchy.

- [x] Report product definitions are catalogued separately from produced results.
- [x] User report inventory exists as a governed publication surface.
- [x] Questions are linked to capability/hierarchy content.
- [x] Explanations are linked to supporting intelligence/evidence.
- [x] Education is part of the same hierarchy rather than a separate data-free side.
- [x] Workspace surfaces are registered in the authoritative workspace registry.
- [x] Capability-to-hierarchy mapping is exposed through the IRIS catalog.
- [x] Registered workspace routes use governed evidence-backed content.
- [ ] Authenticate and traverse every content surface end-to-end.
- [ ] Verify reverse lineage from every factual report/result/answer where supported.

No question, explanation, education item, report or workspace may fabricate content to make a surface appear complete.

---

# 13. P8 — Complete user journey

```text
Arrival
  ↓
Evidence Connection
  ↓
Evidence Formation
  ↓
Financial-Life State
  ↓
Understanding
  ↓
Questions
  ↓
Relationships
  ↓
Reasoning
  ↓
Change / Comparison
  ↓
Scenario / Counterfactual
  ↓
Decision
  ↓
Permitted Action Planning
  ↓
Outcome Observation
  ↓
Learning
  ↓
Higher-Order / Recursive Intelligence
  ↓
Return / Continue Traversal
```

Every point is a traversal surface, not a terminal level. There is no artificial UI journey ceiling.

---

# 14. P9 — Runtime and certification

- [ ] Exact provider evidence boundary.
- [ ] Exact run boundary.
- [ ] Exact evidence-to-run bindings.
- [ ] Semantic transformation proof.
- [ ] Recursive lineage proof.
- [ ] Certification gates.
- [ ] Publication eligibility.
- [ ] Backend/frontend contract agreement.
- [ ] Deployment verification.
- [ ] End-to-end traversal verification.
- [ ] Reverse lineage verification.
- [ ] Screen-level source verification.
- [ ] No fabricated content anywhere in the traversal.

---

# 15. P10 — Intelligence-to-content accuracy gate

The governing content chain is:

```text
real provider evidence
→ canonical state
→ governed capability
→ exact upstream dependencies
→ semantic transformation
→ persisted intelligence node/output
→ certification gate
→ report/question/explanation/education/workspace content
→ user
```

For every user-facing content artifact, verify:

1. Source evidence is real and user-authorized.
2. Evidence boundary is explicit.
3. Upstream capability dependencies are real.
4. Transformation is deterministic/qualified where applicable.
5. Lineage is persisted.
6. Epistemic state is correct.
7. Certification/publication gate is satisfied.
8. UI uses the authoritative contract.
9. Displayed value/text matches persisted output.
10. Reverse traversal resolves to the supporting node/evidence where factual lineage exists.

If any gate fails, content is withheld or truthfully labeled. It is never replaced by fabricated AI content.

---

# 16. P11 — Fake-data eradication gate

The following are permanently prohibited from user-facing financial truth:

- fake users;
- mock production accounts;
- fabricated transactions;
- fabricated balances;
- fabricated income/debt/spending;
- fabricated provider observations;
- invented report results;
- invented outcomes;
- invented confidence/probability values;
- invented causal claims;
- hardcoded financial facts presented as user truth;
- missing evidence represented as zero.

Actual Plaid Sandbox records are permitted only when they are genuinely returned Sandbox observations and are explicitly treated as Sandbox evidence.

Technical test fixtures may test infrastructure but must never become production financial evidence.

---

# 17. Current UI implementation status

The current frontend now includes an evidence-backed workspace surface that:

- resolves only registered workspace nodes;
- reads actual overview data;
- reads the authoritative consumer intelligence contract;
- reads provider surface data for Data/Plaid workspaces;
- publishes certified intelligence only when the backend certification gate passes;
- preserves observed account/transaction values as observed;
- uses `—`/insufficient-evidence states instead of invented numbers;
- exposes explicit traversal to Evidence, Intelligence, and Understand surfaces; and
- refuses unsupported routes rather than silently substituting another page.

The evidence refresh path also surfaces provider refresh failures rather than swallowing them.

These are implementation milestones, not end-to-end certification.

---

# 18. End-to-end certification procedure

For each route and capability:

```text
1. Navigate to route
2. Verify correct component/surface
3. Exercise every visible control
4. Verify request/handler
5. Verify authenticated boundary
6. Verify backend response
7. Verify evidence boundary
8. Verify persisted state/output
9. Verify lineage
10. Verify certification/publication state
11. Verify displayed content
12. Traverse backward to evidence
13. Traverse forward to downstream intelligence
14. Verify loading/empty/error/insufficient states
15. Repeat on mobile and desktop
```

The route is certified only after the complete chain succeeds.

---

# 19. Permanent architectural rules

1. One IRIS system.
2. One complete hierarchy.
3. One relational ontology financial-life state ecosystem.
4. No two-side architecture.
5. No separate data-free Intelligence/Education side.
6. The UI is part of the hierarchy.
7. The user journey is traversal through the hierarchy.
8. Any supported IRIS surface may expose any supported portion of the hierarchy.
9. No artificial semantic depth ceiling.
10. Forward and reverse traversal are mandatory.
11. Exact factual reverse traversal requires exact persisted lineage.
12. Provider availability is not observation.
13. Authorization is not response receipt.
14. Response receipt is not persisted observation.
15. Persistence is not evidence certification.
16. Evidence certification is not intelligence consumption.
17. Intelligence definition is not intelligence execution.
18. Report definition is not a user-specific report result.
19. Products and Reports are never artificially equal in count.
20. Unknown is never zero.
21. Prediction is not observation.
22. Scenario is not observation.
23. Correlation is not causation.
24. No lineage may be claimed without exact lineage.
25. No user-specific financial fact may be fabricated.
26. No AI-generated financial fact may be presented as real evidence.
27. Statements remains architecturally present but currently deferred from Sandbox evidence.
28. Read-only boundaries remain enforced.
29. Every new build block must preserve synchronization among evidence, state, ontology, intelligence, runtime, UI, and traversal.

---

# 20. Definition of done

The build is complete only when the entire application operates as one governed, recursively traversable IRIS hierarchy in which:

- real governed evidence enters the hierarchy;
- canonical Financial-Life state is accurate;
- relationships are explicit and traversable;
- intelligence is derived only from supported evidence and valid transformations;
- recursive derived intelligence preserves exact lineage;
- reports, features, questions, explanations, education, scenarios, decisions, outcomes, and workspaces faithfully expose supported graph content;
- every reachable route renders its intended surface;
- every user-facing control performs its intended supported function;
- every factual result can traverse backward to its exact evidence where lineage exists;
- uncertainty and epistemic state remain explicit;
- Products and Reports remain distinct;
- no fake or fabricated financial content exists;
- read-only boundaries remain enforced;
- runtime and certification gates are independently proven; and
- the authenticated user can move through the system as one continuous financial-life intelligence experience.

Structural mapping and compilation are necessary. They are not substitutes for authenticated end-to-end proof.
