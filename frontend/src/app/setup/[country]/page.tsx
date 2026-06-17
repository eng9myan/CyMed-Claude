import Link from 'next/link';
import { notFound } from 'next/navigation';
import { COUNTRIES, getCountry } from '@/lib/setup/countries';

export async function generateStaticParams() {
  return COUNTRIES.map(c => ({ country: c.iso2.toLowerCase() }));
}

export async function generateMetadata({ params }: { params: Promise<{ country: string }> }) {
  const { country } = await params;
  const c = getCountry(country);
  return { title: c ? `CyMed Setup — ${c.name}` : 'CyMed Setup' };
}

const CATEGORY_META: Record<string, { label: string; color: string; icon: string }> = {
  'einvoice':         { label: 'E-Invoicing',        color: '#E67E22', icon: '🧾' },
  'tax':              { label: 'Tax Authority',      color: '#F59E0B', icon: '💰' },
  'social-security':  { label: 'Social Security',    color: '#3B82F6', icon: '👥' },
  'medical-insurance':{ label: 'Medical Insurance',  color: '#10B981', icon: '🏥' },
  'procurement':      { label: 'Procurement',        color: '#8B5CF6', icon: '🛒' },
  'banking':          { label: 'Banking',            color: '#06B6D4', icon: '🏦' },
  'health-info':      { label: 'Health Info Exchange',color:'#EC4899', icon: '📡' },
};

const STATUS_BADGES: Record<string, { label: string; bg: string; fg: string }> = {
  'pre-built':    { label: 'PRE-BUILT',     bg: '#10B98122', fg: '#10B981' },
  'oauth-ready':  { label: 'OAUTH READY',   bg: '#3B82F622', fg: '#3B82F6' },
  'coming-soon':  { label: 'COMING SOON',   bg: '#94A3B822', fg: '#94A3B8' },
};

export default async function CountrySetupPage({ params }: { params: Promise<{ country: string }> }) {
  const { country } = await params;
  const c = getCountry(country);
  if (!c) notFound();

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-6xl mx-auto py-12">

        <Link href="/setup" className="text-sm text-slate-400 hover:text-white mb-6 inline-flex items-center gap-2">
          ← Change country
        </Link>

        <div className="mb-10">
          <div className="text-xs uppercase tracking-wider font-bold mb-3 text-orange-400">
            Step 2 of 8 — {c.name} Regulatory Bundle
          </div>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-6xl">{c.flag}</span>
            <div>
              <h1 className="text-4xl font-extrabold">{c.name}</h1>
              <p className="text-slate-400 mt-1">{c.currency.name} ({c.currency.code} {c.currency.symbol}) · {c.language.toUpperCase()} · {c.taxRegime}</p>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="bg-slate-900 rounded-full h-2 mb-10 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 h-full" style={{ width: '25%' }} />
        </div>

        {/* Pre-loaded configuration summary */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-5">Pre-loaded for {c.name} (no setup required)</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-5">
              <div className="text-xs uppercase tracking-wider font-bold text-emerald-400 mb-2">✓ Chart of Accounts</div>
              <div className="font-semibold">{c.chartOfAccounts}</div>
              <div className="text-xs text-slate-400 mt-1">Full COA template with 200+ accounts pre-categorized</div>
            </div>
            <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-5">
              <div className="text-xs uppercase tracking-wider font-bold text-emerald-400 mb-2">✓ Tax Regime</div>
              <div className="font-semibold">{c.taxRegime}</div>
              <div className="text-xs text-slate-400 mt-1">Tax codes, rates, return forms pre-configured</div>
            </div>
            <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-5">
              <div className="text-xs uppercase tracking-wider font-bold text-emerald-400 mb-2">✓ Working Week & Calendar</div>
              <div className="font-semibold">{c.workingWeek.join(' · ')}</div>
              <div className="text-xs text-slate-400 mt-1">Fiscal year starts {c.fiscalYearStart} · {c.publicHolidaysSource}</div>
            </div>
            {c.socialSecuritySystem && (
              <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-5">
                <div className="text-xs uppercase tracking-wider font-bold text-emerald-400 mb-2">✓ Social Security</div>
                <div className="font-semibold">{c.socialSecuritySystem.name}</div>
                <div className="text-xs text-slate-400 mt-1">
                  Employer {c.socialSecuritySystem.employerRate} · Employee {c.socialSecuritySystem.employeeRate}
                  {c.socialSecuritySystem.ceiling && ` · ceiling ${c.socialSecuritySystem.ceiling}`}
                </div>
              </div>
            )}
            {c.endOfServiceRule && (
              <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-5">
                <div className="text-xs uppercase tracking-wider font-bold text-emerald-400 mb-2">✓ End of Service / Severance</div>
                <div className="font-semibold">{c.endOfServiceRule}</div>
                <div className="text-xs text-slate-400 mt-1">Auto-calculated per termination type</div>
              </div>
            )}
            <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-5">
              <div className="text-xs uppercase tracking-wider font-bold text-emerald-400 mb-2">✓ Localization Pack</div>
              <div className="font-semibold">Forms, reports, invoices in {c.language.toUpperCase()}</div>
              <div className="text-xs text-slate-400 mt-1">Date formats, number formats, RTL/LTR auto-applied</div>
            </div>
          </div>
        </div>

        {/* Integrations needing credentials */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-2">{c.name} integrations ready to activate</h2>
          <p className="text-slate-400 mb-6 text-sm">
            Pre-built code. You just paste credentials → connect → live in minutes.
          </p>

          {c.integrations.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">
              <div className="text-4xl mb-3">🚧</div>
              <h3 className="font-bold mb-2">Country-specific integrations coming soon</h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto">
                {c.name} integrations are in active development. Your CyMed instance still works fully —
                you can use generic accounting, manual e-invoice export, and standard payroll meanwhile.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {c.integrations.map((i) => {
                const cat = CATEGORY_META[i.category];
                const status = STATUS_BADGES[i.status];
                return (
                  <Link key={i.id} href={`/setup/${c.iso2.toLowerCase()}/integration/${i.id}`}
                        className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 transition-all hover:-translate-y-0.5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style={{ backgroundColor: `${cat.color}22` }}>
                          {cat.icon}
                        </div>
                        <div>
                          <div className="text-xs uppercase font-bold tracking-wider" style={{ color: cat.color }}>{cat.label}</div>
                          <div className="font-bold text-base mt-0.5">{i.name}</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider"
                            style={{ backgroundColor: status.bg, color: status.fg }}>
                        {status.label}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed mb-3">{i.description}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">{i.fields.length} fields · {i.setupTime}</span>
                      <span className="text-orange-400 font-bold">Connect →</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-800 pt-6">
          <Link href="/setup" className="text-slate-400 hover:text-white text-sm">
            ← Back to country picker
          </Link>
          <Link href={`/setup/${c.iso2.toLowerCase()}/modules`} className="px-6 py-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm">
            Continue to module setup →
          </Link>
        </div>
      </div>
    </div>
  );
}
