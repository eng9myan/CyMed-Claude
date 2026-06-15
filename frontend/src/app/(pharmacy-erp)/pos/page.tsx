"use client";

import { useState, useEffect, useRef } from "react";
import {
  ShoppingCart, Scan, Search, Plus, Minus, Trash2, Receipt,
  CreditCard, Banknote, Smartphone, Package, RotateCcw, Tag,
  User, CheckCircle2, BarChart3, AlertTriangle, Pause, Play,
  X, Star, Clock, Pill, LogIn, LogOut, RefreshCw, Printer,
} from "lucide-react";

type Product = {
  id: string; barcode: string; name: string; generic?: string;
  category: "rx" | "otc" | "cosmetic" | "consumable"; price: number;
  vat: number; stock: number; unit: string; requiresRx?: boolean;
  controlled?: boolean; image?: string;
};

type CartItem = Product & { qty: number; discount: number };
type PayMethod = "cash" | "card" | "mada" | "insurance" | "loyalty";
type Payment = { method: PayMethod; amount: number };
type HeldOrder = { id: string; customer: string; items: CartItem[]; total: number; ts: string };

const PRODUCTS: Product[] = [
  { id:"P001", barcode:"6281103403610", name:"Panadol Extra 500mg", generic:"Paracetamol+Caffeine", category:"otc", price:12.5, vat:0.15, stock:240, unit:"Strip/10" },
  { id:"P002", barcode:"6281103403611", name:"Ventolin Inhaler 100mcg", generic:"Salbutamol", category:"rx", price:28.0, vat:0.15, stock:85, unit:"Inhaler", requiresRx:true },
  { id:"P003", barcode:"6281103403612", name:"Augmentin 625mg", generic:"Amoxicillin+Clavulanate", category:"rx", price:45.0, vat:0.15, stock:60, unit:"Strip/14", requiresRx:true },
  { id:"P004", barcode:"6281103403613", name:"Cetaphil Moisturising Cream", category:"cosmetic", price:65.0, vat:0.15, stock:32, unit:"250g" },
  { id:"P005", barcode:"6281103403614", name:"Oral-B Toothbrush Medium", category:"otc", price:22.0, vat:0.15, stock:120, unit:"Each" },
  { id:"P006", barcode:"6281103403615", name:"BD Lancets 28G", category:"consumable", price:35.0, vat:0.15, stock:48, unit:"Box/100" },
  { id:"P007", barcode:"6281103403616", name:"Nexium 40mg (Esomeprazole)", generic:"Esomeprazole", category:"rx", price:52.0, vat:0.15, stock:70, unit:"Strip/28", requiresRx:true },
  { id:"P008", barcode:"6281103403617", name:"Vitamin D3 5000IU", category:"otc", price:38.0, vat:0.15, stock:155, unit:"Cap/60" },
  { id:"P009", barcode:"6281103403618", name:"Glucometer OneTouch", category:"consumable", price:155.0, vat:0.15, stock:15, unit:"Each" },
  { id:"P010", barcode:"6281103403619", name:"Cetrizine 10mg", generic:"Cetirizine", category:"otc", price:9.5, vat:0.15, stock:300, unit:"Strip/10" },
  { id:"P011", barcode:"6281103403620", name:"Omega-3 Fish Oil 1000mg", category:"otc", price:42.0, vat:0.15, stock:88, unit:"Cap/100" },
  { id:"P012", barcode:"6281103403621", name:"KN95 Face Mask", category:"consumable", price:18.0, vat:0.15, stock:200, unit:"Box/20" },
  { id:"P013", barcode:"6281103403622", name:"Morphine 10mg/mL", category:"rx", price:84.0, vat:0.15, stock:42, unit:"Vial", requiresRx:true, controlled:true },
  { id:"P014", barcode:"6281103403623", name:"Tramadol 50mg", generic:"Tramadol", category:"rx", price:24.0, vat:0.15, stock:60, unit:"Strip/20", requiresRx:true, controlled:true },
  { id:"P015", barcode:"6281103403624", name:"Insulin Glargine 100IU", generic:"Glargine", category:"rx", price:48.0, vat:0.15, stock:42, unit:"Pen", requiresRx:true },
];

const CATEGORY_META: Record<string, string> = {
  rx:"#a78bfa", otc:"#22d3ee", cosmetic:"#f472b6", consumable:"#4ade80",
};

