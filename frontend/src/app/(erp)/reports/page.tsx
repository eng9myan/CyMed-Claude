"use client";
import { FileText, Download, BarChart3, TrendingUp, Users, DollarSign } from "lucide-react";

function Card({ children, style={} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>{children}</div>;
}

const REPORT_GROUPS = [
  { name:"Financial", icon:DollarSign, c:"#4ade80", reports:[
    "Trial Balance", "Balance Sheet", "Profit & Loss", "Cash Flow Statement",
    "General Ledger Detail", "AR Aging", "AP Aging", "Bank Reconciliation",
    "VAT Returns", "GOSI Return", "Zakat Computation", "Tax Filings",
  ]},
  { name:"HR", icon:Users, c:"#a78bfa", reports:[
    "Employee Master List", "Attendance Summary", "Leave Balance", "Payroll Summary",
    "End of Service Liability", "Headcount by Department", "Turnover Analysis",
    "Overtime Report", "Training Compliance", "Performance Review Status",
  ]},
  { name:"Operations", icon:BarChart3, c:"#22d3ee", reports:[
    "Patient Census", "Bed Occupancy", "ALOS by Service Line", "OR Utilization",
    "Lab Throughput", "Radiology Worklist", "Pharmacy Dispense Summary",
    "Procurement Spend by Vendor", "Inventory Valuation", "Asset Register Summary",
  ]},
  { name:"Sales & CRM", icon:TrendingUp, c:"#f472b6", reports:[
    "Pipeline Forecast", "Win/Loss Analysis", "Sales by Product",
    "Customer Lifetime Value", "Lead Conversion Funnel", "Quota Attainment",
  ]},
  { name:"Regulatory", icon:FileText, c:"#fbbf24", reports:[
    "NPHIES Claims Submission", "GOSI Wage Protection", "MoH Annual Statistical Return",
    "JCI Quality Indicators", "CBAHI Compliance", "Notifiable Disease Reporting",
    "Adverse Drug Reaction (ADR)", "Sentinel Event Log",
  ]},
];

export default function ReportsPage() {
  return (
    <div style={{ padding:24, minHeight:"100vh", background:"#080d18" }}>
      <div style={{ marginBottom:20 }}>
        <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0 }}>Reports Library</h1>
        <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:3 }}>{REPORT_GROUPS.reduce((s,g)=>s+g.reports.length,0)} reports · PDF / Excel / CSV export · Scheduled email delivery</p>
      </div>

      {REPORT_GROUPS.map(g => (
        <div key={g.name} style={{ marginBottom:20 }}>
          <h3 style={{ fontSize:13, fontWeight:700, color:g.c, margin:"0 0 10px", textTransform:"uppercase", letterSpacing:"0.07em", display:"flex", alignItems:"center", gap:7 }}>
            <g.icon style={{ width:14, height:14 }} />{g.name}
          </h3>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:10 }}>
            {g.reports.map(r => (
              <Card key={r} style={{ padding:14, cursor:"pointer", transition:"all 0.15s" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div>
                    <p style={{ fontSize:12, fontWeight:600, color:"#f1f5f9", margin:0 }}>{r}</p>
                    <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:"4px 0 0" }}>Last generated 2026-06-12</p>
                  </div>
                  <button style={{ background:`${g.c}15`, border:`1px solid ${g.c}30`, color:g.c, borderRadius:7, padding:"6px 10px", fontSize:10, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:4 }}><Download style={{ width:10, height:10 }}/>Run</button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
