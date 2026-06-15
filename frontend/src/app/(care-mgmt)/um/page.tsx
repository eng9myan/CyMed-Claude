"use client";
import { ClipboardCheck, Clock, AlertTriangle, CheckCircle2, TrendingUp } from "lucide-react";

function Card({ children, style={} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>{children}</div>;
}

const REVIEWS = [
  { id:"UM001", patient:"Ahmad Al-Rashid",  los:8, expected:5, mcg:"InterQual met",      status:"approved",      type:"Concurrent",    payer:"Bupa" },
  { id:"UM002", patient:"Fatima Al-Zahra",  los:4, expected:7, mcg:"Approved 4 more days",status:"approved",     type:"Concurrent",    payer:"Tawuniya" },
  { id:"UM003", patient:"Khalid Al-Dosari", los:12,expected:5, mcg:"⚠ LOS exceeds criteria",status:"under_review",type:"Concurrent",    payer:"MedGulf" },
  { id:"UM004", patient:"Sara Al-Ghamdi",   los:6, expected:6, mcg:"Discharge planning",  status:"discharge_planning",type:"Concurrent",payer:"Daman" },
  { id:"UM005", patient:"Omar Al-Shehri",   los:14,expected:7, mcg:"Denial — observation",status:"denied",        type:"Retrospective", payer:"Aetna" },
];

const STATUS_META: Record<string,{c:string;bg:string}> = {
  approved:{c:"#4ade80",bg:"rgba(74,222,128,0.1)"},
  under_review:{c:"#fbbf24",bg:"rgba(251,191,36,0.1)"},
  discharge_planning:{c:"#a78bfa",bg:"rgba(167,139,250,0.1)"},
  denied:{c:"#f87171",bg:"rgba(248,113,113,0.1)"},
};

export default function UMPage() {
  return (
    <div style={{ padding:24, minHeight:"100vh", background:"#080d18" }}>
      <div style={{ marginBottom:20 }}>
        <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0 }}>Utilization Management</h1>
        <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:3 }}>Prior auth · Length-of-stay management · Concurrent review · Retrospective review · Case conferences · InterQual/MCG criteria</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10, marginBottom:18 }}>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Active Reviews</p><p style={{ fontSize:24, fontWeight:800, color:"#22d3ee", margin:"4px 0 0" }}>{REVIEWS.filter(r=>r.status!=="denied").length}</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Avg ALOS</p><p style={{ fontSize:24, fontWeight:800, color:"#fbbf24", margin:"4px 0 0" }}>5.8d</p><p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:0 }}>target 5.2d</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Denials YTD</p><p style={{ fontSize:24, fontWeight:800, color:"#f87171", margin:"4px 0 0" }}>42</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Appeal Win Rate</p><p style={{ fontSize:24, fontWeight:800, color:"#4ade80", margin:"4px 0 0" }}>74%</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Readmission Rate</p><p style={{ fontSize:24, fontWeight:800, color:"#a78bfa", margin:"4px 0 0" }}>8.4%</p></Card>
      </div>

      <Card style={{ padding:0, overflow:"hidden" }}>
        <div style={{ padding:"14px 18px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
          <h3 style={{ fontSize:14, fontWeight:700, color:"#f1f5f9", margin:0 }}>Active Inpatient Reviews</h3>
        </div>
        {REVIEWS.map(r => {
          const losExceeded = r.los > r.expected;
          const sm = STATUS_META[r.status];
          return (
            <div key={r.id} style={{ padding:"14px 18px", borderBottom:"1px solid rgba(255,255,255,0.04)", display:"grid", gridTemplateColumns:"180px 1fr 200px 180px 120px", gap:14, alignItems:"center" }}>
              <div>
                <p style={{ fontSize:10, fontFamily:"monospace", color:"#22d3ee", margin:0 }}>{r.id}</p>
                <p style={{ fontSize:12, fontWeight:600, color:"#f1f5f9", margin:"3px 0 0" }}>{r.patient}</p>
                <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:"2px 0 0" }}>{r.payer}</p>
              </div>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                  <div>
                    <p style={{ fontSize:9, color:"rgba(255,255,255,0.4)", margin:0, textTransform:"uppercase", fontWeight:700 }}>Current LOS</p>
                    <p style={{ fontSize:18, color:losExceeded?"#f87171":"#f1f5f9", margin:0, fontWeight:800 }}>{r.los}d</p>
                  </div>
                  <div>
                    <p style={{ fontSize:9, color:"rgba(255,255,255,0.4)", margin:0, textTransform:"uppercase", fontWeight:700 }}>Expected</p>
                    <p style={{ fontSize:18, color:"#4ade80", margin:0, fontWeight:800 }}>{r.expected}d</p>
                  </div>
                  {losExceeded && <AlertTriangle style={{ width:18, height:18, color:"#f87171" }} />}
                </div>
              </div>
              <p style={{ fontSize:11, color:"rgba(255,255,255,0.55)", margin:0 }}>{r.mcg}</p>
              <span style={{ fontSize:10, color:"rgba(255,255,255,0.4)" }}>{r.type}</span>
              <span style={{ fontSize:11, background:sm.bg, color:sm.c, borderRadius:6, padding:"4px 12px", fontWeight:700, textAlign:"center", textTransform:"capitalize" }}>{r.status.replace("_"," ")}</span>
            </div>
          );
        })}
      </Card>
    </div>
  );
}
