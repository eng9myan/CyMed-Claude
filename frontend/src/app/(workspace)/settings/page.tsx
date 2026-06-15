"use client";

import { useState } from "react";
import {
  Globe, Building2, Bell, Shield, Palette,
  Users, Database, Zap, ChevronRight, Save, CheckCircle2,
} from "lucide-react";
import { CountrySelector, type CountryProfile } from "@/components/settings/CountrySelector";

const TABS = [
  { id:"country",       label:"Country & Locale",   icon:<Globe className="w-4 h-4" /> },
  { id:"organization",  label:"Organization",        icon:<Building2 className="w-4 h-4" /> },
  { id:"notifications", label:"Notifications",       icon:<Bell className="w-4 h-4" /> },
  { id:"security",      label:"Security & Privacy",  icon:<Shield className="w-4 h-4" /> },
  { id:"appearance",    label:"Appearance",          icon:<Palette className="w-4 h-4" /> },
  { id:"integrations",  label:"Integrations",        icon:<Zap className="w-4 h-4" /> },
  { id:"users",         label:"Users & RBAC",        icon:<Users className="w-4 h-4" /> },
  { id:"data",          label:"Data & Backup",       icon:<Database className="w-4 h-4" /> },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function SettingsPage() {
  const [tab, setTab] = useState<TabId>("country");
  const [saved, setSaved] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<CountryProfile | null>(null);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">System Settings</h1>
            <p className="text-slate-500 text-sm mt-0.5">Configure deployment, compliance, and facility options</p>
          </div>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition shadow-lg shadow-orange-500/20"
          >
            {saved ? <><CheckCircle2 className="w-4 h-4" /> Saved</> : <><Save className="w-4 h-4" /> Save Changes</>}
          </button>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <nav className="w-56 shrink-0 space-y-1">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                  tab === t.id
                    ? "bg-orange-500/15 text-orange-400 border border-orange-500/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                <span className={tab === t.id ? "text-orange-400" : "text-slate-500"}>{t.icon}</span>
                {t.label}
                {tab === t.id && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
              </button>
            ))}
          </nav>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {tab === "country" && (
              <div>
                <h2 className="text-lg font-semibold text-slate-200 mb-1">Country & Locale Configuration</h2>
                <p className="text-slate-500 text-sm mb-6">
                  Set the deployment country. This controls billing standard, currency, date format, national ID format, privacy law compliance, RTL/LTR layout, and national API endpoints.
                </p>
                <CountrySelector
                  currentCountry="SA"
                  onChange={setSelectedCountry}
                />
                {selectedCountry && (
                  <div className="mt-4 bg-emerald-500/10 border border-emerald-500/25 rounded-xl px-4 py-3 text-sm text-emerald-300">
                    Country set to <strong>{selectedCountry.name}</strong> — billing standard will switch to <strong>{selectedCountry.billing_standard}</strong>. Click Save Changes to apply.
                  </div>
                )}
              </div>
            )}

            {tab === "organization" && <OrganizationTab />}
            {tab === "notifications" && <NotificationsTab />}
            {tab === "security" && <SecurityTab />}
            {tab === "appearance" && <AppearanceTab />}
            {tab === "integrations" && <IntegrationsTab />}
            {tab === "users" && <UsersRbacTab />}
            {tab === "data" && <DataBackupTab />}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Tab sub-components ──────────────────────────────────────────────────── */

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-4">
      <h3 className="text-slate-300 font-semibold text-sm mb-4">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between py-3 border-b border-slate-800 last:border-0">
      <div className="flex-1 min-w-0 mr-6">
        <p className="text-slate-300 text-sm font-medium">{label}</p>
        {description && <p className="text-slate-500 text-xs mt-0.5">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Toggle({ checked = false }: { checked?: boolean }) {
  const [on, setOn] = useState(checked);
  return (
    <button
      onClick={() => setOn(!on)}
      className={`relative inline-flex h-5 w-9 rounded-full transition ${on ? "bg-orange-500" : "bg-slate-700"}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${on ? "translate-x-4" : ""}`} />
    </button>
  );
}

function TextInput({ placeholder, defaultValue }: { placeholder?: string; defaultValue?: string }) {
  return (
    <input
      defaultValue={defaultValue}
      placeholder={placeholder}
      className="bg-slate-800 border border-slate-700 text-slate-300 text-sm px-3 py-1.5 rounded-xl w-52 outline-none focus:border-orange-500"
    />
  );
}

function OrganizationTab() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-200 mb-1">Organization</h2>
      <p className="text-slate-500 text-sm mb-6">Facility identity, accreditation, and contact information.</p>
      <SectionCard title="Facility Details">
        <Field label="Organization Name" description="Displayed on reports and invoices">
          <TextInput defaultValue="CyMed General Hospital" />
        </Field>
        <Field label="License Number" description="National healthcare facility license">
          <TextInput placeholder="HF-XXXX-XXXXX" />
        </Field>
        <Field label="Accreditation Body" description="JCI, CBAHI, CQC, DNV, etc.">
          <TextInput defaultValue="JCI" />
        </Field>
        <Field label="Facility Type">
          <select className="bg-slate-800 border border-slate-700 text-slate-300 text-sm px-3 py-1.5 rounded-xl outline-none focus:border-orange-500">
            <option>General Hospital</option>
            <option>Specialty Clinic</option>
            <option>Day Surgery Center</option>
            <option>Polyclinic</option>
          </select>
        </Field>
        <Field label="Bed Count" description="Licensed inpatient beds">
          <TextInput defaultValue="350" />
        </Field>
      </SectionCard>
      <SectionCard title="Contact">
        <Field label="Main Phone"><TextInput placeholder="+966-11-XXXXXXX" /></Field>
        <Field label="Emergency Line"><TextInput placeholder="+966-11-XXXXXXX" /></Field>
        <Field label="Email"><TextInput placeholder="admin@cymed.sa" /></Field>
        <Field label="Address"><TextInput placeholder="Street, City" /></Field>
      </SectionCard>
    </div>
  );
}

