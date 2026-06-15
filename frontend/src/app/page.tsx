"use client";

import { useState } from "react";
import Link from "next/link";

// ── Solution definitions ─────────────────────────────────────────
const SOLUTIONS = [
  {
    id: "hms", name: "Hospital Management System", short: "HMS",
    desc: "Full-stack inpatient & outpatient management. ER, ICU, OR, Nursing, Admissions, Billing, Pharmacy, Lab, Radiology.",
    href: "/command_center", demoHref: "/command_center",
    color: "#22d3ee", bg: "rgba(34,211,238,0.08)", border: "rgba(34,211,238,0.18)",
    status: "LIVE", tier: "Enterprise",
    stats: [{ label: "Modules", val: "16" }, { label: "Active Orgs", val: "24" }, { label: "Patients/day", val: "2,400+" }],
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="4" y="4" width="20" height="20" rx="4" stroke="#22d3ee" strokeWidth="1.5"/>
        <path d="M14 8v12M8 14h12" stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: "cms", name: "Clinic Management System", short: "CMS",
    desc: "Outpatient & specialist clinic operations. Appointments, EMR, prescriptions, telemedicine integration.",
    href: "/cms-home", demoHref: "/cms-home",
    color: "#4ade80", bg: "rgba(74,222,128,0.08)", border: "rgba(74,222,128,0.18)",
    status: "LIVE", tier: "Standard",
    stats: [{ label: "Modules", val: "8" }, { label: "Active Orgs", val: "118" }, { label: "Appts/day", val: "8,200+" }],
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="10" r="4" stroke="#4ade80" strokeWidth="1.5"/>
        <path d="M6 22c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: "pharmacy", name: "Pharmacy ERP", short: "Rx",
    desc: "Multi-branch pharmacy operations. Dispensing, inventory, procurement, POS, controlled drugs, insurance claims.",
    href: "/rx-home", demoHref: "/rx-home",
    color: "#a78bfa", bg: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.18)",
    status: "LIVE", tier: "Standard",
    stats: [{ label: "Modules", val: "9" }, { label: "Active Branches", val: "340" }, { label: "Rx/day", val: "15,000+" }],
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="9" y="4" width="10" height="4" rx="2" stroke="#a78bfa" strokeWidth="1.5"/>
        <rect x="6" y="8" width="16" height="16" rx="3" stroke="#a78bfa" strokeWidth="1.5"/>
        <path d="M14 12v8M10 16h8" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: "lis", name: "Laboratory ERP", short: "LIS",
    desc: "Full LIS with specimen tracking, analyzer integration, critical value management, reference lab operations.",
    href: "/lis-home", demoHref: "/lis-home",
    color: "#fbbf24", bg: "rgba(251,191,36,0.08)", border: "rgba(251,191,36,0.18)",
    status: "LIVE", tier: "Standard",
    stats: [{ label: "Modules", val: "8" }, { label: "Active Labs", val: "86" }, { label: "Tests/day", val: "22,000+" }],
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M11 4v8l-5 10h16l-5-10V4" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M10 4h8" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="14" cy="18" r="1.5" fill="#fbbf24"/>
      </svg>
    ),
  },
  {
    id: "ris", name: "Radiology & Imaging ERP", short: "RIS",
    desc: "Full RIS/PACS with DICOM integration, radiologist worklist, reporting, teleradiology, and imaging POS.",
    href: "/ris-home", demoHref: "/ris-home",
    color: "#60a5fa", bg: "rgba(96,165,250,0.08)", border: "rgba(96,165,250,0.18)",
    status: "LIVE", tier: "Standard",
    stats: [{ label: "Modules", val: "7" }, { label: "Active Centers", val: "52" }, { label: "Studies/day", val: "4,800+" }],
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="4" y="6" width="20" height="16" rx="3" stroke="#60a5fa" strokeWidth="1.5"/>
        <circle cx="14" cy="14" r="4" stroke="#60a5fa" strokeWidth="1.5"/>
        <circle cx="14" cy="14" r="1.5" fill="#60a5fa"/>
      </svg>
    ),
  },
  {
    id: "portal", name: "Patient Portal", short: "Portal",
    desc: "Patient-controlled health record. View results, manage consent, approve provider access, book appointments.",
    href: "/patient_portal", demoHref: "/patient_portal",
    color: "#f472b6", bg: "rgba(244,114,182,0.08)", border: "rgba(244,114,182,0.18)",
    status: "LIVE", tier: "Free",
    stats: [{ label: "Features", val: "12" }, { label: "Active Patients", val: "48K+" }, { label: "Satisfaction", val: "96%" }],
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M14 4C9.6 4 6 7.6 6 12c0 2.6 1.2 4.9 3.1 6.4L14 24l4.9-5.6C20.8 16.9 22 14.6 22 12c0-4.4-3.6-8-8-8z" stroke="#f472b6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="14" cy="12" r="3" stroke="#f472b6" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    id: "telehealth", name: "Telemedicine Platform", short: "Tele",
    desc: "Virtual consultations, secure video, asynchronous messaging, e-prescriptions and remote monitoring.",
    href: "/tele-home", demoHref: "/tele-home",
    color: "#34d399", bg: "rgba(52,211,153,0.08)", border: "rgba(52,211,153,0.18)",
    status: "LIVE", tier: "Standard",
    stats: [{ label: "Features", val: "10" }, { label: "Daily Sessions", val: "1,200+" }, { label: "Countries", val: "13" }],
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="4" y="7" width="16" height="12" rx="2" stroke="#34d399" strokeWidth="1.5"/>
        <path d="M20 11l4-3v12l-4-3" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: "homecare", name: "Home Healthcare Platform", short: "Home",
    desc: "Home visit scheduling, remote patient monitoring, care coordinator workflows and IoT device integration.",
    href: "/evv", demoHref: "/evv",
    color: "#fb923c", bg: "rgba(251,146,60,0.08)", border: "rgba(251,146,60,0.18)",
    status: "BETA", tier: "Enterprise",
    stats: [{ label: "Features", val: "8" }, { label: "Visits/day", val: "900+" }, { label: "Devices", val: "IoT Ready" }],
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M4 14L14 5l10 9" stroke="#fb923c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8 12v10h12V12" stroke="#fb923c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="11" y="18" width="6" height="4" rx="1" stroke="#fb923c" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    id: "care", name: "Care Management Platform", short: "Care",
    desc: "Interdisciplinary care plans, chronic disease management, care coordinator tools and outcome tracking.",
    href: "/care_management", demoHref: "/care_management",
    color: "#e879f9", bg: "rgba(232,121,249,0.08)", border: "rgba(232,121,249,0.18)",
    status: "LIVE", tier: "Standard",
    stats: [{ label: "Modules", val: "6" }, { label: "Active Plans", val: "12K+" }, { label: "Conditions", val: "200+" }],
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M14 6c-1.1-2.2-4-3-6-1.5S5.5 9.5 7 11l7 7 7-7c1.5-1.5 1.5-4.5-.5-6S15.1 3.8 14 6z" stroke="#e879f9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: "research", name: "Research Platform", short: "Research",
    desc: "Clinical trial management, cohort builder, real-world evidence, de-identified dataset export, IRB workflows.",
    href: "/protocol", demoHref: "/protocol",
    color: "#818cf8", bg: "rgba(129,140,248,0.08)", border: "rgba(129,140,248,0.18)",
    status: "BETA", tier: "Enterprise",
    stats: [{ label: "Features", val: "9" }, { label: "Active Trials", val: "18" }, { label: "Datasets", val: "FHIR R4" }],
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="10" cy="10" r="5" stroke="#818cf8" strokeWidth="1.5"/>
        <circle cx="18" cy="10" r="5" stroke="#818cf8" strokeWidth="1.5"/>
        <circle cx="14" cy="18" r="5" stroke="#818cf8" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    id: "pophealth", name: "Population Health Platform", short: "PopHealth",
    desc: "Disease surveillance, epidemiology dashboards, risk stratification, community health analytics and SDOH tracking.",
    href: "/vbc", demoHref: "/vbc",
    color: "#2dd4bf", bg: "rgba(45,212,191,0.08)", border: "rgba(45,212,191,0.18)",
    status: "LIVE", tier: "Government",
    stats: [{ label: "Indicators", val: "120+" }, { label: "Population", val: "National" }, { label: "Countries", val: "13" }],
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M4 20l6-8 4 4 4-10 6 14" stroke="#2dd4bf" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: "moh", name: "Ministry of Health Platform", short: "MoH",
    desc: "National MOH dashboards, facility licensing, healthcare workforce registry, mandatory reporting and NPHIES integration.",
    href: "/moh-home", demoHref: "/moh-home",
    color: "#e67e22", bg: "rgba(230,126,34,0.08)", border: "rgba(230,126,34,0.18)",
    status: "LIVE", tier: "Government",
    stats: [{ label: "Modules", val: "8" }, { label: "Facilities", val: "National" }, { label: "Compliance", val: "NPHIES" }],
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M14 4l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z" stroke="#e67e22" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: "group", name: "Healthcare Group Platform", short: "Group",
    desc: "Multi-facility group management. Consolidated financials, group-wide analytics, inter-facility transfers and benchmarking.",
    href: "/group-home", demoHref: "/group-home",
    color: "#f87171", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.18)",
    status: "LIVE", tier: "Enterprise",
    stats: [{ label: "Modules", val: "6" }, { label: "Active Groups", val: "12" }, { label: "Facilities", val: "200+" }],
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="8" cy="20" r="3" stroke="#f87171" strokeWidth="1.5"/>
        <circle cx="20" cy="20" r="3" stroke="#f87171" strokeWidth="1.5"/>
        <circle cx="14" cy="8" r="3" stroke="#f87171" strokeWidth="1.5"/>
        <path d="M14 11v5M11 18l-3 2M17 18l3 2" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: "national", name: "National Health Platform", short: "National",
    desc: "National health information infrastructure. Universal patient record, cross-provider exchange, national HIE and analytics.",
    href: "/national-home", demoHref: "/national-home",
    color: "#67e8f9", bg: "rgba(103,232,249,0.08)", border: "rgba(103,232,249,0.18)",
    status: "LIVE", tier: "Government",
    stats: [{ label: "Scope", val: "National" }, { label: "Exchange", val: "FHIR R4" }, { label: "Countries", val: "13" }],
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="9" stroke="#67e8f9" strokeWidth="1.5"/>
        <ellipse cx="14" cy="14" rx="4" ry="9" stroke="#67e8f9" strokeWidth="1.5"/>
        <path d="M5 14h18" stroke="#67e8f9" strokeWidth="1.5"/>
        <path d="M7 9h14M7 19h14" stroke="#67e8f9" strokeWidth="1" strokeDasharray="2 2"/>
      </svg>
    ),
  },
  {
    id: "superadmin", name: "Super Admin Platform", short: "SuperAdmin",
    desc: "Full ecosystem control. Manage all tenants, organizations, users, licenses, subscriptions, and platform configuration.",
    href: "/dashboard", demoHref: "/dashboard",
    color: "#c084fc", bg: "rgba(192,132,252,0.08)", border: "rgba(192,132,252,0.18)",
    status: "ADMIN", tier: "Internal",
    stats: [{ label: "Tenants", val: "42" }, { label: "Orgs", val: "280+" }, { label: "Users", val: "18,400+" }],
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M14 4l1.8 5.6H22l-4.9 3.5 1.8 5.6L14 15.2l-4.9 3.5 1.8-5.6L6 9.6h6.2z" stroke="#c084fc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="14" cy="22" r="2" stroke="#c084fc" strokeWidth="1.5"/>
      </svg>
    ),
  },
];

