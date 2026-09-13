import { supabaseAdmin } from "../config/supabase.js";
import { materializeCertifiedHierarchy, materializeIrisUserReportInventory } from "./irisUserReportComposer.js";
import { type RetryTarget } from "./publicationStateMachine.js";

function errorText(error: unknown): string { return error instanceof Error ? error.message : typeof error === "string" ? error : JSON.stringify(error); }

async function rpc(name: string, args: Record<string, unknown>): Promise<void> {
  const { error } = await supabaseAdmin.rpc(name, args);
  if (error) throw new Error(`PUBLICATION_STATE_PERSISTENCE_FAILED: ${name}: ${error.message}`);
}

export async function retryCertifiedPublication(input: { userId: string; runId: string; executionId: string; target: RetryTarget }): Promise<{ publication_status: "PUBLISHED" }> {
  const { data: certification, error: certificationError } = await supabaseAdmin.from("iris_certifications").select("certification_hash,status").eq("run_id", input.runId).eq("execution_id", input.executionId).eq("user_id", input.userId).eq("status", "CERTIFIED").maybeSingle();
  if (certificationError || !certification?.certification_hash) throw new Error(`CERTIFIED_PUBLICATION_RECOVERY_BLOCKED: ${certificationError?.message ?? "exact certification not found"}`);
  const args = { p_run_id: input.runId, p_execution_id: input.executionId, p_user_id: input.userId };
  await rpc("iris_publication_retry_failed", { ...args, p_target: input.target });
  try {
    if (input.target === "HIERARCHY") {
      await materializeCertifiedHierarchy({ userId: input.userId, runId: input.runId, executionId: input.executionId, certificationHash: certification.certification_hash });
      await rpc("iris_publication_mark_hierarchy_published", args);
      await rpc("iris_publication_mark_report_pending", args);
    }
    await materializeIrisUserReportInventory({ userId: input.userId, runId: input.runId, executionId: input.executionId, certificationHash: certification.certification_hash });
    await rpc("iris_publication_mark_published", args);
    return { publication_status: "PUBLISHED" };
  } catch (error) {
    const code = input.target === "HIERARCHY" ? "HIERARCHY_PUBLICATION_FAILED" : "REPORT_PUBLICATION_FAILED";
    try { await rpc("iris_publication_mark_failed", { ...args, p_error_code: code, p_error_message: errorText(error) }); } catch (stateError) { throw new Error(`PUBLICATION_STATE_PERSISTENCE_FAILED: ${errorText(stateError)}`); }
    throw new Error(`${code}: ${errorText(error)}`);
  }
}
