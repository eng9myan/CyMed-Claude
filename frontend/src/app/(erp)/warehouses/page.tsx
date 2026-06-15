"use client";
import { Warehouse, ArrowRight, Truck, AlertTriangle, Plus } from "lucide-react";

function Card({ children, style={} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>{children}</div>;
}

const WAREHOUSES = [
  { code:"WH-MAIN",  name:"Main Pharmacy Store",     city:"Riyadh — HQ",      skus:1840, util:78, type:"Pharma",  cold:false },
  { code:"WH-COLD-A",name:"Cold Storage A (+2 to +8°C)",city:"Riyadh — HQ",   skus:120,  util:92, type:"Pharma — Cold", cold:true  },
  { code:"WH-CD",    name:"Controlled Drug Safe",     city:"Riyadh — HQ",     skus:48,   util:64, type:"Controlled",cold:false },
  { code:"WH-CENT",  name:"Central Medical Supplies", city:"Riyadh — HQ",     skus:4200, util:88, type:"Consumables",cold:false },
  { code:"WH-LAB",   name:"Lab Reagent Store",        city:"Riyadh — Lab Wing",skus:340, util:71, type:"Reagents", cold:true  },
  { code:"WH-JED",   name:"Jeddah Branch Pharmacy",   city:"Jeddah",           skus:820, util:54, type:"Pharma",   cold:false },
  { code:"WH-DAM",   name:"Dammam Branch Pharmacy",   city:"Dammam",           skus:640, util:62, type:"Pharma",   cold:false },
];

const TRANSFERS = [
  { id:"TRF-2026-0841", from:"WH-MAIN",  to:"WH-JED",   items:24, status:"in_transit",   eta:"2026-06-15 14:00" },
  { id:"TRF-2026-0842", from:"WH-CENT",  to:"WH-DAM",   items:142,status:"picking",      eta:"2026-06-14 09:00" },
  { id:"TRF-2026-0843", from:"WH-COLD-A",to:"WH-LAB",   items:8,  status:"requested",    eta:"2026-06-13 18:00" },
  { id:"TRF-2026-0840", from:"WH-MAIN",  to:"WH-JED",   items:60, status:"received",     eta:"2026-06-12 11:30" },
];

const STATUS: Record<string,{c:string;bg:string}> = {
  requested:{c:"#fbbf24",bg:"rgba(251,191,36,0.1)"},
  picking:{c:"#22d3ee",bg:"rgba(34,211,238,0.1)"},
  in_transit:{c:"#a78bfa",bg:"rgba(167,139,250,0.1)"},
  received:{c:"#4ade80",bg:"rgba(74,222,128,0.1)"},
};

export default function WarehousesPage() {
  return (
    <div style={{ padding:24, minHeight:"100vh", background:"#080d18" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0 }}>Warehouses & Stores</h1>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:3 }}>Multi-location · Inter-store transfers · Picking · Putaway · Cold chain</p>
        </div>
        <button style={{ background:"#e67e22", color:"white", border:"none", borderRadius:10, padding:"8px 18px", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:7 }}><Plus style={{ width:14, height:14 }}/>New transfer</button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:10, marginBottom:18 }}>
        {WAREHOUSES.map(w => (
          <Card key={w.code} style={{ padding:16, borderLeft:`3px solid ${w.cold?"#22d3ee":"#a78bfa"}` }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
              <Warehouse style={{ width:14, height:14, color: w.cold?"#22d3ee":"#a78bfa" }} />
              <span style={{ fontSize:10, fontFamily:"monospace", color:"rgba(255,255,255,0.5)" }}>{w.code}</span>
              {w.cold && <span style={{ fontSize:9, background:"rgba(34,211,238,0.15)", color:"#22d3ee", borderRadius:4, padding:"1px 6px", fontWeight:700 }}>COLD</span>}
            </div>
            <p style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:0 }}>{w.name}</p>
            <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:"2px 0 8px" }}>{w.city}</p>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
              <span style={{ fontSize:10, color:"rgba(255,255,255,0.4)" }}>{w.skus.toLocaleString()} SKUs</span>
              <span style={{ fontSize:10, color: w.util>85?"#f87171":w.util>70?"#fbbf24":"#4ade80", fontWeight:700 }}>{w.util}% util</span>
            </div>
            <div style={{ height:5, background:"rgba(255,255,255,0.06)", borderRadius:3, overflow:"hidden" }}>
              <div style={{ height:"100%", background: w.util>85?"#f87171":w.util>70?"#fbbf24":"#4ade80", width:`${w.util}%` }} />
            </div>
          </Card>
        ))}
      </div>

      <Card style={{ padding:0, overflow:"hidden" }}>
        <div style={{ padding:"14px 18px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
          <h3 style={{ fontSize:14, fontWeight:700, color:"#f1f5f9", margin:0 }}>Inter-warehouse transfers</h3>
        </div>
        {TRANSFERS.map(t => {
          const sm = STATUS[t.status];
          return (
            <div key={t.id} style={{ padding:"14px 18px", borderBottom:"1px solid rgba(255,255,255,0.04)", display:"grid", gridTemplateColumns:"170px 1fr 120px 180px 120px", gap:14, alignItems:"center" }}>
              <span style={{ fontSize:11, fontFamily:"monospace", color:"#22d3ee" }}>{t.id}</span>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:11, fontWeight:600, color:"#f1f5f9", background:"rgba(255,255,255,0.04)", borderRadius:5, padding:"2px 8px" }}>{t.from}</span>
                <ArrowRight style={{ width:13, height:13, color:"rgba(255,255,255,0.4)" }} />
                <span style={{ fontSize:11, fontWeight:600, color:"#f1f5f9", background:"rgba(255,255,255,0.04)", borderRadius:5, padding:"2px 8px" }}>{t.to}</span>
              </div>
              <span style={{ fontSize:12, color:"#a78bfa", fontWeight:700 }}>{t.items} items</span>
              <span style={{ fontSize:11, color:"rgba(255,255,255,0.5)" }}>ETA {t.eta}</span>
              <span style={{ fontSize:10, background:sm.bg, color:sm.c, borderRadius:5, padding:"3px 9px", fontWeight:700, textAlign:"center", textTransform:"uppercase" }}>{t.status.replace("_"," ")}</span>
            </div>
          );
        })}
      </Card>
    </div>
  );
}
