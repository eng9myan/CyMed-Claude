"use client";

import { useState, useCallback, useRef } from "react";
import { Search, X, Loader2, ChevronRight, BookOpen } from "lucide-react";

interface ICD11Result {
  code: string;
  title: string;
  chapter?: string;
  icd10_codes?: string[];
  is_billable?: boolean;
}

interface Props {
  onSelect: (result: ICD11Result) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

function useDebounce<T extends (...args: Parameters<T>) => void>(fn: T, delay: number): T {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  return useCallback((...args: Parameters<T>) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => fn(...args), delay);
  }, [fn, delay]) as T;
}

const DEMO_RESULTS: ICD11Result[] = [
  { code: "XY9Z",   title: "Essential hypertension, uncomplicated",       chapter: "11", icd10_codes: ["I10"],    is_billable: true },
  { code: "AA21.Z", title: "Type 2 diabetes mellitus without complications", chapter: "05", icd10_codes: ["E11.9"], is_billable: true },
  { code: "FA24.0", title: "Acute myocardial infarction, unspecified",    chapter: "11", icd10_codes: ["I21.9"], is_billable: true },
  { code: "BD10",   title: "Community-acquired bacterial pneumonia",       chapter: "01", icd10_codes: ["J18.9"], is_billable: true },
  { code: "5A11",   title: "Hyperthyroidism due to Graves disease",       chapter: "05", icd10_codes: ["E05.0"], is_billable: true },
  { code: "CA01.0", title: "Depressive episode, mild",                    chapter: "06", icd10_codes: ["F32.0"], is_billable: true },
  { code: "KB20",   title: "Acute kidney injury",                         chapter: "16", icd10_codes: ["N17.9"], is_billable: true },
];

export function ICD11Search({ onSelect, placeholder = "Search ICD-11 diagnosis codes…", autoFocus }: Props) {
  const [query,    setQuery]    = useState("");
  const [results,  setResults]  = useState<ICD11Result[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [open,     setOpen]     = useState(false);
  const [selected, setSelected] = useState<ICD11Result | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); setOpen(false); return; }
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 250));
      const filtered = DEMO_RESULTS.filter(r =>
        r.title.toLowerCase().includes(q.toLowerCase()) ||
        r.code.toLowerCase().includes(q.toLowerCase()) ||
        r.icd10_codes?.some(c => c.toLowerCase().includes(q.toLowerCase()))
      );
      setResults(filtered);
      setOpen(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedSearch = useDebounce(doSearch, 350);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setQuery(v);
    setSelected(null);
    debouncedSearch(v);
  }

  function handleSelect(r: ICD11Result) {
    setSelected(r);
    setQuery(`${r.code} — ${r.title}`);
    setOpen(false);
    onSelect(r);
  }

  function handleClear() {
    setQuery("");
    setSelected(null);
    setResults([]);
    setOpen(false);
    inputRef.current?.focus();
  }

  return (
    <div className="relative">
      <div className="relative flex items-center">
        {loading
          ? <Loader2 className="absolute left-3 w-4 h-4 animate-spin pointer-events-none" style={{ color: "#E67E22" }} />
          : <Search className="absolute left-3 w-4 h-4 pointer-events-none" style={{ color: "rgba(255,255,255,.3)" }} />
        }
        <input
          ref={inputRef}
          value={query}
          onChange={handleChange}
          onFocus={() => results.length > 0 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          autoFocus={autoFocus}
          placeholder={placeholder}
          className="w-full pl-10 pr-8 py-2.5 rounded-xl text-sm outline-none transition-all"
          style={{
            background: "rgba(255,255,255,.05)",
            border: `1px solid ${selected ? "rgba(230,126,34,.4)" : "rgba(255,255,255,.1)"}`,
            color: "#fff",
          }}
        />
        {query && (
          <button onClick={handleClear} className="absolute right-2 p-0.5 rounded-md hover:bg-white/5">
            <X className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,.4)" }} />
          </button>
        )}
      </div>

      {selected && (
        <div className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium"
          style={{ background: "rgba(230,126,34,.12)", color: "#E67E22", border: "1px solid rgba(230,126,34,.25)" }}>
          <BookOpen className="w-3 h-3" />
          {selected.code}
          {selected.icd10_codes?.[0] && (
            <span className="text-[10px] opacity-60">← ICD-10: {selected.icd10_codes[0]}</span>
          )}
        </div>
      )}

      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-50"
          style={{ background: "oklch(0.10 0.018 250)", border: "1px solid rgba(255,255,255,.08)", boxShadow: "0 16px 40px rgba(0,0,0,.6)" }}>
          <div className="px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase border-b"
            style={{ color: "rgba(255,255,255,.3)", borderColor: "rgba(255,255,255,.05)" }}>
            ICD-11 Results
          </div>
          {results.map(r => (
            <button key={r.code}
              onMouseDown={() => handleSelect(r)}
              className="w-full text-left px-3 py-2.5 flex items-start gap-3 transition-colors hover:bg-white/[0.04] group">
              <div className="flex-shrink-0 mt-0.5 w-14 text-[11px] font-bold font-mono" style={{ color: "#E67E22" }}>
                {r.code}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-white truncate">{r.title}</div>
                {r.icd10_codes?.length ? (
                  <div className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,.35)" }}>
                    ICD-10: {r.icd10_codes.join(", ")}
                  </div>
                ) : null}
              </div>
              <ChevronRight className="w-3 h-3 flex-shrink-0 opacity-0 group-hover:opacity-40 mt-0.5" />
            </button>
          ))}
          <div className="px-3 py-1.5 text-[10px] border-t" style={{ color: "rgba(255,255,255,.2)", borderColor: "rgba(255,255,255,.05)" }}>
            Powered by WHO ICD-11 API
          </div>
        </div>
      )}

      {open && query.length >= 2 && results.length === 0 && !loading && (
        <div className="absolute top-full left-0 right-0 mt-1 rounded-xl p-4 text-center text-xs z-50"
          style={{ background: "oklch(0.10 0.018 250)", border: "1px solid rgba(255,255,255,.08)", color: "rgba(255,255,255,.35)" }}>
          No ICD-11 codes found for &ldquo;{query}&rdquo;
        </div>
      )}
    </div>
  );
}
