import { AuthProvider } from "@/context/AuthContext";
import { PlatformSidebar, PlatformNavSection, PlatformBrand } from "@/components/layout/PlatformSidebar";

const BRAND: PlatformBrand = {
  code: "NH",
  name: "CyMed National",
  tagline: "EHR · HIE · Registries",
  primary: "#0ea5e9",
  secondary: "#0369a1",
  badgeText: "NHS",
};

const NAV: PlatformNavSection[] = [
  {
    label: "OVERVIEW",
    items: [
      { label: "National Dashboard",   href: "/national-home",      dot: "#0ea5e9" },
      { label: "Capacity Monitoring",  href: "/national/capacity",  dot: "#22d3ee" },
    ],
  },
  {
    label: "IDENTITY",
    items: [
      { label: "Digital Health ID",    href: "/health-id", dot: "#22d3ee" },
      { label: "National MPI",         href: "/national/mpi",       dot: "#a78bfa" },
      { label: "Longitudinal Record",  href: "/national/lhr",       dot: "#4ade80" },
    ],
  },
  {
    label: "INTEROPERABILITY",
    items: [
      { label: "HIE (FHIR/HL7)",       href: "/national/hie",       dot: "#0ea5e9" },
      { label: "National E-Prescribing",href: "/national/eprescribe",dot: "#e67e22" },
      { label: "PDMP",                 href: "/national/pdmp",      dot: "#f472b6" },
    ],
  },
  {
    label: "REGISTRIES",
    items: [
      { label: "Immunization Registry",href: "/immunization",dot: "#4ade80" },
      { label: "Cancer Registry",      href: "/national/cancer",    dot: "#f87171" },
      { label: "Chronic Disease",      href: "/national/chronic",   dot: "#fbbf24" },
      { label: "Organ Donation",       href: "/national/organ",     dot: "#f472b6" },
      { label: "Medical Devices",      href: "/national/devices",   dot: "#a78bfa" },
    ],
  },
  {
    label: "CLAIMS & FINANCE",
    items: [
      { label: "National Clearinghouse",href: "/national/clearinghouse",dot: "#34d399" },
      { label: "Insurance Payers",     href: "/insurance",          dot: "#fbbf24" },
      { label: "Fraud Detection",      href: "/national/fraud",     dot: "#f87171" },
    ],
  },
  {
    label: "SECURITY",
    items: [
      { label: "Data Sovereignty",     href: "/national/sovereignty",dot: "#f87171" },
      { label: "Audit Logs",           href: "/national/audit",     dot: "#a78bfa" },
      { label: "Patient Consent",      href: "/consent",   dot: "#4ade80" },
    ],
  },
];

export default function NationalLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="flex h-screen w-full overflow-hidden font-sans" style={{ background: "#080d18" }}>
        <PlatformSidebar brand={BRAND} sections={NAV} />
        <main className="flex-1 min-w-0 overflow-y-auto">{children}</main>
      </div>
    </AuthProvider>
  );
}
