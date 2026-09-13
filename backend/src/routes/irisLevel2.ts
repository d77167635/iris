import { Router } from "express";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { executeLevel2DomainIntelligence, readLatestLevel2 } from "../intelligence/level2DomainIntelligence.js";

export const irisLevel2Router = Router();

irisLevel2Router.get("/iris/level2", requireAuth, async (req: AuthedRequest, res) => {
  try { return res.json(await readLatestLevel2(req.userId!)); }
  catch (error) { console.error("iris/level2 error:", error); return res.status(500).json({ certified: false, level: 2, error: "Level 2 domain intelligence could not be read" }); }
});

irisLevel2Router.post("/iris/level2/run", requireAuth, async (req: AuthedRequest, res) => {
  try { return res.status(201).json(await executeLevel2DomainIntelligence(req.userId!)); }
  catch (error) { console.error("iris/level2/run error:", error); return res.status(500).json({ certified: false, level: 2, error: error instanceof Error ? error.message : "Level 2 execution failed" }); }
});
