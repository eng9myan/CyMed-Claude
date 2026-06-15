"use client";

import { useState } from "react";
import {
  Calendar, CheckSquare, Plus, Clock, Bell, Users, Flag,
  CheckCircle2, Circle, AlertTriangle, ChevronLeft, ChevronRight,
  Repeat, Paperclip, MoreHorizontal, Filter,
} from "lucide-react";

type EventType = "appointment" | "surgery" | "meeting" | "task" | "reminder" | "on-call";
type Priority = "high" | "medium" | "low";
type TaskStatus = "todo" | "in-progress" | "done";

type CalEvent = {
  id: string; title: string; type: EventType; date: string; time: string;
  endTime?: string; description?: string; assignees?: string[];
  priority?: Priority; color: string; allDay?: boolean;
};

type Task = {
  id: string; title: string; priority: Priority; status: TaskStatus;
  due: string; assignee: string; tags: string[]; dept: string;
};

const TODAY = new Date("2026-06-13");

const TYPE_META: Record<EventType, { color: string; label: string }> = {
  appointment: { color:"#22d3ee", label:"Appointment" },
  surgery:     { color:"#f472b6", label:"Surgery" },
  meeting:     { color:"#a78bfa", label:"Meeting" },
  task:        { color:"#4ade80", label:"Task" },
  reminder:    { color:"#fbbf24", label:"Reminder" },
  "on-call":   { color:"#f87171", label:"On-Call" },
};

const PRIORITY_META: Record<Priority, { color: string; icon: React.ReactNode }> = {
  high:   { color:"#f87171", icon:<AlertTriangle style={{ width:12, height:12 }} /> },
  medium: { color:"#fbbf24", icon:<Flag style={{ width:12, height:12 }} /> },
  low:    { color:"#4ade80", icon:<Circle style={{ width:12, height:12 }} /> },
};

const EVENTS: CalEvent[] = [
  { id:"E1", title:"Dr. Al-Mutawa Ward Round", type:"appointment", date:"2026-06-13", time:"07:30", endTime:"09:00", assignees:["Dr. Al-Mutawa","Sr. Nurse Layla"], color:"#22d3ee" },
  { id:"E2", title:"CABG â€” Mr. Al-Rashid", type:"surgery", date:"2026-06-13", time:"09:00", endTime:"13:00", assignees:["Dr. Al-Ghamdi","Dr. Hassan"], color:"#f472b6" },
  { id:"E3", title:"ICU Team Handover", type:"meeting", date:"2026-06-13", time:"13:30", endTime:"14:00", assignees:["ICU Team"], color:"#a78bfa" },
  { id:"E4", title:"Infection Control Committee", type:"meeting", date:"2026-06-13", time:"15:00", endTime:"16:00", assignees:["IPC Team"], color:"#a78bfa" },
  { id:"E5", title:"Dr. Al-Harbi On-Call Night", type:"on-call", date:"2026-06-13", time:"20:00", endTime:"08:00", color:"#f87171" },
  { id:"E6", title:"Paediatric Clinic", type:"appointment", date:"2026-06-14", time:"08:00", endTime:"12:00", assignees:["Dr. Al-Otaibi"], color:"#22d3ee" },
  { id:"E7", title:"Knee Replacement â€” Mrs. Thompson", type:"surgery", date:"2026-06-15", time:"08:30", endTime:"11:30", assignees:["Dr. Al-Harbi"], color:"#f472b6" },
  { id:"E8", title:"Pharmacy Inventory Review", type:"task", date:"2026-06-14", time:"10:00", color:"#4ade80" },
  { id:"E9", title:"Quality Committee Meeting", type:"meeting", date:"2026-06-16", time:"14:00", endTime:"15:30", assignees:["Quality Team"], color:"#a78bfa" },
  { id:"E10", title:"Annual Maintenance â€” MRI Suite", type:"reminder", date:"2026-06-18", time:"07:00", color:"#fbbf24", allDay:true },
];

