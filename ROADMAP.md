# IRIS Capability & Product Roadmap

This roadmap is the engineering source of truth for the IRIS build. It tracks **capability state and proof state**, not artifact count, page count, endpoint count, or a percentage-complete impression.

The roadmap governs one system: **IRIS is a complete intelligence hierarchy, relational ontology, and financial-life state ecosystem.** The hierarchy includes the user interface, user journey, governed evidence, canonical financial-life state, relationships, intelligence, derived intelligence, reports, explanations, education, scenarios, decisions, outcomes, learning, and every other supported IRIS surface.

Nothing in this roadmap creates separate architectural sides, experiences, intelligence systems, or semantic layers. Different screens and entry points are traversal surfaces into the same hierarchy.

---

# 0. Authoritative architecture — read this before every build block

## 0.1 IRIS is one complete hierarchy

IRIS is a **Relational Financial Intelligence Operating System** and a **relational ontology financial-life state intelligence ecosystem**.

The complete system is one recursively connected hierarchy:

```text
IRIS
  ↓
Financial-Life Reality / State
  ↓
Provider, User, and Authoritative Evidence
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

This diagram is not a fixed sequence or finite tree. It represents traversable relationships in a graph. Nodes may have multiple parents, multiple children, cross-domain relationships, temporal dependencies, and recursive derived dependencies.

**IRIS is at the top. The hierarchy extends downward without an artificial semantic ceiling.**

## 0.2 The UI is part of the hierarchy

The user interface is not outside the intelligence architecture and is not a separate product layer with a separate semantic boundary.

Every supported screen, workspace, report, question surface, explanation, control, navigation destination, modal, drawer, interaction, and user journey step is a presentation and traversal point into the same IRIS hierarchy.

The UI may expose a shallow entry point and progressively disclose arbitrarily deeper supported relationships. A user may traverse from a human-readable result into intelligence, relationships, canonical state, evidence, source fields, and provider observations, or traverse upward from evidence into increasingly higher-order derived intelligence.

The UI and user journey therefore have **no artificial semantic ceiling**. Practical limits such as authorization, evidence availability, runtime, storage, latency, pagination, materialization, device capability, and usefulness are operational constraints, not limits on what the hierarchy can semantically represent or traverse.

## 0.3 The user journey is part of the hierarchy

The user journey is not a third architectural layer and is not a separate experience boundary. It is the user's traversal through the hierarchy.

A journey may move through:

`Arrival → Evidence Connection → Evidence Formation → Understanding → Ask → Explore Relationships → Reasoning → Compare → Change → Scenario → Decide → Action → Observe Outcomes → Learn → Return`

These are navigation and interaction destinations, not limits on the underlying hierarchy.

A user may enter the hierarchy at any supported point and move forward or backward while preserving context and exact lineage where factual lineage exists.

## 0.4 Financial Life is part of the same hierarchy

Financial Life means the governed representation of the user's financial reality and state, including when supported:

- accounts;
- transactions;
- balances;
- identity;
- assets;
- liabilities;
- investments;
- statements;
- income;
- cash flow;
- spending;
- merchants, domains, categories and entities;
- recurring activity;
- obligations;
- debt;
- temporal state;
- changes;
- relationships;
- user-specific intelligence;
- reports and analytics;
- scenarios;
- decisions;
- permitted actions;
- outcomes;
- learning; and
- contextual explanations and education.

These are not separate products or sides. They are different states, representations, relationships, transformations, or traversal surfaces within the same hierarchy.

## 0.5 Evidence is part of the same hierarchy

Provider observations and other authorized authoritative inputs enter the hierarchy through governed evidence boundaries. Evidence is not a separate side of IRIS.

The hierarchy must preserve the distinction between source observation, canonical state, transformation, inference, derivation, prediction, scenario, decision, consequence, outcome, and learning.

Unknown remains unknown. Unavailable remains unavailable. Hypothetical remains hypothetical. Predicted remains predicted. Derived remains derived. Observed remains observed.

Only actual governed source content and legitimately derived intelligence with complete supported upstream lineage may be presented as user-specific factual content.

## 0.6 Intelligence has no artificial semantic depth ceiling

The intelligence hierarchy is a graph, not a fixed numbered tree.

Level 1 is IRIS. Level 2 contains the eight authoritative financial-life evidence domains. Level 3 and beyond are recursively generated intelligence and derived state.

Capability families/operators are composition machinery, not hierarchy levels. They may recur at arbitrary depth and in different combinations.

Arbitrary derived-intelligence nodes must support:

- exact upstream node identity;
- recursive ancestry;
- transformation identity;
- evidence binding;
- provenance;
- uncertainty and limitations;
- execution/run boundary;
- user boundary; and
- certification state.

A finite capability registry does not define the semantic boundary of IRIS.

## 0.7 Bidirectional traversal is mandatory

Forward traversal:

```text
provider observation
→ governed evidence
→ observed state
→ canonical Financial-Life State
→ relational ontology
→ intelligence
→ recursive derived intelligence
→ qualified result
→ user traversal
```

Reverse traversal:

```text
user result / report / answer
→ producing intelligence
→ upstream intelligence and relationships
→ canonical state
→ exact governed evidence
→ source-field observation
→ provider observation
```

Both directions are part of the same graph. Exact factual reverse traversal requires exact persisted lineage.

---

# 1. Governing execution and certification chain

Every capability is tracked through:

`Architecture Defined → Contract Defined → Schema Implemented → Runtime Implemented → Independently Executable → Evidence Verified → Exact Evidence Boundary Verified → Semantic Lineage Verified → Product/Report Defined → Product/Report User-Controlled → Product/Report Surfaced → Interaction Verified → Deployment Verified → End-to-End Certified`

A later state never implies an earlier state is certified.

A file, table, endpoint, component, route, successful build, persisted row, rendered screen, or visible button is not certification.

Certification requires corresponding proof.

---

# 2. Build-order rule

Build order follows dependency and proof requirements, not a division between parts of the application.

The complete UI, user journey, Financial Life state, evidence pipeline, relational ontology, intelligence hierarchy, reports, education, scenarios, decisions, outcomes, and derived intelligence must remain synchronized as one system.

No consumer surface is allowed to become a disconnected mock of a deeper layer.

No backend intelligence may be treated as complete while the UI cannot faithfully traverse and explain it.

No UI surface may claim state or intelligence that the governed evidence and runtime do not support.

The active build program therefore proceeds from authoritative architecture and contracts through governed evidence and canonical state into intelligence and then through every required UI traversal and proof gate, while allowing all layers to be developed where their dependencies are satisfied.

---

# 3. Non-negotiable architecture

## 3.1 One graph, one hierarchy

```text
                              IRIS
                                │
                 complete governed hierarchy / graph
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
      evidence              financial state        user interface
        │                       │                       │
        └───────────────────────┼───────────────────────┘
                                │
                         relational ontology
                                │
                       recursive intelligence
                                │
                    higher-order / derived nodes
                                │
              reports / questions / explanations / education
                                │
                         user traversal
