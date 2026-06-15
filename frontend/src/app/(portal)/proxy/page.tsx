"use client";

import { useState } from "react";
import { Users, Shield, Plus, CheckCircle2, Clock, XCircle, Eye, FileText } from "lucide-react";

type ProxyStatus = "active" | "pending" | "expired" | "revoked";
type Relationship = "parent" | "spouse" | "child" | "guardian" | "caregiver";

type Proxy = {
  id: string; name: string; relationship: Relationship; email: string;
  status: ProxyStatus; grantedAt: string; expiresAt?: string;
  permissions: { view_records: boolean; book_appointments: boolean; refill_meds: boolean; message_provider: boolean; access_billing: boolean; receive_results: boolean; };
};

const PROXIES: Proxy[] = [
  { id:"PX1", name:"Layla Al-Rashid", relationship:"spouse",   email:"layla@example.com", status:"active", grantedAt:"2026-01-15", permissions:{view_records:true,book_appointments:true,refill_meds:true,message_provider:true,access_billing:true,receive_results:true} },
  { id:"PX2", name:"Yousef Al-Rashid (age 8)", relationship:"child", email:"—", status:"active", grantedAt:"2026-01-15", permissions:{view_records:true,book_appointments:true,refill_meds:true,message_provider:false,access_billing:false,receive_results:true} },
  { id:"PX3", name:"Sara Al-Rashid (age 16)", relationship:"child", email:"sara@example.com", status:"active", grantedAt:"2026-01-15", expiresAt:"2027-04-22", permissions:{view_records:true,book_appointments:true,refill_meds:false,message_provider:false,access_billing:false,receive_results:false} },
  { id:"PX4", name:"Mohammad Al-Rashid (father)", relationship:"guardian", email:"mohammad@example.com", status:"pending", grantedAt:"2026-06-10", permissions:{view_records:true,book_appointments:false,refill_meds:false,message_provider:false,access_billing:false,receive_results:false} },
];

const REL_META: Record<Relationship,{c:string;label:string}> = {
  parent:{c:"#22d3ee",label:"Parent"}, spouse:{c:"#f472b6",label:"Spouse"},
  child:{c:"#a78bfa",label:"Minor Child"}, guardian:{c:"#fbbf24",label:"Legal Guardian"}, caregiver:{c:"#4ade80",label:"Caregiver"},
};

const STATUS_META: Record<ProxyStatus,{c:string;bg:string;label:string}> = {
  active:{c:"#4ade80",bg:"rgba(74,222,128,0.1)",label:"Active"},
  pending:{c:"#fbbf24",bg:"rgba(251,191,36,0.1)",label:"Pending Approval"},
  expired:{c:"#fb923c",bg:"rgba(251,146,60,0.1)",label:"Expired"},
  revoked:{c:"#f87171",bg:"rgba(248,113,113,0.1)",label:"Revoked"},
};

function Card({ children, style={}, onClick }: { children: React.ReactNode; style?: React.CSSProperties; onClick?: () => void }) {
  return <div onClick={onClick} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>{children}</div>;
}

const PERMISSIONS = [
  { k:"view_records", label:"View medical records" },
  { k:"book_appointments", label:"Book appointments" },
  { k:"refill_meds", label:"Request medication refills" },
  { k:"message_provider", label:"Message providers" },
  { k:"access_billing", label:"Access billing & pay bills" },
  { k:"receive_results", label:"Receive lab results notifications" },
];

