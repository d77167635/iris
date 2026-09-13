# IRIS

**IRIS is a Relational Financial Intelligence Operating System.**

IRIS is **one complete hierarchy intelligence relational ontology financial life state ecosystem**.

There are no two sides, no separate Financial Life side and Intelligence side, and no separate data-free Intelligence/Education side. Financial Life, Evidence, Understand, Intelligence, Reports, Scenarios, Decisions, Action, Outcomes, Connect, questions, explanations, education and workspaces are traversal surfaces of the same governed hierarchy.

## The authoritative hierarchy

The structural hierarchy now has an explicit, governed Level 3 capability layer. The Level 3 catalog is structural ontology only. It creates no user financial observations and is never treated as financial evidence.

```text
LEVEL 1
IRIS
MASTER INTELLIGENCE / MASTER GOVERNOR
        │
        ▼
LEVEL 2
8 AUTHORITATIVE DOMAINS
        │
        ├── Authentication
        ├── Transactions
        ├── Balance
        ├── Identity
        ├── Assets
        ├── Liabilities
        ├── Investments
        └── Statements
        │
        ▼
LEVEL 3
19 REGISTERED INTELLIGENCE CAPABILITIES
        │
        ├── Temporal
        ├── Financial Life State
        ├── Relational Ontology
        ├── Analysis
        ├── Behavioral
        ├── Pattern
        ├── Relationship
        ├── Anomaly
        ├── Causal
        ├── Predictive
        ├── Scenario
        ├── Decision
        ├── Recommendation
        ├── Risk
        ├── Opportunity
        ├── Consequence
        ├── Outcome
        ├── Learning
        └── Emergent
        │
        ▼
LEVEL 4+
RECURSIVE HIERARCHY INTELLIGENCE
        │
        ├── domain intelligence
        ├── subdomain intelligence
        ├── entity intelligence
        ├── relationship intelligence
        ├── derived intelligence
        ├── cross-domain compositions
        ├── higher-order intelligence
        └── further recursively derived intelligence
```

The 19 capabilities are therefore **inside the hierarchy immediately after the eight authoritative domains**. They are not a separate architecture and they are not a semantic depth ceiling.

Each Level 3 capability applies across the authoritative domains. For example, Temporal can operate on Transactions, Balance, Identity, Assets, Liabilities, Investments and any other domain where governed evidence supports it. The same applies to the other registered capabilities. Domain-to-capability applicability is represented explicitly in the hierarchy catalog.

Level 4 and deeper intelligence is not a fixed list. It is generated only from real governed evidence and legitimately derived upstream intelligence. The semantic hierarchy has no artificial maximum depth.

## Structural hierarchy catalog

The authoritative structural catalog is persisted in:

- `public.iris_hierarchy_catalog_nodes`
- `public.iris_hierarchy_catalog_edges`

The catalog contains only IRIS structural definitions:

```text
IRIS
  → 8 authoritative domains
      → 19 registered intelligence capabilities
```

There are 8 structural `contains` edges from IRIS to the domains and 152 structural `applies_to` edges connecting the 19 capabilities to the 8 domains.

These are ontology definitions, not user financial observations.

## Real user intelligence

Structural catalog ≠ user intelligence.

User-specific hierarchy intelligence remains subject to the hard certification boundary:

```text
REAL SUPABASE / PLAID EVIDENCE
        ↓
EVIDENCE BOUNDARY
        ↓
LEVEL 1 GOVERNANCE / VALIDATION
        ↓
LEVEL 2 DOMAIN ACCESS
        ↓
LEVEL 3 CAPABILITY EXECUTION
        ↓
RECURSIVE INTELLIGENCE
        ↓
SEMANTIC DEPENDENCY VALIDATION
        ↓
EXECUTION OUTPUT
        ↓
VALIDATION
        ↓
CERTIFICATION
        ↓
AUTHORITATIVE USER HIERARCHY MATERIALIZATION
        ↓
NODES / EDGES / COMPOSITIONS / LINEAGE
        ↓
CERTIFIED INTELLIGENCE
```

No failed or uncertified execution may create authoritative user hierarchy nodes, edges, compositions or intelligence-node lineage. The database enforces this boundary independently of application code.

A structural catalog entry must never be presented as though it were a user's financial fact.

## Current authoritative user state

After removal of pre-certification artifacts, the legitimate user-specific state remains:

