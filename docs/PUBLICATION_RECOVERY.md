# IRIS Publication Retry and Recovery

## Purpose

IRIS computation certification and post-certification publication are separate truth boundaries.

`CERTIFIED` means the computation passed validation and certification. It does not mean hierarchy or report publication succeeded.

## Normal publication sequence

`CERTIFIED → HIERARCHY_PENDING → HIERARCHY_PUBLISHED → REPORT_PENDING → PUBLISHED`

## Failure sequence

- Hierarchy materialization failure: `HIERARCHY_PENDING → FAILED` with `HIERARCHY_PUBLICATION_FAILED`.
- Report materialization failure: `REPORT_PENDING → FAILED` with `REPORT_PUBLICATION_FAILED`.
- Publication-state persistence failure: `HIERARCHY_PENDING` or `REPORT_PENDING → FAILED` with `PUBLICATION_STATE_PERSISTENCE_FAILED` when the database can persist the failure state.

Certification truth is never downgraded by a publication failure:

- `iris_runs.status = CERTIFIED`
- `iris_execution_records.execution_state = EXECUTED`
- `iris_execution_records.validation_status = PASS`
- `iris_execution_records.certification_status = CERTIFIED`

Only `publication_status` and publication error/timestamp fields change after certification.

## Retry rules

### Hierarchy failure

If `publication_status = FAILED`, `publication_error_code = HIERARCHY_PUBLICATION_FAILED`, and `hierarchy_published_at IS NULL`, retry target is `HIERARCHY`.

Recovery:

`FAILED → HIERARCHY_PENDING → hierarchy materialization → HIERARCHY_PUBLISHED → REPORT_PENDING → report materialization → PUBLISHED`

The certified execution is reused. There is no capability recomputation, new evidence boundary, new certification, or new financial observation.

### Report failure

If `publication_status = FAILED`, `publication_error_code = REPORT_PUBLICATION_FAILED`, and `hierarchy_published_at IS NOT NULL`, retry target is `REPORT`.

Recovery:

`FAILED → REPORT_PENDING → report materialization → PUBLISHED`

The already-published hierarchy is not rebuilt.

### Publication-state persistence failure

If the failure occurred before hierarchy publication, retry the hierarchy boundary.

If hierarchy publication is already recorded, retry the report boundary.

A state-persistence error never authorizes recomputation or recertification.

## Fail-closed rules

- Never retry `PUBLISHED`.
- Never retry a report failure as a hierarchy rebuild when hierarchy publication is already recorded.
- Never retry a hierarchy failure as a report-only operation when hierarchy publication has not occurred.
- Never retry without an exact certified run, execution, user, and certification hash.
- Never manufacture missing hierarchy/report content to make publication succeed.
- Never change provider evidence during publication recovery.
- Never create financial observations, synthetic balances, transactions, or AI financial facts during recovery.

## Idempotency

Hierarchy and report materialization use the certified run/execution boundary. Report persistence uses the existing `(user_id, run_id, composition_hash)` conflict target. Database publication transitions lock the run/execution pair in deterministic order.

## Runtime boundary

Supabase publication RPCs are service-role-only. Client-facing roles cannot advance publication state. The application must treat a publication failure as a publication failure, not as a failed computation.
