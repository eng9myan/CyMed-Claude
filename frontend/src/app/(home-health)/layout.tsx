import { AuthProvider } from "@/context/AuthContext";
import { PlatformSidebar, PlatformNavSection, PlatformBrand } from "@/components/layout/PlatformSidebar";

const BRAND: PlatformBrand = {
  code: "HH",
  name: "CyMed Home Care",
  tagline: "Visits · EVV · Field Staff",
  primary: "#84cc16",
  secondary: "#65a30d",
  badgeText: "HHC",
};

const NAV: PlatformNavSection[] = [
  {
    label: "OVERVIEW",
    items: [
      { label: "Dashboard",            href: "/evv",                dot: "#84cc16" },
      { label: "Calendar & Tasks",     href: "/calendar",dot: "#fbbf24" },
      { label: "Messenger",            href: "/messenger",dot: "#4ade80" },
    ],
  },
  {
    label: "FIELD WORKFLOW",
    items: [
      { label: "Visit Scheduling",     href: "/scheduling",dot: "#84cc16" },
      { label: "Route Optimization",   href: "/home-health/routes",   dot: "#22d3ee" },
      { label: "EVV (GPS Check-in)",   href: "/evv",      dot: "#a78bfa" },
      { label: "Mileage / Expense",    href: "/home-health/mileage",  dot: "#fbbf24" },
    ],
  },
  {
    label: "CLINICAL",
    items: [
      { label: "OASIS-E / RAI",        href: "/home-health/oasis",    dot: "#4ade80" },
      { label: "Care Plans",           href: "/home-health/careplans",dot: "#a78bfa" },
      { label: "Wound Photos",         href: "/wounds",   dot: "#fb923c" },
      { label: "Medication Mgmt",      href: "/home-health/meds",     dot: "#e67e22" },
      { label: "IV / Infusion / DME",  href: "/home-health/dme",      dot: "#22d3ee" },
    ],
  },
  {
    label: "FAMILY & STAFF",
    items: [
      { label: "Family Portal",        href: "/home-health/family",   dot: "#f472b6" },
      { label: "Field Staff Registry", href: "/home-health/staff",    dot: "#fbbf24" },
      { label: "Credential Tracker",   href: "/home-health/credentials",dot: "#a78bfa" },
      { label: "Outcomes (HHCAHPS)",   href: "/home-health/outcomes", dot: "#4ade80" },
    ],
  },
  {
    label: "FINANCE",
    items: [
      { label: "Insurance",            href: "/insurance",            dot: "#34d399" },
      { label: "Visit Billing",        href: "/billing",  dot: "#fbbf24" },
      { label: "Payroll",              href: "/payroll",  dot: "#f472b6" },
    ],
  },
];

export default function HomeHealthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="flex h-screen w-full overflow-hidden font-sans" style={{ background: "#080d18" }}>
        <PlatformSidebar brand={BRAND} sections={NAV} />
        <main className="flex-1 min-w-0 overflow-y-auto">{children}</main>
      </div>
    </AuthProvider>
  );
}
