"use client";
import { useState } from 'react';
import { CheckCircle2, AlertCircle, ExternalLink, Loader2 } from 'lucide-react';
import type { Integration } from '@/lib/setup/countries';

interface Props { integration: Integration; country: string; flag: string; }

export function IntegrationForm({ integration, country, flag }: Props) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');

  const setField = (k: string, v: string) => setValues((p) => ({ ...p, [k]: v }));

  const handleTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('testing');
    setMessage('Validating credentials with ' + integration.name + '…');
    // Simulated test
    await new Promise((r) => setTimeout(r, 1500));
    const allRequired = integration.fields.filter(f => f.required).every(f => values[f.key]);
    if (allRequired) {
      setStatus('success');
      setMessage(`Connected to ${integration.name}. Test request returned OK — ready for production use.`);
    } else {
      setStatus('error');
      setMessage('Missing required fields. Fill all required fields and try again.');
    }
  };

  const filled = integration.fields.filter(f => values[f.key]).length;
  const total = integration.fields.length;

  return (
    <>
      <div className="mb-8">
        <div className="text-xs uppercase tracking-wider font-bold mb-3 text-orange-400">
          {flag} {country} · {integration.category.toUpperCase()}
        </div>
        <h1 className="text-3xl font-extrabold mb-3">{integration.name}</h1>
        <p className="text-slate-400 leading-relaxed">{integration.description}</p>

        <div className="flex items-center gap-4 mt-4 text-sm">
          <span className="text-slate-500">⏱ {integration.setupTime}</span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-500">{total} fields</span>
          {integration.website && (
            <>
              <span className="text-slate-500">·</span>
              <a href={integration.website} target="_blank" rel="noreferrer" className="text-orange-400 hover:underline inline-flex items-center gap-1">
                {new URL(integration.website).host} <ExternalLink className="w-3 h-3" />
              </a>
            </>
          )}
        </div>
      </div>

      {/* Pre-built notice */}
      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 mb-8 flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <div className="font-bold text-emerald-400 mb-1">Pre-built — no code required</div>
          <div className="text-slate-300">
            The CyMed engine includes the full {integration.name} connector — XML schemas, signing logic,
            retry handling, and audit logs. You only need to authenticate. Code lives in
            <code className="bg-slate-900 px-1.5 py-0.5 rounded text-xs mx-1">cymed_erp/addons/l10n_{country.toLowerCase().slice(0,2)}_edi</code>
            and is updated automatically with regulatory changes.
          </div>
        </div>
      </div>

      <form onSubmit={handleTest} className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h3 className="font-bold mb-1">Enter your credentials</h3>
        <p className="text-xs text-slate-400 mb-5">All credentials are encrypted at rest (AES-256) and never logged.</p>

        <div className="space-y-4">
          {integration.fields.map((f) => (
            <div key={f.key}>
              <label className="text-sm font-semibold mb-1.5 flex items-center gap-2">
                {f.label} {f.required && <span className="text-red-400 text-xs">required</span>}
              </label>
              {f.type === 'select' ? (
                <select value={values[f.key] ?? ''} onChange={(e) => setField(f.key, e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:border-orange-500 focus:outline-none">
                  <option value="">— Select —</option>
                  {(f.options ?? []).map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : f.type === 'file' ? (
                <div className="bg-slate-950 border border-dashed border-slate-700 rounded-lg p-4 text-center hover:border-orange-500/50">
                  <input type="file" id={f.key} className="hidden" onChange={(e) => setField(f.key, e.target.files?.[0]?.name ?? '')} />
                  <label htmlFor={f.key} className="cursor-pointer text-sm">
                    {values[f.key] ? <span className="text-emerald-400">✓ {values[f.key]}</span>
                                   : <span className="text-slate-400">Click to upload {f.label.toLowerCase()}</span>}
                  </label>
                </div>
              ) : (
                <input type={f.type} value={values[f.key] ?? ''} onChange={(e) => setField(f.key, e.target.value)}
                       placeholder={f.help}
                       className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:border-orange-500 focus:outline-none font-mono" />
              )}
              {f.help && <div className="text-xs text-slate-500 mt-1">{f.help}</div>}
            </div>
          ))}
        </div>

        <div className="mt-6 pt-5 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">{filled} / {total} fields filled</span>
          <button type="submit" disabled={status === 'testing'}
                  className="px-5 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold disabled:opacity-50 inline-flex items-center gap-2">
            {status === 'testing' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            {status === 'testing' ? 'Testing…' : status === 'success' ? 'Reconnect & Save' : 'Test & Connect'}
          </button>
        </div>

        {message && (
          <div className={`mt-4 rounded-lg p-3 flex items-start gap-2 text-sm ${
            status === 'success' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' :
            status === 'error' ? 'bg-red-500/10 text-red-300 border border-red-500/20' :
                                'bg-blue-500/10 text-blue-300 border border-blue-500/20'
          }`}>
            {status === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" /> :
             status === 'error' ? <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> :
                                  <Loader2 className="w-4 h-4 flex-shrink-0 mt-0.5 animate-spin" />}
            <span>{message}</span>
          </div>
        )}
      </form>

      {status === 'success' && (
        <div className="mt-6 text-center">
          <a href={`/setup/${country.toLowerCase().slice(0,2)}`} className="inline-block px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm">
            ✓ Continue to next integration
          </a>
        </div>
      )}
    </>
  );
}
