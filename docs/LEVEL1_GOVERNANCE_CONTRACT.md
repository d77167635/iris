# IRIS Level 1 Governance Contract

**Effective:** 2026-09-13

## Purpose

Level 1 is the **IRIS Master Governor**. It is a governance, evidence-boundary, certification and lineage layer.

**Level 1 does not produce financial-life content.**

The first user-facing financial content begins at Level 2, where the eight authoritative domains are materialized from the certified evidence boundary.

## Authoritative sequence

```text
Plaid/provider response
        ↓
Supabase source observations
        ↓
Level 1 governance boundary
        ↓
Evidence manifest
        ↓
Execution identity
        ↓
Input/output hashes
        ↓
Exact execution lineage
        ↓
Independent governance validation
        ↓
Level 1 certification
        ↓
Level 2 domain access/content
        ↓
Level 3+ intelligence
```

Level 1 governs the evidence. It does not interpret that evidence into balances, transactions, spending, debt, assets, identity facts, investment state, or other financial content.

## Level 1 may create

- `iris_runs` execution identity and evidence boundary;
- `iris_execution_records` execution state;
- `iris_run_evidence` evidence manifest records and source hashes;
- `iris_execution_inputs` manifest/input binding;
- one `iris_execution_outputs` governance certificate;
- `iris_execution_lineage` records connecting exact source records to the governance certificate;
- `iris_validation_results` governance checks;
- `iris_certifications` certification state and certification hash;
- run/execution publication state indicating the governance gate passed.

These are governance artifacts, not financial-life observations.

## Level 1 must not create

Level 1 must not create user financial content or derived financial intelligence, including:

- transaction content;
- balance content;
- identity content;
- asset content;
- liability content;
- investment content;
- statement content;
- spending results;
- cash-flow results;
- debt analysis;
- projections;
- recommendations;
- anomaly findings;
- causal conclusions;
- predictions;
- scenarios;
- report content;
- user intelligence nodes representing financial facts;
- user intelligence edges or compositions representing financial relationships.

`iris_user_intelligence_nodes`, `iris_user_intelligence_edges`, and `iris_user_intelligence_compositions` therefore remain zero for a successful Level 1 governance run.

## Level 1 output contract

The Level 1 output is a **governance certificate**, not a financial-content payload.

It may contain:

- hierarchy level;
- artifact type;
- governance role;
- source-of-truth identifier;
- evidence state;
- evidence boundary timestamp;
- evidence manifest hash;
- authoritative Item scope hash;
- exact evidence record count;
- exact source-table counts;
- flags proving no financial content was created;
- downstream-level enablement state;
- next content level.

It must not contain the underlying financial values.

## Level 2 handoff contract

Level 2 may execute only from a **certified Level 1 run**.

Level 2 receives:

1. the certified run ID;
2. the certified execution ID;
3. the certified evidence-manifest hash;
4. the bounded authoritative Item scope;
5. the exact governed evidence available inside that boundary;
6. the Level 1 certification hash;
7. the persisted source/field lineage needed for reverse traversal.

Level 2 then independently governs and materializes the applicable authoritative domains:

1. Authentication
2. Transactions
3. Balance
4. Identity
5. Assets
6. Liabilities
7. Investments
8. Statements

A domain may remain `unknown`, `unobserved`, `unavailable`, `deferred`, or `insufficient_evidence` when its evidence does not support content. No missing evidence may be converted into zero or a fabricated result.

## Certification gate

Level 1 passes only when all of the following are true:

1. authenticated user scope is valid;
2. exactly one authoritative active Item is bound for the run;
3. evidence is read from real Supabase source records;
4. every evidence record has an exact evidence hash;
5. the evidence manifest is persisted and hashed;
6. execution input is bound to that manifest;
7. exactly one governance certificate output exists;
8. the governance output contains no financial content;
9. exact execution lineage exists from each evidence record to the governance output;
10. the existing field-lineage boundary is measured for the authoritative Item;
11. no Level 1 financial nodes, edges or compositions are created;
12. all governance validation checks independently evaluate to PASS;
13. certification is persisted only after validation passes;
14. downstream levels remain disabled until Level 1 certification is complete.

## Reverse-lineage test

The Level 1 screen must be able to identify:

```text
screen governance certificate
        ↓
certification hash
        ↓
execution ID
        ↓
run ID
        ↓
evidence manifest hash
        ↓
exact execution-lineage record
        ↓
exact Supabase source table + record ID
        ↓
provider observation/receipt lineage
```

The reverse test does not require exposing raw financial values on the Level 1 screen. Those values are verified at Level 2 when the corresponding domain content is materialized.

## User-screen rule

The Level 1 screen must show governance/certification state only.

It must not display a transaction, balance, liability amount, merchant, account balance, spending result, or other financial-life content as a Level 1 result.

The screen must explicitly communicate that **Level 2 is where financial content begins**.

## Anti-fabrication rule

No fake AI data is permitted. Level 1 may summarize counts, hashes, states and lineage identifiers that actually exist in Supabase. It may never manufacture financial facts to make the governance screen appear populated.
