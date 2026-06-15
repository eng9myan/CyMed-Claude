"use client";
import { useState } from "react";
import { Palette, Globe, Mail, CheckCircle2 } from "lucide-react";

function Card({ children, style={}, onClick }: { children: React.ReactNode; style?: React.CSSProperties; onClick?: () => void }) {
  return <div onClick={onClick} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, ...style }}>{children}</div>;
}

const TENANTS = [
  { id:"T001", name:"King Fahd Medical City", primary:"#1e40af", logo:"KFMC", domain:"kfmc.cymed.health",        emailSender:"no-reply@kfmc.health", customDomain:true },
  { id:"T002", name:"Riyadh National Hospital",primary:"#059669", logo:"RNH",  domain:"rnh.cymed.health",         emailSender:"system@rnhospital.com", customDomain:true },
  { id:"T003", name:"Jeddah Health Network",   primary:"#dc2626", logo:"JHN",  domain:"jhn.cymed.health",         emailSender:"no-reply@jhn.health",  customDomain:false },
  { id:"T004", name:"Al Nahda Clinics",        primary:"#7c3aed", logo:"AN",   domain:"alnahda.cymed.health",      emailSender:"no-reply@cymed.health",customDomain:false },
];

export default function WhiteLabelPage() {
  const [active, setActive] = useState(TENANTS[0]);
  const [primary, setPrimary] = useState(active.primary);

  return (
    <div style={{ padding:24, minHeight:"100vh", background:"#080d18" }}>
      <div style={{ marginBottom:20 }}>
        <h1 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0 }}>White-Label Configuration</h1>
        <p style={{ fontSize:12, color:"rgba(255,255,255,0.38)", marginTop:3 }}>Logo & color scheme · Custom login page · Custom email domain · Custom subdomain</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"300px 1fr", gap:16 }}>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {TENANTS.map(t => {
            const isA = active.id === t.id;
            return (
              <Card key={t.id} style={{ padding:14, cursor:"pointer", border:`1px solid ${isA?"rgba(230,126,34,0.3)":"rgba(255,255,255,0.07)"}`, background:isA?"rgba(230,126,34,0.07)":"rgba(255,255,255,0.03)" }} onClick={()=>{setActive(t);setPrimary(t.primary);}}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:36, height:36, borderRadius:10, background:t.primary, color:"white", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800 }}>{t.logo}</div>
                  <div>
                    <p style={{ fontSize:12, fontWeight:700, color:"#f1f5f9", margin:0 }}>{t.name}</p>
                    <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:"2px 0 0" }}>{t.domain}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <Card style={{ padding:22 }}>
          <h2 style={{ fontSize:16, fontWeight:800, color:"#f1f5f9", margin:"0 0 18px" }}>{active.name} — Branding</h2>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:18 }}>
            <div>
              <label style={{ fontSize:11, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.07em", fontWeight:700 }}>Primary Brand Color</label>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:6 }}>
                <input type="color" value={primary} onChange={e=>setPrimary(e.target.value)} style={{ width:42, height:42, borderRadius:10, border:"1px solid rgba(255,255,255,0.1)", cursor:"pointer", background:"none" }} />
                <input value={primary} onChange={e=>setPrimary(e.target.value)} style={{ flex:1, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"9px 13px", color:"#f1f5f9", fontSize:12, outline:"none", fontFamily:"monospace" }} />
              </div>
            </div>
            <div>
              <label style={{ fontSize:11, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.07em", fontWeight:700 }}>Logo (Tenant Initials)</label>
              <input defaultValue={active.logo} style={{ marginTop:6, width:"100%", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"9px 13px", color:"#f1f5f9", fontSize:12, outline:"none" }} />
            </div>
            <div>
              <label style={{ fontSize:11, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.07em", fontWeight:700 }}>Custom Subdomain</label>
              <input defaultValue={active.domain} style={{ marginTop:6, width:"100%", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"9px 13px", color:"#f1f5f9", fontSize:12, outline:"none" }} />
            </div>
            <div>
              <label style={{ fontSize:11, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.07em", fontWeight:700 }}>Email Sender</label>
              <input defaultValue={active.emailSender} style={{ marginTop:6, width:"100%", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"9px 13px", color:"#f1f5f9", fontSize:12, outline:"none" }} />
            </div>
          </div>

          <h3 style={{ fontSize:12, fontWeight:700, color:"rgba(255,255,255,0.5)", textTransform:"uppercase", letterSpacing:"0.07em", margin:"0 0 12px" }}>Login Page Preview</h3>
          <div style={{ background:`linear-gradient(135deg, ${primary} 0%, ${primary}80 100%)`, borderRadius:14, padding:40, textAlign:"center", marginBottom:18 }}>
            <div style={{ width:80, height:80, borderRadius:18, background:"rgba(255,255,255,0.95)", color:primary, fontSize:22, fontWeight:900, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:14, marginLeft:"auto", marginRight:"auto" }}>{active.logo}</div>
            <p style={{ fontSize:18, fontWeight:800, color:"white", margin:"0 0 6px" }}>{active.name}</p>
            <p style={{ fontSize:11, color:"rgba(255,255,255,0.7)", margin:"0 0 20px" }}>Powered by CyMed Health Platform</p>
            <button style={{ background:"white", color:primary, border:"none", borderRadius:8, padding:"8px 24px", fontSize:13, fontWeight:700, cursor:"pointer" }}>Sign In</button>
          </div>

          <button style={{ width:"100%", background:"linear-gradient(135deg,#e67e22,#d35400)", color:"white", border:"none", borderRadius:12, padding:"12px 0", fontSize:14, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}><CheckCircle2 style={{ width:16, height:16 }}/>Save & Deploy White-Label</button>
        </Card>
      </div>
    </div>
  );
}
