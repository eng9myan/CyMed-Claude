"use client";

import { useState } from "react";
import {
  Mail, MessageSquare, Send, Users, BarChart3, Plus,
  CheckCircle2, Clock, PauseCircle, XCircle, Eye, MousePointer,
  Filter, Calendar, ChevronDown, Bell, Heart,
} from "lucide-react";

type CampaignType = "email" | "sms";
type CampaignStatus = "draft" | "scheduled" | "sent" | "active" | "paused";
type SegmentType = "all" | "diabetic" | "chronic" | "post_discharge" | "missed_followup" | "vaccination_due";

type Campaign = {
  id: string; name: string; type: CampaignType; status: CampaignStatus;
  segment: SegmentType; recipients: number; scheduledAt?: string;
  sentAt?: string; subject?: string; body: string;
  stats?: { sent: number; delivered: number; opened: number; clicked: number; unsubscribed: number };
};

const STATUS_META: Record<CampaignStatus, { color:string; bg:string; label:string; icon:React.ReactNode }> = {
  draft:     { color:"rgba(255,255,255,0.4)", bg:"rgba(255,255,255,0.06)", label:"Draft",     icon:<Clock style={{ width:11, height:11 }} /> },
  scheduled: { color:"#fbbf24",               bg:"rgba(251,191,36,0.1)",   label:"Scheduled", icon:<Clock style={{ width:11, height:11 }} /> },
  sent:      { color:"#4ade80",               bg:"rgba(74,222,128,0.1)",   label:"Sent",      icon:<CheckCircle2 style={{ width:11, height:11 }} /> },
  active:    { color:"#22d3ee",               bg:"rgba(34,211,238,0.1)",   label:"Active",    icon:<Send style={{ width:11, height:11 }} /> },
  paused:    { color:"#fb923c",               bg:"rgba(251,146,60,0.1)",   label:"Paused",    icon:<PauseCircle style={{ width:11, height:11 }} /> },
};

const SEGMENT_LABELS: Record<SegmentType, string> = {
  all:"All Patients",
  diabetic:"Diabetic Patients",
  chronic:"Chronic Disease",
  post_discharge:"Post-Discharge (30d)",
  missed_followup:"Missed Follow-up",
  vaccination_due:"Vaccination Due",
};

const CAMPAIGNS: Campaign[] = [
  {
    id:"C001", name:"Ramadan Diabetes Awareness", type:"email", status:"sent", segment:"diabetic",
    recipients:3240, sentAt:"2026-06-10 09:00",
    subject:"Manage Your Diabetes Better This Ramadan â€” CyMed Health Tips",
    body:"Dear {{patient_name}},\n\nRamadan Mubarak! During fasting, managing your blood sugar is more important than ever...",
    stats:{ sent:3240, delivered:3190, opened:1456, clicked:312, unsubscribed:14 },
  },
  {
    id:"C002", name:"Post-Discharge 7-Day Check-in", type:"sms", status:"active", segment:"post_discharge",
    recipients:187, sentAt:"2026-06-13 08:00",
    body:"Hi {{patient_name}}, this is CyMed. It's been 7 days since your discharge. How are you feeling? Reply YES for a call-back from your care team.",
    stats:{ sent:187, delivered:182, opened:182, clicked:98, unsubscribed:2 },
  },
  {
    id:"C003", name:"Flu Vaccination Campaign â€” Q3", type:"email", status:"scheduled", segment:"all",
    recipients:12840, scheduledAt:"2026-06-20 07:00",
    subject:"Your Flu Vaccine is Available â€” Book Now at CyMed",
    body:"Dear {{patient_name}},\n\nFlu season is approaching. CyMed offers free flu vaccinations for all registered patients...",
  },
  {
    id:"C004", name:"Missed Follow-up Reminder", type:"sms", status:"scheduled", segment:"missed_followup",
    recipients:234, scheduledAt:"2026-06-14 10:00",
    body:"Hi {{patient_name}}, you missed your follow-up with {{doctor_name}} on {{appointment_date}}. Call 920-CYMED to reschedule.",
  },
  {
    id:"C005", name:"World Heart Day Awareness", type:"email", status:"draft", segment:"chronic",
    recipients:0, subject:"World Heart Day â€” Know Your Numbers",
    body:"Dear {{patient_name}},\n\nOn World Heart Day, CyMed reminds you to stay on top of your cardiovascular health...",
  },
  {
    id:"C006", name:"Children Vaccination Reminder", type:"sms", status:"sent", segment:"vaccination_due",
    recipients:891, sentAt:"2026-06-05 09:30",
    body:"Dear parent, your child {{patient_name}} is due for a vaccination. Please book at CyMed clinic.",
    stats:{ sent:891, delivered:875, opened:875, clicked:341, unsubscribed:8 },
  },
];

