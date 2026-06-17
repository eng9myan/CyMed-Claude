import Link from 'next/link';
import { COUNTRIES } from '@/lib/setup/countries';

export const metadata = { title: 'CyMed Setup — Choose Your Country' };

export default function SetupHome() {
  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-6xl mx-auto py-12">

        <div className="mb-12">
          <div className="text-xs uppercase tracking-wider font-bold mb-3 text-orange-400">
            Step 1 of 8 — Country & Region
          </div>
          <h1 className="text-4xl font-extrabold mb-3">Where will you operate CyMed?</h1>
          <p className="text-slate-400 max-w-2xl">
            Pick your country and we&apos;ll pre-load the entire regulatory stack — chart of accounts, tax codes,
            social security rules, e-invoicing platform, and medical insurance integrations. You only enter credentials.
          </p>
        </div>

        {/* Progress bar */}
        <div className="bg-slate-900 rounded-full h-2 mb-12 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 h-full" style={{ width: '12.5%' }} />
        </div>

        {/* Region groups */}
        {[
          { label: 'Gulf Cooperation Council (GCC)', codes: ['SA', 'AE', 'BH', 'KW', 'QA', 'OM'] },
          { label: 'Middle East & North Africa',     codes: ['JO', 'EG'] },
          { label: 'Europe',                          codes: ['GB', 'FR', 'DE', 'IT', 'ES', 'NL'] },
          { label: 'Americas',                        codes: ['US', 'CA', 'BR'] },
          { label: 'Asia-Pacific',                    codes: ['IN', 'AU', 'SG'] },
        ].map((region) => (
          <div key={region.label} className="mb-10">
            <h2 className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-4">{region.label}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {region.codes.map((iso) => {
                const c = COUNTRIES.find(x => x.iso2 === iso);
                if (!c) return null;
                return (
                  <Link key={iso} href={`/setup/${iso.toLowerCase()}`} className="bg-slate-900 border border-slate-800 hover:border-orange-500 rounded-xl p-4 flex items-center gap-3 transition-all hover:-translate-y-0.5">
                    <span className="text-3xl">{c.flag}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold truncate">{c.name}</div>
                      <div className="text-xs text-slate-400">{c.currency.code} · {c.taxRegime.split(' ')[0]} · {c.integrations.length} integrations</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        <div className="mt-10 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="text-3xl">🌍</div>
            <div className="flex-1">
              <h3 className="font-bold mb-1">Don&apos;t see your country?</h3>
              <p className="text-sm text-slate-400 mb-3">
                CyMed supports 220+ country localizations from the base layer. Tell us your country and we&apos;ll activate the bundle in your tenant within 24 hours.
              </p>
              <a href="mailto:setup@cy-com.com" className="inline-block text-orange-400 hover:underline text-sm font-bold">
                Request your country →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
