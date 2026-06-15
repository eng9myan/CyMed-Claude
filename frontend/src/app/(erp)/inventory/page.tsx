"use client";
import { useState } from "react";
import { Package, AlertTriangle, TrendingDown, CalendarClock, Search, Plus, Box } from "lucide-react";

function Card({ children, style={} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>{children}</div>;
}

type Item = {
  sku: string; name: string; category: string;
  qty: number; uom: string; reorder: number;
  warehouse: string; batch?: string; expiry?: string;
  cost: number; valuation: number; daysToExpiry?: number;
};

const ITEMS: Item[] = [
  { sku:"DRG-08471", name:"Amoxicillin 500mg",  category:"Pharma — Rx",   qty:840,   uom:"caps",   reorder:1000, warehouse:"Main Pharmacy",   batch:"LOT-2026-A41", expiry:"2027-04-22", cost:0.42,  valuation:352.80,    daysToExpiry:313 },
  { sku:"DRG-08472", name:"Insulin Glargine 100IU",category:"Pharma — Cold-chain", qty:120,uom:"pens",reorder:200, warehouse:"Cold Storage A",  batch:"LOT-2026-B82", expiry:"2026-09-14", cost:48.00, valuation:5760.00,   daysToExpiry:93 },
  { sku:"CON-08473", name:"Surgical gloves nitrile size 7.5", category:"Consumables", qty:4200, uom:"boxes", reorder:2000, warehouse:"Central Store", cost:42.50, valuation:178500.00 },
  { sku:"CON-08474", name:"IV cannula 18G with port", category:"Consumables", qty:240, uom:"each", reorder:1000, warehouse:"Central Store", cost:8.20, valuation:1968.00 },
  { sku:"DRG-08475", name:"Morphine Sulfate 10mg/mL",category:"Pharma — Controlled", qty:48, uom:"vials", reorder:60, warehouse:"CD Safe Room", batch:"LOT-2026-CD1", expiry:"2026-12-30", cost:18.40, valuation:883.20, daysToExpiry:200 },
  { sku:"DRG-08476", name:"Paracetamol 500mg",  category:"Pharma — OTC",   qty:18400,uom:"tabs",   reorder:10000, warehouse:"Main Pharmacy",   batch:"LOT-2026-PR2", expiry:"2026-07-15", cost:0.08,  valuation:1472.00,   daysToExpiry:32 },
  { sku:"REA-08477", name:"HbA1c reagent kit",  category:"Lab reagent",    qty:24,    uom:"kits",   reorder:30,    warehouse:"Lab Store",       batch:"LOT-2026-HBA",expiry:"2026-08-04", cost:240,    valuation:5760.00,  daysToExpiry:52 },
  { sku:"REA-08478", name:"Troponin I cartridges",category:"Lab reagent",  qty:142,   uom:"each",   reorder:100,   warehouse:"Lab Store",       batch:"LOT-2026-TRP",expiry:"2027-01-12", cost:18.20,  valuation:2584.40,  daysToExpiry:213 },
  { sku:"DRG-08479", name:"Salbutamol Inhaler",  category:"Pharma — Rx",    qty:28,    uom:"inhalers",reorder:50,   warehouse:"Main Pharmacy",   batch:"LOT-2026-SAL",expiry:"2026-06-20", cost:14.20,  valuation:397.60,   daysToExpiry:7 },
];

function classifyExpiry(days?: number) {
  if (days === undefined) return null;
  if (days <= 30) return { c:"#f43f5e", bg:"rgba(244,63,94,0.12)", label:"Expires <30d" };
  if (days <= 90) return { c:"#fb923c", bg:"rgba(251,146,60,0.12)", label:`<${days}d` };
  if (days <= 180) return { c:"#fbbf24", bg:"rgba(251,191,36,0.12)", label:`<${days}d` };
  return { c:"#4ade80", bg:"rgba(74,222,128,0.1)", label:`${days}d` };
}

export default function InventoryPage() {
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("all");

  const filtered = ITEMS.filter(i =>
    (!search || i.name.toLowerCase().includes(search.toLowerCase()) || i.sku.includes(search.toUpperCase())) &&
    (cat === "all" || i.category.startsWith(cat))
  );

  const totalSkus = ITEMS.length;
  const totalVal = ITEMS.reduce((s,i)=>s+i.valuation,0);
  const lowStock = ITEMS.filter(i => i.qty < i.reorder).length;
  const expiringSoon = ITEMS.filter(i => i.daysToExpiry !== undefined && i.daysToExpiry <= 90).length;
  const cats = ["all", ...Array.from(new Set(ITEMS.map(i => i.category.split(" — ")[0])))];

  return (
    <div style={{ padding:24, minHeight:"100vh", background:"#080d18" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0 }}>Inventory Management</h1>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:3 }}>FEFO valuation · Batch/lot · Cycle counts · Expiry alerts · Multi-warehouse</p>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button style={{ background:"rgba(251,191,36,0.1)", border:"1px solid rgba(251,191,36,0.3)", color:"#fbbf24", borderRadius:10, padding:"8px 16px", fontSize:13, fontWeight:700, cursor:"pointer" }}>Cycle count</button>
          <button style={{ background:"#e67e22", color:"white", border:"none", borderRadius:10, padding:"8px 18px", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:7 }}><Plus style={{ width:14, height:14 }}/>New SKU</button>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:18 }}>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Total SKUs</p><p style={{ fontSize:24, fontWeight:800, color:"#22d3ee", margin:"4px 0 0" }}>{totalSkus.toLocaleString()}</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Inventory value</p><p style={{ fontSize:24, fontWeight:800, color:"#4ade80", margin:"4px 0 0" }}>SAR {(totalVal/1000).toFixed(1)}K</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Below reorder</p><p style={{ fontSize:24, fontWeight:800, color:"#fbbf24", margin:"4px 0 0" }}>{lowStock}</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Expiring &lt; 90 days</p><p style={{ fontSize:24, fontWeight:800, color:"#f87171", margin:"4px 0 0" }}>{expiringSoon}</p></Card>
      </div>

      <Card style={{ padding:0, overflow:"hidden" }}>
        <div style={{ padding:"12px 18px", borderBottom:"1px solid rgba(255,255,255,0.06)", display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ flex:1, display:"flex", alignItems:"center", gap:8, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:10, padding:"0 12px" }}>
            <Search style={{ width:13, height:13, color:"rgba(255,255,255,0.3)" }} />
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search SKU or name..." style={{ flex:1, background:"none", border:"none", color:"#f1f5f9", fontSize:12, outline:"none", padding:"8px 0" }} />
          </div>
          <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
            {cats.slice(0,5).map(c => (
              <button key={c} onClick={()=>setCat(c)} style={{ padding:"4px 11px", borderRadius:7, border:`1px solid ${cat===c?"#e67e22":"rgba(255,255,255,0.08)"}`, background:cat===c?"rgba(230,126,34,0.15)":"transparent", color:cat===c?"#e67e22":"rgba(255,255,255,0.35)", fontSize:10, fontWeight:600, cursor:"pointer" }}>{c}</button>
            ))}
          </div>
        </div>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
          <thead><tr style={{ fontSize:10, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.05em" }}>
            {["SKU","Description","Category","Warehouse","Batch / Expiry","Qty","Valuation"].map(h => <th key={h} style={{ textAlign:"left", padding:"10px 14px" }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {filtered.map(i => {
              const exp = classifyExpiry(i.daysToExpiry);
              const low = i.qty < i.reorder;
              return (
                <tr key={i.sku} style={{ borderTop:"1px solid rgba(255,255,255,0.04)", borderLeft: exp?.label==="Expires <30d" ? "3px solid #f43f5e" : low ? "3px solid #fbbf24" : "3px solid transparent" }}>
                  <td style={{ padding:"10px 14px", color:"#22d3ee", fontFamily:"monospace" }}>{i.sku}</td>
                  <td style={{ padding:"10px 14px", color:"#f1f5f9", fontWeight:600 }}>{i.name}</td>
                  <td style={{ padding:"10px 14px" }}><span style={{ fontSize:10, background:"rgba(167,139,250,0.12)", color:"#a78bfa", borderRadius:5, padding:"2px 8px", fontWeight:600 }}>{i.category}</span></td>
                  <td style={{ padding:"10px 14px", color:"rgba(255,255,255,0.6)" }}>{i.warehouse}</td>
                  <td style={{ padding:"10px 14px" }}>
                    {i.batch ? <>
                      <div style={{ fontSize:11, color:"rgba(255,255,255,0.7)", fontFamily:"monospace" }}>{i.batch}</div>
                      {exp && <span style={{ fontSize:9, background:exp.bg, color:exp.c, borderRadius:5, padding:"1px 7px", fontWeight:700 }}>{i.expiry} · {exp.label}</span>}
                    </> : <span style={{ fontSize:11, color:"rgba(255,255,255,0.3)" }}>—</span>}
                  </td>
                  <td style={{ padding:"10px 14px" }}>
                    <div style={{ fontSize:13, fontWeight:700, color: low?"#fbbf24":"#f1f5f9" }}>{i.qty.toLocaleString()} {i.uom}</div>
                    {low && <div style={{ fontSize:9, color:"#fbbf24" }}>Below reorder ({i.reorder})</div>}
                  </td>
                  <td style={{ padding:"10px 14px", color:"#4ade80", fontWeight:700 }}>SAR {i.valuation.toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
