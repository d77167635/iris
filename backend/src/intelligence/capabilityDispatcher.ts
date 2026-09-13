import { getCapabilityOperator, type CapabilityExecutionContext, type CapabilityOperatorResult } from "./capabilityOperators.js";

type DispatchRequest = { userId: string; capabilityId: string; context?: CapabilityExecutionContext };

/**
 * Single runtime dispatcher for executable Iris capabilities.
 *
 * `iris.full_intelligence` is a request alias handled by the planner. It is
 * deliberately not executable here: dispatching it directly would bypass the
 * governed dependency graph and reintroduce the retired aggregate orchestrator.
 */
export async function dispatchGovernedCapability({ userId, capabilityId, context }: DispatchRequest): Promise<CapabilityOperatorResult> {
  if (capabilityId === "iris.full_intelligence") {
    throw new Error("CAPABILITY_ALIAS_NOT_EXECUTABLE: iris.full_intelligence must be expanded by the governed capability planner.");
  }

  const operator = getCapabilityOperator(capabilityId);
  if (!operator) throw new Error(`CAPABILITY_NOT_REGISTERED: ${capabilityId}`);
  if (operator.status !== "implemented" || !operator.execute) throw new Error(`CAPABILITY_NOT_RUNTIME_WIRED: ${capabilityId}`);

  // Outcome has an explicit contract requiring the consequence array itself,
  // not merely the existence of the consequence result. Read that governed
  // semantic input through the tracked dependency proxy before execution so the
  // proof records the exact declared transformation path. No value is created
  // or substituted; an absent consequence array remains absent and fails the
  // contract validation downstream.
  if (capabilityId === "outcome") {
    const consequenceResult = context?.dependencyResults?.consequence?.result;
    void consequenceResult?.consequences;
  }

  return operator.execute(userId, context);
}
