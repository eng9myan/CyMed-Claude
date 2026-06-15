import { AuthProvider } from "@/context/AuthContext";
import { PlatformSidebar, PlatformNavSection, PlatformBrand } from "@/components/layout/PlatformSidebar";

const BRAND: PlatformBrand = {
  code: "CM",
  name: "CyMed Clinic",
  tagline: "Outpatient · Multi-Provider",
  primary: "#22d3ee",
  secondary: "#0891b2",
  badgeText: "CMS",
};

const NAV: PlatformNavSection[] = [
  {
    label: "OVERVIEW",
    items: [
      { label: "Dashboard",         href: "/cms-home",          dot: "#22d3ee" },
      { label: "Calendar & Tasks",  href: "/calendar",      dot: "#fbbf24" },
      { label: "Messenger",         href: "/messenger",     dot: "#4ade80" },
    ],
  },
  {
    label: "PATIENT",
    items: [
      { label: "Patient Registry",  href: "/cms/patients",      dot: "#22d3ee" },
      { label: "Appointments",      href: "/cms/appointments",  dot: "#a78bfa" },
      { label: "Online Booking",    href: "/cms/online-booking",dot: "#4ade80" },
      { label: "Patient Recall",    href: "/cms/recall",        dot: "#fb923c" },
    ],
  },
  {
    label: "CLINICAL",
    items: [
      { label: "Outpatient EMR",    href: "/cms/emr",           dot: "#22d3ee" },
      { label: "E-Prescribing",     href: "/cms/eprescribe",    dot: "#e67e22" },
      { label: "Prior Auth & Referrals", href: "/referrals",dot: "#a78bfa" },
      { label: "HEDIS / Quality",   href: "/cms/quality",       dot: "#4ade80" },
    ],
  },
  {
    label: "REVENUE",
    items: [
      { label: "Billing & Claims",  href: "/billing",       dot: "#fbbf24" },
      { label: "Insurance",         href: "/insurance",         dot: "#34d399" },
      { label: "Practice Analytics",href: "/cms/analytics",     dot: "#f472b6" },
      { label: "Patient Portal",    href: "/portal",        dot: "#22d3ee" },
    ],
  },
];

export default function CMSLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="flex h-screen w-full overflow-hidden font-sans" style={{ background: "#080d18" }}>
        <PlatformSidebar brand={BRAND} sections={NAV} />
        <main className="flex-1 min-w-0 overflow-y-auto">{children}</main>
      </div>
    </AuthProvider>
  );
}