```text
iris_user_intelligence_nodes          = 0
iris_user_intelligence_edges         = 0
iris_user_intelligence_compositions  = 0
hierarchy-intelligence lineage       = 0
iris_certifications                  = 0
published certified intelligence     = 0
```

This is intentional. The system must earn its first authoritative user hierarchy through a real governed run and certification. The presence of the structural hierarchy catalog does not change that fact.

## Execution model

The 19 capabilities are executable intelligence operators/families within the hierarchy. Their persisted contracts remain in `public.iris_capability_contracts`.

The capability planner now resolves both:

1. the executable capability dependency graph; and
2. the authoritative IRIS hierarchy catalog.

A full-intelligence request therefore cannot silently execute a capability that is absent from the Level 3 hierarchy catalog, and a Level 3 catalog capability cannot silently exist without an executable governed capability contract.

## Recursive intelligence

Recursive intelligence begins immediately at Level 2 when governed evidence makes a domain eligible. It does not wait for all eight domains to finish as one monolithic batch.

The recursion model is:

```text
Domain
  ↓
Subdomain
  ↓
Entity
  ↓
Relationship
  ↓
Derived intelligence
  ↓
Higher-order intelligence
  ↓
Cross-domain composition
  ↓
Further recursive intelligence
```

Runtime resource budgets may limit one execution's materialization. They are operational limits, not semantic limits on what IRIS can represent.

## Evidence truth

IRIS always distinguishes:

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

It also distinguishes:

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

Unknown is never silently represented as zero. Prediction is not observation. Scenario is not observation. Correlation is not causation. Persistence is not semantic proof.

## Eight authoritative domains

1. Authentication
2. Transactions
3. Balance
4. Identity
5. Assets
6. Liabilities
7. Investments
8. Statements

Statements is architecturally authoritative but remains deferred from the current Sandbox evidence boundary until real banking. It must never be simulated or fabricated.

## Plaid → Supabase boundary

Plaid is an external provider/source capability within the same IRIS hierarchy. The verified ingestion path is scoped to the specific Sandbox Item/data path actually tested. Broader multi-Item and future-runtime claims require their own reconciliation.

Provider capability metadata is not financial evidence. A provider product being available or requested does not prove that its response was received or persisted.

## Products and Reports

Provider Products and IRIS Report Products are independent concepts.

```text
Provider Product count ≠ Report Product count
Report Product count ≠ produced result count
produced result count ≠ certified result count
```

Counts must come from their own governed catalog/runtime state. No number is fabricated for visual symmetry.

## Anti-fabrication rule

**Fake AI data is strictly prohibited.**

Never manufacture or present as user truth:

- users;
- accounts;
- transactions;
- balances;
- income;
- debt;
- spending;
- provider observations;
- report results;
- outcomes;
- probabilities or confidence values;
- causal claims; or
- any other financial fact.

Actual Plaid Sandbox observations are allowed as Sandbox test evidence only and must remain explicitly Sandbox evidence. Technical test mocks cannot become production financial evidence.

Structural ontology definitions such as the IRIS root, eight domains, and 19 capability names are architecture metadata, not fabricated financial data. They must never be rendered as observed financial content.

When evidence is missing, IRIS uses truthful insufficient-evidence, unavailable, deferred, unknown, or not-observed states.

## UI and user journey

The UI is part of the hierarchy. It is not a second architecture.

The intelligence read path now exposes the governed hierarchy catalog alongside certified user intelligence. This lets the UI render the actual structural hierarchy without inventing user financial content.

Any IRIS surface may expose any supported portion of the hierarchy when governed evidence and legitimate derivation permit it. User-specific content is not prohibited from an intelligence or education surface merely because of the surface name.

The current product journey is:

`Financial Life → Change → Understand → Evidence → Intelligence → Reports → Scenarios → Decisions → Action → Outcomes → Connect`

This is a traversal order, not a division into architectural sides.

Every route and control must be backed by a real supported behavior and truthful loading, empty, insufficient-evidence, unavailable, deferred and error state. A visible button is not proof of functionality.

## Certification and proof

The full proof chain is:

`Architecture Defined → Contract Defined → Schema Implemented → Runtime Implemented → Independently Executable → Evidence Verified → Exact Evidence Boundary Verified → Semantic Lineage Verified → Product/Report Defined → Product/Report User-Controlled → Product/Report Surfaced → Interaction Verified → Deployment Verified → End-to-End Certified`
