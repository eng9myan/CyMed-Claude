"use client";

import { useState } from "react";
import { Globe, ChevronDown, Check, AlertTriangle } from "lucide-react";

export interface CountryProfile {
  code: string;
  name: string;
  currency: string;
  currency_symbol: string;
  rtl: boolean;
  billing_standard: string;
  privacy_law: string;
  icd_version: string;
  national_id_label: string;
  phone_prefix: string;
  date_format: string;
  ai_data_residency: string;
  fhir_endpoint: string | null;
}

const COUNTRIES: CountryProfile[] = [
  { code:"SA", name:"Saudi Arabia",         currency:"SAR", currency_symbol:"ر.س", rtl:true,  billing_standard:"NPHIES",     privacy_law:"PDPL",   icd_version:"ICD-11",    national_id_label:"National ID",     phone_prefix:"+966", date_format:"DD/MM/YYYY", ai_data_residency:"MENA", fhir_endpoint:"https://nphies.sa/fhir/R4" },
  { code:"JO", name:"Jordan",               currency:"JOD", currency_symbol:"د.أ", rtl:true,  billing_standard:"JFDA",       privacy_law:"Generic",icd_version:"ICD-10",    national_id_label:"National Number", phone_prefix:"+962", date_format:"DD/MM/YYYY", ai_data_residency:"MENA", fhir_endpoint:null },
  { code:"GB", name:"United Kingdom",       currency:"GBP", currency_symbol:"£",   rtl:false, billing_standard:"NHS-ECS",    privacy_law:"GDPR",   icd_version:"ICD-10",    national_id_label:"NHS Number",      phone_prefix:"+44",  date_format:"DD/MM/YYYY", ai_data_residency:"EU",   fhir_endpoint:"https://api.service.nhs.uk/personal-demographics/FHIR/R4" },
  { code:"US", name:"United States",        currency:"USD", currency_symbol:"$",   rtl:false, billing_standard:"CMS-1500",   privacy_law:"HIPAA",  icd_version:"ICD-10-CM", national_id_label:"SSN",             phone_prefix:"+1",   date_format:"MM/DD/YYYY", ai_data_residency:"US",   fhir_endpoint:"https://api.cms.gov/fhir/R4" },
  { code:"AE", name:"United Arab Emirates", currency:"AED", currency_symbol:"د.إ", rtl:true,  billing_standard:"HAAD",       privacy_law:"PDPL",   icd_version:"ICD-10",    national_id_label:"Emirates ID",     phone_prefix:"+971", date_format:"DD/MM/YYYY", ai_data_residency:"MENA", fhir_endpoint:null },
  { code:"KW", name:"Kuwait",               currency:"KWD", currency_symbol:"د.ك", rtl:true,  billing_standard:"MOH-KW",     privacy_law:"Generic",icd_version:"ICD-10",    national_id_label:"Civil ID",        phone_prefix:"+965", date_format:"DD/MM/YYYY", ai_data_residency:"MENA", fhir_endpoint:null },
  { code:"QA", name:"Qatar",                currency:"QAR", currency_symbol:"ر.ق", rtl:true,  billing_standard:"NHCPS-QA",   privacy_law:"PDPL",   icd_version:"ICD-10",    national_id_label:"Qatar ID",        phone_prefix:"+974", date_format:"DD/MM/YYYY", ai_data_residency:"MENA", fhir_endpoint:null },
  { code:"BH", name:"Bahrain",              currency:"BHD", currency_symbol:"BD",  rtl:true,  billing_standard:"Generic",    privacy_law:"Generic",icd_version:"ICD-10",    national_id_label:"CPR Number",      phone_prefix:"+973", date_format:"DD/MM/YYYY", ai_data_residency:"MENA", fhir_endpoint:null },
  { code:"OM", name:"Oman",                 currency:"OMR", currency_symbol:"ر.ع", rtl:true,  billing_standard:"Generic",    privacy_law:"Generic",icd_version:"ICD-10",    national_id_label:"National ID",     phone_prefix:"+968", date_format:"DD/MM/YYYY", ai_data_residency:"MENA", fhir_endpoint:null },
  { code:"EG", name:"Egypt",                currency:"EGP", currency_symbol:"ج.م", rtl:true,  billing_standard:"Generic",    privacy_law:"Generic",icd_version:"ICD-10",    national_id_label:"National ID",     phone_prefix:"+20",  date_format:"DD/MM/YYYY", ai_data_residency:"MENA", fhir_endpoint:null },
  { code:"LB", name:"Lebanon",              currency:"LBP", currency_symbol:"ل.ل", rtl:true,  billing_standard:"Generic",    privacy_law:"Generic",icd_version:"ICD-10",    national_id_label:"National ID",     phone_prefix:"+961", date_format:"DD/MM/YYYY", ai_data_residency:"MENA", fhir_endpoint:null },
  { code:"CA", name:"Canada",               currency:"CAD", currency_symbol:"$",   rtl:false, billing_standard:"Generic",    privacy_law:"PIPEDA", icd_version:"ICD-10-CA", national_id_label:"Health Card No.", phone_prefix:"+1",   date_format:"DD/MM/YYYY", ai_data_residency:"US",   fhir_endpoint:null },
  { code:"TR", name:"Turkey",               currency:"TRY", currency_symbol:"₺",   rtl:false, billing_standard:"Generic",    privacy_law:"KVKK",   icd_version:"ICD-10",    national_id_label:"TC Kimlik No",    phone_prefix:"+90",  date_format:"DD/MM/YYYY", ai_data_residency:"EU",   fhir_endpoint:null },
];

