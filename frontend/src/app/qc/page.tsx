"use client";
import { useState } from 'react';
import Link from 'next/link';
import { ALL_PERSONAS, allowedModulesFor } from '@/lib/demo/personas';
import { CheckCircle2, AlertCircle, Loader2, ExternalLink } from 'lucide-react';

interface CheckResult { url: string; status: number | 'pending' | 'error'; ms?: number; }

export default function QCPage() {
  const [results, setResults] = useState<Record<string, CheckResult>>({});
  const [running, setRunning] = useState(false);

  const allUrls = ALL_PERSONAS.flatMap(p => [
    `/demo/${p.id}`,
    `/demo/${p.id}/workspace`,
    ...allowedModulesFor(p).map(m => `/demo/${p.id}/workspace/${m}`),
  ]);
  const setupUrls = ['/setup', '/setup/sa', '/setup/jo', '/setup/ae', '/setup/sa/integration/nupco', '/setup/sa/integration/zatca', '/setup/jo/integration/jofotara'];
  const otherUrls = ['/', '/demo'];
  const allChecks = [...otherUrls, ...allUrls, ...setupUrls];

  const runAll = async () => {
    setRunning(true);
    setResults({});
    for (const url of allChecks) {
      const start = performance.now();
      try {
        const res = await fetch(url, { method: 'GET' });
        setResults((r) => ({ ...r, [url]: { url, status: res.status, ms: Math.round(performance.now() - start) } }));
      } catch {
        setResults((r) => ({ ...r, [url]: { url, status: 'error', ms: Math.round(performance.now() - start) } }));
      }
    }
    setRunning(false);
  };

  const passed = Object.values(results).filter(r => r.status === 200).length;
  const failed = Object.values(results).filter(r => r.status !== 200 && r.status !== 'pending').length;
  const totalChecked = passed + failed;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-6xl mx-auto py-12">
        <div className="text-xs uppercase tracking-wider font-bold mb-3 text-orange-400">
          INTERNAL — QC VERIFICATION
        </div>
        <h1 className="text-4xl font-extrabold mb-3">CyMed System Health Check</h1>
        <p className="text-slate-400 mb-8 max-w-2xl">
          Click <b>Run Full Verification</b> to hit every demo URL, every setup route, and every persona × module
          combination. This catches broken pages before your client clicks them.
        </p>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-bold">{allChecks.length} URLs to verify</div>
              <div className="text-xs text-slate-400 mt-1">
                Landing · 5 persona landings + workspaces + {ALL_PERSONAS.reduce((s, p) => s + allowedModulesFor(p).length, 0)} modules · Setup wizard · 3 integration forms
              </div>
            </div>
            <button onClick={runAll} disabled={running}
                    className="px-5 py-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold disabled:opacity-50 inline-flex items-center gap-2">
              {running ? <Loader2 className="w-4 h-4 animate-spin"/> : <CheckCircle2 className="w-4 h-4"/>}
              {running ? 'Verifying…' : 'Run Full Verification'}
            </button>
          </div>

          {totalChecked > 0 && (
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-emerald-400">{passed}</div>
                <div className="text-xs text-slate-400">Passed (200 OK)</div>
              </div>
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-red-400">{failed}</div>
                <div className="text-xs text-slate-400">Failed</div>
              </div>
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-white">{Math.round((passed / totalChecked) * 100)}%</div>
                <div className="text-xs text-slate-400">Pass Rate</div>
              </div>
            </div>
          )}
        </div>

        {/* Per-persona quick-launch */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {ALL_PERSONAS.map((p) => (
            <Link key={p.id} href={`/demo/${p.id}`}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 group"
                  style={{ borderLeft: `3px solid ${p.accentColor}` }}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold">{p.label}</span>
                <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-white"/>
              </div>
              <div className="text-xs text-slate-400 mb-2">{allowedModulesFor(p).length} modules</div>
              <div className="text-xs text-slate-500 truncate font-mono">/demo/{p.id}</div>
            </Link>
          ))}
        </div>

        {/* Detailed results */}
        {totalChecked > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 font-bold">Detailed Results</div>
            <div className="max-h-96 overflow-y-auto">
              {Object.values(results).map((r) => (
                <div key={r.url} className="px-4 py-2 flex items-center justify-between border-b border-slate-800/50 text-sm">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {r.status === 200 ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0"/>
                                       : <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0"/>}
                    <a href={r.url} target="_blank" rel="noreferrer" className="text-slate-300 hover:text-white truncate font-mono text-xs">{r.url}</a>
                  </div>
                  <div className="flex items-center gap-3 text-xs flex-shrink-0">
                    <span className="text-slate-500">{r.ms}ms</span>
                    <span className={`font-bold ${r.status === 200 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {r.status === 'error' ? 'ERR' : r.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