function NotificationsTab() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-200 mb-1">Notifications</h2>
      <p className="text-slate-500 text-sm mb-6">Configure alerting thresholds and channels.</p>
      <SectionCard title="Clinical Alerts">
        <Field label="Critical Lab Values" description="Immediate nurse + physician alert"><Toggle checked /></Field>
        <Field label="NEWS2 Score ≥ 7" description="Rapid response team activation"><Toggle checked /></Field>
        <Field label="Medication Hard Stops" description="Pharmacist + prescriber alert on CDS block"><Toggle checked /></Field>
        <Field label="Bed Capacity &gt; 90%" description="Bed manager + executive notification"><Toggle checked /></Field>
      </SectionCard>
      <SectionCard title="Channels">
        <Field label="In-app notifications"><Toggle checked /></Field>
        <Field label="Email alerts"><Toggle checked /></Field>
        <Field label="SMS (for critical only)"><Toggle /></Field>
        <Field label="WhatsApp Business API"><Toggle /></Field>
        <Field label="Slack / Teams integration"><Toggle /></Field>
      </SectionCard>
    </div>
  );
}

function SecurityTab() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-200 mb-1">Security & Privacy</h2>
      <p className="text-slate-500 text-sm mb-6">HIPAA / GDPR / PDPL compliance controls and session policy.</p>
      <SectionCard title="Authentication">
        <Field label="MFA Required for All Staff"><Toggle checked /></Field>
        <Field label="MFA Required for Physicians Only"><Toggle /></Field>
        <Field label="Session Timeout (minutes)"><TextInput defaultValue="30" /></Field>
        <Field label="Single Sign-On (SAML 2.0)"><Toggle /></Field>
        <Field label="IP Allowlist Enforcement"><Toggle /></Field>
      </SectionCard>
      <SectionCard title="Data & Privacy">
        <Field label="Audit Log Retention (days)"><TextInput defaultValue="365" /></Field>
        <Field label="PHI Anonymization on Export"><Toggle checked /></Field>
        <Field label="AI Processing (requires consent)"><Toggle checked /></Field>
        <Field label="Cross-Border Data Transfer" description="Disable to enforce local data residency"><Toggle /></Field>
        <Field label="Patient Portal Access"><Toggle checked /></Field>
      </SectionCard>
      <SectionCard title="Backup & Recovery">
        <Field label="Automated Daily Backup"><Toggle checked /></Field>
        <Field label="Backup Encryption (AES-256)"><Toggle checked /></Field>
        <Field label="Retention Period (days)"><TextInput defaultValue="90" /></Field>
      </SectionCard>
    </div>
  );
}

function AppearanceTab() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-200 mb-1">Appearance</h2>
      <p className="text-slate-500 text-sm mb-6">Theme and display preferences.</p>
      <SectionCard title="Theme">
        <Field label="Color Scheme">
          <select className="bg-slate-800 border border-slate-700 text-slate-300 text-sm px-3 py-1.5 rounded-xl outline-none focus:border-orange-500">
            <option>Dark Neural (default)</option>
            <option>Dark Blue</option>
            <option>Light Clinical</option>
          </select>
        </Field>
        <Field label="Accent Color">
          <div className="flex gap-2">
            {["#E67E22","#3498DB","#2ECC71","#9B59B6","#E74C3C"].map(c => (
              <button key={c} style={{ backgroundColor: c }} className="w-7 h-7 rounded-full border-2 border-transparent hover:border-white" />
            ))}
          </div>
        </Field>
        <Field label="Default Language">
          <select className="bg-slate-800 border border-slate-700 text-slate-300 text-sm px-3 py-1.5 rounded-xl outline-none focus:border-orange-500">
            <option value="en">English</option>
            <option value="ar">العربية</option>
          </select>
        </Field>
        <Field label="Compact Sidebar"><Toggle /></Field>
        <Field label="Animations"><Toggle checked /></Field>
      </SectionCard>
    </div>
  );
}