const BILLING_COLORS: Record<string, string> = {
  "NPHIES":   "bg-orange-500/20 text-orange-400",
  "NHS-ECS":  "bg-blue-500/20 text-blue-400",
  "CMS-1500": "bg-indigo-500/20 text-indigo-400",
  "HAAD":     "bg-teal-500/20 text-teal-400",
  "MOH-KW":   "bg-green-500/20 text-green-400",
  "NHCPS-QA": "bg-violet-500/20 text-violet-400",
  "JFDA":     "bg-amber-500/20 text-amber-400",
  "Generic":  "bg-slate-500/20 text-slate-400",
};

const PRIVACY_COLORS: Record<string, string> = {
  "HIPAA":  "bg-red-500/20 text-red-400",
  "GDPR":   "bg-blue-500/20 text-blue-400",
  "PDPL":   "bg-orange-500/20 text-orange-400",
  "PIPEDA": "bg-indigo-500/20 text-indigo-400",
  "KVKK":   "bg-purple-500/20 text-purple-400",
  "Generic":"bg-slate-500/20 text-slate-400",
};

const FLAG_EMOJIS: Record<string, string> = {
  SA:"🇸🇦", JO:"🇯🇴", GB:"🇬🇧", US:"🇺🇸", AE:"🇦🇪",
  KW:"🇰🇼", QA:"🇶🇦", BH:"🇧🇭", OM:"🇴🇲", EG:"🇪🇬",
  LB:"🇱🇧", CA:"🇨🇦", TR:"🇹🇷",
};

interface Props {
  currentCountry?: string;
  onChange?: (profile: CountryProfile) => void;
}

