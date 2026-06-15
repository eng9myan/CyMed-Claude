"use client";
import { useState } from "react";
import { Plus, TrendingUp, DollarSign, Mail, Phone, Users } from "lucide-react";

function Card({ children, style={} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>{children}</div>;
}

type Stage = "new" | "qualified" | "proposal" | "negotiation" | "won" | "lost";
type Lead = { id:string; org:string; contact:string; product:string; value:number; stage:Stage; nextAction:string; };

const LEADS: Lead[] = [
  { id:"L001", org:"King Saud Medical City",   contact:"Dr. Al-Rashed", product:"HMS Enterprise",      value:2400000, stage:"negotiation", nextAction:"Contract signature mtg Jun 18" },
  { id:"L002", org:"Asir Hospital Network",     contact:"CFO Bin Salem", product:"Group Edition",       value:1840000, stage:"proposal",    nextAction:"Send revised quote" },
  { id:"L003", org:"Royal Eye Hospital",       contact:"COO Al-Otaibi", product:"RIS + Tele-Ophth",     value:680000,  stage:"qualified",  nextAction:"Discovery call Jun 16" },
  { id:"L004", org:"Al Noor Polyclinic Chain",  contact:"Manager Reem", product:"CMS Multi-Site",       value:380000,  stage:"new",         nextAction:"Send intro deck" },
  { id:"L005", org:"Eastern Medical Lab Group", contact:"Director Hassan", product:"LIS Reference",     value:920000,  stage:"won",         nextAction:"Implementation kickoff Jun 20" },
  { id:"L006", org:"Jeddah Health Network",     contact:"CIO Al-Ghamdi", product:"Patient Portal",      value:240000,  stage:"lost",         nextAction:"Lost — chose competitor" },
];

const STAGE_C: Record<Stage,{c:string;label:string}> = {
  new:{c:"#94a3b8",label:"New"},
  qualified:{c:"#22d3ee",label:"Qualified"},
  proposal:{c:"#fbbf24",label:"Proposal"},
  negotiation:{c:"#fb923c",label:"Negotiation"},
  won:{c:"#4ade80",label:"Closed Won"},
  lost:{c:"#f87171",label:"Lost"},
};

export default function CRMPage() {
  const [active, setActive] = useState<Lead>(LEADS[0]);
  const pipeline = LEADS.filter(l=>!["won","lost"].includes(l.stage)).reduce((s,l)=>s+l.value,0);
  const won = LEADS.filter(l=>l.stage==="won").reduce((s,l)=>s+l.value,0);

  return (
    <div style={{ padding:24, minHeight:"100vh", background:"#080d18" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0 }}>CRM / Sales Pipeline</h1>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:3 }}>Leads · Opportunities · Pipeline · Contacts · Activity tracking · Forecast</p>
        </div>
        <button style={{ background:"#e67e22", color:"white", border:"none", borderRadius:10, padding:"8px 18px", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:7 }}><Plus style={{ width:14, height:14 }}/>New Lead</button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:18 }}>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Open Pipeline</p><p style={{ fontSize:22, fontWeight:800, color:"#22d3ee", margin:"4px 0 0" }}>SAR {(pipeline/1000000).toFixed(1)}M</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Closed Won (Q)</p><p style={{ fontSize:22, fontWeight:800, color:"#4ade80", margin:"4px 0 0" }}>SAR {(won/1000000).toFixed(1)}M</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Win Rate</p><p style={{ fontSize:22, fontWeight:800, color:"#a78bfa", margin:"4px 0 0" }}>34%</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Active Leads</p><p style={{ fontSize:22, fontWeight:800, color:"#fbbf24", margin:"4px 0 0" }}>{LEADS.filter(l=>!["won","lost"].includes(l.stage)).length}</p></Card>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:8, marginBottom:14 }}>
        {(Object.keys(STAGE_C) as Stage[]).map(s => {
          const count = LEADS.filter(l=>l.stage===s).length;
          const val = LEADS.filter(l=>l.stage===s).reduce((sum,l)=>sum+l.value,0);
          return (
            <Card key={s} style={{ padding:14, borderTop:`3px solid ${STAGE_C[s].c}` }}>
              <p style={{ fontSize:10, color:STAGE_C[s].c, margin:0, textTransform:"uppercase", letterSpacing:"0.05em", fontWeight:700 }}>{STAGE_C[s].label}</p>
              <p style={{ fontSize:20, color:"#f1f5f9", margin:"6px 0 2px", fontWeight:800 }}>{count}</p>
              <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:0 }}>SAR {(val/1000).toFixed(0)}K</p>
            </Card>
          );
        })}
      </div>

      <Card style={{ padding:0, overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
          <thead><tr style={{ fontSize:10, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.05em" }}>
            {["Lead","Organization","Product","Value","Stage","Next Action"].map(h => <th key={h} style={{ textAlign:"left", padding:"12px 14px" }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {LEADS.map(l => (
              <tr key={l.id} onClick={()=>setActive(l)} style={{ borderTop:"1px solid rgba(255,255,255,0.04)", cursor:"pointer", background:active.id===l.id?"rgba(230,126,34,0.05)":"transparent" }}>
                <td style={{ padding:"12px 14px" }}>
                  <p style={{ fontSize:11, fontFamily:"monospace", color:"#22d3ee", margin:0 }}>{l.id}</p>
                  <p style={{ fontSize:11, color:"rgba(255,255,255,0.55)", margin:"2px 0 0" }}>{l.contact}</p>
                </td>
                <td style={{ padding:"12px 14px", color:"#f1f5f9", fontWeight:700 }}>{l.org}</td>
                <td style={{ padding:"12px 14px", color:"rgba(255,255,255,0.6)" }}>{l.product}</td>
                <td style={{ padding:"12px 14px", color:"#4ade80", fontWeight:700 }}>SAR {(l.value/1000).toFixed(0)}K</td>
                <td style={{ padding:"12px 14px" }}><span style={{ fontSize:10, background:`${STAGE_C[l.stage].c}18`, color:STAGE_C[l.stage].c, borderRadius:5, padding:"3px 9px", fontWeight:700, textTransform:"uppercase" }}>{STAGE_C[l.stage].label}</span></td>
                <td style={{ padding:"12px 14px", color:"rgba(255,255,255,0.55)", fontSize:11 }}>{l.nextAction}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