const TEMPLATES = [
  { name:"Appointment Reminder",    type:"sms",   desc:"24h before appointment reminder" },
  { name:"Lab Results Ready",       type:"sms",   desc:"Notify patient results available" },
  { name:"Discharge Summary",       type:"email", desc:"After-visit summary email" },
  { name:"Health Campaign",         type:"email", desc:"Awareness / prevention campaigns" },
  { name:"Payment Due Reminder",    type:"sms",   desc:"Outstanding balance reminder" },
  { name:"Preventive Care Due",     type:"email", desc:"Screening / checkup reminders" },
];

function Card({ children, style={}, onClick }: { children: React.ReactNode; style?: React.CSSProperties; onClick?: () => void }) {
  return (
    <div onClick={onClick} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>
      {children}
    </div>
  );
}

function pct(a: number, b: number) { return b > 0 ? `${Math.round((a/b)*100)}%` : "-"; }

export default function CampaignsPage() {
  const [activeC, setActiveC] = useState<Campaign>(CAMPAIGNS[0]);
  const [filter, setFilter] = useState<string>("all");
  const [newOpen, setNewOpen] = useState(false);

  const filtered = CAMPAIGNS.filter(c => filter === "all" || c.status === filter || c.type === filter);

  const totalSent = CAMPAIGNS.filter(c=>c.stats).reduce((s,c)=>s+(c.stats?.sent??0), 0);
  const avgOpen   = CAMPAIGNS.filter(c=>c.stats).reduce((s,c,_,arr)=>s+(c.stats!.opened/c.stats!.sent)/arr.length, 0);

  return (
    <div style={{ padding:"24px", minHeight:"100vh", background:"#080d18" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0 }}>Email & SMS Campaigns</h1>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:3 }}>
            Patient outreach Â· Appointment reminders Â· Health campaigns Â· Segmentation
          </p>
        </div>
        <button onClick={() => setNewOpen(true)}
          style={{ display:"flex", alignItems:"center", gap:7, background:"#e67e22", color:"white", border:"none", borderRadius:10, padding:"8px 18px", fontSize:13, fontWeight:700, cursor:"pointer" }}>
          <Plus style={{ width:14, height:14 }} /> New Campaign
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10, marginBottom:20 }}>
        {[
          { l:"Total Sent", v:totalSent.toLocaleString(), c:"#22d3ee" },
          { l:"Avg Open Rate", v:`${Math.round(avgOpen*100)}%`, c:"#4ade80" },
          { l:"Active Campaigns", v:CAMPAIGNS.filter(c=>c.status==="active").length.toString(), c:"#e67e22" },
          { l:"Scheduled", v:CAMPAIGNS.filter(c=>c.status==="scheduled").length.toString(), c:"#fbbf24" },
          { l:"Templates", v:TEMPLATES.length.toString(), c:"#a78bfa" },
        ].map(s => (
          <Card key={s.l} style={{ padding:"12px 16px" }}>
            <p style={{ fontSize:22, fontWeight:800, color:s.c, margin:0 }}>{s.v}</p>
            <p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:0 }}>{s.l}</p>
          </Card>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"320px 1fr", gap:16 }}>
        {/* Campaign list */}
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {/* Filters */}
          <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
            {["all","email","sms","active","scheduled","sent","draft"].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{ padding:"4px 10px", borderRadius:8, border:`1px solid ${filter===f?"#e67e22":"rgba(255,255,255,0.08)"}`,
                  background:filter===f?"rgba(230,126,34,0.15)":"transparent", color:filter===f?"#e67e22":"rgba(255,255,255,0.35)", fontSize:10, fontWeight:600, cursor:"pointer", textTransform:"capitalize" }}>
                {f}
              </button>
            ))}
          </div>

          {filtered.map(c => {
            const sm = STATUS_META[c.status];
            const isA = activeC.id === c.id;
            return (
              <Card key={c.id} style={{ padding:14, cursor:"pointer",
                border:`1px solid ${isA?"rgba(230,126,34,0.3)":"rgba(255,255,255,0.07)"}`,
                background:isA?"rgba(230,126,34,0.07)":"rgba(255,255,255,0.03)" }}
                onClick={() => setActiveC(c)}>
                <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:6 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                    {c.type === "email"
                      ? <Mail style={{ width:13, height:13, color:"#22d3ee" }} />
                      : <MessageSquare style={{ width:13, height:13, color:"#4ade80" }} />}
                    <span style={{ fontSize:12, fontWeight:700, color:"#f1f5f9" }}>{c.name}</span>
                  </div>
                  <span style={{ display:"flex", alignItems:"center", gap:4, fontSize:10, fontWeight:600, color:sm.color, background:sm.bg, borderRadius:5, padding:"2px 7px" }}>
                    {sm.icon}{sm.label}
                  </span>
                </div>
                <p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:"0 0 8px" }}>{SEGMENT_LABELS[c.segment]}</p>
                <div style={{ display:"flex", gap:8 }}>
                  <span style={{ fontSize:10, display:"flex", alignItems:"center", gap:4, color:"rgba(255,255,255,0.4)" }}>
                    <Users style={{ width:10, height:10 }} />{c.recipients > 0 ? c.recipients.toLocaleString() : "TBD"}
                  </span>
                  {c.stats && (
                    <span style={{ fontSize:10, color:"#4ade80" }}>
                      {pct(c.stats.opened, c.stats.sent)} open
                    </span>
                  )}
                  {(c.sentAt || c.scheduledAt) && (
                    <span style={{ fontSize:10, color:"rgba(255,255,255,0.3)" }}>
                      {c.sentAt ? c.sentAt : `Sched. ${c.scheduledAt}`}
                    </span>
                  )}
                </div>
              </Card>
            );
          })}

          {/* Templates */}
          <div style={{ marginTop:4 }}>
            <p style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.28)", textTransform:"uppercase", letterSpacing:"0.07em", margin:"0 0 10px" }}>Quick Templates</p>
            {TEMPLATES.map(t => (
              <div key={t.name} style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 0", borderBottom:"1px solid rgba(255,255,255,0.04)", cursor:"pointer" }}>
                {t.type==="email" ? <Mail style={{ width:12, height:12, color:"#22d3ee" }} /> : <MessageSquare style={{ width:12, height:12, color:"#4ade80" }} />}
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:11, fontWeight:500, color:"rgba(255,255,255,0.65)", margin:0 }}>{t.name}</p>
                  <p style={{ fontSize:9, color:"rgba(255,255,255,0.3)", margin:0 }}>{t.desc}</p>
                </div>
                <button style={{ fontSize:9, background:"rgba(230,126,34,0.1)", border:"1px solid rgba(230,126,34,0.2)", borderRadius:5, padding:"2px 8px", color:"#e67e22", cursor:"pointer" }}>Use</button>
              </div>
            ))}
          </div>
        </div>

        {/* Campaign detail */}
        <Card style={{ padding:0, overflow:"hidden", display:"flex", flexDirection:"column" }}>
          <div style={{ padding:"16px 20px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <h2 style={{ fontSize:16, fontWeight:800, color:"#f1f5f9", margin:0 }}>{activeC.name}</h2>
              <div style={{ display:"flex", gap:8 }}>
                {activeC.status === "draft" && (
                  <button style={{ background:"#e67e22", color:"white", border:"none", borderRadius:10, padding:"7px 16px", fontSize:12, fontWeight:700, cursor:"pointer" }}>
                    Schedule / Send
                  </button>
                )}
                {activeC.status === "active" && (
                  <button style={{ background:"rgba(251,146,60,0.15)", border:"1px solid rgba(251,146,60,0.3)", borderRadius:10, padding:"7px 14px", fontSize:12, color:"#fb923c", fontWeight:600, cursor:"pointer" }}>
                    Pause
                  </button>
                )}
              </div>
            </div>
            <div style={{ display:"flex", gap:10, marginTop:8 }}>
              <span style={{ fontSize:10, background: activeC.type==="email"?"rgba(34,211,238,0.12)":"rgba(74,222,128,0.12)", color: activeC.type==="email"?"#22d3ee":"#4ade80", borderRadius:6, padding:"2px 8px", fontWeight:700 }}>
                {activeC.type.toUpperCase()}
              </span>
              <span style={{ fontSize:10, background:"rgba(255,255,255,0.06)", color:"rgba(255,255,255,0.45)", borderRadius:6, padding:"2px 8px" }}>
                {SEGMENT_LABELS[activeC.segment]}
              </span>
              <span style={{ display:"flex", alignItems:"center", gap:4, fontSize:10, color:"rgba(255,255,255,0.4)" }}>
                <Users style={{ width:10, height:10 }} />{activeC.recipients.toLocaleString()} recipients
              </span>
            </div>
          </div>

          {/* Stats */}
          {activeC.stats && (
            <div style={{ padding:"14px 20px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
              <h3 style={{ fontSize:12, fontWeight:700, color:"rgba(255,255,255,0.5)", textTransform:"uppercase", letterSpacing:"0.07em", margin:"0 0 12px" }}>Performance</h3>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10 }}>
                {[
                  { l:"Sent",         v:activeC.stats.sent.toLocaleString(),         c:"rgba(255,255,255,0.7)" },
                  { l:"Delivered",    v:`${pct(activeC.stats.delivered,activeC.stats.sent)}`, c:"#22d3ee" },
                  { l:"Opened",       v:`${pct(activeC.stats.opened,activeC.stats.sent)}`, c:"#4ade80" },
                  { l:"Clicked",      v:`${pct(activeC.stats.clicked,activeC.stats.sent)}`, c:"#e67e22" },
                  { l:"Unsubscribed", v:activeC.stats.unsubscribed.toString(), c:"#f87171" },
                ].map(s => (
                  <div key={s.l} style={{ background:"rgba(255,255,255,0.02)", borderRadius:10, padding:"12px 14px", textAlign:"center" }}>
                    <p style={{ fontSize:20, fontWeight:800, color:s.c, margin:0 }}>{s.v}</p>
                    <p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:0 }}>{s.l}</p>
                  </div>
                ))}
              </div>
              {/* Open rate bar */}
              <div style={{ marginTop:12 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                  <span style={{ fontSize:11, color:"rgba(255,255,255,0.5)" }}>Open rate</span>
                  <span style={{ fontSize:11, fontWeight:700, color:"#4ade80" }}>{pct(activeC.stats.opened,activeC.stats.sent)}</span>
                </div>
                <div style={{ height:8, background:"rgba(255,255,255,0.07)", borderRadius:8, overflow:"hidden" }}>
                  <div style={{ height:"100%", background:"linear-gradient(90deg,#4ade80,#22d3ee)", borderRadius:8, width:pct(activeC.stats.opened,activeC.stats.sent) }} />
                </div>
              </div>
            </div>
          )}

          {/* Message preview */}
          <div style={{ padding:"14px 20px", flex:1 }}>
            <h3 style={{ fontSize:12, fontWeight:700, color:"rgba(255,255,255,0.5)", textTransform:"uppercase", letterSpacing:"0.07em", margin:"0 0 12px" }}>
              {activeC.type === "email" ? "Email Preview" : "SMS Preview"}
            </h3>
            {activeC.subject && (
              <div style={{ marginBottom:12, padding:"10px 14px", background:"rgba(255,255,255,0.02)", borderRadius:10 }}>
                <p style={{ fontSize:10, color:"rgba(255,255,255,0.3)", margin:"0 0 3px" }}>Subject</p>
                <p style={{ fontSize:13, fontWeight:600, color:"#f1f5f9", margin:0 }}>{activeC.subject}</p>
              </div>
            )}
            <div style={{ padding:"14px 16px", background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:12 }}>
              <p style={{ fontSize:12, color:"rgba(255,255,255,0.65)", margin:0, lineHeight:1.7, whiteSpace:"pre-wrap" }}>
                {activeC.body}
              </p>
              <div style={{ marginTop:12, padding:"8px 12px", background:"rgba(255,255,255,0.03)", borderRadius:8 }}>
                <p style={{ fontSize:10, color:"rgba(255,255,255,0.3)", margin:0 }}>
                  Variables available: <span style={{ color:"#e67e22" }}>{"{{patient_name}}"}</span>  <span style={{ color:"#e67e22" }}>{"{{doctor_name}}"}</span>  <span style={{ color:"#e67e22" }}>{"{{appointment_date}}"}</span>
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* New campaign modal */}
      {newOpen && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200 }}>
          <Card style={{ width:520, padding:28 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
              <h3 style={{ fontSize:16, fontWeight:700, color:"#f1f5f9", margin:0 }}>New Campaign</h3>
              <button onClick={() => setNewOpen(false)} style={{ color:"rgba(255,255,255,0.3)", background:"none", border:"none", cursor:"pointer", fontSize:22 }}>Ã—</button>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              {[{l:"Campaign Name",span:true},{l:"Type"},{l:"Segment"},{l:"Schedule Date"},{l:"Schedule Time"}].map(f => (
                <div key={f.l} style={{ display:"flex", flexDirection:"column", gap:5, gridColumn:(f as {span?:boolean}).span?"1/-1":"auto" }}>
                  <label style={{ fontSize:11, color:"rgba(255,255,255,0.35)", textTransform:"uppercase", letterSpacing:"0.07em" }}>{f.l}</label>
                  {f.l === "Type" || f.l === "Segment" ? (
                    <select style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"9px 13px", color:"#f1f5f9", fontSize:13, outline:"none" }}>
                      {f.l === "Type" ? <><option>Email</option><option>SMS</option></> : Object.entries(SEGMENT_LABELS).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                    </select>
                  ) : (
                    <input type={f.l.includes("Date")?"date":f.l.includes("Time")?"time":"text"} style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"9px 13px", color:"#f1f5f9", fontSize:13, outline:"none" }} />
                  )}
                </div>
              ))}
              <div style={{ display:"flex", flexDirection:"column", gap:5, gridColumn:"1/-1" }}>
                <label style={{ fontSize:11, color:"rgba(255,255,255,0.35)", textTransform:"uppercase", letterSpacing:"0.07em" }}>Message Body</label>
                <textarea rows={4} style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"9px 13px", color:"#f1f5f9", fontSize:13, outline:"none", resize:"vertical" }} />
              </div>
            </div>
            <div style={{ display:"flex", gap:10, marginTop:20 }}>
              <button style={{ background:"#e67e22", color:"white", border:"none", borderRadius:12, padding:"9px 24px", fontSize:13, fontWeight:700, cursor:"pointer" }}>Save Campaign</button>
              <button onClick={() => setNewOpen(false)} style={{ background:"rgba(255,255,255,0.05)", color:"rgba(255,255,255,0.4)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, padding:"9px 18px", fontSize:13, cursor:"pointer" }}>Cancel</button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}