function IntegrationsTab() {
  const integrations = [
    { name:"NPHIES (Saudi)", status:"connected", color:"text-emerald-400" },
    { name:"ZATCA Phase 2",  status:"connected", color:"text-emerald-400" },
    { name:"NHS ECS (UK)",   status:"configured", color:"text-blue-400" },
    { name:"CMS / Availity (US)", status:"configured", color:"text-blue-400" },
    { name:"HAAD (UAE)",     status:"configured", color:"text-blue-400" },
    { name:"HL7 FHIR R4",    status:"active",    color:"text-emerald-400" },
    { name:"SMS Gateway",    status:"inactive",  color:"text-slate-500" },
    { name:"Laboratory LIS", status:"connected", color:"text-emerald-400" },
    { name:"PACS / DICOM",   status:"connected", color:"text-emerald-400" },
    { name:"AI Services (Claude, Gemini)", status:"connected", color:"text-emerald-400" },
  ];
  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-200 mb-1">Integrations</h2>
      <p className="text-slate-500 text-sm mb-6">National APIs, clinical systems, and third-party connections.</p>
      <SectionCard title="Connected Systems">
        {integrations.map(i => (
          <Field key={i.name} label={i.name}>
            <div className="flex items-center gap-3">
              <span className={`text-xs font-semibold capitalize ${i.color}`}>{i.status}</span>
              <button className="text-xs text-slate-500 hover:text-slate-300 underline">Configure</button>
            </div>
          </Field>
        ))}
      </SectionCard>
    </div>
  );
}

function UsersRbacTab() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-200 mb-1">Users & RBAC</h2>
      <p className="text-slate-500 text-sm mb-6">Role-based access control policies.</p>
      <SectionCard title="Role Policies">
        {[
          ["Super Admin",      "Full system access including settings"],
          ["Doctor",           "Patient records, prescriptions, orders"],
          ["Nurse",            "Vitals, MAR, nursing notes, care plans"],
          ["Pharmacist",       "Prescription verification and dispensing"],
          ["Lab Technician",   "Lab orders and result entry"],
          ["Radiologist",      "Imaging orders and reports"],
          ["Billing Clerk",    "Invoice generation and claim submission"],
          ["Receptionist",     "Patient registration and scheduling"],
          ["Executive",        "Read-only dashboards and KPIs"],
        ].map(([role, desc]) => (
          <Field key={role} label={role} description={desc}>
            <button className="text-xs text-slate-500 hover:text-orange-400 underline">Edit Permissions</button>
          </Field>
        ))}
      </SectionCard>
      <SectionCard title="Policy Controls">
        <Field label="Enforce Least Privilege"><Toggle checked /></Field>
        <Field label="Break-glass Emergency Override"><Toggle checked /></Field>
        <Field label="Concurrent Session Limit"><TextInput defaultValue="1" /></Field>
        <Field label="Idle Lock (minutes)"><TextInput defaultValue="10" /></Field>
      </SectionCard>
    </div>
  );
}

function DataBackupTab() {
  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-200 mb-1">Data & Backup</h2>
      <p className="text-slate-500 text-sm mb-6">Storage, export, and disaster recovery configuration.</p>
      <SectionCard title="Storage">
        <Field label="Primary Database" description="PostgreSQL 16"><span className="text-emerald-400 text-sm font-medium">Healthy · 68% used</span></Field>
        <Field label="Redis Cache"><span className="text-emerald-400 text-sm font-medium">Healthy · 12% used</span></Field>
        <Field label="File Storage (DICOM, Documents)"><span className="text-slate-400 text-sm">S3-compatible · 2.1 TB</span></Field>
      </SectionCard>
      <SectionCard title="Backup Schedule">
        <Field label="Full Backup Frequency">
          <select className="bg-slate-800 border border-slate-700 text-slate-300 text-sm px-3 py-1.5 rounded-xl outline-none focus:border-orange-500">
            <option>Daily at 02:00</option>
            <option>Every 6 hours</option>
            <option>Hourly</option>
          </select>
        </Field>
        <Field label="Point-in-Time Recovery"><Toggle checked /></Field>
        <Field label="Cross-Region Replication"><Toggle /></Field>
        <Field label="Last Successful Backup"><span className="text-slate-400 text-sm">Today 02:04</span></Field>
      </SectionCard>
    </div>
  );
}
