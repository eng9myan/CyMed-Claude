"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { CyMedLogo, CyMedIcon } from "@/components/ui/CyMedLogo";

/* ── Neural Network canvas background ── */
interface Particle { x: number; y: number; vx: number; vy: number; radius: number; opacity: number; }

function NeuralCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);
  const particles = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const COUNT = 80;
    particles.current = Array.from({ length: COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      radius: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.2,
    }));

    const CYAN   = [93, 173, 226];   /* CyMed blue #5DADE2 */
    const VIOLET = [230, 126, 34];   /* CyMed orange #E67E22 */
    const TEAL   = [89, 195, 225];   /* CyMed blue-light #59c3e1 */

    const lerp = (a: number[], b: number[], t: number) =>
      a.map((v, i) => Math.round(v + (b[i] - v) * t));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const pts = particles.current;

      // Draw connections
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            const t = dist / 130;
            const [r, g, b] = lerp(CYAN, VIOLET, t);
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${r},${g},${b},${(1 - t) * 0.18})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw particles
      pts.forEach((p, idx) => {
        const c = idx % 3 === 0 ? CYAN : idx % 3 === 1 ? VIOLET : TEAL;
        ctx.beginPath();
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 3);
        gradient.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},${p.opacity})`);
        gradient.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},0)`);
        ctx.fillStyle = gradient;
        ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2);
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      });

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.6 }}
    />
  );
}

/* ── ECG line SVG ── */
function EcgLine() {
  return (
    <svg viewBox="0 0 320 50" className="w-full h-10 opacity-60" preserveAspectRatio="none">
      <polyline
        points="0,25 40,25 50,5 60,45 70,15 80,35 90,25 130,25 140,8 148,42 154,18 160,25 200,25 210,5 220,45 230,12 240,25 280,25 290,8 300,40 308,18 316,25 320,25"
        fill="none"
        stroke="oklch(0.78 0.19 200)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="animate-ecg"
        style={{ filter: "drop-shadow(0 0 4px oklch(0.78 0.19 200 / 0.7))" }}
      />
    </svg>
  );
}

/* ── AI Thinking dots ── */
function AiDots() {
  return (
    <span className="inline-flex gap-1 items-end ml-1">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-1 h-1 rounded-full bg-violet-400"
          style={{ animation: `blink 1.2s ${i * 0.2}s ease-in-out infinite` }}
        />
      ))}
    </span>
  );
}

/* ── Live stats ticker ── */
const TICKER_STATS = [
  { label: "Active Patients",    value: "12,847",  color: "oklch(0.78 0.19 200)" },
  { label: "Beds Occupied",      value: "87.3%",   color: "oklch(0.82 0.18 70)" },
  { label: "AI Decisions Today", value: "4,291",   color: "oklch(0.65 0.25 280)" },
  { label: "Claims Processed",   value: "1,038",   color: "oklch(0.73 0.19 155)" },
  { label: "Staff On Duty",      value: "2,156",   color: "oklch(0.72 0.17 180)" },
];

