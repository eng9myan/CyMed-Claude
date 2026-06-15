"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem  = { label: string; href: string; dot: string };
type NavGroup = { label: string; items: NavItem[] };

const NAV: NavGroup[] = [
  {
    label: "OVERVIEW",
    items: [
      { label: "Dashboard",      href: "/dashboard",      dot: "#c084fc" },
      { label: "Activity Log",   href: "/superadmin/activity",       dot: "#a78bfa" },
    ],
  },
  {
    label: "ORGANIZATIONS",
    items: [
      { label: "Organizations",  href: "/organizations",  dot: "#22d3ee" },
      { label: "Facilities",     href: "/superadmin/facilities",     dot: "#60a5fa" },
      { label: "Departments",    href: "/superadmin/departments",    dot: "#4ade80" },
      { label: "Provider Dir.",  href: "/superadmin/providers",      dot: "#34d399" },
    ],
  },
  {
    label: "USERS & ACCESS",
    items: [
      { label: "Users",          href: "/users",          dot: "#f472b6" },
      { label: "Roles",          href: "/superadmin/roles",          dot: "#e879f9" },
      { label: "Permissions",    href: "/superadmin/permissions",    dot: "#a78bfa" },
    ],
  },
  {
    label: "SAAS & BILLING",
    items: [
      { label: "Tenants",        href: "/tenants",        dot: "#fbbf24" },
      { label: "Subscriptions",  href: "/superadmin/subscriptions",  dot: "#fb923c" },
      { label: "Licensing",      href: "/saas-licensing",            dot: "#f97316" },
      { label: "Billing",        href: "/billing",        dot: "#e67e22" },
    ],
  },
  {
    label: "PLATFORM",
    items: [
      { label: "Solutions",      href: "/superadmin/solutions",      dot: "#818cf8" },
      { label: "Modules",        href: "/superadmin/modules",        dot: "#6366f1" },
      { label: "Features",       href: "/superadmin/features",       dot: "#4f46e5" },
      { label: "Config",         href: "/superadmin/config",         dot: "#94a3b8" },
    ],
  },
];

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div style={{ display:"flex", height:"100vh", width:"100%", overflow:"hidden", background:"#050a14", fontFamily:"var(--font-inter, system-ui, sans-serif)" }}>
      {/* Sidebar */}
      <aside style={{ width:230, height:"100%", display:"flex", flexDirection:"column", flexShrink:0, background:"linear-gradient(180deg,#0a0518 0%,#050a14 100%)", borderRight:"1px solid rgba(255,255,255,0.06)" }}>
        {/* Logo */}
        <div style={{ padding:"20px 18px", borderBottom:"1px solid rgba(255,255,255,0.05)", display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:34, height:34, borderRadius:10, background:"linear-gradient(135deg,#c084fc,#7c3aed)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M10 3l2 6h6l-5 3.5L15 19l-5-3.5L5 19l2-6.5L2 9h6z" fill="white"/></svg>
          </div>
          <div>
            <div style={{ fontSize:13, fontWeight:800, color:"white", letterSpacing:"-0.2px" }}>Super Admin</div>
            <div style={{ fontSize:10, color:"rgba(192,132,252,0.7)", marginTop:1 }}>CyMed Network</div>
          </div>
          <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:4, padding:"3px 8px", borderRadius:99, background:"rgba(192,132,252,0.12)", border:"1px solid rgba(192,132,252,0.25)" }}>
            <div style={{ width:5, height:5, borderRadius:"50%", background:"#c084fc" }} />
            <span style={{ fontSize:9, fontWeight:700, color:"#c084fc" }}>GOD</span>
          </div>
        </div>

        {/* Back to Launcher */}
        <div style={{ padding:"10px 12px 0" }}>
          <Link href="/" style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 10px", borderRadius:10, color:"rgba(255,255,255,0.3)", fontSize:11, textDecoration:"none", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)" }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M7.5 2L3.5 6l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Back to Launcher
          </Link>
        </div>

        {/* Nav */}
        <nav style={{ flex:1, overflowY:"auto", padding:"12px 10px 8px" }}>
          {NAV.map(group => (
            <div key={group.label} style={{ marginBottom:20 }}>
              <p style={{ fontSize:9, fontWeight:700, color:"rgba(255,255,255,0.22)", textTransform:"uppercase", letterSpacing:"0.12em", padding:"0 10px", margin:"0 0 6px" }}>{group.label}</p>
              {group.items.map(item => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link key={item.href} href={item.href} style={{
                    display:"flex", alignItems:"center", gap:10, padding:"7px 10px", borderRadius:10, marginBottom:2, textDecoration:"none", fontSize:12, fontWeight: active ? 600 : 500,
                    background: active ? "linear-gradient(135deg,rgba(192,132,252,0.15),rgba(124,58,237,0.1))" : "transparent",
                    border: `1px solid ${active ? "rgba(192,132,252,0.25)" : "transparent"}`,
                    color: active ? "#e2e8f0" : "rgba(255,255,255,0.4)",
                  }}>
                    <span style={{ width:7, height:7, borderRadius:"50%", background: active ? item.dot : "rgba(255,255,255,0.15)", flexShrink:0, boxShadow: active ? `0 0 8px ${item.dot}80` : "none" }} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding:"10px 12px", borderTop:"1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, padding:"10px", borderRadius:10, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ width:28, height:28, borderRadius:8, background:"linear-gradient(135deg,#c084fc,#7c3aed)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800, color:"white", flexShrink:0 }}>SA</div>
            <div>
              <p style={{ fontSize:11, fontWeight:600, color:"rgba(255,255,255,0.65)", margin:0 }}>super.admin</p>
              <p style={{ fontSize:9, color:"rgba(255,255,255,0.28)", margin:0 }}>admin@cymed.network</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex:1, overflowY:"auto", minWidth:0 }}>
        {children}
      </main>
    </div>
  );
}
