# IRIS Current State

**State date:** 2026-09-13

This document records the current implementation/proof boundary. Live runtime truth remains authoritative over documentation.

## 1. Canonical architecture

IRIS is one complete hierarchy intelligence relational ontology financial life state ecosystem. There are no two sides.

```text
Plaid/provider evidence
→ Supabase source of truth
→ LEVEL 1: governance / certification / lineage
→ LEVEL 2: authoritative financial domains
→ LEVEL 3+: recursive intelligence
→ unified IRIS surfaces
```

## 2. Level 1 boundary — authoritative correction

**Level 1 is governance only. It has no financial-content output.**

Level 1 establishes:

- authenticated user scope;
- the authoritative active Plaid Item boundary;
- evidence manifest and evidence hashes;
- execution identity;
- input/output binding;
- exact execution lineage;
- validation;
- certification;
- publication authorization for the governed hierarchy boundary;
- reverse lineage from the governance certificate to exact Supabase source records.

The Level 1 output is a governance certificate. It does not contain transaction, balance, spending, debt, asset, investment, identity, statement, or other financial-life content.

The authoritative contract is `docs/LEVEL1_GOVERNANCE_CONTRACT.md`.

## 3. Level 1 must not materialize financial hierarchy

A successful Level 1 run must create **zero**:

```text
iris_user_intelligence_nodes
iris_user_intelligence_edges
iris_user_intelligence_compositions
```

Those tables represent user-specific financial/intelligence hierarchy content and begin only at the appropriate later hierarchy stage.

The structural catalog in `iris_hierarchy_catalog_nodes` remains architecture metadata and is not user financial content.

## 4. Level 2 boundary

Level 2 is the first level that may materialize user financial content from the certified Level 1 evidence boundary.

The authoritative domains are:

1. Authentication
2. Transactions
3. Balance
4. Identity
5. Assets
6. Liabilities
7. Investments
8. Statements

Each domain retains its own evidence gate. Missing evidence remains unknown, unobserved, unavailable, deferred, or insufficient-evidence as appropriate. Unknown is never converted to zero.

## 5. Current Plaid/Supabase evidence boundary

The current active Plaid Item is the sole Level 1 candidate unless a later authenticated action explicitly changes that boundary. Historical disconnected Items remain preserved for audit lineage and must not be deleted merely to clean counts.

The normal provider refresh/resync path is separate from reconnect. A successful provider response does not automatically imply that new observations, a new evidence manifest, or a certified Level 1 run exists. Those states remain distinct.

## 6. Current runtime correction

The previous Level 1 implementation attempted to transform source rows into `level1_source_content` records and display those records as Level 1 content. That was architecturally incorrect.

The corrected implementation:

- reads only the governed source metadata required to establish evidence scope;
- records exact evidence hashes and source IDs;
- creates a governance certificate only;
- persists exact execution lineage from source evidence to the governance certificate;
- independently evaluates governance checks before certification;
- does not write user financial hierarchy nodes, edges or compositions;
- explicitly disables downstream levels until certification;
- points the user screen to governance/certification state only.

No financial values are created by Level 1.

## 7. Certification gate

Level 1 may certify only when:

1. authenticated user scope is valid;
2. exactly one active authoritative Item is bound;
3. real Supabase source evidence is present;
4. every evidence record has a hash;
5. the evidence manifest is persisted and hashed;
6. execution input is bound to the manifest;
7. exactly one governance output exists;
8. the output contains no financial content;
9. exact execution lineage is complete;
10. Level 1 financial hierarchy node/edge/composition counts are zero;
11. governance validation checks all pass;
12. certification persists after validation;
13. downstream levels remain disabled until certification.

## 8. Reverse lineage gate

The Level 1 screen must be traceable:

```text
screen governance certificate
→ certification hash
→ execution
→ run
→ evidence manifest
→ execution-lineage record
→ exact Supabase source record
→ provider observation/receipt lineage
```

The Level 1 screen does not need to expose raw financial values. Those values are verified at Level 2 when financial-domain content is first materialized.

## 9. User verification order

The current work stops at Level 1.

The required sequence is:

1. deploy corrected Level 1;
2. execute one real governed Level 1 run against the current authoritative Item;
3. independently audit the persisted run, execution, evidence, output, lineage, validation and certification records;
4. perform the reverse-lineage test;
5. user verifies the actual authenticated Level 1 screen;
6. only then begin Level 2.

## 10. Permanent truth rules

- Fake AI data is strictly prohibited.
- No fabricated financial facts.
- No fabricated provider observations.
- No unknown-as-zero substitution.
- No capability metadata treated as financial observation.
- No persistence row treated as semantic proof without the applicable validation.
- No certification claim without runtime proof.
- No two-side architecture.
- No reconnect merely to manufacture a downstream evidence event when resync already returned valid provider observations.
- No Level 2 financial content before Level 1 certification.