const TASKS: Task[] = [
  { id:"T1", title:"Complete OASIS assessments for 3 home health patients", priority:"high", status:"todo", due:"2026-06-13", assignee:"Sr. Nurse Layla", tags:["home-health","assessment"], dept:"Home Health" },
  { id:"T2", title:"Submit monthly infection report to MoH", priority:"high", status:"in-progress", due:"2026-06-14", assignee:"Dr. Al-Zahrani", tags:["reporting","MoH"], dept:"IPC" },
  { id:"T3", title:"Restock ICU crash cart medications", priority:"high", status:"todo", due:"2026-06-13", assignee:"Pharmacist Sami", tags:["ICU","pharmacy"], dept:"Pharmacy" },
  { id:"T4", title:"Update patient consent forms (new template v2.1)", priority:"medium", status:"in-progress", due:"2026-06-15", assignee:"Admin Rasha", tags:["admin","consent"], dept:"Administration" },
  { id:"T5", title:"Review new radiology reporting protocol", priority:"medium", status:"todo", due:"2026-06-16", assignee:"Dr. Al-Ghamdi", tags:["radiology","protocol"], dept:"Radiology" },
  { id:"T6", title:"Train new staff on eMAR system", priority:"medium", status:"todo", due:"2026-06-17", assignee:"Dr. Al-Harbi", tags:["training","eMAR"], dept:"IT/Nursing" },
  { id:"T7", title:"Biomedical calibration â€” 4 analyzers", priority:"low", status:"done", due:"2026-06-12", assignee:"Biomedical Eng. Omar", tags:["equipment","lab"], dept:"Biomedical" },
  { id:"T8", title:"Patient satisfaction survey â€” Q2 compilation", priority:"low", status:"done", due:"2026-06-11", assignee:"Quality Officer", tags:["quality","survey"], dept:"Quality" },
];

const HOURS = Array.from({ length:16 }, (_,i) => i+6); // 06:00â€“21:00

function Card({ children, style={}, onClick }: { children: React.ReactNode; style?: React.CSSProperties; onClick?: () => void }) {
  return (
    <div onClick={onClick} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>
      {children}
    </div>
  );
}

function timeToMinutes(t: string) {
  const [h,m] = t.split(":").map(Number);
  return h * 60 + (m||0);
}

