import assert from "node:assert/strict";
import test from "node:test";
import { executeRecursiveCapabilityPlan } from "./recursiveCapabilityExecutor.js";
import type { CapabilityPlan } from "./capabilityPlanner.js";

test("recursive execution never materializes hierarchy nodes before certification", async () => {
  const plan: CapabilityPlan = {
    planner_version: "test",
    requested: ["temporal"],
    ordered_capabilities: ["temporal"],
    contracts: [{
      capability_id: "temporal", version: "1.0.0", operator_id: "temporal", operator_version: "1.0.0",
      evidence_requirements: {}, dependencies: [], validation_rules: [], output_type: "test", output_contract: {},
      lineage_requirements: [], resource_limits: {}, user_control: {}, recursive: false, cross_domain: false,
    }],
    missing_capabilities: [], unsupported_capabilities: [], cycle_detected: false,
    hierarchy: { root: null, domains: [], capabilities: [], edges: [] },
    evidence: { selected_item_id: null, observed_products: [], observed_product_count: 0, source_field_observation_count: 0 },
    resource_estimate: { nodes: 1, edges: 0, compositions: 0 }, status: "READY", limitations: [],
  };
  let hierarchyWriteAttempted = false;
  const result = await executeRecursiveCapabilityPlan("00000000-0000-0000-0000-000000000000", plan, {
    persistGraphNode: async () => { hierarchyWriteAttempted = true; throw new Error("PRE_CERTIFICATION_HIERARCHY_WRITE"); },
  }, { maxNodes: 10, maxEdges: 10, maxCompositions: 10 }, async ({ userId, capabilityId }) => ({
    capability_id: capabilityId, operator_id: capabilityId, operator_version: "1.0.0", evidence_state: "CALCULATED",
    result: { user_id: userId, evidence_boundary: "test-boundary", financial_values_created: false, provider_observations_created: false, money_movement_executed: false },
  }));
  assert.equal(result.status, "COMPLETED");
  assert.deepEqual(result.graph_node_ids, {});
  assert.equal(hierarchyWriteAttempted, false);
});
