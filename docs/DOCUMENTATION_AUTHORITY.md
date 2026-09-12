# IRIS Documentation Authority & Continuity Protocol

## Purpose

This document exists to prevent continuity drift between chats, repository documentation, deployed services, and the live Supabase state.

IRIS is **one complete hierarchy intelligence relational ontology financial life state ecosystem**.

There are no two IRIS sides. There is no separate Financial Life side and Intelligence side. There is no separate data-free Intelligence or Education side. There is no architecture in which user financial content is prohibited from an intelligence/education surface merely because of the surface name.

All evidence, financial-life state, ontology, intelligence, recursive intelligence, reports, features, questions, explanations, education, scenarios, decisions, actions, outcomes, learning, and workspaces are representations, transformations, execution paths, or traversal surfaces of the same governed hierarchy.

## 1. Authority order

When documents or chat context disagree, use this order:

1. **Live runtime/database evidence** — current GitHub main, deployed Render services, and current Supabase state are checked directly.
2. **Current GitHub implementation** — code, migrations, contracts, registry, tests, and committed configuration.
3. **This document and the current continuity documents** — architecture and proof rules that govern interpretation of the implementation.
4. **Prior conversation** — context only; never a substitute for current repository/runtime verification.
5. **Older documentation** — historical context only when it is not contradicted by the current authority chain.

A document may describe a required architecture, but it cannot be used as proof that the architecture is implemented or certified.

## 2. Mandatory pre-change audit

Before modifying anything:

1. Read the current relevant README and ROADMAP.
2. Read `docs/MASTER_STATE.md`, `docs/ARCHITECTURE.md`, `docs/DECISIONS.md`, and `docs/SESSION_HANDOFF.md`.
3. Inspect the exact current repository files involved in the change.
4. Inspect the relevant live Render service/deployment state.
5. Inspect the relevant live Supabase schema/data/runtime state.
6. Identify the exact defect and its upstream/downstream dependencies.
7. Record the current verification boundary before changing it.

No blind changes are permitted.

## 3. Mandatory post-change audit

After every material change:

1. Re-read every changed file.
2. Verify the resulting GitHub commit.
3. Run the applicable build/tests/static checks.
4. Verify the affected Render deployment.
5. Verify the affected Supabase state.
6. Exercise the affected runtime path where authenticated execution is available.
7. Compare forward and reverse lineage where applicable.
8. Search for stale terminology or contradictory documentation introduced by the change.
9. Update continuity documents with the actual verified state.
10. State any remaining unverified boundary explicitly.

A successful compilation or deployment is not end-to-end proof.

## 4. Single-system architecture rule

The canonical hierarchy is:

```text
IRIS
→ Financial-Life Reality / State
→ Provider / User / Authoritative Evidence
→ Observed State
→ Canonical Financial-Life State
→ Relational Ontology
→ Temporal / Statistical / Behavioral / Causal Intelligence
→ Risk / Opportunity / Prediction / Scenario
→ Decision / Consequence / Outcome / Learning
→ Cross-Domain Intelligence
→ Higher-Order Intelligence
→ Recursive Derived Intelligence
→ Features / Reports / Questions / Explanations / Education / Workspaces
→ User
```

Forward traversal and reverse traversal are both first-class requirements.

## 5. Evidence truth rules

Always distinguish:

`available ≠ consented ≠ authorized ≠ provider response received ≠ observation persisted ≠ evidence certified ≠ normalized ≠ intelligence-consumable ≠ intelligence consumed`

Also distinguish:

`unknown ≠ unavailable ≠ unobserved ≠ hypothetical ≠ predicted ≠ inferred ≠ derived ≠ observed`

Unknown is never silently represented as zero.

Persistence is not semantic proof. Provider capability metadata is not provider observation. Prediction is not observation. Scenario is not observation. Correlation is not causation.

## 6. Anti-fabrication rule

**Fake AI data is strictly prohibited.**

Never create or present as user financial truth:

- fake AI-generated financial values;
- fabricated users, accounts, transactions, balances, income, debt, spending, or provider observations;
- invented report results or outcomes;
- invented probabilities or confidence values;
- catalog metadata as evidence;
- availability, consent, authorization, entitlement, or billing state as observation;
- missing evidence as zero.

Actual Plaid Sandbox observations may be used as Sandbox test evidence and must remain explicitly Sandbox evidence. Technical unit-test mocks may isolate infrastructure behavior but must never become production financial evidence.

## 7. Products, reports, and intelligence

Provider Products, IRIS Report Products, produced results, certified results, and intelligence nodes are independent concepts.

```text
Provider Product count ≠ Report Product count
Report Product count ≠ produced result count
produced result count ≠ certified result count
```

No count is manufactured for visual symmetry.

The intelligence hierarchy is not a separate user side. Reports are not the only expression of intelligence. Any IRIS surface may expose supported portions of the hierarchy when evidence, derivation, lineage, uncertainty, runtime state, authorization, and publication rules permit it.

## 8. Current provider boundary

The eight authoritative domains remain:

1. Authentication
2. Transactions
3. Balance
4. Identity
5. Assets
6. Liabilities
7. Investments
8. Statements

Statements remains architecturally authoritative but is deferred from the current Sandbox evidence boundary until real banking. It must never be simulated to make the architecture appear complete.

The verified Plaid Sandbox → Supabase ingestion result must be scoped precisely to the Item/data path that was actually tested. Broader multi-Item or future runtime claims require their own reconciliation and proof.

## 9. Certification rule

The governing progression is:

`Architecture Defined → Contract Defined → Schema Implemented → Runtime Implemented → Independently Executable → Evidence Verified → Exact Evidence Boundary Verified → Semantic Lineage Verified → Product/Report Defined → Product/Report User-Controlled → Product/Report Surfaced → Interaction Verified → Deployment Verified → End-to-End Certified`

No later state implies an earlier state is certified.

## 10. Current implementation target

The immediate build target is the complete IRIS experience as one governed hierarchy:

- fix the recursive intelligence runtime until real governed evidence can produce valid execution outputs;
- preserve exact Item/user evidence scope;
- materialize exact intelligence graph lineage;
- make every registered UI route express its real function rather than a generic substitute;
- make every visible interaction execute its intended supported behavior;
- normalize IRIS visual cognition across all surfaces;
- preserve truthful insufficient-evidence, unavailable, deferred, loading, and error states;
- prove forward and reverse traversal; and
- certify only after authenticated end-to-end verification.

No implementation step may bypass the evidence boundary to make the UI look complete.
