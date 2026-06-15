"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LogOut, Settings } from "lucide-react";
import { CyMedIcon } from "@/components/ui/CyMedLogo";

interface NavItem {
  label: string;
  href: string;
  dot: string;   // CSS color
  roles: string[];
}
interface NavSection {
  label: string;
  items: NavItem[];
}

const ALL = ["admin@cymed.com", "doctor@cymed.com", "staff@cymed.com", "lab@cymed.com", "nurse@cymed.com"];

const NAV: NavSection[] = [
  {
    label: "OVERVIEW",
    items: [
      { label: "Command Center",  href: "/command_center", dot: "#22d3ee", roles: ALL },
      { label: "Executive Intel", href: "/executive",      dot: "#a78bfa", roles: ["admin@cymed.com"] },
      { label: "Calendar & Tasks",href: "/calendar",       dot: "#fbbf24", roles: ALL },
      { label: "Secure Messenger",href: "/messenger",      dot: "#4ade80", roles: ALL },
    ],
  },
  {
    label: "CLINICAL",
    items: [
      { label: "Doctor Queue",    href: "/doctor",         dot: "#4ade80", roles: ALL },
      { label: "Admissions",      href: "/admission",      dot: "#22d3ee", roles: ALL },
      { label: "Bed Board",       href: "/bed_board",      dot: "#f87171", roles: ALL },
      { label: "Scheduling",      href: "/scheduling",     dot: "#a78bfa", roles: ALL },
      { label: "Nurse Station",   href: "/nurse",          dot: "#fb923c", roles: ALL },
      { label: "eMAR",            href: "/emar",           dot: "#e67e22", roles: ALL },
      { label: "Order Sets",      href: "/order-sets",     dot: "#22d3ee", roles: ALL },
      { label: "Maternity",       href: "/maternity",      dot: "#f472b6", roles: ["admin@cymed.com", "doctor@cymed.com"] },
      { label: "Nutrition",       href: "/nutrition",      dot: "#a3e635", roles: ALL },
      { label: "Wound Care",      href: "/wound-care",     dot: "#fb923c", roles: ALL },
      { label: "Allied Health",   href: "/allied-health",  dot: "#4ade80", roles: ALL },
      { label: "Social Work",     href: "/social-work",    dot: "#a78bfa", roles: ALL },
      { label: "AI Scribe",       href: "/ai-scribe",      dot: "#a855f7", roles: ALL },
      { label: "Sepsis AI",       href: "/sepsis",         dot: "#f43f5e", roles: ALL },
      { label: "Genomics",        href: "/genomics",       dot: "#22d3ee", roles: ALL },
      { label: "Virtual ICU",     href: "/virtual-icu",    dot: "#f472b6", roles: ALL },
      { label: "IoMT Hub",        href: "/iomt",           dot: "#22d3ee", roles: ALL },
      { label: "RTLS Tracking",   href: "/rtls",           dot: "#22d3ee", roles: ALL },
      { label: "Coding AI",       href: "/coding-ai",      dot: "#a855f7", roles: ["admin@cymed.com"] },
      { label: "Care Plans",      href: "/care_management",dot: "#34d399", roles: ALL },
      { label: "Consent",         href: "/consent",        dot: "#60a5fa", roles: ALL },
    ],
  },
  {
    label: "DIAGNOSTICS",
    items: [
      { label: "Laboratory",      href: "/laboratory",     dot: "#4ade80", roles: ALL },
      { label: "Radiology",       href: "/radiology",      dot: "#60a5fa", roles: ALL },
      { label: "Blood Bank",      href: "/bloodbank",      dot: "#f87171", roles: ALL },
      { label: "Pharmacy",        href: "/pharmacy",       dot: "#a78bfa", roles: ALL },
    ],
  },
  {
    label: "FINANCE & OPS",
    items: [
      { label: "Billing",         href: "/billing",        dot: "#fbbf24", roles: ALL },
      { label: "Insurance",       href: "/insurance",      dot: "#34d399", roles: ALL },
      { label: "Reception",       href: "/reception",      dot: "#94a3b8", roles: ALL },
      { label: "Fleet & Ambulance",href: "/fleet",         dot: "#f43f5e", roles: ALL },
      { label: "Campaigns",       href: "/campaigns",      dot: "#22d3ee", roles: ["admin@cymed.com"] },
      { label: "National Health", href: "/national",       dot: "#22d3ee", roles: ["admin@cymed.com"] },
    ],
  },
];

