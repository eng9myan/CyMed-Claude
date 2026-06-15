import { AuthProvider } from "@/context/AuthContext";
import { PlatformSidebar, PlatformNavSection, PlatformBrand } from "@/components/layout/PlatformSidebar";

const BRAND: PlatformBrand = {
  code: "TM",
  name: "CyMed Telemedicine",
  tagline: "Video · Async · RPM",
  primary: "#f472b6",
  secondary: "#db2777",
  badgeText: "TELE",
};

const NAV: PlatformNavSection[] = [
  {
    label: "OVERVIEW",
    items: [
      { label: "Dashboard",           href: "/tele-home",          dot: "#f472b6" },
      { label: "Calendar & Tasks",    href: "/calendar",      dot: "#fbbf24" },
      { label: "Messenger",           href: "/messenger",     dot: "#4ade80" },
    ],
  },
  {
    label: "VISITS",
    items: [
      { label: "Virtual Waiting Room",href: "/tele/waiting",       dot: "#f472b6" },
      { label: "Video Consultations", href: "/tele/video",         dot: "#22d3ee" },
      { label: "Group Sessions",      href: "/group",         dot: "#a78bfa" },
      { label: "Store-and-Forward",   href: "/async",         dot: "#fb923c" },
      { label: "E-Prescribing",       href: "/tele/eprescribe",    dot: "#e67e22" },
    ],
  },
  {
    label: "MONITORING",
    items: [
      { label: "Remote Patient (RPM)",href: "/tele/rpm",           dot: "#4ade80" },
      { label: "Connected Devices",   href: "/tele/devices",       dot: "#22d3ee" },
      { label: "Wearables Sync",      href: "/wearables",     dot: "#a78bfa" },
      { label: "Alert Center",        href: "/tele/alerts",        dot: "#f87171" },
    ],
  },
  {
    label: "SUPPORT",
    items: [
      { label: "Interpretation",      href: "/tele/interpreter",   dot: "#fbbf24" },
      { label: "Tech Support",        href: "/tele/tech-support",  dot: "#94a3b8" },
      { label: "Analytics",           href: "/tele/analytics",     dot: "#f472b6" },
    ],
  },
  {
    label: "REVENUE",
    items: [
      { label: "Insurance",           href: "/insurance",          dot: "#34d399" },
      { label: "Visit Billing",       href: "/billing",       dot: "#fbbf24" },
    ],
  },
];

export default function TelehealthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="flex h-screen w-full overflow-hidden font-sans" style={{ background: "#080d18" }}>
        <PlatformSidebar brand={BRAND} sections={NAV} />
        <main className="flex-1 min-w-0 overflow-y-auto">{children}</main>
      </div>
    </AuthProvider>
  );
}
