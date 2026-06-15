import { AuthProvider } from "@/context/AuthContext";
import { PlatformSidebar, PlatformNavSection, PlatformBrand } from "@/components/layout/PlatformSidebar";

const BRAND: PlatformBrand = {
  code: "LB",
  name: "CyMed Lab",
  tagline: "LIS · LIMS · QC",
  primary: "#4ade80",
  secondary: "#16a34a",
  badgeText: "LIS",
};

const NAV: PlatformNavSection[] = [
  {
    label: "OVERVIEW",
    items: [
      { label: "Dashboard",          href: "/lis-home",           dot: "#4ade80" },
      { label: "Calendar & Tasks",   href: "/calendar",       dot: "#fbbf24" },
      { label: "Messenger",          href: "/messenger",      dot: "#22d3ee" },
    ],
  },
  {
    label: "WORKFLOW",
    items: [
      { label: "Order Management",   href: "/lab/orders",         dot: "#22d3ee" },
      { label: "Specimen Tracking",  href: "/lab/specimens",      dot: "#4ade80" },
      { label: "Result Entry",       href: "/lab/results",        dot: "#a78bfa" },
      { label: "Auto-Verification",  href: "/autoverify",     dot: "#e67e22" },
      { label: "Send-Outs",          href: "/lab/sendouts",       dot: "#fb923c" },
    ],
  },
  {
    label: "SPECIALTIES",
    items: [
      { label: "Microbiology",       href: "/microbiology",   dot: "#f472b6" },
      { label: "Histo / Cyto",       href: "/lab/histology",      dot: "#a78bfa" },
      { label: "Blood Bank",         href: "/bloodbank",      dot: "#f87171" },
      { label: "Molecular",          href: "/lab/molecular",      dot: "#22d3ee" },
      { label: "POCT",               href: "/lab/poct",           dot: "#4ade80" },
    ],
  },
  {
    label: "QUALITY",
    items: [
      { label: "QC (Westgard)",      href: "/lab/qc",             dot: "#fbbf24" },
      { label: "Reagent Lots",       href: "/lab/reagents",       dot: "#a78bfa" },
      { label: "Proficiency Testing",href: "/lab/pt",             dot: "#4ade80" },
      { label: "TAT Analytics",      href: "/lab/tat",            dot: "#22d3ee" },
    ],
  },
  {
    label: "REVENUE",
    items: [
      { label: "Insurance",          href: "/insurance",          dot: "#34d399" },
      { label: "Lab Billing",        href: "/billing",        dot: "#fbbf24" },
    ],
  },
];

export default function LISLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="flex h-screen w-full overflow-hidden font-sans" style={{ background: "#080d18" }}>
        <PlatformSidebar brand={BRAND} sections={NAV} />
        <main className="flex-1 min-w-0 overflow-y-auto">{children}</main>
      </div>
    </AuthProvider>
  );
}
