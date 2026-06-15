"use client";

import { useState, useEffect } from "react";
import {
  Shield, ShieldCheck, ShieldOff, ShieldAlert,
  User, Building2, FlaskConical, Pill, Radio,
  Clock, Infinity, Plus, Trash2, Eye, Lock,
  AlertTriangle, CheckCircle2, XCircle, ChevronDown,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────
interface ConsentGrant {
  id: string;
  granted_to_name: string;
  granted_to_type: string;
  scopes: string[];
  purpose: string;
  status: "active" | "revoked" | "expired" | "pending";
  valid_from: string;
  valid_until: string | null;
  is_emergency: boolean;
}

interface BreakGlassEvent {
  id: string;
  accessed_by_name: string;
  justification: string;
  access_start: string;
  scopes_accessed: string[];
  reviewed: boolean;
}

// ── Constants ─────────────────────────────────────────────────────────────────
const SCOPE_LABELS: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  demographics:   { label: "Demographics",    icon: <User className="w-3.5 h-3.5" />,         color: "#5DADE2" },
  medications:    { label: "Medications",     icon: <Pill className="w-3.5 h-3.5" />,         color: "#E67E22" },
  laboratory:     { label: "Lab Results",     icon: <FlaskConical className="w-3.5 h-3.5" />, color: "#2ECC71" },
  imaging:        { label: "Imaging",         icon: <Radio className="w-3.5 h-3.5" />,        color: "#9B59B6" },
  clinical_notes: { label: "Clinical Notes",  icon: <Eye className="w-3.5 h-3.5" />,          color: "#E74C3C" },
  diagnoses:      { label: "Diagnoses",       icon: <AlertTriangle className="w-3.5 h-3.5" />,color: "#F39C12" },
  procedures:     { label: "Procedures",      icon: <Shield className="w-3.5 h-3.5" />,       color: "#1ABC9C" },
  billing:        { label: "Billing",         icon: <Building2 className="w-3.5 h-3.5" />,    color: "#95A5A6" },
  full_record:    { label: "Full Record",     icon: <ShieldCheck className="w-3.5 h-3.5" />,  color: "#E67E22" },
};

const MOCK_GRANTS: ConsentGrant[] = [
  { id: "1", granted_to_name: "Dr. Ahmed Al-Rashidi", granted_to_type: "provider", scopes: ["demographics","medications","clinical_notes","diagnoses"], purpose: "treatment", status: "active", valid_from: "2026-01-15", valid_until: null, is_emergency: false },
  { id: "2", granted_to_name: "King Fahd Hospital — Cardiology", granted_to_type: "department", scopes: ["full_record"], purpose: "treatment", status: "active", valid_from: "2026-03-01", valid_until: "2026-09-01", is_emergency: false },
  { id: "3", granted_to_name: "Saudi Health Insurance Co.", granted_to_type: "insurance", scopes: ["demographics","diagnoses","procedures","billing"], purpose: "payment", status: "active", valid_from: "2026-01-01", valid_until: "2026-12-31", is_emergency: false },
  { id: "4", granted_to_name: "National Cancer Registry", granted_to_type: "organization", scopes: ["diagnoses","laboratory","imaging"], purpose: "public_health", status: "revoked", valid_from: "2025-06-01", valid_until: "2026-06-01", is_emergency: false },
];

const MOCK_BREAK_GLASS: BreakGlassEvent[] = [
  { id: "bg1", accessed_by_name: "Dr. Nora Al-Otaibi (ER)", justification: "unconscious", access_start: "2026-05-22T03:14:00Z", scopes_accessed: ["full_record"], reviewed: true },
];

// ── Sub-components ────────────────────────────────────────────────────────────
function ScopePill({ scope }: { scope: string }) {
  const meta = SCOPE_LABELS[scope];
  if (!meta) return <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/50">{scope}</span>;
  return (
    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium"
      style={{ background: `${meta.color}18`, color: meta.color, border: `1px solid ${meta.color}30` }}>
      {meta.icon}
      {meta.label}
    </span>
  );
}

function StatusBadge({ status }: { status: ConsentGrant["status"] }) {
  const map = {
    active:   { icon: <CheckCircle2 className="w-3 h-3" />, label: "Active",   color: "#2ECC71" },
    revoked:  { icon: <XCircle      className="w-3 h-3" />, label: "Revoked",  color: "#E74C3C" },
    expired:  { icon: <Clock        className="w-3 h-3" />, label: "Expired",  color: "#95A5A6" },
    pending:  { icon: <Clock        className="w-3 h-3" />, label: "Pending",  color: "#F39C12" },
  };
  const m = map[status];
  return (
    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold"
      style={{ background: `${m.color}18`, color: m.color, border: `1px solid ${m.color}30` }}>
      {m.icon} {m.label}
    </span>
  );
}