function Card({ children, style = {}, onClick }: { children: React.ReactNode; style?: React.CSSProperties; onClick?: () => void }) {
  return (
    <div onClick={onClick} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>
      {children}
    </div>
  );
}

export default function POSPage() {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<string>("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [currentMethod, setCurrentMethod] = useState<PayMethod>("card");
  const [tenderAmount, setTenderAmount] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [patientId, setPatientId] = useState("");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [receiptDone, setReceiptDone] = useState(false);
  const [shiftOpen, setShiftOpen] = useState(true);
  const [shiftStart] = useState("08:00");
  const [held, setHeld] = useState<HeldOrder[]>([
    { id:"H-0014", customer:"Walk-in", items:[{ ...PRODUCTS[0], qty:2, discount:0 }], total:25, ts:"14:12" },
    { id:"H-0013", customer:"MRN-10487", items:[{ ...PRODUCTS[6], qty:1, discount:0 }], total:52, ts:"13:48" },
  ]);
  const [tab, setTab] = useState<"sale"|"returns"|"held"|"reports">("sale");
  const scanRef = useRef<HTMLInputElement>(null);

  useEffect(() => { scanRef.current?.focus(); }, []);
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "F8") { e.preventDefault(); if (cart.length) setCheckoutOpen(true); } };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [cart]);

  const filtered = PRODUCTS.filter(p => {
    const q = search.toLowerCase();
    const matchQ = !q || p.name.toLowerCase().includes(q) || p.barcode.includes(q) || (p.generic ?? "").toLowerCase().includes(q);
    const matchC = catFilter === "all" || p.category === catFilter;
    return matchQ && matchC;
  });

  function addToCart(p: Product) {
    setCart(prev => {
      const ex = prev.find(i => i.id === p.id);
      if (ex) return prev.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...p, qty: 1, discount: 0 }];
    });
  }
  function updateQty(id: string, delta: number) {
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i).filter(i => i.qty > 0));
  }
  function removeItem(id: string) { setCart(prev => prev.filter(i => i.id !== id)); }
  function setLineDiscount(id: string, pct: number) {
    setCart(prev => prev.map(i => i.id === id ? { ...i, discount: Math.max(0, Math.min(0.5, pct/100)) } : i));
  }

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty * (1 - i.discount), 0);
  const vatAmt = cart.reduce((s, i) => s + i.price * i.qty * (1 - i.discount) * i.vat, 0);
  const couponDisc = couponApplied ? subtotal * 0.10 : 0;
  const total = Math.round((subtotal + vatAmt - couponDisc) * 100) / 100;
  const paid = payments.reduce((s, p) => s + p.amount, 0);
  const remaining = Math.max(0, total - paid);
  const change = Math.max(0, paid - total);

  function applyCoupon() { if (couponCode.toUpperCase() === "CYMED10") setCouponApplied(true); }
  function holdOrder() {
    if (!cart.length) return;
    setHeld(prev => [{ id:`H-00${15+prev.length}`, customer:patientId||"Walk-in", items:cart, total, ts:new Date().toLocaleTimeString("en-SA",{hour:"2-digit",minute:"2-digit"}) }, ...prev]);
    setCart([]); setPayments([]); setCouponApplied(false); setCouponCode(""); setPatientId("");
  }
  function recallOrder(h: HeldOrder) { setCart(h.items); setPatientId(h.customer === "Walk-in" ? "" : h.customer); setHeld(prev => prev.filter(o => o.id !== h.id)); setTab("sale"); }

  function addPayment() {
    const amt = parseFloat(tenderAmount);
    if (isNaN(amt) || amt <= 0) return;
    setPayments(prev => [...prev, { method: currentMethod, amount: Math.min(amt, remaining + change) }]);
    setTenderAmount("");
  }
  function completeSale() {
    setReceiptDone(true);
    setTimeout(() => {
      setCart([]); setPayments([]); setCheckoutOpen(false); setReceiptDone(false);
      setCouponApplied(false); setCouponCode(""); setPatientId(""); setTenderAmount("");
    }, 2500);
  }

  return (
    <div style={{ padding:"20px 24px", minHeight:"100vh", background:"#080d18", display:"flex", flexDirection:"column", gap:14 }}>
      {/* Header — shift status, terminal, KPIs */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:800, color:"#f1f5f9", margin:0, letterSpacing:"-0.3px" }}>Point of Sale</h1>
          <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", marginTop:3 }}>
            Cashier: Rasha Al-Otaibi · Terminal POS-01 · Shift opened {shiftStart}
            {shiftOpen && <span style={{ color:"#4ade80", marginLeft:8 }}>● Online</span>}
          </p>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          {[
            { l:"Sales today", v:"SAR 3,847" },
            { l:"Transactions", v:"34" },
            { l:"Avg basket", v:"SAR 113" },
            { l:"Refunds", v:"SAR 42" },
          ].map(s => (
            <Card key={s.l} style={{ padding:"8px 14px", textAlign:"center" }}>
              <p style={{ fontSize:14, fontWeight:800, color:"#e67e22", margin:0 }}>{s.v}</p>
              <p style={{ fontSize:9, color:"rgba(255,255,255,0.4)", margin:0 }}>{s.l}</p>
            </Card>
          ))}
          <button onClick={() => setShiftOpen(false)} style={{ background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.3)", color:"#f87171", borderRadius:10, padding:"8px 14px", fontSize:12, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
            <LogOut style={{ width:13, height:13 }} /> Close shift
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:4, borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
        {([
          { k:"sale",    l:"New sale",      i:ShoppingCart },
          { k:"held",    l:`Held (${held.length})`, i:Pause },
          { k:"returns", l:"Returns / refunds", i:RotateCcw },
          { k:"reports", l:"Shift report",   i:BarChart3 },
        ] as const).map(t => (
          <button key={t.k} onClick={() => setTab(t.k)} style={{ padding:"8px 14px", background:"none", border:"none", borderBottom:`2px solid ${tab===t.k?"#e67e22":"transparent"}`, color:tab===t.k?"#e67e22":"rgba(255,255,255,0.4)", fontSize:12, fontWeight:tab===t.k?700:500, cursor:"pointer", marginBottom:-1, display:"flex", alignItems:"center", gap:6 }}>
            <t.i style={{ width:13, height:13 }} />{t.l}
          </button>
        ))}
      </div>

      {tab === "sale" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 400px", gap:14, flex:1 }}>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            <div style={{ display:"flex", gap:8 }}>
              <div style={{ flex:1, display:"flex", alignItems:"center", gap:10, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, padding:"0 14px" }}>
                <Scan style={{ width:16, height:16, color:"rgba(255,255,255,0.35)" }} />
                <input ref={scanRef} value={search} onChange={e => setSearch(e.target.value)} placeholder="Scan barcode or search product name / generic..." style={{ flex:1, background:"none", border:"none", color:"#f1f5f9", fontSize:13, outline:"none", padding:"11px 0" }} />
                {search && <button onClick={() => setSearch("")} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.3)", cursor:"pointer" }}><X style={{ width:13, height:13 }} /></button>}
              </div>
              <div style={{ display:"flex", gap:5 }}>
                {["all","rx","otc","cosmetic","consumable"].map(c => (
                  <button key={c} onClick={() => setCatFilter(c)} style={{ padding:"0 12px", borderRadius:10, border:`1px solid ${catFilter===c?CATEGORY_META[c]??"#e67e22":"rgba(255,255,255,0.08)"}`, background: catFilter===c?`${CATEGORY_META[c]??"#e67e22"}20`:"transparent", color: catFilter===c?CATEGORY_META[c]??"#e67e22":"rgba(255,255,255,0.4)", fontSize:11, fontWeight:600, cursor:"pointer", textTransform:"uppercase", letterSpacing:"0.05em" }}>{c}</button>
                ))}
              </div>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:9, overflowY:"auto", maxHeight:"calc(100vh - 280px)" }}>
              {filtered.map(p => (
                <div key={p.id} onClick={() => addToCart(p)} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, padding:12, cursor:"pointer", position:"relative" }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = `${CATEGORY_META[p.category]}50`)}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")}>
                  <div style={{ position:"absolute", top:8, right:8, display:"flex", gap:3 }}>
                    {p.requiresRx && <span style={{ fontSize:8, fontWeight:700, color:"#f472b6", background:"rgba(244,114,182,0.15)", borderRadius:4, padding:"1px 5px" }}>Rx</span>}
                    {p.controlled && <span style={{ fontSize:8, fontWeight:700, color:"#a78bfa", background:"rgba(167,139,250,0.15)", borderRadius:4, padding:"1px 5px" }}>CD</span>}
                  </div>
                  <div style={{ width:30, height:30, borderRadius:8, background:`${CATEGORY_META[p.category]}20`, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:8 }}>
                    <Package style={{ width:14, height:14, color:CATEGORY_META[p.category] }} />
                  </div>
                  <p style={{ fontSize:12, fontWeight:600, color:"#f1f5f9", margin:"0 0 3px", lineHeight:1.3 }}>{p.name}</p>
                  {p.generic && <p style={{ fontSize:9, color:"rgba(255,255,255,0.35)", margin:"0 0 6px" }}>{p.generic}</p>}
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    <span style={{ fontSize:13, fontWeight:800, color:"#e67e22" }}>SAR {p.price.toFixed(2)}</span>
                    <span style={{ fontSize:9, color: p.stock < 20 ? "#f87171":"rgba(255,255,255,0.3)" }}>{p.stock < 20 ? `⚠${p.stock}` : `${p.stock} ${p.unit}`}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            <Card style={{ padding:12 }}>
              <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:8 }}>
                <User style={{ width:13, height:13, color:"rgba(255,255,255,0.4)" }} />
                <span style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.5)", textTransform:"uppercase", letterSpacing:"0.07em" }}>Customer</span>
              </div>
              <div style={{ display:"flex", gap:6 }}>
                <input value={patientId} onChange={e => setPatientId(e.target.value)} placeholder="MRN, name, or walk-in" style={{ flex:1, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:8, padding:"7px 10px", color:"#f1f5f9", fontSize:12, outline:"none" }} />
                <button style={{ background:"rgba(230,126,34,0.15)", border:"1px solid rgba(230,126,34,0.3)", color:"#e67e22", borderRadius:8, padding:"0 12px", fontSize:11, fontWeight:600, cursor:"pointer" }}>Lookup</button>
              </div>
            </Card>

            <Card style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
              <div style={{ padding:"10px 14px", borderBottom:"1px solid rgba(255,255,255,0.06)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <h3 style={{ fontSize:12, fontWeight:700, color:"#f1f5f9", margin:0, display:"flex", alignItems:"center", gap:6 }}>
                  <ShoppingCart style={{ width:13, height:13, color:"#e67e22" }} /> Cart
                  <span style={{ background:"#e67e22", color:"white", fontSize:9, fontWeight:800, borderRadius:9, padding:"0 6px" }}>{cart.length}</span>
                </h3>
                <div style={{ display:"flex", gap:5 }}>
                  {cart.length > 0 && <>
                    <button onClick={holdOrder} style={{ fontSize:10, background:"rgba(251,191,36,0.12)", border:"1px solid rgba(251,191,36,0.25)", color:"#fbbf24", borderRadius:6, padding:"3px 8px", fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:3 }}><Pause style={{ width:9, height:9 }} />Hold</button>
                    <button onClick={() => setCart([])} style={{ fontSize:10, color:"rgba(255,0,0,0.5)", background:"none", border:"none", cursor:"pointer" }}>Clear</button>
                  </>}
                </div>
              </div>

              <div style={{ flex:1, overflowY:"auto" }}>
                {cart.length === 0 ? (
                  <div style={{ padding:32, textAlign:"center", color:"rgba(255,255,255,0.2)", fontSize:12 }}>
                    <ShoppingCart style={{ width:28, height:28, margin:"0 auto 10px", opacity:0.2 }} />
                    Empty cart — scan or tap a product
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.id} style={{ padding:"8px 14px", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}>
                        <p style={{ fontSize:11, fontWeight:600, color:"#f1f5f9", margin:0, flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.name}</p>
                        <button onClick={() => removeItem(item.id)} style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(255,0,0,0.4)" }}><Trash2 style={{ width:11, height:11 }} /></button>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                        <button onClick={() => updateQty(item.id, -1)} style={{ width:22, height:22, borderRadius:5, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", color:"#f1f5f9", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}><Minus style={{ width:9, height:9 }} /></button>
                        <span style={{ fontSize:12, fontWeight:700, color:"#f1f5f9", width:22, textAlign:"center" }}>{item.qty}</span>
                        <button onClick={() => updateQty(item.id, 1)} style={{ width:22, height:22, borderRadius:5, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", color:"#f1f5f9", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}><Plus style={{ width:9, height:9 }} /></button>
                        <input type="number" value={Math.round(item.discount*100)} onChange={e => setLineDiscount(item.id, parseFloat(e.target.value)||0)} placeholder="% off" style={{ width:50, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:5, padding:"4px 6px", color:"#fbbf24", fontSize:10, outline:"none" }} />
                        <span style={{ marginLeft:"auto", fontSize:12, fontWeight:700, color:"#e67e22" }}>SAR {(item.price * item.qty * (1-item.discount)).toFixed(2)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div style={{ padding:"10px 14px", borderTop:"1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ display:"flex", gap:6, marginBottom:8 }}>
                  <input value={couponCode} onChange={e => setCouponCode(e.target.value)} placeholder="Coupon code" style={{ flex:1, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:7, padding:"5px 10px", color:"#f1f5f9", fontSize:11, outline:"none" }} />
                  <button onClick={applyCoupon} style={{ background: couponApplied?"rgba(74,222,128,0.15)":"rgba(255,255,255,0.05)", border:`1px solid ${couponApplied?"rgba(74,222,128,0.3)":"rgba(255,255,255,0.08)"}`, borderRadius:7, padding:"0 10px", color: couponApplied?"#4ade80":"rgba(255,255,255,0.4)", fontSize:11, cursor:"pointer" }}>{couponApplied ? "✓ Applied" : "Apply"}</button>
                </div>
                {[
                  { l:"Subtotal", v:`SAR ${subtotal.toFixed(2)}` },
                  { l:"VAT (15%)", v:`SAR ${vatAmt.toFixed(2)}` },
                  ...(couponApplied ? [{ l:"Coupon (-10%)", v:`−SAR ${couponDisc.toFixed(2)}` }] : []),
                ].map(r => (
                  <div key={r.l} style={{ display:"flex", justifyContent:"space-between", padding:"3px 0", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                    <span style={{ fontSize:11, color:"rgba(255,255,255,0.4)" }}>{r.l}</span>
                    <span style={{ fontSize:11, color:"rgba(255,255,255,0.6)" }}>{r.v}</span>
                  </div>
                ))}
                <div style={{ display:"flex", justifyContent:"space-between", marginTop:6, padding:"6px 0", borderTop:"1px solid rgba(230,126,34,0.3)" }}>
                  <span style={{ fontSize:13, fontWeight:700, color:"#f1f5f9" }}>TOTAL</span>
                  <span style={{ fontSize:18, fontWeight:800, color:"#e67e22" }}>SAR {total.toFixed(2)}</span>
                </div>
                <button onClick={() => cart.length > 0 && setCheckoutOpen(true)} disabled={cart.length === 0} style={{ marginTop:8, width:"100%", background: cart.length > 0 ? "linear-gradient(135deg,#e67e22,#d35400)" : "rgba(255,255,255,0.05)", color: cart.length > 0 ? "white":"rgba(255,255,255,0.2)", border:"none", borderRadius:10, padding:"11px 0", fontSize:13, fontWeight:700, cursor: cart.length > 0 ? "pointer":"not-allowed" }}>
                  Charge SAR {total.toFixed(2)} <span style={{ fontSize:9, opacity:0.7, marginLeft:6 }}>F8</span>
                </button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {tab === "held" && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:10 }}>
          {held.length === 0 && <p style={{ fontSize:12, color:"rgba(255,255,255,0.3)" }}>No held orders.</p>}
          {held.map(h => (
            <Card key={h.id} style={{ padding:14, cursor:"pointer" }} onClick={() => recallOrder(h)}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                <span style={{ fontSize:11, fontFamily:"monospace", color:"#22d3ee" }}>{h.id}</span>
                <span style={{ fontSize:9, color:"rgba(255,255,255,0.4)" }}>{h.ts}</span>
              </div>
              <p style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:0 }}>{h.customer}</p>
              <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:"2px 0 8px" }}>{h.items.length} items</p>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:14, fontWeight:800, color:"#e67e22" }}>SAR {h.total.toFixed(2)}</span>
                <button style={{ fontSize:10, background:"rgba(74,222,128,0.15)", border:"1px solid rgba(74,222,128,0.3)", color:"#4ade80", borderRadius:6, padding:"3px 10px", fontWeight:700, cursor:"pointer" }}><Play style={{ width:9, height:9, display:"inline", marginRight:3 }}/>Recall</button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === "returns" && (
        <Card style={{ padding:20 }}>
          <h3 style={{ fontSize:14, fontWeight:700, color:"#f1f5f9", margin:"0 0 14px" }}>Returns & refunds</h3>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.5)", marginBottom:12 }}>Scan original receipt or enter invoice number to start a refund.</p>
          <div style={{ display:"flex", gap:8, marginBottom:18 }}>
            <input placeholder="INV-2026-08471" style={{ flex:1, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"9px 13px", color:"#f1f5f9", fontSize:13, outline:"none" }} />
            <button style={{ background:"#e67e22", color:"white", border:"none", borderRadius:10, padding:"0 18px", fontSize:13, fontWeight:700, cursor:"pointer" }}>Look up</button>
          </div>
          <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)" }}>Recent refunds today: 2 (SAR 42.00) · Top reason: Wrong item dispensed</p>
        </Card>
      )}

      {tab === "reports" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <Card style={{ padding:18 }}>
            <h3 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:"0 0 14px" }}>Shift summary — {shiftStart} to now</h3>
            {[
              ["Opening float (cash)", "SAR 500.00"],
              ["Cash sales", "SAR 1,184.00"],
              ["Card sales", "SAR 1,842.00"],
              ["Mada sales", "SAR 642.00"],
              ["Insurance copays", "SAR 179.00"],
              ["Refunds", "−SAR 42.00"],
              ["Expected cash drawer", "SAR 1,684.00"],
            ].map(([l,v]) => (
              <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                <span style={{ fontSize:12, color:"rgba(255,255,255,0.55)" }}>{l}</span>
                <span style={{ fontSize:13, color:"#f1f5f9", fontWeight:600 }}>{v}</span>
              </div>
            ))}
          </Card>
          <Card style={{ padding:18 }}>
            <h3 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:"0 0 14px" }}>Top items today</h3>
            {[
              ["Panadol Extra", 24, 300],
              ["Vitamin D3 5000IU", 18, 684],
              ["Augmentin 625mg", 8, 360],
              ["Cetaphil cream", 6, 390],
              ["Glucometer OneTouch", 3, 465],
            ].map(([n,q,v]) => (
              <div key={n as string} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                <span style={{ fontSize:12, color:"#f1f5f9" }}>{n} <span style={{ color:"rgba(255,255,255,0.4)", fontSize:10, marginLeft:5 }}>×{q}</span></span>
                <span style={{ fontSize:12, color:"#4ade80", fontWeight:700 }}>SAR {v}</span>
              </div>
            ))}
          </Card>
        </div>
      )}

      {checkoutOpen && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200 }}>
          <Card style={{ width:520, padding:24 }}>
            {receiptDone ? (
              <div style={{ textAlign:"center", padding:20 }}>
                <CheckCircle2 style={{ width:50, height:50, color:"#4ade80", margin:"0 auto 14px" }} />
                <h3 style={{ fontSize:17, fontWeight:800, color:"#f1f5f9", margin:"0 0 6px" }}>Sale complete</h3>
                <p style={{ fontSize:12, color:"rgba(255,255,255,0.4)", margin:"0 0 10px" }}>INV-2026-0942 · Receipt printing...</p>
                {change > 0 && <p style={{ fontSize:14, color:"#4ade80", fontWeight:700 }}>Change due: SAR {change.toFixed(2)}</p>}
              </div>
            ) : (
              <>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                  <h3 style={{ fontSize:15, fontWeight:700, color:"#f1f5f9", margin:0 }}>Take payment</h3>
                  <button onClick={() => setCheckoutOpen(false)} style={{ color:"rgba(255,255,255,0.3)", background:"none", border:"none", cursor:"pointer", fontSize:20 }}>×</button>
                </div>

                <div style={{ background:"rgba(230,126,34,0.06)", border:"1px solid rgba(230,126,34,0.2)", borderRadius:10, padding:12, marginBottom:14 }}>
                  <div style={{ display:"flex", justifyContent:"space-between" }}>
                    <span style={{ fontSize:11, color:"rgba(255,255,255,0.5)" }}>Total due</span>
                    <span style={{ fontSize:18, fontWeight:800, color:"#e67e22" }}>SAR {total.toFixed(2)}</span>
                  </div>
                  {payments.length > 0 && <>
                    <div style={{ display:"flex", justifyContent:"space-between", marginTop:4 }}>
                      <span style={{ fontSize:10, color:"rgba(255,255,255,0.4)" }}>Paid so far</span>
                      <span style={{ fontSize:11, color:"#4ade80", fontWeight:700 }}>SAR {paid.toFixed(2)}</span>
                    </div>
                    <div style={{ display:"flex", justifyContent:"space-between", marginTop:2 }}>
                      <span style={{ fontSize:11, fontWeight:700, color:"#fbbf24" }}>Remaining</span>
                      <span style={{ fontSize:13, fontWeight:800, color:"#fbbf24" }}>SAR {remaining.toFixed(2)}</span>
                    </div>
                  </>}
                </div>

                <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.05em", fontWeight:700 }}>Payment method</p>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:5, marginBottom:10 }}>
                  {([
                    { k:"cash", l:"Cash", i:Banknote },
                    { k:"card", l:"Card", i:CreditCard },
                    { k:"mada", l:"Mada", i:Smartphone },
                    { k:"insurance", l:"Insurance", i:Tag },
                    { k:"loyalty", l:"Loyalty", i:Star },
                  ] as { k: PayMethod; l: string; i: React.ElementType }[]).map(m => (
                    <button key={m.k} onClick={() => setCurrentMethod(m.k)} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3, padding:"7px 0", borderRadius:8, cursor:"pointer", background: currentMethod===m.k?"rgba(230,126,34,0.15)":"rgba(255,255,255,0.03)", border:`1px solid ${currentMethod===m.k?"rgba(230,126,34,0.4)":"rgba(255,255,255,0.08)"}`, color: currentMethod===m.k?"#e67e22":"rgba(255,255,255,0.4)", fontSize:10, fontWeight:600 }}>
                      <m.i style={{ width:14, height:14 }} />{m.l}
                    </button>
                  ))}
                </div>

                <div style={{ display:"flex", gap:6, marginBottom:10 }}>
                  <input value={tenderAmount} onChange={e => setTenderAmount(e.target.value)} placeholder={`Amount tendered (remaining ${remaining.toFixed(2)})`} type="number" style={{ flex:1, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"9px 12px", color:"#f1f5f9", fontSize:13, outline:"none" }} />
                  <button onClick={() => setTenderAmount(remaining.toFixed(2))} style={{ background:"rgba(34,211,238,0.15)", border:"1px solid rgba(34,211,238,0.3)", color:"#22d3ee", borderRadius:8, padding:"0 12px", fontSize:11, fontWeight:600, cursor:"pointer" }}>Exact</button>
                  <button onClick={addPayment} style={{ background:"#e67e22", color:"white", border:"none", borderRadius:8, padding:"0 14px", fontSize:12, fontWeight:700, cursor:"pointer" }}>Add</button>
                </div>

                {payments.length > 0 && (
                  <div style={{ marginBottom:12, background:"rgba(255,255,255,0.02)", borderRadius:8, padding:"8px 12px" }}>
                    {payments.map((p,i) => (
                      <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"3px 0", borderBottom: i<payments.length-1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                        <span style={{ fontSize:11, color:"rgba(255,255,255,0.55)" }}>{p.method}</span>
                        <span style={{ fontSize:11, color:"#4ade80", fontWeight:700 }}>SAR {p.amount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}

                <button onClick={completeSale} disabled={remaining > 0.01} style={{ width:"100%", background: remaining < 0.01 ? "linear-gradient(135deg,#4ade80,#22c55e)" : "rgba(255,255,255,0.05)", color: remaining < 0.01 ? "white":"rgba(255,255,255,0.2)", border:"none", borderRadius:10, padding:"12px 0", fontSize:14, fontWeight:700, cursor: remaining < 0.01 ? "pointer" : "not-allowed", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                  <Printer style={{ width:15, height:15 }} /> {remaining < 0.01 ? "Complete & print receipt" : `Need SAR ${remaining.toFixed(2)} more`}
                </button>
              </>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
