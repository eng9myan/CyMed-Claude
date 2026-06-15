import { AuthProvider } from "@/context/AuthContext";
import { PlatformSidebar, PlatformNavSection, PlatformBrand } from "@/components/layout/PlatformSidebar";

const BRAND: PlatformBrand = {
  code: "RI",
  name: "CyMed Imaging",
  tagline: "RIS · PACS · DICOM",
  primary: "#60a5fa",
  secondary: "#2563eb",
  badgeText: "RIS",
};

const NAV: PlatformNavSection[] = [
  {
    label: "OVERVIEW",
    items: [
      { label: "Dashboard",           href: "/ris-home",             dot: "#60a5fa" },
      { label: "Calendar & Tasks",    href: "/calendar",         dot: "#fbbf24" },
      { label: "Messenger",           href: "/messenger",        dot: "#4ade80" },
    ],
  },
  {
    label: "WORKFLOW",
    items: [
      { label: "Modality Worklist",   href: "/ris/worklist",         dot: "#60a5fa" },
      { label: "Scheduling",          href: "/scheduling",       dot: "#a78bfa" },
      { label: "DICOM Viewer",        href: "/ris/viewer",           dot: "#22d3ee" },
      { label: "Reading Queue",       href: "/ris/reads",            dot: "#fb923c" },
    ],
  },
  {
    label: "REPORTING",
    items: [
      { label: "Structured Reports",  href: "/reports",          dot: "#4ade80" },
      { label: "Critical Findings",   href: "/ris/critical",         dot: "#f87171" },
      { label: "AI-Assisted Reads",   href: "/ai",               dot: "#a78bfa" },
      { label: "Peer Review (QA)",    href: "/peerreview",       dot: "#22d3ee" },
    ],
  },
  {
    label: "SAFETY",
    items: [
      { label: "Radiation Dose",      href: "/dose",             dot: "#fbbf24" },
      { label: "Contrast Safety",     href: "/ris/contrast",         dot: "#f87171" },
      { label: "MRI Safety / Implant",href: "/ris/mri-safety",       dot: "#a78bfa" },
    ],
  },
  {
    label: "REVENUE",
    items: [
      { label: "Insurance",           href: "/insurance",            dot: "#34d399" },
      { label: "Radiology Billing",   href: "/billing",          dot: "#fbbf24" },
    ],
  },
];

export default function RISLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="flex h-screen w-full overflow-hidden font-sans" style={{ background: "#080d18" }}>
        <PlatformSidebar brand={BRAND} sections={NAV} />
        <main className="flex-1 min-w-0 overflow-y-auto">{children}</main>
      </div>
    </AuthProvider>
  );
}
