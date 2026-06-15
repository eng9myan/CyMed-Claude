import { AuthProvider } from "@/context/AuthContext";
import { PlatformSidebar, PlatformNavSection, PlatformBrand } from "@/components/layout/PlatformSidebar";

const BRAND: PlatformBrand = {
  code: "ER",
  name: "CyMed ERP",
  tagline: "HR · Finance · Procurement · CRM",
  primary: "#f59e0b",
  secondary: "#d97706",
  badgeText: "ERP",
};

const NAV: PlatformNavSection[] = [
  {
    label: "OVERVIEW",
    items: [
      { label: "ERP Dashboard",     href: "/erp-home",         dot: "#f59e0b" },
      { label: "Discuss",           href: "/discuss",          dot: "#22d3ee" },
      { label: "To-do",              href: "/todo",             dot: "#4ade80" },
      { label: "Approvals",          href: "/approvals",        dot: "#f87171" },
      { label: "Reports",            href: "/reports",          dot: "#a78bfa" },
    ],
  },
  {
    label: "HUMAN CAPITAL",
    items: [
      { label: "Employees",          href: "/employees",        dot: "#a78bfa" },
      { label: "Attendance",          href: "/attendance",       dot: "#4ade80" },
      { label: "Leave",               href: "/leave",            dot: "#fbbf24" },
      { label: "Shifts & Rota",      href: "/shifts",           dot: "#22d3ee" },
      { label: "Payroll",             href: "/payroll",          dot: "#f472b6" },
      { label: "Performance",         href: "/performance",       dot: "#fb923c" },
      { label: "Expenses",            href: "/expenses",         dot: "#4ade80" },
    ],
  },
  {
    label: "FINANCE",
    items: [
      { label: "Chart of accounts",  href: "/coa",              dot: "#fbbf24" },
      { label: "Journal entries",    href: "/journals",         dot: "#a78bfa" },
      { label: "Accounts payable",   href: "/ap",               dot: "#fb923c" },
      { label: "Accounts receivable",href: "/ar",               dot: "#4ade80" },
      { label: "Bank reconciliation",href: "/banking",          dot: "#22d3ee" },
      { label: "Trial balance",       href: "/trial-balance",    dot: "#a78bfa" },
      { label: "P&L / Balance sheet",href: "/financials",       dot: "#4ade80" },
    ],
  },
  {
    label: "SUPPLY CHAIN",
    items: [
      { label: "Procurement / PO",   href: "/procurement",      dot: "#22d3ee" },
      { label: "Inventory",          href: "/inventory",        dot: "#4ade80" },
      { label: "Warehouses",         href: "/warehouses",       dot: "#a78bfa" },
      { label: "Sales proposals",    href: "/proposals",        dot: "#fbbf24" },
      { label: "Sales invoices",      href: "/sales",            dot: "#f472b6" },
      { label: "Returns",             href: "/returns",          dot: "#f87171" },
    ],
  },
  {
    label: "ASSETS & DOCS",
    items: [
      { label: "Asset register",      href: "/assets",           dot: "#fb923c" },
      { label: "Document mgmt",       href: "/documents",        dot: "#22d3ee" },
      { label: "Knowledge base",      href: "/knowledge",        dot: "#a78bfa" },
    ],
  },
  {
    label: "CUSTOMER & GROWTH",
    items: [
      { label: "CRM / Leads",         href: "/crm",              dot: "#f472b6" },
      { label: "Helpdesk tickets",    href: "/helpdesk",         dot: "#a78bfa" },
      { label: "Coupons & promos",    href: "/coupons",          dot: "#fbbf24" },
      { label: "Surveys",              href: "/surveys",          dot: "#4ade80" },
    ],
  },
];

export default function ERPLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="flex h-screen w-full overflow-hidden font-sans" style={{ background: "#080d18" }}>
        <PlatformSidebar brand={BRAND} sections={NAV} />
        <main className="flex-1 min-w-0 overflow-y-auto">{children}</main>
      </div>
    </AuthProvider>
  );
}
