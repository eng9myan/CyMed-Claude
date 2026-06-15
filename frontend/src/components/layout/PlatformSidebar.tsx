"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Settings, ChevronLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export interface PlatformNavItem {
  label: string;
  href: string;
  dot: string;
}
export interface PlatformNavSection {
  label: string;
  items: PlatformNavItem[];
}
export interface PlatformBrand {
  code: string;       // e.g. "PHARM"
  name: string;       // e.g. "Pharmacy ERP"
  tagline: string;    // e.g. "Retail · Hospital · Compounding"
  primary: string;    // accent color (active dot)
  secondary: string;  // sub-accent (e.g. AI badge)
  badgeText?: string; // small badge top-right (e.g. "ERP", "LIS")
}

export function PlatformSidebar({
  brand,
  sections,
}: {
  brand: PlatformBrand;
  sections: PlatformNavSection[];
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth() as { user: { email?: string } | null; logout?: () => void };
  const email = user?.email ?? "";

  return (
    <aside
      className="w-[220px] h-screen flex flex-col flex-shrink-0 hidden md:flex"
      style={{
        background: "linear-gradient(180deg, #0a0f1e 0%, #080d18 100%)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Brand */}
      <div
        className="flex items-center gap-3 px-4 py-4 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div
          style={{
            width: 28, height: 28, borderRadius: 8,
            background: `linear-gradient(135deg, ${brand.primary} 0%, ${brand.secondary} 100%)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 800, color: "white", letterSpacing: "0.05em",
            flexShrink: 0,
          }}
        >
          {brand.code.slice(0, 2)}
        </div>
        <div className="flex-1 min-w-0">
          <div style={{ fontSize: 13, fontWeight: 800, color: "#ffffff", letterSpacing: "0.03em", lineHeight: 1.1 }}>
            {brand.name}
          </div>
          <div style={{ fontSize: 9, color: brand.primary, letterSpacing: "0.08em", marginTop: 2, fontWeight: 700 }}>
            {brand.tagline}
          </div>
        </div>
        {brand.badgeText && (
          <div
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full flex-shrink-0"
            style={{ background: `${brand.primary}20`, border: `1px solid ${brand.primary}40` }}
          >
            <span style={{ fontSize: 9, fontWeight: 700, color: brand.primary, letterSpacing: "0.05em" }}>
              {brand.badgeText}
            </span>
          </div>
        )}
      </div>

      {/* Network launcher link */}
      <div className="px-3 pt-3">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
          style={{
            color: "rgba(255,255,255,0.3)",
            fontSize: 10,
            fontWeight: 600,
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.05)",
            textDecoration: "none",
            letterSpacing: "0.05em",
          }}
        >
          <ChevronLeft style={{ width: 11, height: 11 }} />
          CYMED NETWORK
        </Link>
      </div>

      {/* Nav sections */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {sections.map(section => (
          <div key={section.label}>
            <p
              className="px-3 mb-2"
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.12em",
                color: "rgba(255,255,255,0.25)",
              }}
            >
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map(item => {
                const active =
                  pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href + item.label}
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl transition-all"
                    style={{
                      background: active
                        ? `linear-gradient(135deg, ${brand.primary}28 0%, ${brand.secondary}18 100%)`
                        : "transparent",
                      border: active
                        ? `1px solid ${brand.primary}35`
                        : "1px solid transparent",
                      color: active ? "#e2e8f0" : "rgba(255,255,255,0.42)",
                      fontSize: 13,
                      fontWeight: active ? 600 : 500,
                    }}
                  >
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
        ))}
      </nav>

      {/* Footer */}
      <div
        className="flex-shrink-0 px-3 py-3 space-y-0.5"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-xl"
          style={{ color: "rgba(255,255,255,0.38)", fontSize: 13, fontWeight: 500 }}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Settings</span>
        </Link>
        <button
          onClick={() => logout?.()}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl"
          style={{ color: "rgba(248,113,113,0.7)", fontSize: 13, fontWeight: 500 }}
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>

        {email && (
          <div
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl mt-2"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, ${brand.primary}, ${brand.secondary})`,
                color: "white",
              }}
            >
              {email[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-xs font-medium truncate"
                style={{ color: "rgba(255,255,255,0.65)" }}
              >
                {email.split("@")[0]}
              </p>
              <p
                style={{ fontSize: 10, color: "rgba(255,255,255,0.28)" }}
                className="truncate"
              >
                {email}
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
