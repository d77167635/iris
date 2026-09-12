# Iris Architectural Decision Ledger

Decisions recorded here are authoritative unless superseded by a later numbered decision. Current continuity and change-control rules are defined in `docs/DOCUMENTATION_AUTHORITY.md`.

## ADR-001 — One IRIS hierarchy; provider observability is external
**Status:** AUTHORITATIVE

IRIS is one complete hierarchy intelligence relational ontology financial life state ecosystem. There are no separate IRIS architectural sides or separate Financial Life and Intelligence systems.

Plaid remains an external provider/source boundary. Provider observability may be surfaced distinctly because it represents source capability, coverage, freshness, consent, authorization, and provenance, but it is not a second IRIS side. Provider observations enter the same governed IRIS hierarchy.

## ADR-002 — Plaid products are source capabilities
**Status:** AUTHORITATIVE

A Plaid product is a source/provider capability. It is not an IRIS evidence observation by itself. One IRIS intelligence composition may consume multiple provider products, and one provider product may support many IRIS surfaces.

## ADR-003 — IRIS intelligence is part of the product
**Status:** AUTHORITATIVE

The intelligence hierarchy is not an internal-only area that must be hidden from the user. Intelligence is the product foundation and may be surfaced directly wherever governed evidence, derivation, lineage, uncertainty, execution, authorization, and publication rules permit it.

Features, reports, questions, explanations, education, evidence views, scenarios, decisions, outcomes, and workspaces are different traversal/presentation forms of the same hierarchy.

User controls may govern publication preferences for defined report products or other supported features, but such controls do not create or limit the semantic hierarchy.

## ADR-004 — Evidence gates intelligence
**Status:** AUTHORITATIVE

IRIS may calculate, infer, forecast, recommend, explain, teach, or compose only to the extent justified by available governed evidence and valid upstream intelligence. Missing evidence produces an explicit limitation rather than fabricated completeness.

## ADR-005 — IRIS may select useful provider capabilities
**Status:** AUTHORITATIVE

IRIS may evaluate the provider product universe and select supported capabilities based on evidence needs, availability, institution support, consent, authorization, entitlement, billing policy, and cost policy. Capability selection is control-plane state and is never itself financial evidence.

## ADR-006 — Product cost is data/configuration
**Status:** AUTHORITATIVE

Provider pricing, billing classification, and plan treatment are configuration/data. Pricing changes must not require rewriting intelligence semantics.

## ADR-007 — No arbitrary artifact-count completion
**Status:** AUTHORITATIVE

Project completion is measured by capability and verification coverage, not by file count, page count, endpoint count, commit count, or visual completeness.

## ADR-008 — Current repository/runtime is the implementation source of truth
**Status:** AUTHORITATIVE

Conversation history is context, not the canonical implementation record. Current GitHub main, deployed Render services, and live Supabase state must be checked directly before material changes or certification claims.

## ADR-009 — Session continuity is mandatory
**Status:** AUTHORITATIVE

Material changes update the continuity documents so a new session can recover the current objective, last verified commit, deployment state, live evidence boundary, blockers, and next action without relying on copied chat history.

## ADR-010 — No blind changes; audit after every change
**Status:** AUTHORITATIVE

No material implementation or documentation change may be made without first inspecting the exact current artifact and relevant live state. After the change, the changed artifact, build/test state, deployment state, and affected runtime/database path must be audited before the change is considered complete.

## ADR-011 — No fake AI financial data
**Status:** AUTHORITATIVE

Fake AI financial data is strictly prohibited. No fabricated financial fact, provider observation, report result, outcome, confidence, probability, causal claim, or missing-evidence substitute may be presented as user truth.
