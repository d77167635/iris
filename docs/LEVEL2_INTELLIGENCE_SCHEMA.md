# IRIS Level 2 Intelligence Schema

**Status:** Architectural contract — Level 2 only
**Authority:** Master Build Prompt + live backend contracts
**Scope:** Eight authoritative financial-life domain intelligences

## 1. Purpose

Level 2 is the first content-producing intelligence layer beneath IRIS governance. It consumes only the certified Level 1 evidence boundary and produces evidence-backed domain intelligence.

Level 2 is not a copy of provider records and is not a flat report feed. It creates governed domain state, derived fields, relationships, and domain intelligence from combinations of authoritative evidence.

No Level 2 output may be presented as observed provider truth unless its evidence state is `OBSERVED`. Calculated, normalized, inferred, predicted, scenario, or derived outputs must retain their epistemic state.

## 2. Fixed Level 2 branches

1. Authentication
2. Transactions
3. Balance
4. Identity
5. Assets
6. Liabilities
7. Investments
8. Statements

Statements remains structurally present but is executable/materializable only when the certified evidence boundary actually contains supported statement evidence. It must never be simulated.

## 3. Domain intelligence node contract

Every materialized Level 2 intelligence node must contain or deterministically derive:

- `user_id`
- `run_id`
- `execution_id`
- `node_type`
- `level = 2`
- `domain_key`
- `intelligence_key`
- `intelligence_name`
- `derivation_operator`
- `derivation_version`
- `evidence_state`
- `value`
- `as_of`
- `evidence_boundary`
- `provenance`
- `node_hash`
- `upstream_node_ids`
- `recursive_ancestry`
- `recursive_depth`

The existing persisted intelligence graph remains the persistence substrate. Level 2 extends its semantic contract rather than creating a second graph.

## 4. Domain state

Each domain materialization has a domain envelope:

```text
DomainState {
  domain_key
  evidence_state
  evidence_boundary
  source_scope
  canonical_fields[]
  derived_fields[]
  relationships[]
  domain_intelligence[]
  limitations[]
  provenance
  lineage
  freshness
}
```

### 4.1 Canonical fields

Canonical fields are normalized representations of governed observations. They preserve exact source lineage and never replace the original observation.

### 4.2 Derived fields

A derived field is created only by a deterministic or governed intelligence operator whose inputs are explicitly recorded.

```text
DerivedField {
  field_key
  label
  value
  value_type
  evidence_state
  derivation_operator
  derivation_version
  source_inputs[]
  upstream_nodes[]
  source_field_paths[]
  as_of
  evidence_boundary
  provenance
  output_hash
}
```

A derived field may consume:

- original certified source observations;
- canonical fields;
- other Level 2 derived fields;
- previously certified intelligence nodes;
- cross-domain inputs when the operator contract permits them.

### 4.3 Relationships

Relationships are first-class graph objects, not UI-only joins.

```text
Relationship {
  relation_type
  from_node_id
  to_node_id
  domain_keys[]
  evidence_state
  basis
  derivation_operator
  provenance
  lineage
}
```

A relationship may have multiple domain parents.

## 5. Domain-specific semantic envelopes

### Authentication

Identity/access state derived from actual authorization and Item evidence. It must distinguish authorization state from provider capability and observation state.

### Transactions

Canonical transaction identity, classification, temporal association, account association, merchant/category relationships, economic role, and other evidence-supported transaction fields.

### Balance

Observed balance state and evidence-backed temporal/account relationships. No balance is inferred from transaction activity when balance evidence is absent.

### Identity

Observed identity information and normalized identity relationships where the evidence boundary supports them. Missing identity evidence remains missing.

### Assets

Observed asset/account/holding information where supported, with canonical separation of asset entities and provider representations.

### Liabilities

Observed liability state, obligations, account relationships, and supported terms. A liability is never inferred solely from a transaction pattern.

### Investments

Investment account, security, holding, investment transaction, and valuation observations remain separate canonical concepts.

### Statements

Architectural domain only until supported statement evidence exists.

## 6. Cross-domain contract

Level 2 domains are not silos. A domain node may consume certified inputs from another domain when the operator contract explicitly permits the relationship.

Examples of valid structural combinations include:

```text
Transactions + Balance
Transactions + Liabilities
Transactions + Identity
Assets + Balance
Investments + Balance
Liabilities + Balance
Transactions + Assets + Balance
```

These are dependency possibilities, not claims that a particular result exists. A combination produces output only when the actual evidence and operator requirements are satisfied.

## 7. Evidence states

The schema preserves the distinction:

```text
available
≠ authorized
≠ provider response received
≠ persisted
≠ evidence-certified
≠ normalized
≠ intelligence-consumable
≠ consumed
```

And:

```text
OBSERVED
CALCULATED
INFERRED
PREDICTED
SCENARIO
INSUFFICIENT_EVIDENCE
```

The implementation must never convert insufficient evidence to zero or invent a value to satisfy a schema field.

## 8. Certification requirements

A Level 2 node may become authoritative only when:

1. its Level 1 run is certified;
2. its exact evidence boundary is recorded;
3. every input is owned by the same user and governed run where required;
4. every source field or upstream node has lineage;
5. the derivation operator and version are recorded;
6. the output is deterministically hashed;
7. validation passes;
8. certification succeeds;
9. hierarchy materialization occurs only after certification.

## 9. Recursive compatibility

Level 2 is deliberately compatible with the existing unbounded recursive graph. `recursive_depth` represents actual dependency depth; it is not a semantic ceiling.

A Level 2 node may become an upstream input for a later intelligence node. Later nodes may combine multiple Level 2 nodes, multiple domains, or previously derived intelligence.

## 10. UI contract

The schema is presentation-neutral. User-facing IRIS screens must show professional fintech information architecture, not engineering/debug terminology. Internal hashes, execution identifiers, and lineage details belong in appropriate detail/drill-down surfaces rather than being dumped into primary views.

No conversational wording, build instructions, audit commentary, or implementation discussion is user-facing financial content.
