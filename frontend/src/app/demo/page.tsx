import Link from 'next/link';
import { ALL_PERSONAS } from '@/lib/demo/personas';

export const metadata = { title: 'CyMed Demo Catalog (internal)' };

/**
 * Internal demo index — lists all 5 persona experiences.
 * In production this should be access-controlled or hidden.
 * Prospects only ever receive their persona's direct URL.
 */
export default function DemoIndex() {
  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-5xl mx-auto py-12">
        <div className="text-center mb-12">
          <div className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider mb-4 border border-amber-500/40">
            Internal — Sales Catalog
          </div>
          <h1 className="text-4xl font-extrabold mb-3">CyMed Persona Demos</h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Five vertical-tailored demo experiences. Send each prospect ONLY the link for their vertical — they never see the others exist.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {ALL_PERSONAS.map((p) => (
            <Link key={p.id} href={`/demo/${p.id}`} className="group bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all hover:-translate-y-1"
                  style={{ borderTop: `3px solid ${p.accentColor}` }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center font-extrabold text-white"
                     style={{ backgroundColor: p.accentColor }}>+</div>
                <div>
                  <div className="font-bold">{p.label}</div>
                  <div className="text-xs text-slate-400">{p.tagline}</div>
                </div>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                {p.heroSubhead.slice(0, 110)}...
              </p>
              <div className="space-y-1 mb-4">
                <div className="text-xs text-slate-400">Modules shown: <span className="text-white font-medium">{p.allowedModules.length}</span></div>
                <div className="text-xs text-slate-400">Tour steps: <span className="text-white font-medium">{p.tourSteps.length}</span></div>
                <div className="text-xs text-slate-400">Recommended: <span className="text-white font-medium">{p.recommendedPlan}</span></div>
              </div>
              <div className="text-sm font-semibold transition-colors group-hover:underline"
                   style={{ color: p.accentColor }}>
                Open landing page →
              </div>
              <div className="mt-3 pt-3 border-t border-slate-800 text-xs text-slate-500 font-mono">
                cymed.cy-com.com/demo/{p.id}
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="font-bold mb-3">How to use these in sales</h2>
          <ol className="space-y-2 text-sm text-slate-300 list-decimal list-inside">
            <li><strong>Identify the prospect&apos;s vertical</strong> from your CRM or discovery call.</li>
            <li><strong>Send them the matching URL</strong> — e.g. for a clinic owner, send <code className="bg-slate-800 px-2 py-0.5 rounded text-xs">cymed.cy-com.com/demo/clinic</code></li>
            <li><strong>They land on a personalized page</strong> — hero, features, pricing, testimonial all tailored to them.</li>
            <li><strong>They click &quot;Start Interactive Demo&quot;</strong> → workspace opens with only their modules visible.</li>
            <li><strong>Optional:</strong> they trigger the 5-step guided tour for a self-serve walkthrough.</li>
            <li><strong>They book a meeting</strong> via the sales@cy-com.com link.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
