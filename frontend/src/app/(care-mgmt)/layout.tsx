import { AuthProvider } from "@/context/AuthContext";
import { PlatformSidebar, PlatformNavSection, PlatformBrand } from "@/components/layout/PlatformSidebar";

const BRAND: PlatformBrand = {
  code: "CG",
  name: "CyMed Care Mgmt",
  tagline: "Risk · SDOH · Transitions",
  primary: "#06b6d4",
  secondary: "#0891b2",
  badgeText: "CM",
};

const NAV: PlatformNavSection[] = [
  {
    label: "OVERVIEW",
    items: [
      { label: "Dashboard",            href: "/care_management",    dot: "#06b6d4" },
      { label: "Care Worklists",       href: "/caremgmt/worklists", dot: "#fbbf24" },
      { label: "Messenger",            href: "/messenger", dot: "#4ade80" },
    ],
  },
  {
    label: "POPULATION",
    items: [
      { label: "Risk Stratification",  href: "/caremgmt/risk",      dot: "#f87171" },
      { label: "Hospitalization Risk", href: "/caremgmt/hosp-risk", dot: "#fb923c" },
      { label: "Readmission (LACE)",   href: "/caremgmt/readmit",   dot: "#fbbf24" },
      { label: "Frequent Utilizers",   href: "/caremgmt/utilizers", dot: "#a78bfa" },
    ],
  },
  {
    label: "CARE MANAGEMENT",
    items: [
      { label: "Care Plans",           href: "/care_management",    dot: "#34d399" },
      { label: "Transitions of Care",  href: "/caremgmt/transitions",dot: "#4ade80" },
      { label: "Utilization Mgmt",     href: "/um",        dot: "#22d3ee" },
      { label: "Behavioral Health",    href: "/caremgmt/bh",        dot: "#a78bfa" },
    ],
  },
  {
    label: "SDOH",
    items: [
      { label: "SDOH Screening",       href: "/sdoh",      dot: "#f472b6" },
      { label: "Community Resources",  href: "/caremgmt/resources", dot: "#84cc16" },
      { label: "Health Equity",        href: "/equity",    dot: "#06b6d4" },
    ],
  },
  {
    label: "FINANCE",
    items: [
      { label: "Insurance",            href: "/insurance",          dot: "#34d399" },
      { label: "VBC Tracking",         href: "/vbc",       dot: "#fbbf24" },
    ],
  },
];

export default function CareMgmtLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="flex h-screen w-full overflow-hidden font-sans" style={{ background: "#080d18" }}>
        <PlatformSidebar brand={BRAND} sections={NAV} />
        <main className="flex-1 min-w-0 overflow-y-auto">{children}</main>
      </div>
    </AuthProvider>
  );
}