const ROLES = [
  { label: "Command Center", email: "admin@cymed.com",  path: "/command_center", color: "oklch(0.78 0.19 200)", icon: "⬡" },
  { label: "Clinic",         email: "admin@cymed.com",  path: "/admission",      color: "oklch(0.65 0.25 280)", icon: "🏥" },
  { label: "Laboratory",     email: "lab@cymed.com",    path: "/laboratory",     color: "oklch(0.73 0.19 155)", icon: "🧬" },
  { label: "Doctor",         email: "doctor@cymed.com", path: "/doctor",         color: "oklch(0.72 0.17 180)", icon: "👨‍⚕️" },
  { label: "Billing",        email: "staff@cymed.com",  path: "/billing",        color: "oklch(0.82 0.18 70)",  icon: "💳" },
];

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email,     setEmail]    = useState("admin@cymed.com");
  const [password,  setPassword] = useState("password123");
  const [error,     setError]    = useState("");
  const [loading,   setLoading]  = useState(false);
  const [tickerIdx, setTicker]   = useState(0);
  const [showPass,  setShowPass] = useState(false);
  const [mounted,   setMounted]  = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const id = setInterval(() => setTicker(i => (i + 1) % TICKER_STATS.length), 3000);
    return () => clearInterval(id);
  }, []);

  const handleLogin = useCallback(async (e?: React.FormEvent, roleEmail?: string, path = "/command_center") => {
    e?.preventDefault();
    const loginEmail = roleEmail ?? email;
    const usePassword = roleEmail ? "password123" : password;
    setLoading(true);
    setError("");

    const grantDemo = () => {
      const token = "demo-" + btoa(`${loginEmail}:${Date.now()}`);
      login(token, { email: loginEmail, role: "user" });
      router.push(path);
    };

    try {
      const ctrl = new AbortController();
      const timeout = setTimeout(() => ctrl.abort(), 2500);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/api/v1/auth/token/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: usePassword }),
        signal: ctrl.signal,
      });
      clearTimeout(timeout);
      if (res.ok) {
        const data = await res.json();
        login(data.access, { email: loginEmail, role: "user" });
        router.push(path);
      } else {
        setError("Invalid credentials. Please try again.");
      }
    } catch {
      // Backend unreachable — fall back to demo mode so the UI is still navigable
      grantDemo();
    } finally {
      setLoading(false);
    }
  }, [email, password, login, router]);

  const stat = TICKER_STATS[tickerIdx];

  return (
    <div className="relative min-h-screen w-full overflow-hidden" style={{ background: "oklch(0.07 0.018 250)" }}>
      {/* Animated neural background */}
      <NeuralCanvas />

      {/* Gradient meshes */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-0 w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, oklch(0.78 0.19 200 / 0.4) 0%, transparent 70%)", filter: "blur(80px)" }} />
        <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, oklch(0.65 0.25 280 / 0.5) 0%, transparent 70%)", filter: "blur(80px)" }} />
        <div className="absolute top-3/4 left-1/3 w-[400px] h-[400px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, oklch(0.72 0.17 180 / 0.4) 0%, transparent 70%)", filter: "blur(60px)" }} />
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(oklch(0.78 0.19 200 / 0.5) 1px, transparent 1px), linear-gradient(90deg, oklch(0.78 0.19 200 / 0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px"
        }} />

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex">

        {/* LEFT PANEL — Brand */}
        <div className={`hidden lg:flex w-1/2 flex-col justify-between p-16 xl:p-20 transition-all duration-700 ${mounted ? "opacity-100" : "opacity-0"}`}>
          {/* Real CyMed Logo */}
          <div className="animate-fade-right">
            <CyMedLogo variant="full" size="md" theme="dark" />
          </div>

          {/* Hero text */}
          <div className="space-y-6">
            <div className="animate-fade-up delay-100">
              <p className="text-xs font-semibold tracking-[0.25em] uppercase mb-4 w-fit px-3 py-1.5 rounded-full"
                style={{ background: "rgba(230,126,34,.12)", color: "#E67E22", border: "1px solid rgba(230,126,34,.3)" }}>
                ✦ Powered by AI
              </p>
              <h1 className="text-5xl xl:text-6xl font-bold leading-[1.05] tracking-tight">
                <span style={{ color: "oklch(0.92 0.01 240)" }}>The World's Most</span><br />
                <span style={{ background: "linear-gradient(135deg, #E67E22, #ed6c00, #5DADE2)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  Intelligent
                </span><br />
                <span style={{ color: "oklch(0.92 0.01 240)" }}>Health Platform.</span>
              </h1>
            </div>

            <p className="text-lg max-w-md animate-fade-up delay-200" style={{ color: "oklch(0.60 0.015 240)", lineHeight: 1.7 }}>
              Real-time clinical intelligence, AI-driven decisions, and unified hospital operations — engineered for MENA healthcare.
            </p>

            {/* ECG line */}
            <div className="max-w-xs animate-fade-up delay-300">
              <EcgLine />
            </div>

            {/* Live stats ticker */}
            <div className="animate-fade-up delay-400">
              <div className="glass rounded-2xl p-5 max-w-sm border border-white/10">
                <div className="flex items-center gap-2 mb-3">
                  <div className="pulse-dot cyan" />
                  <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "oklch(0.55 0.02 240)" }}>
                    Live Platform Data
                  </span>
                </div>
                <div key={tickerIdx} className="animate-fade-up">
                  <div className="text-3xl font-bold" style={{ color: stat.color }}>
                    {stat.value}
                  </div>
                  <div className="text-sm mt-1" style={{ color: "oklch(0.60 0.015 240)" }}>{stat.label}</div>
                </div>
                <div className="flex gap-1.5 mt-4">
                  {TICKER_STATS.map((_, i) => (
                    <div key={i} className="h-0.5 flex-1 rounded-full transition-all duration-500"
                      style={{ background: i === tickerIdx ? "oklch(0.78 0.19 200)" : "oklch(1 0 0 / 0.12)" }} />
                  ))}
                </div>
              </div>
            </div>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2 animate-fade-up delay-500">
              {["FHIR R4", "NPHIES", "ZATCA", "ICD-11", "AI/NLP", "HIPAA"].map(tag => (
                <span key={tag} className="text-xs px-3 py-1.5 rounded-full font-medium"
                  style={{ background: "oklch(1 0 0 / 0.05)", border: "1px solid oklch(1 0 0 / 0.1)", color: "oklch(0.70 0.015 240)" }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Bottom footer */}
          <div className="flex items-center justify-between animate-fade-up delay-600">
            <p className="text-xs" style={{ color: "oklch(0.40 0.01 240)" }}>
              © 2026 CyMed Healthcare Technology
            </p>
            <div className="flex gap-4">
              {["Privacy", "Terms", "Status"].map(l => (
                <a key={l} href="#" className="text-xs transition-colors hover:text-white"
                  style={{ color: "oklch(0.40 0.01 240)" }}>{l}</a>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL — Auth form */}
        <div className={`w-full lg:w-1/2 flex items-center justify-center p-8 transition-all duration-700 delay-200 ${mounted ? "opacity-100" : "opacity-0"}`}>
          <div className="w-full max-w-md space-y-6">

            {/* Form card */}
            <div className="glass-card p-8 animate-slide-bottom">
              {/* Header */}
              <div className="mb-8">
                <div className="flex lg:hidden items-center gap-3 mb-6">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, oklch(0.78 0.19 200 / 0.2), oklch(0.65 0.25 280 / 0.15))", border: "1px solid oklch(0.78 0.19 200 / 0.3)" }}>
                    <svg viewBox="0 0 32 32" className="w-5 h-5" fill="none">
                      <path d="M16 4 L28 10 L28 22 L16 28 L4 22 L4 10 Z" stroke="oklch(0.78 0.19 200)" strokeWidth="1.5" fill="none"/>
                      <circle cx="16" cy="16" r="3" fill="oklch(0.78 0.19 200)"/>
                    </svg>
                  </div>
                  <span className="text-lg font-bold gradient-text-ai">CyMed</span>
                </div>
                <h2 className="text-2xl font-bold mb-1" style={{ color: "oklch(0.94 0.008 240)" }}>Welcome back</h2>
                <p className="text-sm" style={{ color: "oklch(0.52 0.02 240)" }}>
                  Sign in to your clinical workspace
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-4 p-3 rounded-xl text-sm flex items-center gap-2"
                  style={{ background: "oklch(0.65 0.22 25 / 0.12)", border: "1px solid oklch(0.65 0.22 25 / 0.25)", color: "oklch(0.80 0.18 25)" }}>
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8zm8-3a.5.5 0 01.5.5v3a.5.5 0 01-1 0v-3A.5.5 0 018 5zm0 6.5a.75.75 0 110-1.5.75.75 0 010 1.5z"/>
                  </svg>
                  {error}
                </div>
              )}

              <form onSubmit={(e) => handleLogin(e, email, "/command_center")} className="space-y-4">
                {/* Email */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold tracking-wide uppercase"
                    style={{ color: "oklch(0.52 0.02 240)" }}>Email Address</label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4" style={{ color: "oklch(0.45 0.02 240)" }} viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                      </svg>
                    </div>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="clinician@hospital.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl text-sm transition-all outline-none focus:ring-1"
                      style={{
                        background: "oklch(1 0 0 / 0.04)",
                        border: "1px solid oklch(1 0 0 / 0.1)",
                        color: "oklch(0.92 0.008 240)",
                        outline: "none",
                      }}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold tracking-wide uppercase"
                      style={{ color: "oklch(0.52 0.02 240)" }}>Password</label>
                    <a href="#" className="text-xs font-medium transition-colors hover:opacity-80"
                      style={{ color: "oklch(0.72 0.17 200)" }}>Forgot password?</a>
                  </div>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4" style={{ color: "oklch(0.45 0.02 240)" }} viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••••"
                      className="w-full pl-10 pr-11 py-3 rounded-xl text-sm transition-all outline-none"
                      style={{
                        background: "oklch(1 0 0 / 0.04)",
                        border: "1px solid oklch(1 0 0 / 0.1)",
                        color: "oklch(0.92 0.008 240)",
                      }}
                    />
                    <button type="button" onClick={() => setShowPass(v => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-80"
                      style={{ color: "oklch(0.45 0.02 240)" }}>
                      {showPass
                        ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                        : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                      }
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button type="submit" disabled={loading}
                  className="w-full py-3 px-6 rounded-xl text-sm font-semibold transition-all duration-200 relative overflow-hidden group"
                  style={{
                    background: loading ? "rgba(230,126,34,.55)" : "linear-gradient(135deg, #E67E22, #d4691a)",
                    color: "#fff",
                    boxShadow: loading ? "none" : "0 0 28px -4px rgba(230,126,34,.5), 0 4px 12px -2px rgba(0,0,0,.4)",
                  }}>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: "linear-gradient(135deg, #ed6c00, #c0581a)" }} />
                  <span className="relative flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        Authenticating
                        <AiDots />
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd"/>
                        </svg>
                        Sign In to Workspace
                      </>
                    )}
                  </span>
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full" style={{ borderTop: "1px solid oklch(1 0 0 / 0.08)" }} />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 text-xs font-medium tracking-wider uppercase"
                    style={{ background: "oklch(0.13 0.018 248)", color: "oklch(0.40 0.015 240)" }}>
                    Quick Role Access
                  </span>
                </div>
              </div>

              {/* Role quick-access */}
              <div className="grid grid-cols-5 gap-2">
                {ROLES.map(role => (
                  <button key={role.label}
                    onClick={() => handleLogin(undefined, role.email, role.path)}
                    disabled={loading}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl text-center transition-all duration-200 group"
                    style={{ background: "oklch(1 0 0 / 0.03)", border: "1px solid oklch(1 0 0 / 0.07)" }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLButtonElement).style.background = `${role.color.replace("oklch(", "oklch(").replace(")", " / 0.1)")}`;
                      (e.currentTarget as HTMLButtonElement).style.borderColor = `${role.color.replace("oklch(", "oklch(").replace(")", " / 0.3)")}`;
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.background = "oklch(1 0 0 / 0.03)";
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "oklch(1 0 0 / 0.07)";
                    }}>
                    <span className="text-base group-hover:scale-110 transition-transform">{role.icon}</span>
                    <span className="text-[10px] font-semibold leading-tight"
                      style={{ color: "oklch(0.55 0.02 240)" }}>{role.label}</span>
                  </button>
                ))}
              </div>

              {/* Compliance footer */}
              <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
                {["HIPAA", "NPHIES", "ISO 27001", "FHIR R4"].map(badge => (
                  <span key={badge} className="text-[10px] font-medium px-2 py-1 rounded-md"
                    style={{ background: "oklch(1 0 0 / 0.04)", color: "oklch(0.42 0.015 240)", border: "1px solid oklch(1 0 0 / 0.06)" }}>
                    ✓ {badge}
                  </span>
                ))}
              </div>
            </div>

            {/* AI note */}
            <div className="ai-panel p-4 flex items-start gap-3 animate-fade-up delay-600">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: "oklch(0.65 0.25 280 / 0.2)", border: "1px solid oklch(0.65 0.25 280 / 0.3)" }}>
                <svg className="w-4 h-4" style={{ color: "oklch(0.78 0.22 280)" }} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/>
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold mb-0.5" style={{ color: "oklch(0.78 0.22 280)" }}>
                  CyMed AI is active
                </p>
                <p className="text-xs leading-relaxed" style={{ color: "oklch(0.52 0.02 240)" }}>
                  Clinical decisions, documentation, and drug interactions are being processed by the neural engine.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
