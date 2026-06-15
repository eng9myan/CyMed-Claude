import { AuthProvider } from "@/context/AuthContext";
import { PlatformSidebar, PlatformNavSection, PlatformBrand } from "@/components/layout/PlatformSidebar";

const BRAND: PlatformBrand = {
  code: "GP",
  name: "CyMed Group",
  tagline: "Multi-Facility · Network",
  primary: "#f97316",
  secondary: "#ea580c",
  badgeText: "GROUP",
};

const NAV: PlatformNavSection[] = [
  {
    label: "OVERVIEW",
    items: [
      { label: "Group Dashboard",      href: "/group-home",          dot: "#f97316" },
      { label: "Facilities Map",       href: "/group/map",           dot: "#22d3ee" },
      { label: "Calendar & Tasks",     href: "/calendar",      dot: "#fbbf24" },
    ],
  },
  {
    label: "NETWORK OPERATIONS",
    items: [
      { label: "Patient Records (MPI)",href: "/group/mpi",           dot: "#22d3ee" },
      { label: "Cross-Facility Referral",href: "/referrals",   dot: "#a78bfa" },
      { label: "Resource Sharing",     href: "/group/resources",     dot: "#4ade80" },
      { label: "Bed Management",       href: "/group/beds",          dot: "#f87171" },
    ],
  },
  {
    label: "GOVERNANCE",
    items: [
      { label: "Clinical Governance",  href: "/group/governance",    dot: "#34d399" },
      { label: "Standardized Protocols",href: "/group/protocols",    dot: "#a78bfa" },
      { label: "Quality Benchmarking", href: "/group/quality",       dot: "#4ade80" },
      { label: "Accreditation (JCI)",  href: "/group/accreditation", dot: "#22d3ee" },
    ],
  },
  {
    label: "SHARED SERVICES",
    items: [
      { label: "Group HR",             href: "/group/hr",            dot: "#fb923c" },
      { label: "Credentialing",        href: "/group/credentialing", dot: "#a78bfa" },
      { label: "GPO Procurement",      href: "/procurement",   dot: "#f472b6" },
    ],
  },
  {
    label: "FINANCE",
    items: [
      { label: "Consolidated GL",      href: "/gl",            dot: "#fbbf24" },
      { label: "Insurance / Payers",   href: "/insurance",           dot: "#34d399" },
      { label: "Service Line P&L",     href: "/group/pnl",           dot: "#22d3ee" },
      { label: "Provider Network",     href: "/group/network",       dot: "#4ade80" },
    ],
  },
];

export default function GroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="flex h-screen w-full overflow-hidden font-sans" style={{ background: "#080d18" }}>
        <PlatformSidebar brand={BRAND} sections={NAV} />
        <main className="flex-1 min-w-0 overflow-y-auto">{children}</main>
      </div>
    </AuthProvider>
  );
}
