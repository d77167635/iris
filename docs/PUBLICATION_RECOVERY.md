# IRIS Publication Retry and Recovery

IRIS computation certification and post-certification publication are separate truth boundaries.

`CERTIFIED` means the computation passed validation and certification. It does not mean hierarchy or report publication succeeded.

## Normal sequence

`CERTIFIED → HIERARCHY_PENDING → HIERARCHY_PUBLISHED → REPORT_PENDING → PUBLISHED`

## Failure rules

- Hierarchy materialization failure: `HIERARCHY_PENDING → FAILED` with `HIERARCHY_PUBLICATION_FAILED`.
- Report materialization failure: `REPORT_PENDING → FAILED` with `REPORT_PUBLICATION_FAILED`.
- Publication-state persistence failure: `HIERARCHY_PENDING` or `REPORT_PENDING → FAILED` with `PUBLICATION_STATE_PERSISTENCE_FAILED` when the failure state itself can be persisted.

Certification truth remains unchanged after publication failure: run `CERTIFIED`; execution `EXECUTED`; validation `PASS`; certification `CERTIFIED`.

## Retry/recovery

Hierarchy failure with no hierarchy timestamp retries the hierarchy boundary. Recovery continues through hierarchy publication, report pending, report publication, and final publication.

Report failure with a hierarchy timestamp retries only the report boundary. The already-published hierarchy is not rebuilt.

A publication-state persistence failure retries the first incomplete boundary: hierarchy if hierarchy publication is absent, otherwise report.

Recovery requires the exact certified run, execution, user, and certification hash. It reuses the certified execution output and evidence boundary; it never recomputes capabilities, creates provider observations, changes financial evidence, or recertifies.

## Fail closed

Never retry `PUBLISHED`. Never turn a report failure into a hierarchy rebuild after hierarchy publication. Never turn a hierarchy failure into report-only recovery. Never manufacture missing content to satisfy publication.

Database publication transitions are service-role-only and lock the run/execution pair deterministically. Report persistence remains idempotent on `(user_id, run_id, composition_hash)`.