```

The branches in this diagram are relationships and representations, not separate sides or separate architectures. Every branch reconnects to the same hierarchy and graph.

## 3.2 Eight authoritative domains

1. Authentication
2. Transactions
3. Balance
4. Identity
5. Assets
6. Liabilities
7. Investments
8. Statements

## 3.3 Current executable/certifiable Sandbox boundary

The current Sandbox boundary is seven domains:

1. Authentication
2. Transactions
3. Balance
4. Identity
5. Assets
6. Liabilities
7. Investments

Statements is architecturally Domain 8 but is deferred until real banking.

Statements must not be requested, simulated, fabricated, displayed as observed, or used as a current Sandbox evidence requirement.

## 3.4 Recursive intelligence

There is no artificial semantic depth ceiling anywhere in the system.

The hierarchy may recursively derive new intelligence from prior intelligence when evidence, governance, transformation validity, resources, and usefulness permit.

This applies equally to backend intelligence, reports, workspaces, education, explanations, questions, and UI traversal.

Runtime/materialization budgets are operational constraints only. They must never be represented as a semantic maximum.

---

# 4. Evidence-state contract

These states must remain separate everywhere:

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

Epistemic states must remain separate:

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

Unknown is never zero.

No evidence means no factual value.

No observation means no fabricated observation.

Prediction is not observation.

Scenario is not observation.

Correlation is not causation.

Persistence is not semantic proof.

Dependency readability is not proof of semantic consumption.

---

# 5. Products versus Reports — mandatory distinction

A provider product and an IRIS report product are different concepts within the same hierarchy.

## 5.1 Provider products

A provider product is a source capability that can potentially contribute observations/evidence.

Its lifecycle can include:

```text
provider product universe
→ catalog
→ capability
→ availability
→ institution support
→ consent
→ authorization
→ plan entitlement
→ commercial cost
→ provider response
→ persisted observation
```

## 5.2 IRIS Report Products

An IRIS Report Product is a user-facing publication definition over the IRIS intelligence graph.

A report product may depend on:

- multiple provider products;
- multiple evidence domains;
- multiple intelligence nodes;
- temporal relationships;
- recursive dependencies;
- scenarios;
- verified outcomes; and
- higher-order compositions.

Therefore:

```text
Provider Product count ≠ Report Product count
Report Product count ≠ produced result count
produced result count ≠ certified result count
```

The UI must never manufacture matching counts.

Each count must come from its own governed runtime/catalog source.

---

# 6. Complete application build program

The following workstreams are implementation views of one hierarchy. They are not separate product sides.

## P1 — UI, route, identity, and journey audit

- [ ] Audit every reachable route against the current repository.
- [ ] Inventory every screen, route, modal, drawer, tab, button, link and interactive control.
- [ ] Identify stale/legacy product terminology.
- [ ] Ensure IRIS is the only current user-facing product identity.
- [ ] Ensure every screen has an explicit role within the complete hierarchy.
- [ ] Ensure no screen invents financial facts to appear complete.
- [ ] Ensure every screen can traverse to deeper supported context where the underlying graph permits it.
- [ ] Ensure every supported surface can return to its upstream context.
- [ ] Remove any architecture language implying separate sides or separate intelligence systems.

## P2 — Visual system normalization

- [ ] Establish one authoritative visual grammar across the application.
- [ ] Normalize typography.
- [ ] Normalize spacing.
- [ ] Normalize containers/cards/panels.
- [ ] Normalize headings and hierarchy.
- [ ] Normalize buttons and button states.
- [ ] Normalize inputs and controls.
- [ ] Normalize badges/status indicators.
- [ ] Normalize loading states.
- [ ] Normalize empty states.
- [ ] Normalize insufficient-evidence states.
- [ ] Normalize unavailable/deferred states.
- [ ] Normalize error/retry states.
- [ ] Normalize responsive behavior.
- [ ] Independently verify consistency across all supported screens.

## P3 — Interaction correctness

- [ ] Inventory all interactive controls.
- [ ] Ensure every user-facing button has a real supported behavior.
- [ ] Ensure navigation controls route to real supported destinations.
- [ ] Ensure unsupported actions do not appear executable.
- [ ] Ensure retry controls invoke the correct retry behavior.
- [ ] Ensure search/filter controls operate on governed sources.
- [ ] Ensure modal/drawer close behavior is correct.
- [ ] Ensure back/return behavior preserves context.
- [ ] Verify keyboard/accessibility interaction.
- [ ] Verify mobile interaction.
- [ ] Verify desktop interaction.

## P4 — Evidence and Financial-Life state

Build and verify the governed state that the rest of the hierarchy traverses.

- [ ] Provider connection state.
- [ ] Evidence formation state.
- [ ] Authentication.
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
- [ ] Liability/debt state.
- [ ] Asset/investment state.
- [ ] Historical provider lifecycle.
- [ ] Field-level evidence lineage.
- [ ] Freshness state.
- [ ] Cross-domain relational state.
- [ ] Exact state-to-intelligence bindings.

## P5 — Relational ontology

The ontology is the connective structure of the same hierarchy.

- [ ] Define authoritative entities.
- [ ] Define relationships.
- [ ] Define relationship directionality.
- [ ] Define temporal relationships.
- [ ] Define cross-domain relationships.
- [ ] Define semantic transformations.
- [ ] Preserve exact node identity.
- [ ] Preserve recursive ancestry.
- [ ] Preserve evidence/provenance bindings.
- [ ] Preserve uncertainty and limitations.
- [ ] Ensure relationships can be traversed forward and backward.
- [ ] Ensure conceptual relationships cannot masquerade as factual user lineage.

## P6 — Intelligence hierarchy

- [ ] Observation intelligence.
- [ ] Classification.
- [ ] Temporal analysis.
- [ ] Statistical analysis.
- [ ] Baselines.
- [ ] Change detection.
- [ ] Anomaly reasoning.
- [ ] Behavioral analysis.
- [ ] Relationship analysis.
- [ ] Causal analysis with explicit causality boundaries.
- [ ] Prediction with explicit prediction state.
- [ ] Scenario/counterfactual reasoning.
- [ ] Risk.
- [ ] Opportunity.
- [ ] Decision reasoning.
- [ ] Recommendation boundaries.
- [ ] Consequence reasoning.
- [ ] Outcome observation.
- [ ] Learning.
- [ ] Cross-domain synthesis.
- [ ] Higher-order intelligence.
- [ ] Recursive derived intelligence.
- [ ] Arbitrary graph node persistence with exact upstream references.

## P7 — Reports, features, questions, education, and workspaces

These are presentation/traversal forms of the same hierarchy.

- [ ] Report product definitions.
- [ ] Runtime-produced reports.
- [ ] Evidence qualification.
- [ ] Certification state.
- [ ] User activation/deactivation.
- [ ] Question-driven exploration.
- [ ] Relationship exploration.
- [ ] Contextual explanations.
- [ ] Evidence inspection.
- [ ] Educational explanations grounded in the hierarchy.
- [ ] Feature surfaces.
- [ ] Workspace surfaces.
- [ ] Cross-domain exploration.
- [ ] Scenario workspaces.
- [ ] Decision surfaces.
- [ ] Outcome surfaces.
- [ ] Learning surfaces.
- [ ] Forward traversal.
- [ ] Reverse traversal.
- [ ] Progressive disclosure into arbitrarily deeper supported nodes.

Education is therefore contextual intelligence explanation within the same system. It is not a data-free architectural side.

## P8 — Complete user journey

The journey must expose the hierarchy rather than flatten it into a dashboard.

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

Every point is a traversal surface, not a terminal level.

The user may continue deeper whenever supported by evidence, lineage, runtime capability, authorization, and useful context.

There is no artificial UI journey ceiling.

## P9 — Runtime and certification

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

# 7. Universal publication and display contract

Any IRIS surface may expose any portion of the complete hierarchy when that content is supported by governed evidence and/or legitimately derived by IRIS from that evidence.

There is no architectural rule prohibiting user-specific financial data from an “intelligence” surface, because there is no separate intelligence side.

Likewise, there is no architectural rule requiring reports, education, explanations, evidence, or intelligence to remain confined to a particular side. Their location is determined by semantic role, user context, authorization, evidence state, and the supported traversal—not by an artificial product split.

Before publication/display, the system must know what the content is:

- observed;
- derived;
- inferred;
- predicted;
- hypothetical/scenario;
- user-provided;
- authoritative external content; or
- conceptual/educational.

The system must preserve that state visibly and semantically where relevant.

Only content whose source and derivation boundary is supported may be presented as factual user-specific content.

---

# 8. No-fabrication contract

Fake financial data and fabricated AI data are prohibited.

Never create or present:

- fake users;
- mock production financial records;
- seeded financial facts;
- fabricated balances;
- fabricated transactions;
- fabricated income;
- fabricated fees;
- fabricated provider observations;
- invented report results;
- invented outcomes;
- invented confidence/probability values;
- invented causal relationships;
- hardcoded financial values presented as user truth; or
- missing evidence represented as zero.

Actual provider Sandbox records may be used when they are genuinely returned by the Sandbox and are explicitly treated as Sandbox/provider evidence.

Technical test fixtures may isolate infrastructure behavior but must never become production financial evidence.

If evidence is absent, the system must use an appropriate insufficient-evidence, unavailable, unknown, deferred, or other governed state.

---

# 9. Read-only boundary

Current IRIS scope is read-only.

No ACH, RTP, FedNow, card movement, transfer, withdrawal, trade, deposit, custody, lending, credit decision, or other money movement is implied or implemented as part of the current intelligence product.

Round-Ups remain an IRIS feature within the hierarchy, not the definition of IRIS and not the intelligence foundation.

---

# 10. Certification gates

A capability is not complete merely because its files exist.

A capability is complete only when the applicable proof chain has passed:

1. Architecture defined.
2. Contract defined.
3. Schema implemented.
4. Runtime implemented.
5. Independently executable.
6. Evidence verified.
7. Exact evidence boundary verified.
8. Semantic lineage verified.
9. Product/report definition verified where applicable.
10. User control verified where applicable.
11. UI surfaced correctly.
12. Interaction verified.
13. Deployment verified.
14. End-to-end certified.

Certification must be based on actual evidence and runtime proof, never on visual completeness or implementation appearance.

---

# 11. Permanent architectural rules

1. IRIS is one complete system.
2. IRIS is at the top of the hierarchy.
3. The entire application is part of the same hierarchy.
4. The UI is a traversal/presentation layer of the hierarchy, not a separate architecture.
5. The user journey is traversal through the hierarchy, not a third architectural layer.
6. Financial Life is part of the hierarchy.
7. Provider/user/authoritative evidence is part of the governed hierarchy.
8. Canonical state and relational ontology are part of the same hierarchy.
9. Intelligence and derived intelligence are part of the same hierarchy.
10. Reports, features, questions, explanations, education, scenarios, decisions, outcomes, and workspaces are traversal/presentation forms of the same hierarchy.
11. Forward and reverse traversal are mandatory.
12. Exact factual reverse traversal requires exact persisted lineage.
13. The hierarchy has no artificial semantic depth ceiling.
14. The UI has no artificial semantic depth ceiling.
15. The user journey has no artificial semantic depth ceiling.
16. Runtime, storage, latency, pagination, authorization, and materialization constraints are operational limits, not semantic limits.
17. Provider availability is not provider observation.
18. Authorization is not response receipt.
19. Response receipt is not persisted observation.
20. Persistence is not evidence certification.
21. Evidence certification is not intelligence consumption.
22. Intelligence definition is not intelligence execution.
23. Report definition is not a user-specific report result.
24. Products and Reports must never be artificially equal in count.
25. Unknown is never zero.
26. Prediction is not observation.
27. Scenario is not observation.
28. Correlation is not causation.
29. No lineage may be claimed without exact lineage.
30. No user-specific financial fact may be fabricated.
31. No AI-generated financial fact may be presented as real evidence.
32. Actual provider Sandbox data may be used only as actual Sandbox/provider evidence.
33. Statements remains architecturally present but currently deferred from the Sandbox evidence boundary.
34. Read-only boundaries remain enforced.
35. Every new build block must preserve synchronization among evidence, canonical state, ontology, intelligence, runtime, UI, and user traversal.

---

# 12. Definition of done

The IRIS build is not done because every screen exists.

It is not done because every capability exists.

It is not done because every report is defined.

It is not done because the intelligence graph is deep.

It is done when the **entire application operates as one governed, recursively traversable IRIS hierarchy** in which:

- real governed evidence can enter the hierarchy;
- canonical Financial-Life state is accurately formed;
- relationships are explicit and traversable;
- intelligence is derived only from supported evidence and transformations;
- derived intelligence can recursively compose without an artificial semantic ceiling;
- reports, features, education, explanations, questions, scenarios, decisions, outcomes, and workspaces faithfully expose supported portions of the graph;
- every user journey surface can traverse to deeper supported context;
- every factual result can traverse backward to its exact evidence where lineage exists;
- uncertainty and epistemic state remain explicit;
- Products and Reports remain distinct;
- no fake or fabricated financial content exists;
- read-only boundaries remain enforced;
- runtime and certification gates are independently proven; and
- the user can move through the system as one continuous financial-life intelligence experience.

**IRIS is one hierarchy. IRIS is one graph. IRIS is one financial-life intelligence ecosystem. There is no artificial semantic ceiling.**
