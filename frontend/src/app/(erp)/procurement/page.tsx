"use client";
import { ShoppingCart, Plus, Send } from "lucide-react";

function Card({ children, style={} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>{children}</div>;
}

const POS = [
  { id:"PO-2026-08471", vendor:"MedSupply Arabia", category:"Consumables",  items:24, amount:42400,  status:"approved",     created:"2026-06-12", eta:"2026-06-18" },
  { id:"PO-2026-08472", vendor:"Sanofi Aventis",   category:"Pharmacy",     items:8,  amount:184000, status:"sent_vendor",  created:"2026-06-13", eta:"2026-06-22" },
  { id:"PO-2026-08470", vendor:"GE Healthcare",   category:"Equipment",    items:2,  amount:1240000,status:"pending_appr", created:"2026-06-11", eta:"2026-07-15" },
  { id:"PO-2026-08469", vendor:"BD Medical",       category:"Lab",          items:18, amount:32800,  status:"received",     created:"2026-06-08", eta:"2026-06-13" },
  { id:"PO-2026-08465", vendor:"Roche Diagnostics",category:"Lab Reagents", items:12, amount:96400,  status:"partial_rec",  created:"2026-06-05", eta:"2026-06-12" },
  { id:"PO-2026-08440", vendor:"Carestream",       category:"Imaging",       items:4,  amount:28400,  status:"draft",         created:"2026-06-13", eta:"—" },
];

const STATUS_META: Record<string,{c:string;bg:string}> = {
  draft:{c:"#94a3b8",bg:"rgba(148,163,184,0.1)"},
  pending_appr:{c:"#fbbf24",bg:"rgba(251,191,36,0.1)"},
  approved:{c:"#22d3ee",bg:"rgba(34,211,238,0.1)"},
  sent_vendor:{c:"#a78bfa",bg:"rgba(167,139,250,0.1)"},
  partial_rec:{c:"#fb923c",bg:"rgba(251,146,60,0.1)"},
  received:{c:"#4ade80",bg:"rgba(74,222,128,0.1)"},
};

export default function ProcurementPage() {
  return (
    <div style={{ padding:24, minHeight:"100vh", background:"#080d18" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0 }}>Procurement</h1>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:3 }}>RFQs · Purchase Orders · Goods Receipt · 3-way matching · Vendor performance</p>
        </div>
        <button style={{ background:"#e67e22", color:"white", border:"none", borderRadius:10, padding:"8px 18px", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:7 }}><Plus style={{ width:14, height:14 }}/>New PO</button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10, marginBottom:18 }}>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Open POs</p><p style={{ fontSize:22, fontWeight:800, color:"#22d3ee", margin:"4px 0 0" }}>284</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Committed Value</p><p style={{ fontSize:22, fontWeight:800, color:"#fbbf24", margin:"4px 0 0" }}>SAR 8.2M</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Avg Lead Time</p><p style={{ fontSize:22, fontWeight:800, color:"#a78bfa", margin:"4px 0 0" }}>9.4d</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>On-Time Delivery</p><p style={{ fontSize:22, fontWeight:800, color:"#4ade80", margin:"4px 0 0" }}>91%</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Approved Vendors</p><p style={{ fontSize:22, fontWeight:800, color:"#f472b6", margin:"4px 0 0" }}>142</p></Card>
      </div>

      <Card style={{ padding:0, overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
          <thead><tr style={{ fontSize:10, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.05em" }}>
            {["PO #","Vendor","Category","Items","Amount","Created","ETA","Status"].map(h => <th key={h} style={{ textAlign:"left", padding:"12px 14px" }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {POS.map(p => {
              const sm = STATUS_META[p.status];
              return (
                <tr key={p.id} style={{ borderTop:"1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding:"12px 14px", color:"#22d3ee", fontFamily:"monospace" }}>{p.id}</td>
                  <td style={{ padding:"12px 14px", color:"#f1f5f9", fontWeight:600 }}>{p.vendor}</td>
                  <td style={{ padding:"12px 14px", color:"rgba(255,255,255,0.5)" }}>{p.category}</td>
                  <td style={{ padding:"12px 14px", color:"#a78bfa", fontWeight:700 }}>{p.items}</td>
                  <td style={{ padding:"12px 14px", color:"#f1f5f9", fontWeight:700 }}>SAR {p.amount.toLocaleString()}</td>
                  <td style={{ padding:"12px 14px", color:"rgba(255,255,255,0.5)" }}>{p.created}</td>
                  <td style={{ padding:"12px 14px", color:"rgba(255,255,255,0.5)" }}>{p.eta}</td>
                  <td style={{ padding:"12px 14px" }}><span style={{ fontSize:10, background:sm.bg, color:sm.c, borderRadius:5, padding:"2px 8px", fontWeight:700, textTransform:"uppercase" }}>{p.status.replace("_"," ")}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