export default function CalendarPage() {
  const [view, setView] = useState<"day"|"week"|"tasks">("day");
  const [activeDate, setActiveDate] = useState(TODAY);
  const [taskFilter, setTaskFilter] = useState<"all"|TaskStatus>("all");
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalEvent | null>(null);

  const dateStr = activeDate.toISOString().split("T")[0];
  const dayEvents = EVENTS.filter(e => e.date === dateStr);

  const filteredTasks = TASKS.filter(t => taskFilter === "all" || t.status === taskFilter);

  function prevDay() {
    const d = new Date(activeDate);
    d.setDate(d.getDate() - 1);
    setActiveDate(d);
  }
  function nextDay() {
    const d = new Date(activeDate);
    d.setDate(d.getDate() + 1);
    setActiveDate(d);
  }

  const taskCounts = {
    todo: TASKS.filter(t => t.status === "todo").length,
    "in-progress": TASKS.filter(t => t.status === "in-progress").length,
    done: TASKS.filter(t => t.status === "done").length,
  };

  return (
    <div style={{ padding:"24px", minHeight:"100vh", background:"#080d18" }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0, letterSpacing:"-0.3px" }}>
            Calendar & Tasks
          </h1>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:3 }}>
            Unified hospital schedule, shift handovers, and team task management
          </p>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <div style={{ display:"flex", gap:0, background:"rgba(255,255,255,0.05)", borderRadius:10, overflow:"hidden", border:"1px solid rgba(255,255,255,0.08)" }}>
            {(["day","week","tasks"] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                style={{ padding:"7px 16px", fontSize:12, fontWeight:600, cursor:"pointer", border:"none", transition:"all 0.15s",
                  background: view === v ? "#e67e22" : "transparent",
                  color: view === v ? "white" : "rgba(255,255,255,0.4)" }}>
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
          <button onClick={() => setNewTaskOpen(true)}
            style={{ display:"flex", alignItems:"center", gap:6, background:"#e67e22", color:"white", border:"none", borderRadius:10, padding:"7px 16px", fontSize:12, fontWeight:700, cursor:"pointer" }}>
            <Plus style={{ width:14, height:14 }} /> New
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:10, marginBottom:16 }}>
        {[
          { l:"Events Today", v:dayEvents.length.toString(), c:"#22d3ee" },
          { l:"Surgeries", v:EVENTS.filter(e=>e.type==="surgery").length.toString(), c:"#f472b6" },
          { l:"Tasks Todo", v:taskCounts.todo.toString(), c:"#f87171" },
          { l:"In Progress", v:taskCounts["in-progress"].toString(), c:"#fbbf24" },
          { l:"Done Today", v:taskCounts.done.toString(), c:"#4ade80" },
          { l:"On-Call", v:EVENTS.filter(e=>e.type==="on-call").length.toString(), c:"#f87171" },
        ].map(s => (
          <Card key={s.l} style={{ padding:"12px 14px" }}>
            <p style={{ fontSize:22, fontWeight:800, color:s.c, margin:0 }}>{s.v}</p>
            <p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:0 }}>{s.l}</p>
          </Card>
        ))}
      </div>

      {view === "tasks" ? (
        /* Tasks view */
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
          {(["todo","in-progress","done"] as TaskStatus[]).map(col => (
            <Card key={col} style={{ padding:0, overflow:"hidden" }}>
              <div style={{ padding:"12px 16px", borderBottom:"1px solid rgba(255,255,255,0.06)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <h3 style={{ fontSize:12, fontWeight:700, color:"rgba(255,255,255,0.7)", margin:0, textTransform:"uppercase", letterSpacing:"0.07em" }}>
                  {col === "in-progress" ? "In Progress" : col.charAt(0).toUpperCase()+col.slice(1)}
                </h3>
                <span style={{ fontSize:10, background:"rgba(255,255,255,0.08)", borderRadius:20, padding:"2px 8px", color:"rgba(255,255,255,0.4)", fontWeight:700 }}>
                  {TASKS.filter(t=>t.status===col).length}
                </span>
              </div>
              <div style={{ padding:"8px 10px", display:"flex", flexDirection:"column", gap:8 }}>
                {TASKS.filter(t => t.status === col).map(task => {
                  const pm = PRIORITY_META[task.priority];
                  const isOverdue = task.status !== "done" && new Date(task.due) < TODAY;
                  return (
                    <div key={task.id} style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.05)", borderRadius:12, padding:14 }}>
                      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8, marginBottom:8 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                          {task.status === "done"
                            ? <CheckCircle2 style={{ width:14, height:14, color:"#4ade80", flexShrink:0 }} />
                            : task.status === "in-progress"
                            ? <Clock style={{ width:14, height:14, color:"#fbbf24", flexShrink:0 }} />
                            : <Circle style={{ width:14, height:14, color:"rgba(255,255,255,0.25)", flexShrink:0 }} />}
                          <span style={{ fontSize:12, fontWeight:600, color: task.status==="done"?"rgba(255,255,255,0.35)":"#f1f5f9", textDecoration: task.status==="done"?"line-through":"none", lineHeight:1.4 }}>{task.title}</span>
                        </div>
                        <span style={{ display:"flex", alignItems:"center", gap:3, color:pm.color, fontSize:10, fontWeight:600, flexShrink:0 }}>
                          {pm.icon}{task.priority}
                        </span>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                        <span style={{ fontSize:10, color:"rgba(255,255,255,0.35)" }}>{task.assignee}</span>
                        <span style={{ fontSize:10, color: isOverdue?"#f87171":"rgba(255,255,255,0.28)", fontWeight: isOverdue ? 700 : 400 }}>
                          {isOverdue ? "âš  Overdue" : `Due ${task.due}`}
                        </span>
                      </div>
                      <div style={{ display:"flex", gap:5, marginTop:8, flexWrap:"wrap" }}>
                        {task.tags.map(tag => (
                          <span key={tag} style={{ fontSize:9, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:6, padding:"2px 7px", color:"rgba(255,255,255,0.4)" }}>{tag}</span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        /* Day / Week calendar */
        <div style={{ display:"grid", gridTemplateColumns:"220px 1fr", gap:16 }}>
          {/* Left: mini strip + event list */}
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {/* Date nav */}
            <Card style={{ padding:14 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                <button onClick={prevDay} style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(255,255,255,0.4)", padding:4 }}>
                  <ChevronLeft style={{ width:16, height:16 }} />
                </button>
                <div style={{ textAlign:"center" }}>
                  <p style={{ fontSize:24, fontWeight:800, color:"#e67e22", margin:0 }}>{activeDate.getDate()}</p>
                  <p style={{ fontSize:11, color:"rgba(255,255,255,0.5)", margin:0 }}>
                    {activeDate.toLocaleDateString("en-SA",{weekday:"short",month:"short",year:"numeric"})}
                  </p>
                </div>
                <button onClick={nextDay} style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(255,255,255,0.4)", padding:4 }}>
                  <ChevronRight style={{ width:16, height:16 }} />
                </button>
              </div>
              <button onClick={() => setActiveDate(TODAY)}
                style={{ width:"100%", background:"rgba(230,126,34,0.1)", border:"1px solid rgba(230,126,34,0.2)", borderRadius:8, padding:"5px 0", fontSize:11, color:"#e67e22", cursor:"pointer", fontWeight:600 }}>
                Today
              </button>
            </Card>

            {/* Event type legend */}
            <Card style={{ padding:14 }}>
              <p style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.28)", textTransform:"uppercase", letterSpacing:"0.07em", margin:"0 0 10px" }}>Event Types</p>
              {Object.entries(TYPE_META).map(([key, meta]) => (
                <div key={key} style={{ display:"flex", alignItems:"center", gap:8, padding:"5px 0" }}>
                  <div style={{ width:8, height:8, borderRadius:"50%", background:meta.color, flexShrink:0 }} />
                  <span style={{ fontSize:11, color:"rgba(255,255,255,0.5)" }}>{meta.label}</span>
                </div>
              ))}
            </Card>

            {/* Upcoming tasks sidebar */}
            <Card style={{ padding:14 }}>
              <p style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.28)", textTransform:"uppercase", letterSpacing:"0.07em", margin:"0 0 10px" }}>Urgent Tasks</p>
              {TASKS.filter(t => t.priority === "high" && t.status !== "done").map(task => (
                <div key={task.id} style={{ display:"flex", alignItems:"flex-start", gap:8, padding:"6px 0", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                  <AlertTriangle style={{ width:12, height:12, color:"#f87171", flexShrink:0, marginTop:2 }} />
                  <div>
                    <p style={{ fontSize:11, fontWeight:500, color:"#f1f5f9", margin:0, lineHeight:1.4 }}>{task.title}</p>
                    <p style={{ fontSize:10, color:"rgba(255,255,255,0.3)", margin:0 }}>{task.assignee}</p>
                  </div>
                </div>
              ))}
            </Card>
          </div>

          {/* Timeline */}
          <Card style={{ padding:0, overflow:"hidden" }}>
            <div style={{ padding:"14px 18px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
              <h3 style={{ fontSize:14, fontWeight:700, color:"#f1f5f9", margin:0 }}>
                {activeDate.toLocaleDateString("en-SA",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}
                {activeDate.toDateString() === TODAY.toDateString() && (
                  <span style={{ marginLeft:8, fontSize:10, background:"#e67e22", color:"white", borderRadius:6, padding:"2px 8px", fontWeight:700 }}>TODAY</span>
                )}
              </h3>
              <p style={{ fontSize:12, color:"rgba(255,255,255,0.35)", margin:"3px 0 0" }}>{dayEvents.length} events scheduled</p>
            </div>

            <div style={{ padding:"8px 0", overflowY:"auto", maxHeight:"calc(100vh - 280px)" }}>
              {HOURS.map(h => {
                const hStr = `${h.toString().padStart(2,"0")}:00`;
                const slotEvents = dayEvents.filter(e => {
                  const start = timeToMinutes(e.time);
                  return start >= h*60 && start < (h+1)*60;
                });
                return (
                  <div key={h} style={{ display:"flex", minHeight:64, borderBottom:"1px solid rgba(255,255,255,0.03)" }}>
                    <div style={{ width:64, padding:"10px 0 0 18px", flexShrink:0 }}>
                      <span style={{ fontSize:11, color:"rgba(255,255,255,0.25)", fontWeight:500 }}>{hStr}</span>
                    </div>
                    <div style={{ flex:1, padding:"6px 14px 6px 8px", display:"flex", flexDirection:"column", gap:4 }}>
                      {slotEvents.map(ev => (
                        <div key={ev.id}
                          onClick={() => setSelectedEvent(selectedEvent?.id === ev.id ? null : ev)}
                          style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 14px", borderRadius:10, cursor:"pointer",
                            background:`${ev.color}12`, border:`1px solid ${ev.color}30`,
                            borderLeft:`3px solid ${ev.color}` }}>
                          <div style={{ flex:1 }}>
                            <p style={{ fontSize:13, fontWeight:600, color:"#f1f5f9", margin:0 }}>{ev.title}</p>
                            <p style={{ fontSize:11, color:"rgba(255,255,255,0.35)", margin:0 }}>
                              {ev.time}{ev.endTime ? ` â€“ ${ev.endTime}` : ""}
                              {ev.assignees && ` Â· ${ev.assignees.join(", ")}`}
                            </p>
                          </div>
                          <span style={{ fontSize:10, background:`${ev.color}20`, color:ev.color, borderRadius:6, padding:"2px 8px", fontWeight:600 }}>
                            {TYPE_META[ev.type].label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* New task modal */}
      {newTaskOpen && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200 }}>
          <Card style={{ width:480, padding:28 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
              <h3 style={{ fontSize:16, fontWeight:700, color:"#f1f5f9", margin:0 }}>New Event / Task</h3>
              <button onClick={() => setNewTaskOpen(false)} style={{ color:"rgba(255,255,255,0.3)", background:"none", border:"none", cursor:"pointer", fontSize:22 }}>Ã—</button>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              {[{l:"Title",span:true},{l:"Date"},{l:"Time"},{l:"Assignee"},{l:"Department"},{l:"Type"}].map(f => (
                <div key={f.l} style={{ display:"flex", flexDirection:"column", gap:5, gridColumn: (f as {span?:boolean}).span ? "1/-1" : "auto" }}>
                  <label style={{ fontSize:11, color:"rgba(255,255,255,0.35)", textTransform:"uppercase", letterSpacing:"0.07em" }}>{f.l}</label>
                  {f.l === "Type" ? (
                    <select style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"9px 13px", color:"#f1f5f9", fontSize:13, outline:"none" }}>
                      {Object.entries(TYPE_META).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  ) : (
                    <input defaultValue={f.l === "Date" ? dateStr : ""} style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"9px 13px", color:"#f1f5f9", fontSize:13, outline:"none" }} />
                  )}
                </div>
              ))}
            </div>
            <div style={{ display:"flex", gap:10, marginTop:20 }}>
              <button style={{ background:"#e67e22", color:"white", border:"none", borderRadius:12, padding:"9px 24px", fontSize:13, fontWeight:700, cursor:"pointer" }}>Save</button>
              <button onClick={() => setNewTaskOpen(false)} style={{ background:"rgba(255,255,255,0.05)", color:"rgba(255,255,255,0.4)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, padding:"9px 18px", fontSize:13, cursor:"pointer" }}>Cancel</button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}