function GranteeIcon({ type }: { type: string }) {
  const iconMap: Record<string, React.ReactNode> = {
    provider:       <User className="w-4 h-4" />,
    facility:       <Building2 className="w-4 h-4" />,
    department:     <Building2 className="w-4 h-4" />,
    organization:   <Building2 className="w-4 h-4" />,
    lab:            <FlaskConical className="w-4 h-4" />,
    pharmacy:       <Pill className="w-4 h-4" />,
    imaging:        <Radio className="w-4 h-4" />,
    insurance:      <Shield className="w-4 h-4" />,
    researcher:     <Eye className="w-4 h-4" />,
    representative: <User className="w-4 h-4" />,
  };
  return <>{iconMap[type] ?? <User className="w-4 h-4" />}</>;
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ConsentPage() {
  const [grants, setGrants]         = useState<ConsentGrant[]>(MOCK_GRANTS);
  const [tab, setTab]               = useState<"active" | "all" | "break_glass">("active");
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [revokeReason, setRevokeReason] = useState("");
  const [showNewGrant, setShowNewGrant] = useState(false);

  const shown = tab === "active"
    ? grants.filter(g => g.status === "active")
    : tab === "all" ? grants
    : [];

  function handleRevoke(id: string) {
    if (!revokeReason.trim()) return;
    setGrants(gs => gs.map(g => g.id === id ? { ...g, status: "revoked" } : g));
    setRevokingId(null);
    setRevokeReason("");
  }

  return (
    <main className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5" style={{ color: "#E67E22" }} />
            <h1 className="text-xl font-bold text-white">My Health Data Consent</h1>
          </div>
          <p className="text-sm" style={{ color: "rgba(255,255,255,.45)" }}>
            You control who can access your health records. Review and manage all access permissions.
          </p>
        </div>
        <button
          onClick={() => setShowNewGrant(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
          style={{ background: "linear-gradient(135deg,#E67E22,#d4691a)", color: "#fff" }}>
          <Plus className="w-4 h-4" />
          Grant Access
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Active Grants", value: grants.filter(g => g.status === "active").length, color: "#2ECC71", icon: <ShieldCheck className="w-4 h-4" /> },
          { label: "Revoked",       value: grants.filter(g => g.status === "revoked").length, color: "#E74C3C", icon: <ShieldOff className="w-4 h-4" /> },
          { label: "Emergency Access", value: MOCK_BREAK_GLASS.length, color: "#F39C12", icon: <ShieldAlert className="w-4 h-4" /> },
          { label: "Pending Review",   value: 0, color: "#5DADE2", icon: <Clock className="w-4 h-4" /> },
        ].map(s => (
          <div key={s.label} className="glass-card p-4 rounded-xl"
            style={{ borderTop: `2px solid ${s.color}40` }}>
            <div className="flex items-center justify-between mb-1">
              <span style={{ color: s.color }}>{s.icon}</span>
              <span className="text-2xl font-bold text-white">{s.value}</span>
            </div>
            <div className="text-[11px]" style={{ color: "rgba(255,255,255,.40)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.06)" }}>
        {(["active","all","break_glass"] as const).map(t => (
          <button key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
            style={tab === t
              ? { background: "rgba(230,126,34,.15)", color: "#E67E22", border: "1px solid rgba(230,126,34,.3)" }
              : { color: "rgba(255,255,255,.4)" }}>
            {t === "active" ? "Active Consents" : t === "all" ? "All Consents" : "Emergency Access Log"}
          </button>
        ))}
      </div>

      {/* Grants list */}
      {tab !== "break_glass" && (
        <div className="space-y-3">
          {shown.length === 0 && (
            <div className="text-center py-12 text-sm" style={{ color: "rgba(255,255,255,.3)" }}>
              <Lock className="w-8 h-8 mx-auto mb-3 opacity-30" />
              No {tab === "active" ? "active " : ""}consent grants found.
            </div>
          )}
          {shown.map(grant => (
            <div key={grant.id} className="glass-card rounded-2xl p-5 space-y-3"
              style={{ opacity: grant.status !== "active" ? 0.6 : 1 }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(93,173,226,.12)", color: "#5DADE2" }}>
                    <GranteeIcon type={grant.granted_to_type} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{grant.granted_to_name}</div>
                    <div className="text-[11px] capitalize" style={{ color: "rgba(255,255,255,.4)" }}>
                      {grant.granted_to_type} · {grant.purpose}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <StatusBadge status={grant.status} />
                  {grant.status === "active" && (
                    <button
                      onClick={() => setRevokingId(grant.id)}
                      className="text-[11px] px-2 py-1 rounded-lg transition-all hover:bg-red-500/10"
                      style={{ color: "#E74C3C" }}>
                      Revoke
                    </button>
                  )}
                </div>
              </div>

              {/* Scopes */}
              <div className="flex flex-wrap gap-1.5">
                {grant.scopes.map(s => <ScopePill key={s} scope={s} />)}
              </div>

              {/* Validity */}
              <div className="flex items-center gap-2 text-[11px]" style={{ color: "rgba(255,255,255,.35)" }}>
                <Clock className="w-3 h-3" />
                Granted {new Date(grant.valid_from).toLocaleDateString("en-SA")}
                {grant.valid_until ? (
                  <> · Expires {new Date(grant.valid_until).toLocaleDateString("en-SA")}</>
                ) : (
                  <span className="inline-flex items-center gap-0.5"><Infinity className="w-3 h-3" /> Permanent</span>
                )}
              </div>

              {/* Revoke confirm */}
              {revokingId === grant.id && (
                <div className="mt-2 p-3 rounded-xl space-y-2"
                  style={{ background: "rgba(231,76,60,.08)", border: "1px solid rgba(231,76,60,.2)" }}>
                  <p className="text-xs font-medium" style={{ color: "#E74C3C" }}>
                    Confirm revocation — this will immediately remove {grant.granted_to_name}'s access.
                  </p>
                  <input
                    value={revokeReason}
                    onChange={e => setRevokeReason(e.target.value)}
                    placeholder="Reason for revoking (required)"
                    className="w-full px-3 py-2 rounded-lg text-xs outline-none"
                    style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", color: "#fff" }}
                  />
                  <div className="flex gap-2">
                    <button onClick={() => handleRevoke(grant.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                      style={{ background: "#E74C3C", color: "#fff" }}>
                      Confirm Revoke
                    </button>
                    <button onClick={() => { setRevokingId(null); setRevokeReason(""); }}
                      className="px-3 py-1.5 rounded-lg text-xs"
                      style={{ color: "rgba(255,255,255,.5)" }}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Break-glass log */}
      {tab === "break_glass" && (
        <div className="space-y-3">
          {MOCK_BREAK_GLASS.length === 0 && (
            <div className="text-center py-12 text-sm" style={{ color: "rgba(255,255,255,.3)" }}>
              <ShieldAlert className="w-8 h-8 mx-auto mb-3 opacity-30" />
              No emergency access events on record.
            </div>
          )}
          {MOCK_BREAK_GLASS.map(ev => (
            <div key={ev.id} className="glass-card rounded-2xl p-5"
              style={{ borderLeft: "3px solid #F39C12" }}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldAlert className="w-4 h-4" style={{ color: "#F39C12" }} />
                    <span className="text-sm font-semibold text-white">Emergency Access</span>
                    {ev.reviewed && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full"
                        style={{ background: "rgba(46,204,113,.12)", color: "#2ECC71", border: "1px solid rgba(46,204,113,.25)" }}>
                        Reviewed
                      </span>
                    )}
                  </div>
                  <div className="text-xs" style={{ color: "rgba(255,255,255,.5)" }}>
                    {ev.accessed_by_name} · {new Date(ev.access_start).toLocaleString("en-SA")}
                  </div>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {ev.scopes_accessed.map(s => <ScopePill key={s} scope={s} />)}
              </div>
              <div className="mt-2 text-[11px] px-3 py-2 rounded-lg"
                style={{ background: "rgba(243,156,18,.06)", color: "rgba(255,255,255,.5)" }}>
                Justification: <span className="font-medium text-white/70">{ev.justification}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Patient rights notice */}
      <div className="glass-card rounded-2xl p-5 flex gap-4"
        style={{ borderLeft: "3px solid #5DADE2" }}>
        <ShieldCheck className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#5DADE2" }} />
        <div>
          <div className="text-sm font-semibold text-white mb-1">Your Data Rights</div>
          <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,.45)" }}>
            Under Saudi PDPL and your rights as a CyMed patient, you may revoke any access at any time.
            Emergency access is automatically logged and you will be notified within 24 hours.
            You have the right to request a full audit of who accessed your records.
          </p>
        </div>
      </div>
    </main>
  );
}
