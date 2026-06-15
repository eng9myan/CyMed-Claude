"use client";
import { useState } from "react";
import { CheckSquare, Plus, Calendar, Tag, Flag, MoreHorizontal, CheckCircle2, Circle, Clock } from "lucide-react";

function Card({ children, style={} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>{children}</div>;
}

type Priority = "high"|"medium"|"low";
type Status = "todo"|"doing"|"done";
type Task = { id:string; title:string; project:string; priority:Priority; status:Status; due:string; tags:string[]; notes?:string };

const INITIAL: Task[] = [
  { id:"T-001", title:"Sign off on June payroll batch",   project:"Finance",  priority:"high",   status:"todo",  due:"2026-06-14", tags:["payroll","approval"], notes:"4,240 employees, SAR 18.4M" },
  { id:"T-002", title:"Review Q2 financial close",         project:"Finance",  priority:"high",   status:"doing", due:"2026-06-17", tags:["close","Q2"] },
  { id:"T-003", title:"Renew MOH facility license",        project:"Compliance",priority:"high",  status:"todo",  due:"2026-08-22", tags:["MOH","license"] },
  { id:"T-004", title:"Approve 3 pending leave requests", project:"HR",       priority:"medium", status:"todo",  due:"2026-06-14", tags:["HR","leave"] },
  { id:"T-005", title:"Investigate AP overdue — GE Healthcare",project:"Procurement",priority:"medium",status:"doing", due:"2026-06-15", tags:["AP","vendor"] },
  { id:"T-006", title:"Sign Bupa contract amendment v3",  project:"Legal",     priority:"medium", status:"todo",  due:"2026-06-20", tags:["legal","Bupa"] },
  { id:"T-007", title:"Prepare board pack — July meeting",project:"Executive", priority:"medium", status:"doing", due:"2026-07-01", tags:["board"] },
  { id:"T-008", title:"Read JCI inspection prep doc",    project:"Quality",   priority:"low",    status:"todo",  due:"2026-06-30", tags:["JCI","reading"] },
  { id:"T-009", title:"Approve new SKU additions — pharmacy",project:"Pharmacy",priority:"low",  status:"todo",  due:"2026-06-18", tags:["pharmacy","SKU"] },
  { id:"T-010", title:"Sign off Q2 audit responses",      project:"Finance",   priority:"medium", status:"done",  due:"2026-06-12", tags:["audit"] },
  { id:"T-011", title:"Onboard 3 new hires",              project:"HR",        priority:"medium", status:"done",  due:"2026-06-10", tags:["onboarding"] },
];

const PRI: Record<Priority,{c:string;label:string}> = { high:{c:"#f87171",label:"High"}, medium:{c:"#fbbf24",label:"Medium"}, low:{c:"#4ade80",label:"Low"} };
const STATUS: Record<Status,{c:string;bg:string;label:string;icon:React.ReactNode}> = {
  todo: {c:"rgba(255,255,255,0.5)",bg:"rgba(255,255,255,0.05)",label:"To do",icon:<Circle style={{ width:11, height:11 }}/>},
  doing:{c:"#22d3ee",bg:"rgba(34,211,238,0.1)",label:"In progress",icon:<Clock style={{ width:11, height:11 }}/>},
  done: {c:"#4ade80",bg:"rgba(74,222,128,0.1)",label:"Done",icon:<CheckCircle2 style={{ width:11, height:11 }}/>},
};

export default function TodoPage() {
  const [tasks, setTasks] = useState(INITIAL);
  const [view, setView] = useState<"kanban"|"list">("kanban");
  const [newTitle, setNewTitle] = useState("");

  function addTask() {
    if (!newTitle.trim()) return;
    setTasks(prev => [{ id:`T-${String(prev.length+1).padStart(3,"0")}`, title:newTitle, project:"Personal", priority:"medium" as Priority, status:"todo" as Status, due:new Date(Date.now()+86400000*3).toISOString().split("T")[0], tags:[] }, ...prev]);
    setNewTitle("");
  }
  function move(id: string, to: Status) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status:to } : t));
  }
  function toggleDone(id: string) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: t.status === "done" ? "todo" : "done" } : t));
  }

  const stats = { total:tasks.length, todo:tasks.filter(t=>t.status==="todo").length, doing:tasks.filter(t=>t.status==="doing").length, done:tasks.filter(t=>t.status==="done").length, overdue:tasks.filter(t=>t.status!=="done"&&new Date(t.due)<new Date()).length };

  return (
    <div style={{ padding:24, minHeight:"100vh", background:"#080d18" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0 }}>To-do</h1>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:3 }}>Personal & team tasks · Kanban / list views · Projects · Priorities · Tags</p>
        </div>
        <div style={{ display:"flex", gap:6, background:"rgba(255,255,255,0.04)", borderRadius:10, padding:3 }}>
          {(["kanban","list"] as const).map(v => (
            <button key={v} onClick={()=>setView(v)} style={{ padding:"6px 14px", border:"none", borderRadius:7, background:view===v?"#e67e22":"transparent", color:view===v?"white":"rgba(255,255,255,0.5)", fontSize:12, fontWeight:600, cursor:"pointer", textTransform:"capitalize" }}>{v}</button>
          ))}
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10, marginBottom:18 }}>
        <Card style={{ padding:"12px 16px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Total</p><p style={{ fontSize:22, fontWeight:800, color:"#22d3ee", margin:"4px 0 0" }}>{stats.total}</p></Card>
        <Card style={{ padding:"12px 16px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>To do</p><p style={{ fontSize:22, fontWeight:800, color:"#94a3b8", margin:"4px 0 0" }}>{stats.todo}</p></Card>
        <Card style={{ padding:"12px 16px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>In progress</p><p style={{ fontSize:22, fontWeight:800, color:"#22d3ee", margin:"4px 0 0" }}>{stats.doing}</p></Card>
        <Card style={{ padding:"12px 16px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Done</p><p style={{ fontSize:22, fontWeight:800, color:"#4ade80", margin:"4px 0 0" }}>{stats.done}</p></Card>
        <Card style={{ padding:"12px 16px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Overdue</p><p style={{ fontSize:22, fontWeight:800, color:"#f87171", margin:"4px 0 0" }}>{stats.overdue}</p></Card>
      </div>

      <div style={{ display:"flex", gap:8, marginBottom:16 }}>
        <div style={{ flex:1, display:"flex", alignItems:"center", gap:8, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:10, padding:"0 14px" }}>
          <Plus style={{ width:13, height:13, color:"rgba(255,255,255,0.4)" }} />
          <input value={newTitle} onChange={e=>setNewTitle(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addTask()} placeholder="Quick add a task and press Enter..." style={{ flex:1, background:"none", border:"none", color:"#f1f5f9", fontSize:13, outline:"none", padding:"10px 0" }} />
        </div>
        <button onClick={addTask} style={{ background:"#e67e22", color:"white", border:"none", borderRadius:10, padding:"0 22px", fontSize:13, fontWeight:700, cursor:"pointer" }}>Add</button>
      </div>

      {view === "kanban" ? (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
          {(["todo","doing","done"] as Status[]).map(col => (
            <Card key={col} style={{ padding:0, overflow:"hidden" }}>
              <div style={{ padding:"12px 16px", borderBottom:"1px solid rgba(255,255,255,0.06)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <span style={{ fontSize:11, fontWeight:700, color:STATUS[col].c, textTransform:"uppercase", letterSpacing:"0.07em" }}>{STATUS[col].label}</span>
                <span style={{ fontSize:10, background:"rgba(255,255,255,0.05)", color:"rgba(255,255,255,0.5)", borderRadius:8, padding:"1px 7px", fontWeight:700 }}>{tasks.filter(t=>t.status===col).length}</span>
              </div>
              <div style={{ padding:"8px 10px", display:"flex", flexDirection:"column", gap:6, minHeight:200 }}>
                {tasks.filter(t=>t.status===col).map(t => {
                  const pri = PRI[t.priority];
                  const overdue = t.status !== "done" && new Date(t.due) < new Date();
                  return (
                    <div key={t.id} style={{ padding:"10px 12px", background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.05)", borderRadius:10, cursor:"pointer", borderLeft:`3px solid ${pri.c}` }}>
                      <div style={{ display:"flex", alignItems:"flex-start", gap:8, marginBottom:6 }}>
                        <button onClick={()=>toggleDone(t.id)} style={{ background:"none", border:"none", cursor:"pointer", padding:0, marginTop:2 }}>
                          {t.status === "done" ? <CheckCircle2 style={{ width:13, height:13, color:"#4ade80" }} /> : <Circle style={{ width:13, height:13, color:"rgba(255,255,255,0.3)" }} />}
                        </button>
                        <p style={{ fontSize:12, color: t.status === "done" ? "rgba(255,255,255,0.4)" : "#f1f5f9", fontWeight:500, margin:0, textDecoration: t.status === "done" ? "line-through" : "none", flex:1 }}>{t.title}</p>
                      </div>
                      <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                        <span style={{ fontSize:9, background:"rgba(167,139,250,0.12)", color:"#a78bfa", borderRadius:4, padding:"1px 6px", fontWeight:600 }}>{t.project}</span>
                        <span style={{ fontSize:9, color:overdue?"#f87171":"rgba(255,255,255,0.4)", fontWeight:overdue?700:500 }}>{overdue && "⚠ "}{t.due}</span>
                      </div>
                      {col !== "done" && (
                        <button onClick={()=>move(t.id, col === "todo" ? "doing" : "done")} style={{ marginTop:6, fontSize:9, background:"rgba(230,126,34,0.15)", border:"none", color:"#e67e22", borderRadius:5, padding:"3px 8px", fontWeight:600, cursor:"pointer" }}>→ {col === "todo" ? "Start" : "Done"}</button>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card style={{ padding:0, overflow:"hidden" }}>
          {tasks.map(t => {
            const sm = STATUS[t.status]; const pri = PRI[t.priority]; const overdue = t.status !== "done" && new Date(t.due) < new Date();
            return (
              <div key={t.id} style={{ padding:"10px 16px", borderBottom:"1px solid rgba(255,255,255,0.04)", display:"grid", gridTemplateColumns:"30px 1fr 120px 100px 100px 80px", gap:12, alignItems:"center" }}>
                <button onClick={()=>toggleDone(t.id)} style={{ background:"none", border:"none", cursor:"pointer", padding:0 }}>{t.status === "done" ? <CheckCircle2 style={{ width:15, height:15, color:"#4ade80" }} /> : <Circle style={{ width:15, height:15, color:"rgba(255,255,255,0.3)" }} />}</button>
                <span style={{ fontSize:12, color: t.status === "done" ? "rgba(255,255,255,0.4)" : "#f1f5f9", textDecoration: t.status === "done" ? "line-through" : "none" }}>{t.title}</span>
                <span style={{ fontSize:10, background:"rgba(167,139,250,0.12)", color:"#a78bfa", borderRadius:5, padding:"2px 8px", fontWeight:700, textAlign:"center" }}>{t.project}</span>
                <span style={{ fontSize:10, background:`${pri.c}18`, color:pri.c, borderRadius:5, padding:"2px 8px", fontWeight:700, textAlign:"center" }}>{pri.label}</span>
                <span style={{ fontSize:11, color:overdue?"#f87171":"rgba(255,255,255,0.5)", fontWeight:overdue?700:500 }}>{overdue && "⚠ "}{t.due}</span>
                <span style={{ fontSize:10, background:sm.bg, color:sm.c, borderRadius:5, padding:"3px 9px", fontWeight:700, textTransform:"uppercase", textAlign:"center" }}>{sm.label}</span>
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
}
