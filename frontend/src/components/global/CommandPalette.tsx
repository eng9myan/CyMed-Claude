"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, Command } from "lucide-react";

type Cmd = { id:string; label:string; section:string; href?:string; keywords:string; icon?:string };

const COMMANDS: Cmd[] = [
  // Navigation — ERP
  { id:"erp-dashboard", label:"ERP — Dashboard",        section:"ERP",   href:"/erp-home",        keywords:"erp home dashboard finance hr command center" },
  { id:"erp-employees", label:"ERP — Employees",        section:"ERP",   href:"/employees",       keywords:"employees hr staff directory" },
  { id:"erp-payroll",   label:"ERP — Payroll",          section:"ERP",   href:"/payroll",         keywords:"payroll salary wages gosi wps" },
  { id:"erp-coa",       label:"ERP — Chart of accounts",section:"ERP",   href:"/coa",             keywords:"chart accounts coa ledger" },
  { id:"erp-ap",        label:"ERP — Accounts payable", section:"ERP",   href:"/ap",              keywords:"ap accounts payable vendor invoices bills" },
  { id:"erp-ar",        label:"ERP — Accounts receivable",section:"ERP",href:"/ar",              keywords:"ar accounts receivable customer invoices aging" },
  { id:"erp-procurement",label:"ERP — Procurement / PO",section:"ERP",   href:"/procurement",     keywords:"procurement purchase orders po rfq vendors" },
  { id:"erp-inventory", label:"ERP — Inventory",        section:"ERP",   href:"/inventory",       keywords:"inventory stock warehouse sku batch expiry" },
  { id:"erp-warehouses",label:"ERP — Warehouses",       section:"ERP",   href:"/warehouses",      keywords:"warehouses stores transfers locations" },
  { id:"erp-sales",     label:"ERP — Sales invoices",   section:"ERP",   href:"/sales",           keywords:"sales invoices billing vat fatoora zatca" },
  { id:"erp-proposals", label:"ERP — Proposals",        section:"ERP",   href:"/proposals",       keywords:"sales proposals quotes quotations e-sign" },
  { id:"erp-leave",     label:"ERP — Leave",            section:"ERP",   href:"/leave",           keywords:"leave annual sick hajj maternity" },
  { id:"erp-banking",   label:"ERP — Bank reconciliation",section:"ERP",href:"/banking",         keywords:"bank reconciliation reconcile statement match" },
  { id:"erp-journals",  label:"ERP — Journal entries",  section:"ERP",   href:"/journals",        keywords:"journal entries je recurring reversing accruals" },
  { id:"erp-financials",label:"ERP — Financial statements",section:"ERP",href:"/financials",     keywords:"financials profit loss pl balance sheet" },
  { id:"erp-crm",       label:"ERP — CRM / pipeline",   section:"ERP",   href:"/crm",             keywords:"crm leads opportunities pipeline sales" },
  { id:"erp-helpdesk",  label:"ERP — Helpdesk",         section:"ERP",   href:"/helpdesk",        keywords:"helpdesk tickets support sla" },
  { id:"erp-assets",    label:"ERP — Asset register",   section:"ERP",   href:"/assets",          keywords:"assets register depreciation cmms equipment" },
  { id:"erp-documents", label:"ERP — Documents",        section:"ERP",   href:"/documents",       keywords:"documents dms files folders contracts ocr" },
  { id:"erp-reports",   label:"ERP — Reports library",  section:"ERP",   href:"/reports",         keywords:"reports financial ops regulatory export" },
  // Clinical
  { id:"hms-cmd",       label:"HMS — Command center",   section:"HMS",   href:"/command_center",  keywords:"hms command center clinical operations" },
  { id:"hms-doctor",    label:"HMS — Doctor queue",     section:"HMS",   href:"/doctor",          keywords:"doctor queue clinical" },
  { id:"hms-bed",       label:"HMS — Bed board",        section:"HMS",   href:"/bed_board",       keywords:"bed board occupancy admit" },
  { id:"hms-pharmacy",  label:"HMS — Pharmacy",         section:"HMS",   href:"/pharmacy",        keywords:"pharmacy dispense queue" },
  { id:"hms-lab",       label:"HMS — Laboratory",       section:"HMS",   href:"/laboratory",      keywords:"lab laboratory results orders" },
  { id:"hms-insurance", label:"HMS — Insurance",        section:"HMS",   href:"/insurance",       keywords:"insurance claims payers nphies" },
  // Actions
  { id:"act-new-emp",   label:"Add new employee",       section:"Actions",href:"/employees?new=1",keywords:"new employee hire onboard" },
  { id:"act-new-po",    label:"Create new PO",          section:"Actions",href:"/procurement?new=1",keywords:"new purchase order po vendor" },
  { id:"act-new-claim", label:"Submit insurance claim", section:"Actions",href:"/insurance?new=1", keywords:"new insurance claim nphies submit" },
  { id:"act-export",    label:"Export today's reports", section:"Actions",href:"/reports?export=today",keywords:"export reports today pdf excel" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [idx, setIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(o => !o);
        setQuery("");
        setIdx(0);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  if (!open) return null;

  const q = query.toLowerCase();
  const matches = q
    ? COMMANDS.filter(c => c.label.toLowerCase().includes(q) || c.keywords.includes(q))
    : COMMANDS.slice(0, 12);

  function go(c: Cmd) {
    setOpen(false);
    if (c.href) router.push(c.href);
  }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setIdx(i => Math.min(matches.length - 1, i + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setIdx(i => Math.max(0, i - 1)); }
    else if (e.key === "Enter" && matches[idx]) { e.preventDefault(); go(matches[idx]); }
  }

  return (
    <div onClick={() => setOpen(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", backdropFilter:"blur(4px)", zIndex:9999, display:"flex", alignItems:"flex-start", justifyContent:"center", paddingTop:120 }}>
      <div onClick={e => e.stopPropagation()} style={{ width:600, maxHeight:520, background:"#0c111c", border:"1px solid rgba(255,255,255,0.1)", borderRadius:14, overflow:"hidden", boxShadow:"0 20px 60px rgba(0,0,0,0.5)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, padding:"14px 18px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
          <Search style={{ width:16, height:16, color:"rgba(255,255,255,0.4)" }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setIdx(0); }}
            onKeyDown={onKey}
            placeholder="Search anywhere — modules, actions, employees..."
            style={{ flex:1, background:"none", border:"none", color:"#f1f5f9", fontSize:15, outline:"none" }}
          />
          <span style={{ fontSize:10, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:5, padding:"2px 7px", color:"rgba(255,255,255,0.4)", fontFamily:"monospace" }}>ESC</span>
        </div>

        <div style={{ overflowY:"auto", maxHeight:430 }}>
          {matches.length === 0 ? (
            <div style={{ padding:32, textAlign:"center", color:"rgba(255,255,255,0.4)", fontSize:13 }}>No matches</div>
          ) : (
            matches.map((c, i) => (
              <div
                key={c.id}
                onClick={() => go(c)}
                onMouseEnter={() => setIdx(i)}
                style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 18px", cursor:"pointer", background: i === idx ? "rgba(230,126,34,0.1)" : "transparent", borderLeft: i === idx ? "2px solid #e67e22" : "2px solid transparent" }}
              >
                <span style={{ fontSize:9, fontWeight:700, background:"rgba(255,255,255,0.05)", color:"rgba(255,255,255,0.5)", borderRadius:4, padding:"2px 7px", textTransform:"uppercase", letterSpacing:"0.05em", flexShrink:0, width:60, textAlign:"center" }}>{c.section}</span>
                <span style={{ flex:1, fontSize:13, color:"#f1f5f9" }}>{c.label}</span>
                <ArrowRight style={{ width:13, height:13, color: i === idx ? "#e67e22" : "rgba(255,255,255,0.2)" }} />
              </div>
            ))
          )}
        </div>

        <div style={{ padding:"10px 18px", borderTop:"1px solid rgba(255,255,255,0.06)", display:"flex", justifyContent:"space-between", fontSize:10, color:"rgba(255,255,255,0.4)" }}>
          <span><Command style={{ width:11, height:11, display:"inline", marginRight:3, verticalAlign:"-2px" }}/>K to toggle · ↑↓ to navigate · ↵ to open</span>
          <span style={{ color:"#e67e22", fontWeight:700 }}>CyMed</span>
        </div>
      </div>
    </div>
  );
}
