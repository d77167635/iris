import assert from "node:assert/strict";
import test from "node:test";
import { isPublicationFailureCode, publicationFailurePreservesCertification, retryPredecessor, retryTargetForFailure } from "./publicationStateMachine.js";

test("hierarchy publication failure is recoverable without recomputation", () => {
  assert.equal(isPublicationFailureCode("HIERARCHY_PUBLICATION_FAILED"), true);
  assert.equal(retryTargetForFailure("FAILED", "HIERARCHY_PUBLICATION_FAILED", false), "HIERARCHY");
  assert.equal(retryPredecessor("HIERARCHY"), "HIERARCHY_PENDING");
  assert.equal(publicationFailurePreservesCertification("FAILED", "CERTIFIED", "PASS"), true);
});

test("report publication failure retries only the report boundary", () => {
  assert.equal(isPublicationFailureCode("REPORT_PUBLICATION_FAILED"), true);
  assert.equal(retryTargetForFailure("FAILED", "REPORT_PUBLICATION_FAILED", true), "REPORT");
  assert.equal(retryPredecessor("REPORT"), "REPORT_PENDING");
  assert.equal(publicationFailurePreservesCertification("FAILED", "CERTIFIED", "PASS"), true);
});

test("publication-state persistence failure recovers at the first incomplete publication boundary", () => {
  assert.equal(retryTargetForFailure("FAILED", "PUBLICATION_STATE_PERSISTENCE_FAILED", false), "HIERARCHY");
  assert.equal(retryTargetForFailure("FAILED", "PUBLICATION_STATE_PERSISTENCE_FAILED", true), "REPORT");
});

test("illegal recovery states fail closed", () => {
  assert.equal(retryTargetForFailure("PUBLISHED", "REPORT_PUBLICATION_FAILED", true), null);
  assert.equal(retryTargetForFailure("FAILED", "REPORT_PUBLICATION_FAILED", false), null);
  assert.equal(retryTargetForFailure("FAILED", "HIERARCHY_PUBLICATION_FAILED", true), null);
  assert.equal(isPublicationFailureCode("INTELLIGENCE_EXECUTION_FAILED"), false);
});

test("certification truth is never downgraded by publication failure", () => {
  assert.equal(publicationFailurePreservesCertification("FAILED", "CERTIFIED", "PASS"), true);
  assert.equal(publicationFailurePreservesCertification("FAILED", "NOT_CERTIFIED", "FAIL"), false);
  assert.equal(publicationFailurePreservesCertification("PUBLISHED", "CERTIFIED", "PASS"), false);
});
