import { type ReactNode } from "react";
import { IrisAssistant } from "./IrisAssistant";
import { IrisFinancialContext } from "./IrisFinancialContext";
import { flattenWorkspaceRegistry, irisWorkspaceRegistry } from "./irisWorkspaceRegistry";

export type IrisJourneySurface = { page: string; label: string; description: string };
type Props = { page: string; go: (page: string) => void; children: ReactNode };

const navigation: IrisJourneySurface[] = [
  { page: "iris", label: "Financial Life", description: "Observed state and the complete Iris starting point" },
  { page: "iris/behavior", label: "Change", description: "Movement, patterns and signals" },
  { page: "iris/reasoning", label: "Understand", description: "Relationships, explanations and investigations" },
  { page: "iris/evidence", label: "Evidence", description: "How Iris knows and traces its sources" },
  { page: "iris/intelligence", label: "Intelligence", description: "Hierarchy, graph, reasoning and recursion" },
  { page: "iris/reports", label: "Reports", description: "Produced report results" },
  { page: "iris/catalog", label: "Report Catalog", description: "Report definitions and activation preferences" },
  { page: "iris/scenarios", label: "Scenarios", description: "Explicit hypothetical states" },
  { page: "iris/decisions", label: "Decisions", description: "Choices, tradeoffs and consequences" },
  { page: "iris/action", label: "Action", description: "Action-oriented results without money movement" },
  { page: "iris/outcomes", label: "Outcomes", description: "Observed outcomes and qualified learning" },
  { page: "iris/connect", label: "Connect", description: "Build governed evidence" },
];

const journey = [
  { page: "iris", label: "Life" },
  { page: "iris/evidence", label: "Evidence" },
  { page: "iris/reasoning", label: "Understand" },
  { page: "iris/intelligence", label: "Intelligence" },
  { page: "iris/reports", label: "Reports" },
  { page: "iris/scenarios", label: "Scenario" },
  { page: "iris/decisions", label: "Decide" },
  { page: "iris/action", label: "Action" },
  { page: "iris/outcomes", label: "Outcome" },
];

export function IrisExperienceShell({ page, go, children }: Props) {
  const active = navigation.find((item) => item.page === page)?.page ?? (page.startsWith("iris/intelligence/") ? "iris/intelligence" : page === "iris/catalog" ? "iris/catalog" : page === "iris/reports" ? "iris/reports" : "iris");
  const workspaceNodes = flattenWorkspaceRegistry();
  return <div className="iris-experience-shell">
    <header className="ies-topbar">
      <button className="ies-brand" type="button" onClick={() => go("iris")} aria-label="Go to your IRIS financial life"><span className="ies-brand-mark" aria-hidden="true">I</span><span><strong>IRIS</strong><small>RELATIONAL FINANCIAL INTELLIGENCE</small></span></button>
      <section className="ies-experience-group" aria-label="IRIS workspace">
        <span>IRIS · COMPLETE FINANCIAL-LIFE INTELLIGENCE</span>
        <nav className="ies-nav" aria-label="IRIS workspace">{navigation.map((item) => <button key={item.page} className={active === item.page ? "active" : ""} type="button" onClick={() => go(item.page)} aria-current={active === item.page ? "page" : undefined}><strong>{item.label}</strong><span>{item.description}</span></button>)}</nav>
      </section>
      <div className="ies-top-actions"><button type="button" onClick={() => go("iris/evidence")}>Evidence</button><button type="button" onClick={() => go("iris/reasoning")}>Ask / Understand</button><button className="ies-connect" type="button" onClick={() => go("iris/connect")}>Connect evidence</button></div>
    </header>
    <section className="ies-workspace-index" aria-label="All IRIS financial-life workspace surfaces">
      <span className="ies-workspace-index-label">ALL FINANCIAL-LIFE SURFACES</span>
      <nav className="ies-workspace-index-nav">
        {workspaceNodes.map((item) => { const isRoot = irisWorkspaceRegistry.some((root) => root.id === item.id); return <button key={item.id} type="button" className={page === item.id ? "active" : ""} onClick={() => go(item.id)} aria-current={page === item.id ? "page" : undefined} data-root={isRoot ? "true" : "false"}><strong>{item.label}</strong><span>{item.description}</span></button>; })}
      </nav>
    </section>
    <div className="ies-journey" aria-label="IRIS financial-life journey"><span className="ies-journey-label">IRIS · RECURSIVE JOURNEY</span>{journey.map((item, index) => <span key={item.page} className={page === item.page ? "active" : ""}><button type="button" onClick={() => go(item.page)} aria-current={page === item.page ? "step" : undefined}>{item.label}</button>{index < journey.length - 1 && <i aria-hidden="true">→</i>}</span>)}</div>
    <IrisFinancialContext page={page} go={go} />
    <main className="ies-content">{children}</main>
    <IrisAssistant />
  </div>;
}
