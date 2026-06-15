import { AuthProvider } from "@/context/AuthContext";
import { PlatformSidebar, PlatformNavSection, PlatformBrand } from "@/components/layout/PlatformSidebar";

const BRAND: PlatformBrand = {
  code: "RS",
  name: "CyMed Research",
  tagline: "CTMS · EDC · IRB",
  primary: "#a855f7",
  secondary: "#7e22ce",
  badgeText: "RES",
};

const NAV: PlatformNavSection[] = [
  {
    label: "OVERVIEW",
    items: [
      { label: "Dashboard",            href: "/protocol",           dot: "#a855f7" },
      { label: "Active Studies",       href: "/research/studies",   dot: "#22d3ee" },
      { label: "Calendar & Tasks",     href: "/calendar",  dot: "#fbbf24" },
    ],
  },
  {
    label: "STUDY MANAGEMENT",
    items: [
      { label: "Protocol & IRB",       href: "/protocol",  dot: "#a855f7" },
      { label: "Recruitment",          href: "/research/recruitment",dot: "#22d3ee" },
      { label: "eConsent",             href: "/research/econsent",  dot: "#4ade80" },
      { label: "Randomization",        href: "/randomize", dot: "#f472b6" },
      { label: "Visit Schedules",      href: "/research/visits",    dot: "#a78bfa" },
    ],
  },
  {
    label: "DATA",
    items: [
      { label: "EDC (CRF Builder)",    href: "/research/edc",       dot: "#22d3ee" },
      { label: "Query Management",     href: "/research/queries",   dot: "#fbbf24" },
      { label: "Source Verification",  href: "/research/sdv",       dot: "#a78bfa" },
      { label: "Database Lock",        href: "/research/lock",      dot: "#f87171" },
    ],
  },
  {
    label: "SAFETY",
    items: [
      { label: "Adverse Events (SAE)", href: "/ae",        dot: "#f87171" },
      { label: "Drug Accountability",  href: "/research/drug-acc",  dot: "#e67e22" },
      { label: "Biospecimens",         href: "/research/biobank",   dot: "#84cc16" },
    ],
  },
  {
    label: "REGULATORY",
    items: [
      { label: "ClinicalTrials.gov",   href: "/research/ctgov",     dot: "#22d3ee" },
      { label: "21 CFR Part 11 Audit", href: "/research/audit",     dot: "#a78bfa" },
      { label: "Inspection Readiness", href: "/research/inspection",dot: "#fbbf24" },
    ],
  },
];

export default function ResearchLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="flex h-screen w-full overflow-hidden font-sans" style={{ background: "#080d18" }}>
        <PlatformSidebar brand={BRAND} sections={NAV} />
        <main className="flex-1 min-w-0 overflow-y-auto">{children}</main>
      </div>
    </AuthProvider>
  );
}
