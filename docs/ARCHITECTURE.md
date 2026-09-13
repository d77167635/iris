# IRIS Architecture

## 1. Authoritative definition

IRIS is **one complete hierarchy intelligence relational ontology financial life state ecosystem** and a **Relational Financial Intelligence Operating System**.

There are no separate Financial Life and Intelligence sides. Evidence, canonical state, ontology, intelligence, reports, questions, explanations, education, scenarios, decisions, outcomes and workspaces are traversal surfaces of the same recursively extensible hierarchy.

```text
IRIS
 ↓
Authoritative evidence
 ↓
Observed state
 ↓
Canonical Financial-Life State
 ↓
Relational Ontology
 ↓
Derived Intelligence
 ↓
Higher-Order / Recursive Intelligence
 ↓
Reports / Questions / Explanations / Education / Scenarios / Decisions / Outcomes
 ↓
User
```

The structure is a graph, not a finite tree or fixed pipeline. Nodes may have multiple parents, cross-domain dependencies, temporal relationships and recursive ancestry. There is no artificial semantic depth ceiling.

## 2. Current authoritative write state — 2026-09-13

Level 1 governance is certified. Level 2 authoritative domain intelligence is certified and published. Level 3 recursive intelligence infrastructure is implemented and is the current certification target.

The current Level 2 certified run is:

- run: `5a0af473-f2a9-43a4-bbe4-7b0b04aa5df3`
- execution: `9586ea77-9d14-4c1f-8da6-86b99ab77c3c`
- status: `CERTIFIED`
- publication: `HIERARCHY_PUBLISHED`
- nodes: `10`
- edges: `4`
- compositions: `10`
- execution lineage: `340`

Level 3+ must add governed derived intelligence to the existing hierarchy. It must not replace, duplicate, or restate Level 2 as a separate hierarchy.

## 3. Eight authoritative evidence domains

1. Authentication
2. Transactions
3. Balance
4. Identity
5. Assets
6. Liabilities
7. Investments
8. Statements

Statements may remain deferred/insufficient-evidence when real evidence is unavailable. Deferred evidence is never fabricated.

## 4. Evidence truth contract

```text
available
≠ consented
≠ authorized
≠ provider response received
≠ persisted
≠ evidence certified
≠ normalized
≠ intelligence-consumable
≠ intelligence consumed
```

Also:

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

Unknown is never silently converted to zero.

## 5. Level 2 → Level 3 boundary

```text
REAL SUPABASE / PLAID EVIDENCE
        ↓
LEVEL 1 GOVERNANCE
        ↓
LEVEL 2 AUTHORITATIVE DOMAINS
        ↓
LEVEL 3 APPLICABLE RECURSIVE OPERATORS
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
UNIFIED IRIS SURFACES
```

Level 3 is not a Temporal-only stage and is not a fixed 19-level tree. The 19 capabilities are reusable operators/composition families.

## 6. The 19 reusable capability families

1. Temporal
2. Financial Life State
3. Relational Ontology
4. Analysis
5. Behavioral
6. Pattern
7. Relationship
8. Anomaly
9. Causal
10. Predictive
11. Scenario
12. Decision
13. Recommendation
14. Risk
15. Opportunity
16. Consequence
17. Outcome
18. Learning
19. Emergent

A capability may operate at multiple semantic depths and may combine with other capabilities recursively. The registry does not define a semantic ceiling.

## 7. Governed dependency model

The runtime planner resolves dependencies topologically. Current declared dependencies include:

```text
analysis ← temporal
behavioral ← analysis
pattern ← analysis + behavioral
relationship ← pattern + relational_ontology
anomaly ← analysis + temporal + behavioral + pattern
causal ← relationship
predictive ← causal + temporal
risk ← analysis + behavioral + anomaly + predictive
scenario ← predictive + risk
decision ← scenario + risk
recommendation ← decision
opportunity ← analysis + behavioral + scenario + recommendation
consequence ← risk + opportunity + scenario + decision
outcome ← decision + recommendation
learning ← outcome
emergent ← governed upstream intelligence
```

Financial Life State and Relational Ontology provide foundational/cross-domain structure. The exact execution order is determined by the active contracts and planner, not by a fixed numbered semantic sequence.

## 8. Recursive execution

The recursive executor must:

- resolve active contracts;
- reject duplicate paths and cycles;
- execute dependencies before dependents;
- prove declared dependency reads;
- prove required semantic paths were accessed;
- preserve execution lineage and semantic dependency proofs;
- enforce resource budgets without treating them as semantic depth limits; and
- write no authoritative hierarchy nodes before certification.

Original governed evidence may be reused at deeper stages when an operator contract permits it. A later node is not restricted to only its immediate parent.

## 9. Certification boundary

A successful endpoint, database row, compiled build, deployment or visible UI is not certification.

The required sequence is:

`Evidence → Planning → Execution → Semantic Validation → Output Persistence → Validation Persistence → Certification → Hierarchy Materialization → Publication → Forward/Reverse UI Verification`.

Level 3 certification must bind the Level 3 execution to the exact certified Level 2 parent execution/output hash.

## 10. User-facing hierarchy

The UI is part of the hierarchy. It must not present a separate intelligence side and must not expose raw execution JSON as the consumer-facing intelligence product.

Every factual result must be traceable through persisted hierarchy/lineage to governed evidence. Reverse traversal is mandatory for certification.

## 11. Anti-fabrication boundary

Fake AI data is strictly prohibited.

No production financial observation, transaction, balance, income, debt, spending value, outcome, probability, confidence value or causal conclusion may be fabricated.

Actual Plaid Sandbox observations may be used only as explicitly identified Sandbox evidence. Missing evidence remains missing/insufficient evidence.

## 12. Publication boundary

Authoritative hierarchy materialization is post-certification only. The database publication guards and runtime certification path must independently enforce this rule.

Provider Product metadata is not user-specific evidence. A catalog entry is not a result. Persistence is not semantic proof.

## 13. Permanent architectural rules

1. One IRIS system.
2. One complete hierarchy.
3. One relational ontology financial-life state ecosystem.
4. No two-side architecture.
5. Any IRIS surface may expose supported governed hierarchy content.
6. Evidence and intelligence remain one graph.
7. No fake AI data.
8. No fabricated financial facts.
9. No unknown-as-zero substitution.
10. No provider capability/evidence confusion.
11. No observation/derivation/prediction/scenario confusion.
12. No lineage claim without exact persisted lineage.
13. No artificial semantic depth ceiling.
14. Forward and reverse traversal are mandatory.
15. Provider Product and Report Product counts remain independent.
16. Read-only money-movement boundaries remain enforced.
17. Authoritative hierarchy writes remain certification/publication gated.
18. Capability infrastructure is not itself user-specific hierarchy intelligence.
19. Documentation must remain synchronized with live runtime/database proof.
20. Documentation never substitutes for runtime proof.