export function CountrySelector({ currentCountry = "SA", onChange }: Props) {
  const [selected, setSelected] = useState<string>(currentCountry);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const profile = COUNTRIES.find(c => c.code === selected) ?? COUNTRIES[0];
  const filtered = COUNTRIES.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase())
  );

  function select(c: CountryProfile) {
    setSelected(c.code);
    setOpen(false);
    setSearch("");
    onChange?.(c);
  }

  return (
    <div className="space-y-6">
      {/* Active country card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-slate-200 font-semibold flex items-center gap-2">
            <Globe className="w-4 h-4 text-orange-400" /> Deployment Country
          </h3>
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm px-3 py-1.5 rounded-xl transition"
          >
            {FLAG_EMOJIS[selected] ?? "🌐"} {profile.name}
            <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Profile detail grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            ["Currency", `${profile.currency} (${profile.currency_symbol})`],
            ["National ID", profile.national_id_label],
            ["Date Format", profile.date_format],
            ["ICD Version", profile.icd_version],
            ["Phone Prefix", profile.phone_prefix],
            ["AI Data Residency", profile.ai_data_residency],
          ].map(([label, value]) => (
            <div key={label} className="bg-slate-800/50 rounded-xl px-3 py-2.5">
              <p className="text-xs text-slate-500 mb-0.5">{label}</p>
              <p className="text-slate-300 font-medium">{value}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mt-3">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${BILLING_COLORS[profile.billing_standard] ?? BILLING_COLORS.Generic}`}>
            {profile.billing_standard}
          </span>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${PRIVACY_COLORS[profile.privacy_law] ?? PRIVACY_COLORS.Generic}`}>
            {profile.privacy_law}
          </span>
          {profile.rtl && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-violet-500/20 text-violet-400">RTL Arabic</span>
          )}
          {profile.fhir_endpoint && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400">National FHIR</span>
          )}
        </div>

        {profile.billing_standard === "Generic" && (
          <div className="mt-3 flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-amber-300 text-xs">Full national integration for {profile.name} is in roadmap. Generic billing adapter active — manual claim processing may be required.</p>
          </div>
        )}
      </div>

      {/* Country picker dropdown */}
      {open && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-3 border-b border-slate-800">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search country..."
              autoFocus
              className="w-full bg-slate-800 border border-slate-700 text-slate-300 text-sm px-3 py-2 rounded-xl outline-none focus:border-orange-500 placeholder:text-slate-600"
            />
          </div>
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/50">
            {filtered.map(c => (
              <button
                key={c.code}
                onClick={() => select(c)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-800 transition text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{FLAG_EMOJIS[c.code] ?? "🌐"}</span>
                  <div>
                    <p className="text-slate-200 text-sm font-medium">{c.name}</p>
                    <p className="text-slate-500 text-xs">{c.currency} · {c.billing_standard} · {c.privacy_law}</p>
                  </div>
                </div>
                {c.code === selected && <Check className="w-4 h-4 text-orange-400" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Full country matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-800">
          <h3 className="text-slate-300 text-sm font-semibold">All Supported Countries ({COUNTRIES.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-xs text-slate-500 uppercase tracking-wider">
                <th className="text-left px-4 py-3">Country</th>
                <th className="text-left px-4 py-3">Billing</th>
                <th className="text-left px-4 py-3">Privacy</th>
                <th className="text-left px-4 py-3">ICD</th>
                <th className="text-left px-4 py-3">Currency</th>
                <th className="text-left px-4 py-3">FHIR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {COUNTRIES.map(c => (
                <tr
                  key={c.code}
                  onClick={() => select(c)}
                  className={`hover:bg-slate-800/40 cursor-pointer transition ${c.code === selected ? "bg-orange-500/5 border-l-2 border-orange-500" : ""}`}
                >
                  <td className="px-4 py-3">
                    <span className="mr-2">{FLAG_EMOJIS[c.code] ?? "🌐"}</span>
                    <span className="text-slate-200 font-medium">{c.name}</span>
                    <span className="text-slate-500 text-xs ml-2">{c.code}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${BILLING_COLORS[c.billing_standard] ?? BILLING_COLORS.Generic}`}>
                      {c.billing_standard}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${PRIVACY_COLORS[c.privacy_law] ?? PRIVACY_COLORS.Generic}`}>
                      {c.privacy_law}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{c.icd_version}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{c.currency} {c.currency_symbol}</td>
                  <td className="px-4 py-3">
                    {c.fhir_endpoint
                      ? <span className="text-xs text-emerald-400 font-medium">Live</span>
                      : <span className="text-xs text-slate-600">—</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
