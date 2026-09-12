import { test } from "node:test";
import assert from "node:assert/strict";
import { composeIrisUserReport } from "./irisUserReportComposer.js";

test("IRIS report composition accepts mixed hierarchy content", () => {
  const report = composeIrisUserReport({
    userId: "user",
    runId: "run",
    executionId: "execution",
    certificationHash: "cert",
    blocks: [
      { kind: "observed_evidence", id: "evidence-1", name: "Transaction evidence", value: { product: "transactions" }, evidence_state: "OBSERVED" },
      { kind: "explanation", id: "explanation-1", name: "Why the pattern matters", value: { explanation: "governed" }, evidence_state: "CALCULATED" },
      { kind: "intelligence", id: "intelligence-1", name: "Opportunity to improve cash flow", value: { importance_score: 1 }, evidence_state: "CALCULATED" },
    ],
  });

  assert.equal(report.primary_content_kind, "intelligence");
  assert.equal(report.title, "Opportunity to improve cash flow");
  assert.deepEqual(report.content_node_ids, ["explanation-1", "intelligence-1"]);
  assert.deepEqual(report.source_evidence_ids, []);
  assert.equal(report.composition.version, "IRIS_USER_REPORT_COMPOSITION_V2");
  assert.equal(report.content.blocks.length, 3);
});

test("IRIS report naming uses explicit empowering metadata when supplied", () => {
  const report = composeIrisUserReport({
    userId: "user",
    runId: "run",
    executionId: "execution",
    certificationHash: "cert",
    blocks: [
      { kind: "intelligence", id: "a", name: "General financial pattern", value: { empowerment_score: 0.2 }, evidence_state: "CALCULATED" },
      { kind: "observed_evidence", id: "b", name: "Observed evidence", value: { product: "balance" }, evidence_state: "OBSERVED" },
      { kind: "scenario", id: "c", name: "Potential decision path", value: { empowerment_score: 0.8 }, evidence_state: "SCENARIO" },
    ],
  });

  assert.equal(report.primary_content_kind, "scenario");
  assert.equal(report.title, "Potential decision path");
});

test("IRIS report composition is deterministic for the same inputs", () => {
  const input = {
    userId: "user",
    runId: "run",
    executionId: "execution",
    certificationHash: "cert",
    blocks: [
      { kind: "observed_evidence" as const, id: "evidence", name: "Evidence", value: null, evidence_state: "OBSERVED" },
      { kind: "derived_state" as const, id: "state", name: "Financial position", value: { state: "governed" }, evidence_state: "CALCULATED" },
    ],
  };

  const first = composeIrisUserReport(input);
  const second = composeIrisUserReport(input);
  assert.equal(first.report_id, second.report_id);
  assert.equal(first.composition_hash, second.composition_hash);
  assert.deepEqual(first.content, second.content);
});
