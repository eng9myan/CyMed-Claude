"use client";
import { Package, Star, TrendingDown, ShoppingCart } from "lucide-react";

function Card({ children, style={} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>{children}</div>;
}

const PRODUCTS = [
  { name:"Surgical gloves nitrile, sterile (size 7.5)", category:"Consumables", vendor:"MedSupply Arabia", price:42.50, unit:"box of 50", rating:4.8, savings:"−14% vs list" },
  { name:"IV cannula 18G with port",                    category:"Consumables", vendor:"BD Healthcare",     price:8.20,  unit:"per piece", rating:4.9, savings:"−8%" },
  { name:"Defibrillator paddles AED-Plus",              category:"Equipment",   vendor:"Zoll Medical",       price:1850,  unit:"each",     rating:4.7, savings:"−22%" },
  { name:"Insulin Glargine 100 IU/mL",                  category:"Pharmacy",    vendor:"Sanofi Aventis",     price:48.00, unit:"per pen", rating:4.9, savings:"NPHIES" },
  { name:"X-ray film 14×17 inch",                       category:"Imaging",     vendor:"Carestream",         price:3.40,  unit:"per sheet",rating:4.6, savings:"−12%" },
  { name:"Centrifuge tube 15mL, sterile",               category:"Lab",         vendor:"BD Falcon",          price:0.85,  unit:"per piece",rating:4.7, savings:"−18%" },
];

export default function MarketplacePage() {
  return (
    <div style={{ padding:24, minHeight:"100vh", background:"#080d18" }}>
      <div style={{ marginBottom:20 }}>
        <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0 }}>Healthcare B2B Marketplace</h1>
        <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:3 }}>Group purchasing organization (GPO) · Pre-negotiated prices · Multi-vendor catalog · 5-vendor price comparison</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:18 }}>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Catalog SKUs</p><p style={{ fontSize:24, fontWeight:800, color:"#22d3ee", margin:"4px 0 0" }}>18,400</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Approved Vendors</p><p style={{ fontSize:24, fontWeight:800, color:"#a78bfa", margin:"4px 0 0" }}>142</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>YTD Savings</p><p style={{ fontSize:24, fontWeight:800, color:"#4ade80", margin:"4px 0 0" }}>SAR 8.4M</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Open POs</p><p style={{ fontSize:24, fontWeight:800, color:"#fbbf24", margin:"4px 0 0" }}>142</p></Card>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:12 }}>
        {PRODUCTS.map(p => (
          <Card key={p.name} style={{ padding:18 }}>
            <div style={{ width:"100%", aspectRatio:"4/3", background:"linear-gradient(135deg,rgba(249,115,22,0.06),rgba(167,139,250,0.03))", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:12 }}>
              <Package style={{ width:32, height:32, color:"rgba(249,115,22,0.4)" }} />
            </div>
            <span style={{ fontSize:9, background:"rgba(34,211,238,0.12)", color:"#22d3ee", borderRadius:5, padding:"2px 7px", fontWeight:700 }}>{p.category}</span>
            <p style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:"6px 0 4px", lineHeight:1.3 }}>{p.name}</p>
            <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:"0 0 8px" }}>{p.vendor}</p>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
              <div>
                <p style={{ fontSize:18, fontWeight:800, color:"#e67e22", margin:0 }}>SAR {p.price}</p>
                <p style={{ fontSize:9, color:"rgba(255,255,255,0.4)", margin:0 }}>{p.unit}</p>
              </div>
              <div style={{ textAlign:"right" }}>
                <p style={{ fontSize:11, fontWeight:700, color:"#4ade80", margin:0, display:"flex", alignItems:"center", gap:3 }}><TrendingDown style={{ width:11, height:11 }}/>{p.savings}</p>
                <p style={{ fontSize:10, color:"rgba(255,255,255,0.5)", margin:"2px 0 0" }}><Star style={{ width:9, height:9, display:"inline", color:"#fbbf24", fill:"#fbbf24" }}/>{p.rating}</p>
              </div>
            </div>
            <button style={{ width:"100%", background:"rgba(230,126,34,0.15)", border:"1px solid rgba(230,126,34,0.3)", color:"#e67e22", borderRadius:8, padding:"7px 0", fontSize:12, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:5 }}><ShoppingCart style={{ width:12, height:12 }}/>Add to PO</button>
          </Card>
        ))}
      </div>
    </div>
  );
}
