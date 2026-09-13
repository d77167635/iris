# IRIS UI Intelligence Contract

## Purpose

The IRIS user interface is part of the IRIS Hierarchy Intelligence system. It is not an independent reporting surface and it is never a source of financial truth.

## State flow

`Plaid observations → Supabase source of truth → Level 1 governed evidence → Level 2 domain/relational intelligence → UI intelligence state`

The UI may then request a different view of the same certified hierarchy through navigation, expansion, selection, and drill-down. Those interactions change presentation and retrieval scope; they do not create financial observations.

## UI responsibilities

1. Present the latest certified hierarchy state.
2. Expose domain intelligence, derived fields, and supported relationships.
3. Make cross-domain combinations visible when they exist in the certified output.
4. Preserve evidence state for every displayed value.
5. Treat `INSUFFICIENT_EVIDENCE` as a meaningful state and never replace it with zero.
6. Keep provider/audit identifiers available only as secondary verification detail.
7. Adapt navigation and progressive disclosure to the hierarchy actually returned for the user.
8. Synchronize after a newly certified hierarchy is published.

## UI prohibitions

- No fake, mock, seeded, hardcoded, placeholder, or illustrative financial values.
- No UI-only financial calculations that bypass the intelligence hierarchy.
- No claim that an unavailable or merely consented provider product was observed.
- No inference of investment holdings or statements without corresponding evidence.
- No customer-facing roadmap, build-stage, certification-process, or internal execution language as primary product content.

## Adaptive behavior

The UI is driven by hierarchy state rather than a fixed collection of unrelated cards. A domain becomes a navigable intelligence surface when its certified Level 2 output exists. Selecting a domain reveals its derived state, canonical content, relationships, and cross-domain connections. Selecting a relationship reveals the connected domains and values already certified by the hierarchy.

## Synchronization boundary

A UI refresh must resolve against the latest certified Level 2 publication. If no certified Level 2 publication exists, the UI may request the authenticated Level 2 execution. It must not display the execution as financial content until certification succeeds.

## Reverse lineage requirement

Every screen-visible financial intelligence value must remain traceable through its Level 2 node/field and upstream relationships to the certified Level 1 evidence boundary and ultimately to the Supabase source observation. The UI does not sever or replace that lineage.

## Current implementation boundary

Level 2 currently exposes eight domain envelopes and evidence-backed cross-domain output implemented by the Level 2 engine. The UI must display only the combinations returned by that engine. The mathematical space of possible domain combinations is not evidence that those combinations are implemented or available.