export function CyMedSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth() as { user: { email?: string } | null; logout?: () => void };
  const email = user?.email ?? "";

  const canSee = (roles: string[]) =>
    email === "admin@cymed.com" || roles.includes(email);

  return (
    <aside
      className="w-[220px] h-screen flex flex-col flex-shrink-0 hidden md:flex"
      style={{
        background: "linear-gradient(180deg, #0a0f1e 0%, #080d18 100%)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-4 py-4 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      >
        <CyMedIcon size={28} />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-0">
            <span style={{ fontSize: 14, fontWeight: 800, color: "#E67E22", letterSpacing: "0.04em" }}>CY</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: "#ffffff", letterSpacing: "0.04em" }}>MED</span>
          </div>
          <div style={{ fontSize: 9, color: "#22d3ee", letterSpacing: "0.1em", marginTop: -1, fontWeight: 700 }}>HMS</div>
        </div>
        {/* AI badge */}
        <div
          className="flex items-center gap-1.5 px-2 py-0.5 rounded-full flex-shrink-0"
          style={{ background: "rgba(34,211,238,0.12)", border: "1px solid rgba(34,211,238,0.25)" }}
        >
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#22d3ee" }} />
          <span style={{ fontSize: 10, fontWeight: 700, color: "#22d3ee", letterSpacing: "0.05em" }}>AI</span>
        </div>
      </div>

      {/* Back to Network Launcher */}
      <div className="px-3 pt-3">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
          style={{ color: "rgba(255,255,255,0.25)", fontSize: 10, fontWeight: 600, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", textDecoration: "none", letterSpacing: "0.05em" }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M6.5 2L3.5 5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          NETWORK LAUNCHER
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {NAV.map(section => {
          const visible = section.items.filter(i => canSee(i.roles));
          if (!visible.length) return null;
          return (
            <div key={section.label}>
              <p
                className="px-3 mb-2"
                style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: "rgba(255,255,255,0.25)" }}
              >
                {section.label}
              </p>
              <div className="space-y-0.5">
                {visible.map(item => {
                  const active = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.href + item.label}
                      href={item.href}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl transition-all"
                      style={{
                        background: active
                          ? "linear-gradient(135deg, rgba(59,130,246,0.18) 0%, rgba(99,102,241,0.12) 100%)"
                          : "transparent",
                        border: active ? "1px solid rgba(99,102,241,0.25)" : "1px solid transparent",
                        color: active ? "#e2e8f0" : "rgba(255,255,255,0.42)",
                        fontSize: 13,
                        fontWeight: active ? 600 : 500,
                      }}
                    >
                      {/* Colored dot */}
                      <span
                        className="flex-shrink-0 rounded-full"
                        style={{
                          width: 7,
                          height: 7,
                          background: active ? item.dot : "rgba(255,255,255,0.2)",
                          boxShadow: active ? `0 0 8px ${item.dot}80` : "none",
                          transition: "all 0.2s",
                        }}
                      />
                      <span className="flex-1 truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        className="flex-shrink-0 px-3 py-3 space-y-0.5"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-xl transition-all"
          style={{ color: "rgba(255,255,255,0.38)", fontSize: 13, fontWeight: 500 }}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Settings</span>
        </Link>
        <button
          onClick={() => logout?.()}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all"
          style={{ color: "rgba(248,113,113,0.7)", fontSize: 13, fontWeight: 500 }}
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>

        {email && (
          <div
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl mt-2"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ background: "linear-gradient(135deg,#E67E22,#5DADE2)", color: "white" }}
            >
              {email[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate" style={{ color: "rgba(255,255,255,0.65)" }}>
                {email.split("@")[0]}
              </p>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.28)" }} className="truncate">{email}</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
