#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const root = process.cwd();
const git = (...args) => execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
const head = git("rev-parse", "HEAD");
const branch = git("branch", "--show-current");
const statePath = "docs/PROJECT_STATE.json";
const roadmapPath = "ROADMAP.md";
const roadmap = readFileSync(`${root}/${roadmapPath}`, "utf8");
const completed = (roadmap.match(/- \[x\]/gi) || []).length;
const open = (roadmap.match(/- \[ \]/g) || []).length;

const state = {
  project: "Iris",
  repository: "d77167635/iris",
  branch,
  head,
  generated_at: new Date().toISOString(),
  continuity: {
    documentation_authority: "docs/DOCUMENTATION_AUTHORITY.md",
    master_state: "docs/MASTER_STATE.md",
    architecture: "docs/ARCHITECTURE.md",
    decisions: "docs/DECISIONS.md",
    roadmap: "ROADMAP.md",
    session_handoff: "docs/SESSION_HANDOFF.md",
    source_of_truth: "current GitHub main plus directly verified Render and Supabase state; prior chat is context only"
  },
  architecture: {
    model: "one complete hierarchy intelligence relational ontology financial life state ecosystem",
    two_side_architecture: false,
    separate_data_free_intelligence_side: false,
    semantic_depth_ceiling: false,
    forward_traversal: true,
    reverse_traversal: true
  },
  roadmap: { completed_items: completed, open_items: open },
  environment: {
    render_workspace: "tea-dai0jth42hec73araong",
    backend_service: "srv-dai1jieq1p3s73am2a40",
    backend_url: "https://iris-backend-u60o.onrender.com",
    frontend_service: "srv-dai1c9m1egvs73d1aiog",
    frontend_url: "https://iris-frontend-cuy3.onrender.com",
    supabase_project: "uhcrdehjwaghqvydaqnn",
    status: "active_current_environment"
  },
  current_verified_boundary: {
    plaid_sandbox_to_supabase_tested_path: true,
    entire_multi_item_population_certified: false,
    read_only: true,
    money_movement: false,
    statements_sandbox_execution: false
  },
  rules: [
    "No fabricated financial data",
    "No fake AI financial data",
    "Provider observations are evidence, not intelligence",
    "Unknown is not zero",
    "Readiness, observation, certification, normalization, consumption, and use remain distinct",
    "Products and Reports are independent counts",
    "No money movement in the current scope",
    "No blind changes",
    "Audit before and after every material change",
    "Never claim certification without direct runtime proof"
  ]
};

if (process.argv.includes("--write")) {
  writeFileSync(`${root}/${statePath}`, `${JSON.stringify(state, null, 2)}\n`);
  // Do not rewrite MASTER_STATE or SESSION_HANDOFF. Those documents contain verified
  // narrative state and must only be changed deliberately after a pre/post audit.
  console.log(`updated ${statePath} to repository head ${head}`);
} else {
  console.log(JSON.stringify(state, null, 2));
}