export default function ProxyPage() {
  const [active, setActive] = useState<Proxy>(PROXIES[0]);

  return (
    <div style={{ padding:24, minHeight:"100vh", background:"#080d18" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0 }}>Proxy & Caregiver Access</h1>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:3 }}>Manage who can access your health records · Granular permissions · Audit trail</p>
        </div>
        <button style={{ display:"flex", alignItems:"center", gap:7, background:"#e67e22", color:"white", border:"none", borderRadius:10, padding:"8px 18px", fontSize:13, fontWeight:700, cursor:"pointer" }}><Plus style={{ width:14, height:14 }} />Invite Caregiver</button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"340px 1fr", gap:16 }}>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {PROXIES.map(p => {
            const rm = REL_META[p.relationship];
            const sm = STATUS_META[p.status];
            const isA = active.id === p.id;
            return (
              <Card key={p.id} style={{ padding:14, cursor:"pointer", border:`1px solid ${isA?"rgba(230,126,34,0.3)":"rgba(255,255,255,0.07)"}`, background:isA?"rgba(230,126,34,0.07)":"rgba(255,255,255,0.03)" }} onClick={()=>setActive(p)}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                  <div style={{ width:36, height:36, borderRadius:10, background:`${rm.c}18`, color:rm.c, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:700 }}>{p.name.charAt(0)}</div>
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:12, fontWeight:700, color:"#f1f5f9", margin:0 }}>{p.name}</p>
                    <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:0 }}>{p.email}</p>
                  </div>
                </div>
                <div style={{ display:"flex", gap:5 }}>
                  <span style={{ fontSize:9, background:`${rm.c}15`, color:rm.c, borderRadius:5, padding:"2px 7px", fontWeight:700 }}>{rm.label}</span>
                  <span style={{ fontSize:9, background:sm.bg, color:sm.c, borderRadius:5, padding:"2px 7px", fontWeight:700 }}>{sm.label}</span>
                </div>
              </Card>
            );
          })}
        </div>

        <Card style={{ padding:22 }}>
          <h2 style={{ fontSize:17, fontWeight:800, color:"#f1f5f9", margin:"0 0 16px" }}>{active.name}</h2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:18 }}>
            <div style={{ background:"rgba(255,255,255,0.02)", borderRadius:10, padding:12 }}><p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:0, textTransform:"uppercase", fontWeight:700 }}>Granted</p><p style={{ fontSize:13, color:"#f1f5f9", margin:"4px 0 0", fontWeight:600 }}>{active.grantedAt}</p></div>
            <div style={{ background:"rgba(255,255,255,0.02)", borderRadius:10, padding:12 }}><p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:0, textTransform:"uppercase", fontWeight:700 }}>Expires</p><p style={{ fontSize:13, color:active.expiresAt?"#fbbf24":"#4ade80", margin:"4px 0 0", fontWeight:600 }}>{active.expiresAt ?? "Never"}</p></div>
            <div style={{ background:"rgba(255,255,255,0.02)", borderRadius:10, padding:12 }}><p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:0, textTransform:"uppercase", fontWeight:700 }}>Email</p><p style={{ fontSize:13, color:"#f1f5f9", margin:"4px 0 0", fontWeight:600 }}>{active.email}</p></div>
          </div>

          <h3 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", margin:"0 0 12px", display:"flex", alignItems:"center", gap:7 }}><Shield style={{ width:14, height:14, color:"#22d3ee" }} />Permissions</h3>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
            {PERMISSIONS.map(p => {
              const granted = (active.permissions as any)[p.k];
              return (
                <div key={p.k} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", background: granted ? "rgba(74,222,128,0.05)" : "rgba(255,255,255,0.02)", border:`1px solid ${granted ? "rgba(74,222,128,0.15)" : "rgba(255,255,255,0.05)"}`, borderRadius:10 }}>
                  {granted ? <CheckCircle2 style={{ width:14, height:14, color:"#4ade80" }} /> : <XCircle style={{ width:14, height:14, color:"rgba(255,255,255,0.25)" }} />}
                  <span style={{ fontSize:12, color: granted ? "#f1f5f9":"rgba(255,255,255,0.4)" }}>{p.label}</span>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop:18, display:"flex", gap:8 }}>
            <button style={{ background:"rgba(34,211,238,0.1)", border:"1px solid rgba(34,211,238,0.3)", borderRadius:10, padding:"8px 16px", color:"#22d3ee", fontSize:12, fontWeight:700, cursor:"pointer" }}>Edit Permissions</button>
            <button style={{ background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.3)", borderRadius:10, padding:"8px 16px", color:"#f87171", fontSize:12, fontWeight:700, cursor:"pointer" }}>Revoke Access</button>
            <button style={{ marginLeft:"auto", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"8px 16px", color:"rgba(255,255,255,0.6)", fontSize:12, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}><Eye style={{ width:13, height:13 }} />View Audit Log</button>
          </div>
        </Card>
      </div>
    </div>
  );
}
