import { Router } from "express";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { executeLevel1MasterIntelligence } from "../intelligence/level1MasterIntelligence.js";
import { supabaseAdmin } from "../config/supabase.js";

export const irisLevel1Router = Router();

irisLevel1Router.get("/iris/level1", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const { data: run } = await supabaseAdmin.from("iris_runs").select("id,status,created_at,completed_at,publication_status,hierarchy_published_at").eq("user_id", req.userId!).eq("request_mode", "level1_master_intelligence").order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (!run || run.status !== "CERTIFIED") return res.status(409).json({ certified: false, level: 1, error: "Level 1 Master Intelligence is not certified" });
    const { data: execution } = await supabaseAdmin.from("iris_execution_records").select("id,certification_status,validation_status,output_hash").eq("run_id", run.id).eq("user_id", req.userId!).maybeSingle();
    const { data: certification } = await supabaseAdmin.from("iris_certifications").select("certification_hash,certified_at,status").eq("run_id", run.id).eq("execution_id", execution?.id ?? "").eq("user_id", req.userId!).maybeSingle();
    const { data: output } = await supabaseAdmin.from("iris_execution_outputs").select("value,hash,evidence_state").eq("execution_id", execution?.id ?? "").eq("output_key", "level1_master_intelligence").maybeSingle();
    if (!execution || !certification || certification.status !== "CERTIFIED" || !output?.value) return res.status(409).json({ certified: false, level: 1, error: "Level 1 certification/output is incomplete" });
    return res.json({ level: 1, intelligence_name: "IRIS Master Intelligence", certified: true, run_id: run.id, execution_id: execution.id, certification_hash: certification.certification_hash, certified_at: certification.certified_at, output_hash: output.hash, evidence_state: output.evidence_state, publication_status: run.publication_status, hierarchy_published_at: run.hierarchy_published_at, ...output.value });
  } catch (error) { console.error("iris/level1 error:", error); return res.status(500).json({ certified: false, level: 1, error: "Level 1 Master Intelligence could not be read" }); }
});

irisLevel1Router.post("/iris/level1/run", requireAuth, async (req: AuthedRequest, res) => {
  try { return res.status(201).json(await executeLevel1MasterIntelligence(req.userId!)); }
  catch (error) { console.error("iris/level1/run error:", error); return res.status(500).json({ certified: false, level: 1, error: error instanceof Error ? error.message : "Level 1 execution failed" }); }
});
