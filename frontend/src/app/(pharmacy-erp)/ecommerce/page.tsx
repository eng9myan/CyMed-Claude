"use client";
import { ShoppingCart, Pill, Truck, Star } from "lucide-react";

function Card({ children, style={} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>{children}</div>;
}

const ORDERS = [
  { id:"ORD-2026-08471", customer:"Ahmad Al-Rashid", items:3, total:142.50, status:"out_for_delivery", eta:"35 min" },
  { id:"ORD-2026-08470", customer:"Fatima Al-Zahra", items:1, total:42.00,  status:"prescription_review", eta:"pharmacist verify" },
  { id:"ORD-2026-08469", customer:"Khalid Al-Dosari",items:8, total:284.00, status:"packing", eta:"ships today" },
  { id:"ORD-2026-08468", customer:"Sara Al-Ghamdi",  items:2, total:96.00,  status:"delivered", eta:"delivered 12:42" },
];

const PRODUCTS = [
  { name:"Panadol Extra (50 tabs)",    price:12.50, image:"💊", rating:4.7, otc:true },
  { name:"Vitamin D3 5000IU",          price:38.00, image:"💊", rating:4.9, otc:true },
  { name:"Glucometer + 50 strips",     price:155,   image:"🩸", rating:4.6, otc:true },
  { name:"Cetaphil Moisturiser",       price:65.00, image:"🧴", rating:4.8, otc:true },
  { name:"Omega-3 Fish Oil",           price:42.00, image:"💊", rating:4.7, otc:true },
  { name:"Augmentin 625mg (Rx)",       price:45.00, image:"💊", rating:4.5, otc:false },
];

const STATUS_META: Record<string,{c:string;label:string}> = {
  out_for_delivery:{c:"#22d3ee",label:"Out for Delivery"},
  prescription_review:{c:"#fbbf24",label:"Rx Review"},
  packing:{c:"#a78bfa",label:"Packing"},
  delivered:{c:"#4ade80",label:"Delivered"},
};

export default function EcommercePage() {
  return (
    <div style={{ padding:24, minHeight:"100vh", background:"#080d18" }}>
      <div style={{ marginBottom:20 }}>
        <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0 }}>Online Pharmacy & E-Commerce</h1>
        <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:3 }}>OTC online catalog · Rx upload · Home delivery tracking · Loyalty points</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:18 }}>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Orders Today</p><p style={{ fontSize:24, fontWeight:800, color:"#22d3ee", margin:"4px 0 0" }}>184</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Revenue Today</p><p style={{ fontSize:24, fontWeight:800, color:"#4ade80", margin:"4px 0 0" }}>SAR 24.8K</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>In Delivery</p><p style={{ fontSize:24, fontWeight:800, color:"#fbbf24", margin:"4px 0 0" }}>42</p></Card>
        <Card style={{ padding:"14px 18px" }}><p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>Avg Delivery Time</p><p style={{ fontSize:24, fontWeight:800, color:"#a78bfa", margin:"4px 0 0" }}>52 min</p></Card>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 420px", gap:16 }}>
        <Card style={{ padding:18 }}>
          <h3 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:"0 0 14px" }}>Online Store — Top Products</h3>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))", gap:10 }}>
            {PRODUCTS.map(p => (
              <div key={p.name} style={{ padding:12, background:"rgba(255,255,255,0.02)", borderRadius:10 }}>
                <div style={{ width:"100%", aspectRatio:"1", background:"rgba(230,126,34,0.05)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:32, marginBottom:8 }}>{p.image}</div>
                <p style={{ fontSize:11, fontWeight:600, color:"#f1f5f9", margin:0 }}>{p.name}</p>
                {!p.otc && <span style={{ fontSize:9, color:"#f472b6", fontWeight:700, marginTop:3, display:"inline-block" }}>Rx</span>}
                <div style={{ display:"flex", justifyContent:"space-between", marginTop:6 }}>
                  <p style={{ fontSize:13, color:"#e67e22", fontWeight:800, margin:0 }}>SAR {p.price}</p>
                  <p style={{ fontSize:10, color:"rgba(255,255,255,0.5)", margin:0 }}><Star style={{ width:9, height:9, display:"inline", color:"#fbbf24", fill:"#fbbf24" }}/>{p.rating}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card style={{ padding:0, overflow:"hidden" }}>
          <div style={{ padding:"14px 18px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
            <h3 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:0 }}>Order Tracking</h3>
          </div>
          {ORDERS.map(o => {
            const sm = STATUS_META[o.status];
            return (
              <div key={o.id} style={{ padding:"12px 16px", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
                  <p style={{ fontSize:11, fontFamily:"monospace", color:"#22d3ee", margin:0 }}>{o.id}</p>
                  <span style={{ fontSize:9, background:`${sm.c}18`, color:sm.c, borderRadius:5, padding:"2px 7px", fontWeight:700 }}>{sm.label}</span>
                </div>
                <p style={{ fontSize:12, fontWeight:600, color:"#f1f5f9", margin:0 }}>{o.customer}</p>
                <div style={{ display:"flex", justifyContent:"space-between", marginTop:4 }}>
                  <span style={{ fontSize:10, color:"rgba(255,255,255,0.4)" }}>{o.items} items · SAR {o.total}</span>
                  <span style={{ fontSize:10, color:"#4ade80", fontWeight:700 }}><Truck style={{ width:9, height:9, display:"inline", marginRight:3 }}/>{o.eta}</span>
                </div>
              </div>
            );
          })}
        </Card>
      </div>
    </div>
  );
}
