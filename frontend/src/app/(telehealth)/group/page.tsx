"use client";

import { useState } from "react";
import { Users, Video, Mic, MicOff, VideoOff, Phone, MoreVertical, MessageSquare, Plus, Calendar } from "lucide-react";

type SessionType = "family_meeting" | "tumor_board" | "group_therapy" | "case_conference";

type Participant = { name: string; role: string; muted: boolean; video: boolean; color: string };
type Session = {
  id: string; title: string; type: SessionType; date: string; duration: number;
  participants: Participant[]; host: string;
};

const SESSIONS: Session[] = [
  { id:"GS001", title:"Family Meeting — Mr. Al-Rashid Goals of Care", type:"family_meeting", date:"2026-06-13 15:00", duration:45, host:"Dr. Al-Mutawa",
    participants:[
      { name:"Dr. Al-Mutawa", role:"Attending", muted:false, video:true, color:"#22d3ee" },
      { name:"SW Sara",       role:"Social Work", muted:false, video:true, color:"#a78bfa" },
      { name:"Layla (Wife)",  role:"Family", muted:false, video:true, color:"#f472b6" },
      { name:"Yousef (Son)",  role:"Family", muted:true,  video:true, color:"#fbbf24" },
      { name:"Sara (Daughter)",role:"Family", muted:false, video:false, color:"#4ade80" },
    ] },
  { id:"GS002", title:"Multidisciplinary Tumor Board — Oncology", type:"tumor_board", date:"2026-06-14 13:00", duration:60, host:"Dr. Al-Rashid",
    participants:[
      { name:"Dr. Al-Rashid", role:"Oncology", muted:false, video:true, color:"#f43f5e" },
      { name:"Dr. Hassan",    role:"Radiology", muted:false, video:true, color:"#22d3ee" },
      { name:"Dr. Al-Ghamdi", role:"Pathology", muted:false, video:true, color:"#a78bfa" },
      { name:"Dr. Al-Otaibi", role:"Surgery",   muted:false, video:true, color:"#4ade80" },
      { name:"Dr. Al-Harbi",  role:"Med Onc",   muted:false, video:true, color:"#fbbf24" },
    ] },
  { id:"GS003", title:"CBT Group — Anxiety Management", type:"group_therapy", date:"2026-06-13 17:00", duration:90, host:"Dr. Psych Al-Khalifa",
    participants:[
      { name:"Dr. Psych Al-Khalifa", role:"Psychologist", muted:false, video:true, color:"#a78bfa" },
      { name:"Patient A", role:"Participant", muted:false, video:true, color:"#22d3ee" },
      { name:"Patient B", role:"Participant", muted:true,  video:true, color:"#4ade80" },
      { name:"Patient C", role:"Participant", muted:false, video:false, color:"#fbbf24" },
      { name:"Patient D", role:"Participant", muted:false, video:true, color:"#f472b6" },
      { name:"Patient E", role:"Participant", muted:false, video:true, color:"#fb923c" },
    ] },
];

const TYPE_LABELS: Record<SessionType, { c:string; label:string }> = {
  family_meeting:  {c:"#f472b6",label:"Family Meeting"},
  tumor_board:     {c:"#f43f5e",label:"Tumor Board"},
  group_therapy:   {c:"#a78bfa",label:"Group Therapy"},
  case_conference: {c:"#22d3ee",label:"Case Conference"},
};

function Card({ children, style={}, onClick }: { children: React.ReactNode; style?: React.CSSProperties; onClick?: () => void }) {
  return <div onClick={onClick} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>{children}</div>;
}

