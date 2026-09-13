# IRIS Level 3 Recursive Intelligence Contract

**Status:** Active architecture and execution contract — 2026-09-13

## 1. Semantic definition

Level 3 is the first governed derived-intelligence layer above the certified Level 2 authoritative financial-life domains.

Level 3 is **not** a single capability, a Temporal layer, a 19-branch semantic tree, or a finite numbered intelligence system. The 19 capabilities are reusable operators/composition families. They may execute at different recursive depths, in different combinations, with multiple parents, cross-domain dependencies, and recursive downstream reuse.

The hierarchy remains one system:

```text
Certified Level 1 governance
        ↓
Certified Level 2 authoritative domains
        ↓
Applicable Level 3 operators
        ↓
Dependency-resolved recursive execution
        ↓
Semantic validation
        ↓
Certification
        ↓
Hierarchy materialization
        ↓
Level 3+ intelligence
```

There is no artificial semantic ceiling after Level 3.

## 2. Level 3 capability families

The current executable registry contains these 19 reusable capability families:

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

These names are operator identities, not semantic levels.

## 3. Governed dependency order

The current contract dependencies resolve into the following executable order for a full recursive request:

```text
temporal
financial_life_state
relational_ontology (after financial_life_state)
analysis (after temporal)
behavioral (after analysis)
pattern (after analysis + behavioral)
relationship (after pattern + relational_ontology)
anomaly (after analysis + temporal + behavioral + pattern)
causal (after relationship)
predictive (after causal + temporal)
risk (after analysis + behavioral + anomaly + predictive)
scenario (after predictive + risk)
decision (after scenario + risk)
recommendation (after decision)
opportunity (after analysis + behavioral + scenario + recommendation)
consequence (after risk + opportunity + scenario + decision)
outcome (after decision + recommendation)
learning (after outcome)
emergent (after the governed upstream intelligence available to its contract)
```

The actual runtime planner is authoritative for topological ordering and must reject missing contracts, unsupported operators, or dependency cycles.

## 4. Evidence and dependency boundary

A Level 3 run must have:

- an authenticated user boundary;
- a certified and published Level 2 parent run;
- the exact Level 2 parent execution and output hash;
- a governed current evidence boundary for any original evidence reused by operators;
- active capability contracts;
- implemented executable operators;
- exact dependency reads;
- semantic dependency proofs;
- execution lineage; and
- deterministic output hashes.

Original governed evidence may be reused at a deeper level where the applicable operator contract permits it. Level 3 therefore does not force every later operator to consume only the immediately previous node.

## 5. Execution contract

The recursive executor must:

1. resolve the capability graph;
2. reject duplicate paths and dependency cycles;
3. enforce execution budgets without turning them into a semantic depth limit;
4. execute dependencies before dependents;
5. verify every declared dependency was actually read;
6. verify required semantic dependency paths were actually accessed;
7. persist execution/audit lineage and semantic dependency proofs;
8. produce no authoritative hierarchy nodes before certification.

## 6. Output contract

Every capability result must preserve:

- capability identity;
- operator identity and version;
- evidence state;
- result value;
- upstream dependency identity;
- provenance;
- evidence boundary;
- run identity;
- evidence manifest identity; and
- limitations/uncertainty where applicable.

Insufficient evidence remains insufficient evidence. It is never promoted to observed truth and never converted to zero.

## 7. Certification and materialization

Level 3 is not published merely because the endpoint executes or a result row exists.

Required sequence:

```text
Level 2 parent verified
→ Level 3 evidence boundary established
→ capability plan resolved
→ recursive execution completed
→ semantic dependency proof passes
→ execution output persisted
→ validation persisted
→ certification persisted
→ certified hierarchy materialized
→ publication state becomes HIERARCHY_PUBLISHED
→ unified UI traverses the published hierarchy
```

Exact certification must bind the Level 3 run/execution to the Level 2 parent output hash.

## 8. User-facing hierarchy

The UI must not present Level 3 as a separate intelligence side or as a single Temporal feature. It presents Level 3+ as derived intelligence within the same hierarchy as the eight authoritative domains.

The user-facing surface may expose:

- capability family;
- evidence state;
- recursive depth where persisted;
- upstream relationship count;
- certification/publication state; and
- exact parent/lineage identifiers where appropriate.

Raw execution JSON is not a consumer-facing intelligence presentation.

## 9. Anti-fabrication

No Level 3 operator may invent financial observations, balances, transactions, outcomes, probabilities, causal claims, or confidence values. A derived claim must be supported by its governed inputs and declared semantic transformation.

## 10. Exit gate

Level 3 remains uncertified until the live authenticated screen proves:

1. the certified Level 2 parent is the actual parent;
2. the recursive capability graph is materially present;
3. displayed derived content maps to persisted Level 3 hierarchy nodes;
4. node lineage reaches execution output and governed evidence;
5. reverse traversal is exact for factual claims;
6. publication state is `HIERARCHY_PUBLISHED`; and
7. no fabricated content is present.

Only after those checks pass may the next recursive intelligence composition be treated as the next user-facing hierarchy stage.