const TIER_COLOR: Record<string, { bg: string; color: string }> = {
  Enterprise:  { bg:"rgba(230,126,34,0.12)",  color:"#fb923c"  },
  Standard:    { bg:"rgba(34,211,238,0.1)",   color:"#22d3ee"  },
  Free:        { bg:"rgba(74,222,128,0.1)",   color:"#4ade80"  },
  Government:  { bg:"rgba(251,191,36,0.1)",   color:"#fbbf24"  },
  Internal:    { bg:"rgba(192,132,252,0.12)", color:"#c084fc"  },
};

const STATUS_COLOR: Record<string, { bg: string; color: string; dot: string }> = {
  LIVE:   { bg:"rgba(74,222,128,0.1)",  color:"#4ade80", dot:"#4ade80" },
  BETA:   { bg:"rgba(251,191,36,0.1)",  color:"#fbbf24", dot:"#fbbf24" },
  ADMIN:  { bg:"rgba(192,132,252,0.1)", color:"#c084fc", dot:"#c084fc" },
};

const SHARED_SERVICES = [
  { name:"Patient Identity & EMPI",    color:"#22d3ee", desc:"Universal patient matching across all solutions" },
  { name:"Consent Engine",             color:"#f472b6", desc:"Patient-controlled access to every health record" },
  { name:"AI Platform",                color:"#a78bfa", desc:"Claude AI embedded across all clinical workflows" },
  { name:"Interoperability Layer",     color:"#4ade80", desc:"FHIR R4 · HL7 v2 · NPHIES · NHS · CMS-1500" },
  { name:"Security & Identity",        color:"#fbbf24", desc:"Zero-trust, MFA, RBAC, audit trail, encryption" },
  { name:"Notification Platform",      color:"#fb923c", desc:"SMS, email, push, in-app across all products" },
  { name:"Reporting Platform",         color:"#60a5fa", desc:"BI dashboards, scheduled reports, data exports" },
  { name:"Network Provider Directory", color:"#e879f9", desc:"National registry of all facilities and providers" },
];

