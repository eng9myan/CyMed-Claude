import { AuthProvider } from "@/context/AuthContext";
import { PlatformSidebar, PlatformNavSection, PlatformBrand } from "@/components/layout/PlatformSidebar";

const BRAND: PlatformBrand = {
  code: "RX",
  name: "CyMed Pharmacy",
  tagline: "Retail · Hospital · Compounding",
  primary: "#a78bfa",
  secondary: "#7c3aed",
  badgeText: "ERP",
};

const NAV: PlatformNavSection[] = [
  {
    label: "OVERVIEW",
    items: [
      { label: "Dashboard",         href: "/rx-home",           dot: "#a78bfa" },
      { label: "Calendar & Tasks",  href: "/calendar", dot: "#fbbf24" },
      { label: "Messenger",         href: "/messenger",dot: "#4ade80" },
    ],
  },
  {
    label: "DISPENSING",
    items: [
      { label: "Prescription Queue",href: "/pharmacy/queue",    dot: "#a78bfa" },
      { label: "Point of Sale",     href: "/pos",               dot: "#e67e22" },
      { label: "E-Prescription In", href: "/pharmacy/eprescriptions", dot: "#22d3ee" },
      { label: "Med Reconciliation",href: "/pharmacy/medrec",   dot: "#4ade80" },
    ],
  },
  {
    label: "INVENTORY",
    items: [
      { label: "Drug Master File",  href: "/pharmacy/dmf",      dot: "#22d3ee" },
      { label: "Stock & Par Levels",href: "/pharmacy/stock",    dot: "#fbbf24" },
      { label: "Purchase Orders",   href: "/pharmacy/po",       dot: "#a78bfa" },
      { label: "Expiry Tracker",    href: "/pharmacy/expiry",   dot: "#f87171" },
      { label: "ADC (Pyxis/Omnicell)", href: "/pharmacy/adc",   dot: "#34d399" },
    ],
  },
  {
    label: "SPECIALTY",
    items: [
      { label: "Controlled Drugs",  href: "/pharmacy/controlled", dot: "#f472b6" },
      { label: "IV / TPN / Chemo",  href: "/compounding",dot: "#fb923c" },
      { label: "Clinical Pharmacy", href: "/pharmacy/clinical", dot: "#22d3ee" },
      { label: "Pharmacovigilance", href: "/pharmacy/adr",      dot: "#f87171" },
    ],
  },
  {
    label: "FINANCE",
    items: [
      { label: "Insurance",         href: "/insurance",         dot: "#34d399" },
      { label: "Billing",           href: "/billing",  dot: "#fbbf24" },
      { label: "Coupons",           href: "/coupons",  dot: "#f472b6" },
      { label: "Online Pharmacy",   href: "/ecommerce",dot: "#4ade80" },
    ],
  },
];

export default function PharmacyERPLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="flex h-screen w-full overflow-hidden font-sans" style={{ background: "#080d18" }}>
        <PlatformSidebar brand={BRAND} sections={NAV} />
        <main className="flex-1 min-w-0 overflow-y-auto">{children}</main>
      </div>
    </AuthProvider>
  );
}
