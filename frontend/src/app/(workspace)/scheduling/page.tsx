"use client";

import { useState } from "react";

type Slot = {
  id: string; time: string; patient: string | null; mrn: string | null;
  type: string; duration: number; status: "booked" | "available" | "blocked" | "completed";
  provider: string; notes?: string;
};

type Provider = { id: string; name: string; specialty: string; color: string };

const PROVIDERS: Provider[] = [
  { id:"p1", name:"Dr. Al-Mutawa",   specialty:"Internal Medicine", color:"#22d3ee" },
  { id:"p2", name:"Dr. Al-Ghamdi",   specialty:"Cardiology",        color:"#a78bfa" },
  { id:"p3", name:"Dr. Al-Harbi",    specialty:"Surgery",           color:"#4ade80" },
  { id:"p4", name:"Dr. Al-Otaibi",   specialty:"OB/GYN",            color:"#f472b6" },
];

const SLOTS: Slot[] = [
  { id:"s1",  time:"08:00", patient:"Ahmad Al-Rashid",   mrn:"MRN-10492", type:"Follow-up",      duration:20, status:"completed", provider:"p1" },
  { id:"s2",  time:"08:20", patient:"Nora Al-Otaibi",    mrn:"MRN-10485", type:"Consult",        duration:30, status:"completed", provider:"p1" },
  { id:"s3",  time:"08:50", patient:null,                mrn:null,        type:"",               duration:10, status:"blocked",   provider:"p1", notes:"Admin block" },
  { id:"s4",  time:"09:00", patient:"Khalid Al-Dosari",  mrn:"MRN-10488", type:"New Patient",    duration:45, status:"booked",    provider:"p1" },
  { id:"s5",  time:"09:45", patient:null,                mrn:null,        type:"",               duration:15, status:"available", provider:"p1" },
  { id:"s6",  time:"10:00", patient:"Sara Al-Zahrani",   mrn:"MRN-10489", type:"Post-op",        duration:30, status:"booked",    provider:"p1" },
  { id:"s7",  time:"10:30", patient:null,                mrn:null,        type:"",               duration:30, status:"available", provider:"p1" },
  { id:"s8",  time:"11:00", patient:"Omar Al-Shehri",    mrn:"MRN-10486", type:"Chemotherapy",   duration:60, status:"booked",    provider:"p1" },
  { id:"s9",  time:"12:00", patient:null,                mrn:null,        type:"",               duration:60, status:"blocked",   provider:"p1", notes:"Lunch break" },
  { id:"s10", time:"13:00", patient:"Fatima Al-Qahtani", mrn:"MRN-10487", type:"Follow-up",      duration:20, status:"booked",    provider:"p1" },
  { id:"s11", time:"13:20", patient:null,                mrn:null,        type:"",               duration:20, status:"available", provider:"p1" },
  { id:"s12", time:"13:40", patient:"James O'Brien",      mrn:"MRN-10490", type:"New Patient",    duration:45, status:"booked",    provider:"p1" },
  { id:"s13", time:"14:25", patient:null,                mrn:null,        type:"",               duration:35, status:"available", provider:"p1" },
  { id:"s14", time:"15:00", patient:"Sarah Thompson",    mrn:"MRN-10491", type:"Consult",        duration:30, status:"booked",    provider:"p1" },
  { id:"s15", time:"15:30", patient:null,                mrn:null,        type:"",               duration:30, status:"available", provider:"p1" },
];

const APPT_TYPES = ["Follow-up","New Patient","Consult","Post-op","Chemotherapy","Procedure","Telehealth"];

const STATUS_STYLE: Record<string, { bg: string; border: string; label: string; textColor: string }> = {
  booked:    { bg:"rgba(34,211,238,0.08)",  border:"rgba(34,211,238,0.25)",  label:"Booked",    textColor:"#22d3ee" },
  available: { bg:"rgba(74,222,128,0.06)",  border:"rgba(74,222,128,0.2)",   label:"Available", textColor:"#4ade80" },
  blocked:   { bg:"rgba(255,255,255,0.02)", border:"rgba(255,255,255,0.06)", label:"Blocked",   textColor:"rgba(255,255,255,0.2)" },
  completed: { bg:"rgba(255,255,255,0.02)", border:"rgba(255,255,255,0.04)", label:"Done",      textColor:"rgba(255,255,255,0.25)" },
};

