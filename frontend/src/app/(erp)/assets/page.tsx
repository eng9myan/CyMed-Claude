"use client";
import { Package, TrendingDown, Wrench, Plus } from "lucide-react";

function Card({ children, style={} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>{children}</div>;
}

const ASSETS = [
  { id:"AST-2024-1041", name:"CT Scanner — Siemens SOMATOM", category:"Imaging",   purchase:2400000, accum:480000, nbv:1920000, life:10, method:"straight_line", location:"Radiology - Room 4", status:"active", nextMaint:"2026-07-22" },
  { id:"AST-2023-2204", name:"MRI 3T — GE Signa Premier",     category:"Imaging",   purchase:6800000, accum:1700000,nbv:5100000, life:8,  method:"straight_line", location:"Radiology - Room 1", status:"active", nextMaint:"2026-06-18" },
  { id:"AST-2024-1842", name:"Surgical Robot — Da Vinci Xi",  category:"Surgery",   purchase:8400000, accum:2100000,nbv:6300000, life:8,  method:"straight_line", location:"OR Theatre 1",      status:"active", nextMaint:"2026-09-12" },
  { id:"AST-2022-3001", name:"Ventilators (×24)",              category:"ICU",        purchase:2400000, accum:1200000,nbv:1200000, life:5,  method:"straight_line", location:"ICU floor",         status:"active", nextMaint:"2026-08-04" },
  { id:"AST-2023-4422", name:"Hematology Analyzer — Sysmex",   category:"Lab",        purchase:840000,  accum:210000, nbv:630000,  life:8,  method:"straight_line", location:"Lab - Haematology", status:"active", nextMaint:"2026-07-15" },
  { id:"AST-2025-5532", name:"Ambulance Fleet (×8 ALS)",       category:"Vehicles",  purchase:3200000, accum:320000, nbv:2880000, life:7,  method:"declining_bal", location:"Ambulance bay",    status:"active", nextMaint:"varied" },
  { id:"AST-2024-6643", name:"HVAC System — Main Building",   category:"Facility",  purchase:1840000, accum:368000, nbv:1472000, life:15, method:"straight_line", location:"Main Building",     status:"active", nextMaint:"2026-12-01" },
  { id:"AST-2020-7754", name:"X-ray Mobile Units (×4)",        category:"Imaging",   purchase:480000,  accum:480000, nbv:0,       life:6,  method:"straight_line", location:"Mobile",            status:"fully_depreciated", nextMaint:"—" },
];

export default function AssetsPage() {
  const total = ASSETS.reduce((s,a)=>s+a.purchase,0);
  const depreciated = ASSETS.reduce((s,a)=>s+a.accum,0);
  const nbv = ASSETS.reduce((s,a)=>s+a.nbv,0);

  return (
    <div style={{ padding:24, minHeight:"100vh", background:"#080d18" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0 }}>Asset Register</h1>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:3 }}>Fixed assets · Depreciation · CMMS · Barcode/QR tags · Location tracking · Disposal</p>
        </div>
        <button style={{ background:"#e67e22", color:"white", border:"none", borderRadius:10, padding:"8px 18px", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:7 }}><Plus style={{ width:14, height:14 }}/>Register Asset</button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:18 }}>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Total Asset Value</p><p style={{ fontSize:22, fontWeight:800, color:"#22d3ee", margin:"4px 0 0" }}>SAR {(total/1000000).toFixed(1)}M</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Accumulated Depr.</p><p style={{ fontSize:22, fontWeight:800, color:"#fb923c", margin:"4px 0 0" }}>SAR {(depreciated/1000000).toFixed(1)}M</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Net Book Value</p><p style={{ fontSize:22, fontWeight:800, color:"#4ade80", margin:"4px 0 0" }}>SAR {(nbv/1000000).toFixed(1)}M</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Maintenance Due (30d)</p><p style={{ fontSize:22, fontWeight:800, color:"#fbbf24", margin:"4px 0 0" }}>{ASSETS.filter(a=>a.nextMaint!=="—" && a.nextMaint!=="varied").length}</p></Card>
      </div>

      <Card style={{ padding:0, overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
          <thead><tr style={{ fontSize:10, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.05em" }}>
            {["Asset Tag","Description","Category","Cost","Accum. Depr.","NBV","Location","Next Maint."].map(h => <th key={h} style={{ textAlign:"left", padding:"12px 14px" }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {ASSETS.map(a => (
              <tr key={a.id} style={{ borderTop:"1px solid rgba(255,255,255,0.04)" }}>
                <td style={{ padding:"12px 14px", color:"#22d3ee", fontFamily:"monospace" }}>{a.id}</td>
                <td style={{ padding:"12px 14px", color:"#f1f5f9", fontWeight:600 }}>{a.name}</td>
                <td style={{ padding:"12px 14px" }}><span style={{ fontSize:10, background:"rgba(167,139,250,0.12)", color:"#a78bfa", borderRadius:5, padding:"2px 8px", fontWeight:700 }}>{a.category}</span></td>
                <td style={{ padding:"12px 14px", color:"#f1f5f9", fontWeight:600 }}>SAR {a.purchase.toLocaleString()}</td>
                <td style={{ padding:"12px 14px", color:"#fb923c" }}>SAR {a.accum.toLocaleString()}</td>
                <td style={{ padding:"12px 14px", color:"#4ade80", fontWeight:700 }}>SAR {a.nbv.toLocaleString()}</td>
                <td style={{ padding:"12px 14px", color:"rgba(255,255,255,0.5)" }}>{a.location}</td>
                <td style={{ padding:"12px 14px", color:"rgba(255,255,255,0.5)" }}>{a.nextMaint}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
