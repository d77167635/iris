import { FormEvent, useEffect, useRef, useState } from "react";
import { api } from "../api/backend";
import { supabase } from "../api/supabase";
import { IrisMark } from "./IrisMark";
import { IRIS_EDUCATION_CONTENT_LINKS, IRIS_QUESTION_CONTENT_LINKS } from "./irisContentHierarchyRegistry";
import "../styles/iris-assistant.css";

type Message={role:"iris"|"user";text:string;state?:string;contentId?:string};
type Position={x:number;y:number};
type Props={};

const financialStarters=IRIS_QUESTION_CONTENT_LINKS.filter(item=>item.id.startsWith("question.")).map(item=>item.label);
const educationStarters=IRIS_EDUCATION_CONTENT_LINKS.map(item=>item.label);
const isPlaidQuestion=(q:string)=>/\bplaid\b|financial institution connection|plaid product|plaid service|plaid api|plaid link|item state|plaid check/i.test(q);
const STORAGE_KEY="iris.assistant.position.v2";

function contentIdForQuestion(question:string){
 const normalized=question.trim().toLowerCase();
 return IRIS_QUESTION_CONTENT_LINKS.find(item=>item.label.toLowerCase()===normalized)?.id ?? null;
}

export function IrisAssistant(_:Props){
 const [open,setOpen]=useState(false);const [question,setQuestion]=useState("");const [busy,setBusy]=useState(false);const [messages,setMessages]=useState<Message[]>([]);const [position,setPosition]=useState<Position|null>(null);const drag=useRef<{dx:number;dy:number}|null>(null);
 useEffect(()=>{try{const saved=localStorage.getItem(STORAGE_KEY);if(saved)setPosition(JSON.parse(saved));}catch{}},[]);
 useEffect(()=>{if(position)try{localStorage.setItem(STORAGE_KEY,JSON.stringify(position));}catch{}},[position]);
 useEffect(()=>{const move=(e:PointerEvent)=>{if(!drag.current)return;const width=Math.min(430,window.innerWidth-28);const height=Math.min(680,window.innerHeight-120);const x=Math.max(8,Math.min(window.innerWidth-width-8,e.clientX-drag.current.dx));const y=Math.max(8,Math.min(window.innerHeight-height-8,e.clientY-drag.current.dy));setPosition({x,y});};const up=()=>{drag.current=null;document.body.style.userSelect="";};window.addEventListener("pointermove",move);window.addEventListener("pointerup",up);return()=>{window.removeEventListener("pointermove",move);window.removeEventListener("pointerup",up);};},[]);
 async function ask(value=question){const text=value.trim();if(!text||busy)return;setQuestion("");setOpen(true);setMessages(m=>[...m,{role:"user",text}]);setBusy(true);try{
   const contentId=contentIdForQuestion(text);
   if(isPlaidQuestion(text)){
     const {data}=await supabase.auth.getSession();const r=await fetch(`${import.meta.env.VITE_BACKEND_URL}/iris/plaid-knowledge`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${data.session?.access_token??""}`},body:JSON.stringify({question:text})});if(!r.ok)throw new Error("Iris could not retrieve Plaid public knowledge");const result=await r.json();const records=result.records??[];const answer=records.length?`I found ${records.length} relevant official-public Plaid knowledge record${records.length===1?"":"s"}. ${records.slice(0,5).map((x:any)=>`${x.name}: ${x.description} How: ${x.how_it_works} Iris mapping: ${(x.iris_capabilities??[]).join(", ")||"none"}.`).join(" ")} This is public product knowledge, not evidence that the capability or its data was observed for your account.`:"I do not currently have a matching public Plaid knowledge record. I will not invent a product or service description.";setMessages(m=>[...m,{role:"iris",text:answer,state:"public Plaid knowledge",contentId:contentId??undefined}]);
   }else{const result=await api.askIris(text,{surface:window.location.pathname});setMessages(m=>[...m,{role:"iris",text:result.answer,state:result.evidence_state,contentId:contentId??undefined}]);}
  }catch(error){setMessages(m=>[...m,{role:"iris",text:error instanceof Error?error.message:"Iris could not complete that question."}]);}finally{setBusy(false);}}
 function submit(event:FormEvent){event.preventDefault();void ask();}
 function startDrag(e:React.PointerEvent){if((e.target as HTMLElement).closest("button"))return;const rect=e.currentTarget.getBoundingClientRect();drag.current={dx:e.clientX-rect.left,dy:e.clientY-rect.top};document.body.style.userSelect="none";}
 const panelStyle=position?{left:position.x,top:position.y,right:"auto",bottom:"auto"}:undefined;
 return <><button className="iris-assistant-orb" onClick={()=>setOpen(!open)} aria-label={open?"Close Iris":"Open Iris"}><span className="iris-assistant-orb-core"><IrisMark size={27} color="#fff"/></span><span>Iris</span><i className={open?"open":""}/></button>{open&&<section className="iris-assistant" style={panelStyle} aria-label="Iris assistant"><header onPointerDown={startDrag}><div className="iris-assistant-title"><IrisMark size={24} color="#fff"/><div><strong>Iris</strong><small>Financial-life intelligence</small></div></div><div className="iris-assistant-window-actions"><span className="iris-assistant-drag-label">MOVE</span><button onClick={()=>setOpen(false)} aria-label="Close Iris">×</button></div></header><div className="iris-assistant-body">{!messages.length&&<div className="iris-assistant-welcome"><span>ASK IRIS · ONE HIERARCHY</span><h2>What do you want to understand?</h2><p>Ask about your financial life, evidence, relationships, intelligence, scenarios, decisions, reports, explanations or any concept in the IRIS hierarchy. Questions and education remain connected to the same capabilities and hierarchy nodes.</p><div className="iris-assistant-starters">{[...financialStarters,...educationStarters.slice(0,3)].map(s=><button key={s} onClick={()=>void ask(s)}>{s}</button>)}</div></div>}{messages.map((m,i)=><div key={i} className={`iris-assistant-message ${m.role}`}><div>{m.text}</div>{m.role==="iris"&&<small>{m.state?m.state.replace(/_/g," "):"Iris"}{m.contentId?` · ${m.contentId}`:""}</small>}</div>)}{busy&&<div className="iris-assistant-message iris"><div className="iris-assistant-thinking"><i/><i/><i/></div><small>Reasoning from the governed IRIS hierarchy…</small></div>}</div><form onSubmit={submit} className="iris-assistant-input"><input value={question} onChange={e=>setQuestion(e.target.value)} placeholder="Ask Iris…" maxLength={2000}/><button disabled={busy||!question.trim()}>Ask</button></form></section>}</>;
}
