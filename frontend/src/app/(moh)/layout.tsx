import { AuthProvider } from "@/context/AuthContext";
import { PlatformSidebar, PlatformNavSection, PlatformBrand } from "@/components/layout/PlatformSidebar";

const BRAND: PlatformBrand = {
  code: "MH",
  name: "CyMed Ministry",
  tagline: "Public Health · Regulator",
  primary: "#34d399",
  secondary: "#059669",
  badgeText: "MoH",
};

const NAV: PlatformNavSection[] = [
  {
    label: "OVERVIEW",
    items: [
      { label: "Dashboard",            href: "/moh-home",           dot: "#34d399" },
      { label: "Command Center",       href: "/moh/command",        dot: "#22d3ee" },
      { label: "Calendar & Tasks",     href: "/calendar",       dot: "#fbbf24" },
    ],
  },
  {
    label: "REGULATION",
    items: [
      { label: "Facility Licensing",   href: "/licensing",      dot: "#34d399" },
      { label: "Workforce Registry",   href: "/moh/workforce",      dot: "#22d3ee" },
      { label: "Drug Registration",    href: "/moh/drugs",          dot: "#a78bfa" },
      { label: "Inspections",          href: "/moh/inspections",    dot: "#f87171" },
    ],
  },
  {
    label: "SURVEILLANCE",
    items: [
      { label: "Disease Surveillance", href: "/surveillance",   dot: "#f43f5e" },
      { label: "Outbreak Tracking",    href: "/moh/outbreaks",      dot: "#fb923c" },
      { label: "Vaccination Programme",href: "/moh/vaccination",    dot: "#4ade80" },
      { label: "Maternal & Child",     href: "/moh/mch",            dot: "#f472b6" },
      { label: "NCD Programmes",       href: "/moh/ncd",            dot: "#22d3ee" },
    ],
  },
  {
    label: "OPERATIONS",
    items: [
      { label: "Emergency Preparedness",href: "/moh/emergency",     dot: "#f43f5e" },
      { label: "Pandemic Response",    href: "/pandemic",       dot: "#f87171" },
      { label: "National HIE",         href: "/moh/hie",            dot: "#22d3ee" },
      { label: "Health Statistics",    href: "/moh/statistics",     dot: "#a78bfa" },
    ],
  },
];

export default function MoHLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="flex h-screen w-full overflow-hidden font-sans" style={{ background: "#080d18" }}>
        <PlatformSidebar brand={BRAND} sections={NAV} />
        <main className="flex-1 min-w-0 overflow-y-auto">{children}</main>
      </div>
    </AuthProvider>
  );
}
