import { useEffect, useState } from "react";
import { api } from "../api/backend";
import "./MaximumIntelligencePanel.css";

const money=(n:number|null|undefined)=>n==null?"—":`${n<0?"−":""}$${Math.abs(n).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}`;
const pct=(n:number|null|undefined)=>n==null?"—":`${n>=0?"+":"−"}${Math.abs(n).toFixed(1)}%`;
const label=(s:string|undefined)=>s?.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase())??"—";
const count=(value:unknown)=>Array.isArray(value)?String(value.length):"—";

export function MaximumIntelligencePanel(){
 const [data,setData]=useState<any>(null);
 useEffect(()=>{api.getIntelligence().then(setData).catch(()=>setData(null))},[]);
 const m=data?.maximum_intelligence;
 if(!m)return null;
 const readiness=m.confidence?.analytical_readiness;
 const coverage=m.evidence?.coverage_score;
 const windows=m.evidence?.windows_with_transactions;
 const pressurePoints=m.pressure_points;
 const opportunities=m.opportunities;
 const limitations=m.evidence?.limitations;
 const nextQuestions=m.next_best_questions;
 return <section className="mi-panel">
   <header className="mi-header"><div><span>MAXIMUM INTELLIGENCE</span><h2>What Iris can establish from the evidence</h2><p>Deterministic synthesis across observed history, relationships, behavior and forward calculations. It does not invent missing evidence.</p></div><div className="mi-badges"><b>{m.confidence?.label??"Evidence constrained"}</b><small>{m.architecture_version??"—"}</small></div></header>
   <div className="mi-metrics">
     <article><span>ANALYTICAL READINESS</span><strong>{readiness==null?"—":`${(readiness*100).toFixed(0)}%`}</strong><small>{m.confidence?.basis??"Evidence basis unavailable"}</small></article>
     <article><span>EVIDENCE COVERAGE</span><strong>{coverage==null?"—":`${(coverage*100).toFixed(0)}%`}</strong><small>{m.evidence?.coverage_label??"Coverage unavailable"}</small></article>
     <article><span>STRONGEST WINDOW</span><strong>{m.evidence?.strongest_window_days?`${m.evidence.strongest_window_days}d`:"—"}</strong><small>{Array.isArray(windows)?`${windows.length} populated windows`:"Population unavailable"}</small></article>
     <article><span>TRAJECTORY</span><strong>{label(m.trajectory?.direction)}</strong><small>{m.trajectory?.interpretation??"No trajectory interpretation"}</small></article>
   </div>
   <div className="mi-grid">
    <section><div className="mi-title"><span>PRESSURE POINTS</span><b>{count(pressurePoints)}</b></div>{Array.isArray(pressurePoints)?pressurePoints.slice(0,6).map((x:any,i:number)=><div className="mi-item" key={i}><strong>{x.title??x.statement??"Pressure point"}</strong><p>{x.statement??x.interpretation??""}</p><small>{x.evidence??x.basis??"Calculated from available evidence"}</small></div>):<p className="mi-empty">Pressure-point evidence is unavailable.</p>}{Array.isArray(pressurePoints)&&!pressurePoints.length&&<p className="mi-empty">No evidence-backed pressure point is currently established.</p>}</section>
    <section><div className="mi-title"><span>OPPORTUNITIES</span><b>{count(opportunities)}</b></div>{Array.isArray(opportunities)?opportunities.slice(0,6).map((x:any,i:number)=><div className="mi-item" key={i}><strong>{x.title??x.statement??"Opportunity"}</strong><p>{x.statement??x.interpretation??""}</p><small>{x.evidence??x.basis??"Calculated from available evidence"}</small></div>):<p className="mi-empty">Opportunity evidence is unavailable.</p>}{Array.isArray(opportunities)&&!opportunities.length&&<p className="mi-empty">No evidence-backed opportunity is currently established.</p>}</section>
   </div>
   <section className="mi-counter"><div className="mi-title"><span>COUNTERFACTUALS</span><small>Illustrative calculations · not predictions</small></div><div className="mi-counter-grid">{Array.isArray(m.counterfactuals)?m.counterfactuals.slice(0,6).map((x:any,i:number)=><article key={i}><b>{x.label??x.title??"Scenario"}</b><strong>{x.value!=null?money(x.value):x.change!=null?pct(x.change):"—"}</strong><p>{x.interpretation??x.statement??"Calculated against the observed baseline."}</p></article>):<p className="mi-empty">Counterfactual evidence is unavailable.</p>}</div></section>
   <div className="mi-bottom"><section><span>LIMITS / MISSING EVIDENCE</span>{Array.isArray(limitations)?limitations.map((x:string,i:number)=><p key={i}>• {x}</p>):<p>Limitations are unavailable.</p>}{Array.isArray(limitations)&&!limitations.length&&<p>No additional limitation was returned by the synthesis.</p>}</section><section><span>NEXT-BEST QUESTIONS</span>{Array.isArray(nextQuestions)?nextQuestions.map((x:any,i:number)=><p key={i}>→ {typeof x==="string"?x:x.question??x.statement??"Additional evidence would improve analysis."}</p>):<p>Next-best questions are unavailable.</p>}{Array.isArray(nextQuestions)&&!nextQuestions.length&&<p>No additional evidence question is currently required.</p>}</section></div>
   <footer><span>PROVENANCE</span><p>{Array.isArray(m.provenance)?m.provenance.join(" · "):"Provenance is unavailable."}</p><small>Confidence is analytical readiness, not a probability of correctness.</small></footer>
 </section>;
}
