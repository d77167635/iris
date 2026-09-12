import { test } from "node:test";
import assert from "node:assert/strict";
import { IRIS_CAPABILITY_HIERARCHY, validateIrisCapabilityHierarchyMapping } from "./irisCapabilityHierarchy.js";
import { EXECUTABLE_CAPABILITY_OPERATORS } from "./capabilityOperators.js";

test("maps every executable capability exactly once", () => {
  const registered = EXECUTABLE_CAPABILITY_OPERATORS.map((operator) => operator.capability_id).sort();
  const mapped = IRIS_CAPABILITY_HIERARCHY.map((mapping) => mapping.capability_id).sort();
  assert.deepEqual(mapped, registered);
  assert.equal(new Set(mapped).size, mapped.length);
});

test("maps every capability to hierarchy domains and application content", () => {
  assert.deepEqual(validateIrisCapabilityHierarchyMapping(), []);
  for (const mapping of IRIS_CAPABILITY_HIERARCHY) {
    assert.ok(mapping.hierarchy_domain_ids.length > 0);
    assert.ok(mapping.related_content_kinds.length > 0);
    assert.ok(mapping.related_workspace_roots.length > 0);
    assert.equal(mapping.recursive, true);
  }
});
