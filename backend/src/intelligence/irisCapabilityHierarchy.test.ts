import { describe, expect, it } from "vitest";
import { IRIS_CAPABILITY_HIERARCHY, validateIrisCapabilityHierarchyMapping } from "./irisCapabilityHierarchy.js";
import { EXECUTABLE_CAPABILITY_OPERATORS } from "./capabilityOperators.js";

describe("Iris capability hierarchy mapping", () => {
  it("maps every executable capability exactly once", () => {
    const registered = EXECUTABLE_CAPABILITY_OPERATORS.map((operator) => operator.capability_id).sort();
    const mapped = IRIS_CAPABILITY_HIERARCHY.map((mapping) => mapping.capability_id).sort();
    expect(mapped).toEqual(registered);
    expect(new Set(mapped).size).toBe(mapped.length);
  });

  it("maps every capability to hierarchy domains and application content", () => {
    expect(validateIrisCapabilityHierarchyMapping()).toEqual([]);
    for (const mapping of IRIS_CAPABILITY_HIERARCHY) {
      expect(mapping.hierarchy_domain_ids.length).toBeGreaterThan(0);
      expect(mapping.related_content_kinds.length).toBeGreaterThan(0);
      expect(mapping.related_workspace_roots.length).toBeGreaterThan(0);
      expect(mapping.recursive).toBe(true);
    }
  });
});