export default function NetworkLauncher() {
  const [search, setSearch] = useState("");
  const [filterTier, setFilterTier] = useState("ALL");

  const tiers = ["ALL", "Enterprise", "Standard", "Government", "Free", "Internal"];
  const filtered = SOLUTIONS.filter(s =>
    (filterTier === "ALL" || s.tier === filterTier) &&
    (!search || s.name.toLowerCase().includes(search.toLowerCase()) || s.short.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ minHeight:"100vh", background:"#050a14", color:"#f1f5f9", fontFamily:"var(--font-inter, system-ui, sans-serif)" }}>

      {/* Top navigation */}
      <nav style={{ borderBottom:"1px solid rgba(255,255,255,0.06)", background:"rgba(8,13,24,0.95)", backdropFilter:"blur(20px)", position:"sticky", top:0, zIndex:50 }}>
        <div style={{ maxWidth:1440, margin:"0 auto", padding:"0 32px", display:"flex", alignItems:"center", height:60, gap:32 }}>
          {/* Logo */}
          <div style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
            <div style={{ width:34, height:34, borderRadius:10, background:"linear-gradient(135deg,#e67e22,#22d3ee)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 3l2 6h6l-5 3.5L15 19l-5-3.5L5 19l2-6.5L2 9h6z" fill="white"/>
              </svg>
            </div>
            <div>
              <div style={{ display:"flex", alignItems:"baseline", gap:0 }}>
                <span style={{ fontSize:16, fontWeight:900, color:"#e67e22", letterSpacing:"0.04em" }}>CY</span>
                <span style={{ fontSize:16, fontWeight:900, color:"white", letterSpacing:"0.04em" }}>MED</span>
              </div>
              <div style={{ fontSize:9, color:"rgba(255,255,255,0.3)", letterSpacing:"0.12em", marginTop:-2, textTransform:"uppercase" }}>Health Network</div>
            </div>
          </div>

          <div style={{ flex:1 }} />

          {/* Network status */}
          <div style={{ display:"flex", alignItems:"center", gap:6, padding:"5px 14px", borderRadius:99, background:"rgba(74,222,128,0.1)", border:"1px solid rgba(74,222,128,0.2)" }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:"#4ade80", animation:"pulse 2s infinite" }} />
            <span style={{ fontSize:11, fontWeight:700, color:"#4ade80" }}>All systems operational</span>
          </div>

          {/* AI badge */}
          <div style={{ display:"flex", alignItems:"center", gap:6, padding:"5px 12px", borderRadius:99, background:"rgba(167,139,250,0.1)", border:"1px solid rgba(167,139,250,0.2)" }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:"#a78bfa", animation:"pulse 2s infinite" }} />
            <span style={{ fontSize:11, fontWeight:700, color:"#a78bfa" }}>Claude AI · Active</span>
          </div>

          <Link href="/dashboard" style={{ padding:"6px 16px", borderRadius:9, background:"rgba(192,132,252,0.12)", border:"1px solid rgba(192,132,252,0.25)", color:"#c084fc", fontSize:12, fontWeight:700, textDecoration:"none" }}>
            Super Admin
          </Link>

          <Link href="/login" style={{ padding:"6px 16px", borderRadius:9, background:"#e67e22", color:"white", fontSize:12, fontWeight:700, textDecoration:"none" }}>
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ maxWidth:1440, margin:"0 auto", padding:"56px 32px 40px" }}>
        <div style={{ marginBottom:48, maxWidth:720 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"5px 14px", borderRadius:99, background:"rgba(230,126,34,0.1)", border:"1px solid rgba(230,126,34,0.2)", marginBottom:20 }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="#e67e22" strokeWidth="1.5"/><path d="M6 4v4M4 6h4" stroke="#e67e22" strokeWidth="1.5" strokeLinecap="round"/></svg>
            <span style={{ fontSize:11, fontWeight:700, color:"#e67e22", textTransform:"uppercase", letterSpacing:"0.1em" }}>Healthcare Network Platform</span>
          </div>
          <h1 style={{ fontSize:42, fontWeight:900, lineHeight:1.1, margin:"0 0 16px", letterSpacing:"-0.8px" }}>
            One Platform.<br />
            <span style={{ background:"linear-gradient(90deg,#e67e22,#22d3ee)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
              Every Healthcare Solution.
            </span>
          </h1>
          <p style={{ fontSize:16, color:"rgba(255,255,255,0.5)", lineHeight:1.7, margin:0 }}>
            CyMed Health Network connects hospitals, clinics, pharmacies, laboratories, imaging centers, and governments
            through one patient identity, one consent engine, and one AI platform.
          </p>
        </div>

        {/* Search + filter */}
        <div style={{ display:"flex", gap:12, marginBottom:32, alignItems:"center", flexWrap:"wrap" }}>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search solutions…"
            style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:11, padding:"9px 16px", color:"#f1f5f9", fontSize:13, outline:"none", width:260 }}
          />
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {tiers.map(t => {
              const tc = TIER_COLOR[t];
              return (
                <button key={t} onClick={() => setFilterTier(t)} style={{
                  padding:"7px 16px", borderRadius:10, fontSize:12, fontWeight:600, cursor:"pointer",
                  background: filterTier===t ? (tc?.bg ?? "rgba(230,126,34,0.15)") : "transparent",
                  border: `1px solid ${filterTier===t ? (tc?.color ?? "#e67e22")+"50" : "rgba(255,255,255,0.1)"}`,
                  color: filterTier===t ? (tc?.color ?? "#e67e22") : "rgba(255,255,255,0.4)",
                }}>{t === "ALL" ? "All Solutions" : t}</button>
              );
            })}
          </div>
          <div style={{ marginLeft:"auto", fontSize:12, color:"rgba(255,255,255,0.3)" }}>
            {filtered.length} solution{filtered.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Solution grid */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(360px,1fr))", gap:14, marginBottom:64 }}>
          {filtered.map(s => {
            const st = STATUS_COLOR[s.status] ?? STATUS_COLOR.LIVE;
            const tc = TIER_COLOR[s.tier];
            return (
              <div key={s.id}
                style={{ borderRadius:18, padding:24, background:s.bg, border:`1px solid ${s.border}`, transition:"all 0.2s", display:"flex", flexDirection:"column", gap:16 }}
              >
                {/* Card header */}
                <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <div style={{ width:52, height:52, borderRadius:14, background:`${s.color}14`, border:`1px solid ${s.color}30`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      {s.icon}
                    </div>
                    <div>
                      <h3 style={{ fontSize:15, fontWeight:800, color:"#f1f5f9", margin:"0 0 3px" }}>{s.name}</h3>
                      <div style={{ display:"flex", gap:6 }}>
                        <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:5, background:st.bg, color:st.color }}>
                          <span style={{ display:"inline-block", width:5, height:5, borderRadius:"50%", background:st.dot, marginRight:4, verticalAlign:"middle" }} />
                          {s.status}
                        </span>
                        <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:5, background:tc.bg, color:tc.color }}>{s.tier}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p style={{ fontSize:12, color:"rgba(255,255,255,0.5)", lineHeight:1.6, margin:0 }}>{s.desc}</p>

                {/* Stats */}
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
                  {s.stats.map(st2 => (
                    <div key={st2.label} style={{ padding:"8px 10px", borderRadius:10, background:"rgba(0,0,0,0.2)", textAlign:"center" }}>
                      <p style={{ fontSize:13, fontWeight:800, color:s.color, margin:0 }}>{st2.val}</p>
                      <p style={{ fontSize:9, color:"rgba(255,255,255,0.3)", margin:0, textTransform:"uppercase", letterSpacing:"0.06em" }}>{st2.label}</p>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div style={{ display:"flex", gap:8 }}>
                  <Link href={s.href} style={{
                    flex:1, padding:"9px 0", borderRadius:10, fontSize:12, fontWeight:700, textAlign:"center",
                    background:s.color, color:"#050a14", textDecoration:"none", display:"block",
                  }}>
                    Launch {s.short} →
                  </Link>
                  <Link href={s.demoHref} style={{
                    padding:"9px 16px", borderRadius:10, fontSize:12, fontWeight:600, textAlign:"center",
                    background:"rgba(255,255,255,0.05)", color:"rgba(255,255,255,0.5)",
                    border:"1px solid rgba(255,255,255,0.08)", textDecoration:"none",
                  }}>
                    Demo
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Shared Services */}
        <div style={{ marginBottom:48 }}>
          <div style={{ textAlign:"center", marginBottom:32 }}>
            <p style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.25)", textTransform:"uppercase", letterSpacing:"0.15em", marginBottom:8 }}>Shared Platform Services</p>
            <h2 style={{ fontSize:24, fontWeight:800, color:"#f1f5f9", margin:0 }}>One foundation. Every solution shares:</h2>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:10 }}>
            {SHARED_SERVICES.map(svc => (
              <div key={svc.name} style={{ padding:18, borderRadius:14, background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)", display:"flex", gap:14, alignItems:"flex-start" }}>
                <div style={{ width:10, height:10, borderRadius:"50%", background:svc.color, flexShrink:0, marginTop:4, boxShadow:`0 0 10px ${svc.color}60` }} />
                <div>
                  <p style={{ fontSize:13, fontWeight:700, color:"#e2e8f0", margin:"0 0 3px" }}>{svc.name}</p>
                  <p style={{ fontSize:11, color:"rgba(255,255,255,0.38)", margin:0 }}>{svc.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ borderTop:"1px solid rgba(255,255,255,0.06)", paddingTop:24, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:28, height:28, borderRadius:8, background:"linear-gradient(135deg,#e67e22,#22d3ee)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M10 3l2 6h6l-5 3.5L15 19l-5-3.5L5 19l2-6.5L2 9h6z" fill="white"/></svg>
            </div>
            <span style={{ fontSize:12, color:"rgba(255,255,255,0.3)" }}>© 2026 CyMed Healthcare Technology · FHIR R4 · NPHIES · ZATCA · NHS · HL7 · HIPAA</span>
          </div>
          <div style={{ display:"flex", gap:16 }}>
            {["Documentation","API Reference","Status","Security","Privacy"].map(l => (
              <span key={l} style={{ fontSize:12, color:"rgba(255,255,255,0.3)", cursor:"pointer" }}>{l}</span>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  );
}