export default function GroupSessionsPage() {
  const [active, setActive] = useState<Session>(SESSIONS[0]);
  const [inSession, setInSession] = useState(true);

  return (
    <div style={{ padding:24, minHeight:"100vh", background:"#080d18" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0 }}>Group & Multi-Provider Sessions</h1>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:3 }}>Family meetings · Tumor boards · Group therapy · Multi-specialty case conferences · Host controls · Waiting rooms</p>
        </div>
        <button style={{ background:"#e67e22", color:"white", border:"none", borderRadius:10, padding:"8px 18px", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:7 }}><Plus style={{ width:14, height:14 }} />Schedule Session</button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"320px 1fr", gap:16 }}>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {SESSIONS.map(s => {
            const tm = TYPE_LABELS[s.type];
            const isA = active.id === s.id;
            return (
              <Card key={s.id} style={{ padding:14, cursor:"pointer", border:`1px solid ${isA?"rgba(230,126,34,0.3)":"rgba(255,255,255,0.07)"}`, background:isA?"rgba(230,126,34,0.07)":"rgba(255,255,255,0.03)" }} onClick={()=>setActive(s)}>
                <span style={{ fontSize:9, background:`${tm.c}18`, color:tm.c, borderRadius:5, padding:"2px 7px", fontWeight:700 }}>{tm.label}</span>
                <p style={{ fontSize:12, fontWeight:700, color:"#f1f5f9", margin:"6px 0 4px" }}>{s.title}</p>
                <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:0 }}>{s.date} · {s.duration} min · {s.participants.length} participants</p>
                <p style={{ fontSize:9, color:"rgba(255,255,255,0.3)", margin:"3px 0 0" }}>Host: {s.host}</p>
              </Card>
            );
          })}
        </div>

        <Card style={{ padding:0, overflow:"hidden", background:"#0a0f1e" }}>
          <div style={{ padding:"14px 22px", borderBottom:"1px solid rgba(255,255,255,0.06)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div>
              <h2 style={{ fontSize:15, fontWeight:800, color:"#f1f5f9", margin:0 }}>{active.title}</h2>
              <p style={{ fontSize:11, color:"rgba(74,222,128,0.7)", margin:"3px 0 0" }}>● Live · {active.participants.length} participants</p>
            </div>
            <div style={{ display:"flex", gap:6 }}>
              <button style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:8, padding:"6px 10px", color:"rgba(255,255,255,0.5)", cursor:"pointer" }}><MessageSquare style={{ width:14, height:14 }} /></button>
              <button style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:8, padding:"6px 10px", color:"rgba(255,255,255,0.5)", cursor:"pointer" }}><MoreVertical style={{ width:14, height:14 }} /></button>
            </div>
          </div>

          {/* Video grid */}
          <div style={{ padding:18, display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
            {active.participants.map((p,i) => (
              <div key={p.name} style={{ aspectRatio:"4/3", background:`linear-gradient(135deg, ${p.color}30, ${p.color}10)`, borderRadius:12, position:"relative", border:`1px solid ${p.color}30`, display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden" }}>
                {p.video ? (
                  <div style={{ width:60, height:60, borderRadius:"50%", background:`${p.color}40`, color:p.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, fontWeight:800 }}>
                    {p.name.split(" ").map(w=>w[0]).join("").slice(0,2)}
                  </div>
                ) : (
                  <VideoOff style={{ width:32, height:32, color:`${p.color}60` }} />
                )}
                <div style={{ position:"absolute", bottom:8, left:8, right:8, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <span style={{ fontSize:11, fontWeight:700, color:"#f1f5f9", background:"rgba(0,0,0,0.5)", borderRadius:6, padding:"2px 8px", backdropFilter:"blur(6px)" }}>{p.name}</span>
                  {p.muted && <MicOff style={{ width:13, height:13, color:"#f87171", background:"rgba(0,0,0,0.5)", borderRadius:4, padding:2 }} />}
                </div>
                <span style={{ position:"absolute", top:8, left:8, fontSize:9, color:p.color, background:"rgba(0,0,0,0.5)", borderRadius:4, padding:"1px 6px", fontWeight:700 }}>{p.role}</span>
              </div>
            ))}
          </div>

          {/* Controls */}
          <div style={{ padding:"16px 22px", borderTop:"1px solid rgba(255,255,255,0.06)", display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
            <button style={{ width:44, height:44, borderRadius:"50%", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", color:"#f1f5f9", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}><Mic style={{ width:18, height:18 }} /></button>
            <button style={{ width:44, height:44, borderRadius:"50%", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", color:"#f1f5f9", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}><Video style={{ width:18, height:18 }} /></button>
            <button style={{ width:44, height:44, borderRadius:"50%", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", color:"#f1f5f9", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}><MessageSquare style={{ width:18, height:18 }} /></button>
            <button style={{ height:44, padding:"0 24px", borderRadius:22, background:"#f43f5e", border:"none", color:"white", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:7 }}><Phone style={{ width:16, height:16, transform:"rotate(135deg)" }} />End Session</button>
          </div>
        </Card>
      </div>
    </div>
  );
}
