import { AuthProvider } from "@/context/AuthContext";
import { PlatformSidebar, PlatformNavSection, PlatformBrand } from "@/components/layout/PlatformSidebar";

const BRAND: PlatformBrand = {
  code: "PT",
  name: "MyCyMed",
  tagline: "Patient · Family · Wearables",
  primary: "#22d3ee",
  secondary: "#06b6d4",
  badgeText: "PORTAL",
};

const NAV: PlatformNavSection[] = [
  {
    label: "HEALTH",
    items: [
      { label: "My Dashboard",         href: "/patient_portal",     dot: "#22d3ee" },
      { label: "Health Summary",       href: "/portal/summary",     dot: "#4ade80" },
      { label: "Lab Results",          href: "/portal/labs",        dot: "#a78bfa" },
      { label: "Vitals & Trends",      href: "/portal/vitals",      dot: "#22d3ee" },
      { label: "Wearable Sync",        href: "/wearables",   dot: "#4ade80" },
    ],
  },
  {
    label: "CARE",
    items: [
      { label: "Appointments",         href: "/portal/appointments",dot: "#22d3ee" },
      { label: "Online Booking",       href: "/portal/booking",     dot: "#4ade80" },
      { label: "Telehealth Visit",     href: "/portal/telehealth",  dot: "#f472b6" },
      { label: "Medications & Refills",href: "/portal/medications", dot: "#e67e22" },
      { label: "Messages",             href: "/portal/messages",    dot: "#a78bfa" },
    ],
  },
  {
    label: "FAMILY",
    items: [
      { label: "Proxy / Caregivers",   href: "/proxy",       dot: "#fb923c" },
      { label: "Children's Records",   href: "/portal/children",    dot: "#f472b6" },
    ],
  },
  {
    label: "RECORDS & BILLING",
    items: [
      { label: "Documents (CCDA/PDF)", href: "/patient-documents",  dot: "#4ade80" },
      { label: "After-Visit Summary",  href: "/portal/avs",         dot: "#22d3ee" },
      { label: "My Insurance",         href: "/insurance",          dot: "#34d399" },
      { label: "Bill Pay",             href: "/billpay",     dot: "#fbbf24" },
      { label: "Price Estimator",      href: "/portal/estimator",   dot: "#a78bfa" },
    ],
  },
];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="flex h-screen w-full overflow-hidden font-sans" style={{ background: "#080d18" }}>
        <PlatformSidebar brand={BRAND} sections={NAV} />
        <main className="flex-1 min-w-0 overflow-y-auto">{children}</main>
      </div>
    </AuthProvider>
  );
}