const DAYS_OF_WEEK = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const today = new Date();

function getDayGrid() {
  const days = [];
  for (let i = -1; i <= 5; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d);
  }
  return days;
}

function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>
      {children}
    </div>
  );
}

export default function SchedulingPage() {
  const [activeProvider, setActiveProvider] = useState("p1");
  const [selectedDay, setSelectedDay]       = useState(today);
  const [selectedSlot, setSelectedSlot]     = useState<Slot | null>(null);
  const [bookingOpen, setBookingOpen]       = useState(false);
  const [newSlotTime, setNewSlotTime]       = useState<string>("");

  const days   = getDayGrid();
  const slots  = SLOTS.filter(s => s.provider === activeProvider);
  const prov   = PROVIDERS.find(p => p.id === activeProvider)!;

  const booked    = slots.filter(s => s.status === "booked").length;
  const available = slots.filter(s => s.status === "available").length;
  const completed = slots.filter(s => s.status === "completed").length;

  return (
    <div style={{ padding:"28px 28px 40px", minHeight:"100vh", background:"#080d18" }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:26, fontWeight:800, color:"#f1f5f9", letterSpacing:"-0.3px", margin:0 }}>Scheduling</h1>
          <p style={{ fontSize:13, color:"rgba(255,255,255,0.38)", marginTop:4 }}>
            {selectedDay.toLocaleDateString("en-SA",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}
          </p>
        </div>
        <button onClick={()=>setBookingOpen(true)} style={{ background:"#e67e22", color:"white", border:"none", borderRadius:12, padding:"9px 20px", fontSize:13, fontWeight:700, cursor:"pointer" }}>
          + Book Appointment
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:20 }}>
        {([
          ["Total Slots", slots.length,  "#60a5fa"],
          ["Booked",      booked,        "#22d3ee"],
          ["Available",   available,     "#4ade80"],
          ["Completed",   completed,     "rgba(255,255,255,0.3)"],
        ] as [string,number,string][]).map(([l,v,c])=>(
          <Card key={l} style={{ padding:16 }}>
            <p style={{ fontSize:28, fontWeight:800, color:c, lineHeight:1, margin:0 }}>{v}</p>
            <p style={{ fontSize:11, color:"rgba(255,255,255,0.38)", marginTop:4 }}>{l}</p>
          </Card>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"220px 1fr", gap:16 }}>
        {/* Left sidebar */}
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {/* Mini calendar strip */}
          <Card style={{ padding:14 }}>
            <p style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.28)", textTransform:"uppercase", letterSpacing:"0.07em", margin:"0 0 10px" }}>Week</p>
            {days.map(d => {
              const isToday = d.toDateString() === today.toDateString();
              const isSelected = d.toDateString() === selectedDay.toDateString();
              return (
                <div key={d.toDateString()} onClick={()=>setSelectedDay(new Date(d))}
                  style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"7px 10px", borderRadius:10, marginBottom:3, cursor:"pointer",
                    background: isSelected?"rgba(230,126,34,0.15)":"transparent",
                    border:`1px solid ${isSelected?"rgba(230,126,34,0.35)":"transparent"}`,
                  }}>
                  <span style={{ fontSize:12, color: isSelected?"#e67e22": isToday?"#f1f5f9":"rgba(255,255,255,0.38)", fontWeight: isToday||isSelected?700:400 }}>
                    {DAYS_OF_WEEK[d.getDay()]} {d.getDate()}
                  </span>
                  {isToday && <span style={{ fontSize:9, background:"#e67e22", color:"white", borderRadius:4, padding:"1px 5px", fontWeight:700 }}>TODAY</span>}
                </div>
              );
            })}
          </Card>

          {/* Provider list */}
          <Card style={{ padding:14 }}>
            <p style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.28)", textTransform:"uppercase", letterSpacing:"0.07em", margin:"0 0 10px" }}>Providers</p>
            {PROVIDERS.map(p=>(
              <div key={p.id} onClick={()=>setActiveProvider(p.id)}
                style={{ display:"flex", alignItems:"center", gap:9, padding:"8px 10px", borderRadius:10, marginBottom:3, cursor:"pointer",
                  background: activeProvider===p.id?p.color+"18":"transparent",
                  border:`1px solid ${activeProvider===p.id?p.color+"40":"transparent"}`,
                }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:p.color, flexShrink:0 }} />
                <div>
                  <p style={{ fontSize:12, fontWeight:600, color:activeProvider===p.id?"#f1f5f9":"rgba(255,255,255,0.55)", margin:0 }}>{p.name}</p>
                  <p style={{ fontSize:10, color:"rgba(255,255,255,0.28)", margin:0 }}>{p.specialty}</p>
                </div>
              </div>
            ))}
          </Card>
        </div>

        {/* Main schedule */}
        <div style={{ display:"grid", gridTemplateColumns:selectedSlot?"1fr 340px":"1fr", gap:16 }}>
          <Card style={{ padding:0, overflow:"hidden" }}>
            <div style={{ padding:"14px 18px", borderBottom:"1px solid rgba(255,255,255,0.06)", display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:10, height:10, borderRadius:"50%", background:prov.color }} />
              <span style={{ fontSize:14, fontWeight:700, color:"#f1f5f9" }}>{prov.name}</span>
              <span style={{ fontSize:12, color:"rgba(255,255,255,0.35)" }}>— {prov.specialty}</span>
            </div>
            <div style={{ padding:"8px 0" }}>
              {slots.map(slot => {
                const st = STATUS_STYLE[slot.status];
                const isSelected = selectedSlot?.id === slot.id;
                return (
                  <div key={slot.id}
                    onClick={()=>{ if(slot.status==="available"){setNewSlotTime(slot.time);setBookingOpen(true);}else{setSelectedSlot(isSelected?null:slot);}}}
                    style={{ display:"flex", alignItems:"stretch", margin:"3px 12px", borderRadius:12, cursor:"pointer",
                      background: isSelected?"rgba(230,126,34,0.08)":st.bg,
                      border:`1px solid ${isSelected?"rgba(230,126,34,0.3)":st.border}`,
                      minHeight: Math.max(40, slot.duration * 0.8),
                      transition:"background 0.15s",
                    }}>
                    {/* Time column */}
                    <div style={{ width:60, padding:"10px 0 10px 14px", flexShrink:0, display:"flex", flexDirection:"column", justifyContent:"flex-start" }}>
                      <span style={{ fontSize:12, fontWeight:700, color:st.textColor }}>{slot.time}</span>
                      <span style={{ fontSize:10, color:"rgba(255,255,255,0.2)", marginTop:1 }}>{slot.duration}m</span>
                    </div>
                    {/* Content */}
                    <div style={{ flex:1, padding:"10px 14px 10px 10px", borderLeft:"1px solid rgba(255,255,255,0.04)" }}>
                      {slot.status === "available" ? (
                        <p style={{ fontSize:12, color:"rgba(74,222,128,0.6)", margin:0, fontStyle:"italic" }}>+ Available — click to book</p>
                      ) : slot.status === "blocked" ? (
                        <p style={{ fontSize:12, color:"rgba(255,255,255,0.2)", margin:0 }}>{slot.notes ?? "Blocked"}</p>
                      ) : (
                        <>
                          <p style={{ fontSize:13, fontWeight:600, color: slot.status==="completed"?"rgba(255,255,255,0.3)":"#f1f5f9", margin:"0 0 2px" }}>{slot.patient}</p>
                          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                            <span style={{ fontSize:11, color:"rgba(255,255,255,0.3)" }}>{slot.mrn}</span>
                            <span style={{ fontSize:10, background:prov.color+"20", color:prov.color, borderRadius:5, padding:"1px 7px", fontWeight:600 }}>{slot.type}</span>
                            <span style={{ fontSize:10, color:st.textColor, marginLeft:"auto" }}>{st.label}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Slot detail */}
          {selectedSlot && selectedSlot.patient && (
            <Card style={{ padding:20 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
                <h3 style={{ fontSize:15, fontWeight:700, color:"#f1f5f9", margin:0 }}>{selectedSlot.patient}</h3>
                <button onClick={()=>setSelectedSlot(null)} style={{ color:"rgba(255,255,255,0.3)", background:"none", border:"none", cursor:"pointer", fontSize:20, lineHeight:1 }}>×</button>
              </div>
              {([
                ["MRN", selectedSlot.mrn??"-"],
                ["Time", selectedSlot.time],
                ["Duration", `${selectedSlot.duration} minutes`],
                ["Type", selectedSlot.type],
                ["Provider", prov.name],
                ["Status", STATUS_STYLE[selectedSlot.status].label],
              ] as [string,string][]).map(([l,v])=>(
                <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                  <span style={{ fontSize:12, color:"rgba(255,255,255,0.35)" }}>{l}</span>
                  <span style={{ fontSize:12, color:"#e2e8f0", fontWeight:500 }}>{v}</span>
                </div>
              ))}
              <div style={{ display:"flex", gap:8, marginTop:16 }}>
                {["Check In","Reschedule","Cancel"].map(a=>(
                  <button key={a} style={{ flex:1, padding:"8px 0", borderRadius:10, fontSize:11, fontWeight:600, cursor:"pointer",
                    background: a==="Check In"?"#e67e22":"rgba(255,255,255,0.05)",
                    color: a==="Check In"?"white":a==="Cancel"?"#f87171":"rgba(255,255,255,0.55)",
                    border:`1px solid ${a==="Check In"?"transparent":a==="Cancel"?"rgba(248,113,113,0.3)":"rgba(255,255,255,0.08)"}`,
                  }}>{a}</button>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Book appointment modal */}
      {bookingOpen && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100 }}>
          <Card style={{ width:520, padding:28 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
              <h3 style={{ fontSize:16, fontWeight:700, color:"#f1f5f9", margin:0 }}>Book Appointment</h3>
              <button onClick={()=>setBookingOpen(false)} style={{ color:"rgba(255,255,255,0.3)", background:"none", border:"none", cursor:"pointer", fontSize:22, lineHeight:1 }}>×</button>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              {[
                { label:"Patient Name" }, { label:"MRN" },
                { label:"Date", value: selectedDay.toISOString().split("T")[0] },
                { label:"Time", value: newSlotTime || "09:00" },
              ].map(f=>(
                <div key={f.label} style={{ display:"flex", flexDirection:"column", gap:5 }}>
                  <label style={{ fontSize:11, color:"rgba(255,255,255,0.35)", textTransform:"uppercase", letterSpacing:"0.07em" }}>{f.label}</label>
                  <input defaultValue={f.value??""} style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"9px 13px", color:"#f1f5f9", fontSize:13, outline:"none" }} />
                </div>
              ))}
              <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                <label style={{ fontSize:11, color:"rgba(255,255,255,0.35)", textTransform:"uppercase", letterSpacing:"0.07em" }}>Type</label>
                <select style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"9px 13px", color:"#f1f5f9", fontSize:13, outline:"none" }}>
                  {APPT_TYPES.map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                <label style={{ fontSize:11, color:"rgba(255,255,255,0.35)", textTransform:"uppercase", letterSpacing:"0.07em" }}>Provider</label>
                <select defaultValue={activeProvider} style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"9px 13px", color:"#f1f5f9", fontSize:13, outline:"none" }}>
                  {PROVIDERS.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display:"flex", gap:10, marginTop:20 }}>
              <button style={{ background:"#e67e22", color:"white", border:"none", borderRadius:12, padding:"9px 24px", fontSize:13, fontWeight:700, cursor:"pointer" }}>Confirm Booking</button>
              <button onClick={()=>setBookingOpen(false)} style={{ background:"rgba(255,255,255,0.05)", color:"rgba(255,255,255,0.4)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, padding:"9px 18px", fontSize:13, cursor:"pointer" }}>Cancel</button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
