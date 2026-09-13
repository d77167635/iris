# IRIS Level 2 Recursive Derivation Engine

**Status:** Architectural execution contract — Level 2 only
**Purpose:** Map certified evidence into the eight Level 2 domain intelligences and establish the recursive substrate for Level 3+

## 1. Execution graph

```text
Certified Level 1 Governance
        ↓
Exact evidence boundary
        ↓
Evidence/domain applicability resolver
        ↓
Level 2 domain planners
        ↓
Canonical field construction
        ↓
Domain relationships
        ↓
Derived-field operators
        ↓
Domain intelligence operators
        ↓
Cross-domain dependency resolver
        ↓
Validation
        ↓
Certification
        ↓
Post-certification hierarchy materialization
        ↓
Level 2 nodes / edges / compositions / lineage
        ↓
Eligible Level 3 inputs
```

The recursive executor computes. The authoritative hierarchy persistence layer materializes only after certification.

## 2. Inputs

The engine accepts:

- authenticated `user_id`;
- exact certified Level 1 `run_id`;
- exact certified Level 1 `execution_id`;
- evidence manifest/hash;
- certified evidence records;
- source field observations;
- canonical records already derived from governed evidence;
- active capability contracts;
- operator registry;
- domain applicability metadata.

No provider API is called by the derivation engine to manufacture missing evidence.

## 3. Planning

The existing capability planner remains the dependency resolver. It already resolves capability contracts, dependency order, executable operators, evidence availability, hierarchy catalog structure, cycles, resource estimates, and limitations.

Level 2 adds a domain applicability stage before an operator may consume an input:

```text
source evidence
   ↓
domain applicability
   ↓
input contract satisfied?
   ├── yes → eligible
   └── no  → insufficient_evidence / unavailable / deferred
```

The planner must not treat a provider capability or catalog entry as observed evidence.

## 4. Domain assembly

For each of the eight domains:

```text
Domain
  → select certified observations
  → normalize canonical representation
  → preserve source-field lineage
  → construct domain entities
  → construct domain relationships
  → calculate deterministic domain fields
  → evaluate applicable operators
  → emit governed domain intelligence
```

A domain may consume inputs from another domain when its contract declares the dependency.

## 5. Combinational derivation

The engine supports three input classes:

### A. Source + source

```text
source field A + source field B → derived field C
```

### B. Source + derived

```text
source field A + Level 2 field B → derived intelligence C
```

### C. Derived + derived

```text
Level 2 node A + Level 2 node B → higher-order node C
```

All three require explicit upstream references and deterministic provenance.

## 6. Multiple-parent composition

A derived node can have one or many parents.

```text
Transactions ───────┐
                    ├──→ derived intelligence
Balance ────────────┤
                    │
Liabilities ────────┘
```

The engine records every parent, its role, its node hash, and its lineage.

## 7. Recursive derivation

The recursive engine does not use a fixed semantic depth.

```text
Level 2 node
   ↓
operator
   ↓
new node
   ↓
operator
   ↓
new node
   ↓
operator
   ↓
...
```

Actual `recursive_depth` is calculated from upstream ancestry. A runtime materialization budget may limit execution, but it must never be represented as a semantic intelligence ceiling.

## 8. Reuse of original evidence

Every recursive stage may reference original certified evidence where its contract permits it. A child node is not restricted to only the immediate parent output.

Therefore:

```text
Original Supabase evidence
        ↓
Level 2 derived field
        ↓
Level 3 intelligence
        ↓
Level 4 intelligence
```

and also:

```text
Original Supabase evidence
        ├──────────────→ Level 4 input
        └──────────────→ Level 2 input
```

This prevents information loss through forced parent-only chaining.

## 9. Operator contract

Every derivation operator must declare:

- operator identifier;
- operator version;
- input types;
- required domains;
- required evidence states;
- dependencies;
- output type;
- output schema;
- validation rules;
- lineage requirements;
- resource limits;
- recursion eligibility;
- cross-domain eligibility;
- user-control policy.

An operator cannot silently consume unsupported data.

## 10. Output contract

Every generated field/node must include:

```text
identity
value
value_type
evidence_state
derivation_operator
derivation_version
source_inputs
upstream_nodes
source_field_paths
evidence_boundary
as_of
provenance
output_hash
limitations
```

For intelligence nodes, persistence additionally records recursive ancestry and depth.

## 11. Validation pipeline

```text
Input validation
→ domain applicability
→ semantic dependency validation
→ operator execution
→ output schema validation
→ evidence-state validation
→ lineage validation
→ ownership/isolation validation
→ deterministic hash validation
→ certification
```

Any failed gate prevents authoritative materialization.

## 12. Materialization boundary

The existing persisted intelligence graph is the target persistence substrate.

The application must not write authoritative hierarchy nodes before certification. The persistence layer must independently enforce the exact certified run requirement.

After certification:

```text
node
edge
composition
execution lineage
```

are materialized together as governed hierarchy artifacts.

## 13. Level 2 certification gate

Level 2 passes only when all applicable domain branches satisfy:

- correct authenticated user;
- exact certified Level 1 parent run;
- exact evidence boundary;
- correct domain assignment;
- no fabricated values;
- no unknown-as-zero substitutions;
- all outputs have input lineage;
- all derived fields have operator/version provenance;
- all cross-domain edges have declared dependencies;
- recursive ancestry is internally consistent;
- output hashes are reproducible;
- validation passes;
- certification is persisted;
- post-certification hierarchy materialization matches execution output;
- reverse traversal reaches the original governed evidence.

Statements may legitimately remain deferred/insufficient-evidence without failing the other supported domains, provided the deferred state is explicit and governed.

## 14. Level 3 handoff

Level 3 is not executed by this contract. The Level 2 output becomes the certified input substrate for the next intelligence layer.

The handoff is:

```text
Certified Level 2 domain intelligence
        ↓
eligible operators
        ↓
new derived intelligence
        ↓
recursive/cross-domain composition
```

Level 3 must not begin until Level 2 has been independently verified on the authenticated user screen.

## 15. Product presentation boundary

The engine emits structured intelligence, not a conversation transcript. User-facing presentation must transform that structure into professional fintech information architecture with clear domain navigation, readable primary values, drill-down detail, evidence/lineage inspection, and scalable search/filtering.

Internal execution terminology is never substituted for consumer-facing financial language.
