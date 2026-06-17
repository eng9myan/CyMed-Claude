import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPersona, type PersonaId } from '@/lib/demo/personas';

export async function generateStaticParams() {
  return [
    { persona: 'hospital' },
    { persona: 'clinic' },
    { persona: 'pharmacy' },
    { persona: 'lab' },
    { persona: 'radiology' },
  ];
}

export async function generateMetadata({ params }: { params: Promise<{ persona: string }> }) {
  const { persona: id } = await params;
  const persona = getPersona(id);
  if (!persona) return { title: 'CyMed' };
  return {
    title: `CyMed for ${persona.label} — ${persona.tagline}`,
    description: persona.heroSubhead,
  };
}

export default async function DemoLandingPage({ params }: { params: Promise<{ persona: string }> }) {
  const { persona: id } = await params;
  const persona = getPersona(id);
  if (!persona) notFound();

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/70 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href={`/demo/${persona.id}`} className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center font-extrabold text-white text-xl"
                 style={{ backgroundColor: persona.accentColor }}>+</div>
            <div>
              <div className="font-bold text-white">CyMed</div>
              <div className="text-[10px] uppercase tracking-wider" style={{ color: persona.accentColor }}>for {persona.label}</div>
            </div>
          </Link>
          <div className="flex gap-3">
            <Link href={`/demo/${persona.id}/workspace`} className="text-sm font-medium text-white px-5 py-2 rounded-lg transition-all hover:scale-105"
                  style={{ backgroundColor: persona.accentColor }}>
              Try Demo →
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className={`bg-gradient-to-br ${persona.heroBgClass} px-6 py-20 relative overflow-hidden`}>
        <div className="max-w-7xl mx-auto relative">
          <div className="max-w-3xl">
            <div className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6"
                 style={{ backgroundColor: `${persona.accentColor}22`, color: persona.accentColor, border: `1px solid ${persona.accentColor}44` }}>
              {persona.audience}
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight tracking-tight">
              {persona.heroHeadline}
            </h1>
            <p className="text-xl text-slate-300 leading-relaxed mb-10 max-w-2xl">
              {persona.heroSubhead}
            </p>
            <div className="flex gap-4 mb-12 flex-wrap">
              <Link href={`/demo/${persona.id}/workspace`} className="px-7 py-4 rounded-xl text-white font-bold text-base transition-all hover:scale-105"
                    style={{ backgroundColor: persona.accentColor, boxShadow: `0 10px 30px ${persona.accentColor}44` }}>
                Start Interactive Demo →
              </Link>
              {persona.id === 'hospital' && (
                <Link href={`/demo/${persona.id}/journey`} className="px-7 py-4 rounded-xl text-white font-bold text-base transition-all hover:scale-105 bg-gradient-to-r from-amber-500 to-orange-500">
                  🩺 Patient Journey Walkthrough
                </Link>
              )}
              <Link href="#features" className="px-7 py-4 rounded-xl font-bold text-base bg-white/5 hover:bg-white/10 border border-white/20 transition-all">
                See Features
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl">
              {persona.heroStats.map((s) => (
                <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <div className="text-2xl font-bold" style={{ color: persona.accentColor }}>{s.value}</div>
                  <div className="text-xs text-slate-400 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pain points */}
      <section className="px-6 py-16 bg-slate-900/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-sm uppercase font-bold tracking-wider mb-3" style={{ color: persona.accentColor }}>
            Sound familiar?
          </div>
          <h2 className="text-3xl font-bold mb-10">If you run a {persona.label.toLowerCase()}, you've probably faced:</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {persona.painPoints.map((p) => (
              <div key={p} className="flex items-start gap-3 bg-slate-900 border border-slate-800 rounded-xl p-5">
                <span className="text-red-400 text-xl leading-none mt-0.5">✕</span>
                <span className="text-slate-300">{p}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-sm uppercase font-bold tracking-wider mb-3" style={{ color: persona.accentColor }}>
              The platform
            </div>
            <h2 className="text-4xl font-extrabold mb-3">Everything a {persona.label.toLowerCase()} needs</h2>
            <p className="text-slate-400">Native. Unified. No integrations to maintain.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {persona.features.map((f) => (
              <div key={f.title} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all hover:-translate-y-1">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="px-6 py-20 bg-gradient-to-r from-slate-900 to-slate-800">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-6xl mb-6 opacity-40" style={{ color: persona.accentColor }}>"</div>
          <p className="text-2xl md:text-3xl font-light leading-relaxed mb-8 italic">
            {persona.testimonial.quote}
          </p>
          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white"
                 style={{ backgroundColor: persona.accentColor }}>
              {persona.testimonial.author.split(' ').slice(-1)[0][0]}
            </div>
            <div className="text-left">
              <div className="font-bold">{persona.testimonial.author}</div>
              <div className="text-sm text-slate-400">{persona.testimonial.role} · {persona.testimonial.org}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-900 border-2 rounded-3xl p-10 text-center"
               style={{ borderColor: persona.accentColor }}>
            <div className="text-sm uppercase font-bold tracking-wider mb-3" style={{ color: persona.accentColor }}>
              Recommended for {persona.label}s
            </div>
            <h3 className="text-3xl font-extrabold mb-3">CyMed {persona.recommendedPlan}</h3>
            <div className="text-4xl font-bold mb-2" style={{ color: persona.accentColor }}>
              {persona.priceFrom}
            </div>
            <p className="text-slate-400 mb-8">{persona.audienceDescription}</p>
            <Link href={`/demo/${persona.id}/workspace`} className="inline-block px-8 py-4 rounded-xl text-white font-bold text-lg transition-all hover:scale-105"
                  style={{ backgroundColor: persona.accentColor, boxShadow: `0 10px 30px ${persona.accentColor}44` }}>
              Start the Demo →
            </Link>
            <div className="text-xs text-slate-500 mt-4">No credit card. No sign-up. Click and explore.</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-10 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded flex items-center justify-center font-bold text-white text-xs"
                 style={{ backgroundColor: persona.accentColor }}>+</div>
            <span>© 2026 CyMed Healthcare Systems</span>
          </div>
          <div className="flex gap-6">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/security-policy">Security</Link>
            <a href="mailto:sales@cy-com.com">Contact Sales</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
