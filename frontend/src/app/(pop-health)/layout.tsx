import { AuthProvider } from "@/context/AuthContext";
import { PlatformSidebar, PlatformNavSection, PlatformBrand } from "@/components/layout/PlatformSidebar";

const BRAND: PlatformBrand = {
  code: "PH",
  name: "CyMed Population",
  tagline: "HEDIS · VBC · Predictive",
  primary: "#10b981",
  secondary: "#059669",
  badgeText: "POP",
};

const NAV: PlatformNavSection[] = [
  {
    label: "OVERVIEW",
    items: [
      { label: "Population Dashboard", href: "/vbc",                dot: "#10b981" },
      { label: "Cohort Builder",       href: "/pophealth/cohorts",  dot: "#22d3ee" },
    ],
  },
  {
    label: "ANALYTICS",
    items: [
      { label: "Risk Stratification",  href: "/pophealth/risk",     dot: "#f87171" },
      { label: "Predictive ML",        href: "/ml",       dot: "#a855f7" },
      { label: "Disease Prevalence",   href: "/pophealth/prevalence",dot: "#fb923c" },
      { label: "Frequent Utilizers",   href: "/pophealth/utilizers",dot: "#fbbf24" },
    ],
  },
  {
    label: "QUALITY",
    items: [
      { label: "HEDIS Measures",       href: "/pophealth/hedis",    dot: "#22d3ee" },
      { label: "CMS Quality Metrics",  href: "/pophealth/cms",      dot: "#a78bfa" },
      { label: "Care Gap Closure",     href: "/pophealth/gaps",     dot: "#4ade80" },
      { label: "Benchmark Comparison", href: "/pophealth/benchmark",dot: "#06b6d4" },
    ],
  },
  {
    label: "EQUITY & SURVEILLANCE",
    items: [
      { label: "Health Equity",        href: "/equity",   dot: "#10b981" },
      { label: "Disease Surveillance", href: "/surveillance",dot: "#f43f5e" },
      { label: "Vaccination Campaigns",href: "/pophealth/vaccination",dot: "#84cc16" },
      { label: "SDOH Analytics",       href: "/sdoh",     dot: "#f472b6" },
    ],
  },
  {
    label: "VALUE-BASED CARE",
    items: [
      { label: "ACO / PCMH Contracts", href: "/vbc",      dot: "#fbbf24" },
      { label: "Attributed Panels",    href: "/pophealth/panels",   dot: "#22d3ee" },
      { label: "Shared Savings",       href: "/pophealth/savings",  dot: "#4ade80" },
      { label: "Payer Insurance",      href: "/insurance",          dot: "#34d399" },
    ],
  },
];

export default function PopHealthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="flex h-screen w-full overflow-hidden font-sans" style={{ background: "#080d18" }}>
        <PlatformSidebar brand={BRAND} sections={NAV} />
        <main className="flex-1 min-w-0 overflow-y-auto">{children}</main>
      </div>
    </AuthProvider>
  );
}
