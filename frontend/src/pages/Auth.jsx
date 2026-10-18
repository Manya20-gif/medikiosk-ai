import { useState } from "react";
import {
  LogIn, UserPlus, ShieldCheck, Sparkles, Lock, Mail, User,
  Phone, ArrowRight, Building2, HeartPulse, CheckCircle2, Stethoscope,
  Eye, EyeOff, Award
} from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { login, register } from "../services/api.js";
import { useSession } from "../context/SessionContext.jsx";

export default function Auth() {
  const nav = useNavigate();
  const loc = useLocation();
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { setAuthUser } = useSession();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const data = mode === "login"
        ? await login(form.email, form.password)
        : await register(form);
      setAuthUser(data.user);
      const destination = data.user.role === "DOCTOR"
        ? "/doctor"
        : (loc.state?.from || "/documents-hub");
      nav(destination, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const update = (key) => (e) => setForm((current) => ({ ...current, [key]: e.target.value }));

  // Quick autofill for instant evaluation
  const handleAutofillDemo = () => {
    setForm({
      name: "Vikram Malhotra",
      email: "vikram.malhotra@medikiosk.care",
      password: "password123",
      phone: "+91 98765 43210"
    });
    setError("");
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-4 py-8 sm:px-6 lg:py-14">
      {/* Split Executive Hospitality Lounge Console */}
      <div className="grid w-full overflow-hidden rounded-[34px] border border-white/70 bg-white/80 shadow-2xl backdrop-blur-2xl lg:grid-cols-12">

        {/* LEFT WING: Luxury Medical Lounge Ambience & Amenities (Cols: 6) */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-[#0a2327] to-[#081f23] p-8 text-white sm:p-12 lg:col-span-6 flex flex-col justify-between">
          {/* Ambient Lighting Orbs */}
          <div className="pointer-events-none absolute -left-20 -top-20 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl" />

          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-2">
              <span className="glow-badge-emerald">
                <Sparkles size={12} className="text-emerald-400" />
                Executive Patient Concierge
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-bold text-slate-300">
                256-Bit SSL
              </span>
            </div>

            <div>
              <h2 className="font-heading text-3xl font-black text-white sm:text-4xl leading-tight">
                Welcome to the
                <br />
                <span className="hospitality-gradient-dark-text">
                  MediKiosk Grand Suite.
                </span>
              </h2>
              <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
                Your authenticated account links your verified clinical laboratory reports, biomarker recovery trends, and physician consultations directly to your permanent digital health vault.
              </p>
            </div>

            {/* 3 Executive Hospitality Amenities */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                  <ShieldCheck size={20} />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-white block">Persistent EHR Memory</span>
                  <span className="text-slate-400">Every analyzed report and logged vital is preserved securely.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400">
                  <Stethoscope size={20} />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-white block">Virtual Doctor History</span>
                  <span className="text-slate-400">AI consultations reference your previous records and metrics.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
                  <HeartPulse size={20} />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-white block">Longitudinal Recovery Index</span>
                  <span className="text-slate-400">Multi-point tracking of BP, sugar, HR, and medication streak.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Demo Autofill Helper */}
          <div className="relative z-10 mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
            <span className="text-slate-400">Testing the kiosk?</span>
            <button
              type="button"
              onClick={handleAutofillDemo}
              className="font-bold text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1"
            >
              <Sparkles size={12} /> Auto-fill Sample Credentials
            </button>
          </div>
        </div>

        {/* RIGHT WING: Interactive Glass Fixture Authentication Console (Cols: 6) */}
        <div className="p-8 sm:p-12 lg:col-span-6 flex flex-col justify-between bg-white/90">
          <div>
            {/* Mode Switcher Tabs */}
            <div className="flex rounded-2xl bg-slate-100 p-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => { setMode("login"); setError(""); }}
                className={`flex-1 rounded-xl py-2.5 transition ${
                  mode === "login"
                    ? "bg-slate-900 text-white shadow-md"
                    : "text-muted hover:text-ink"
                }`}
              >
                Sign In to Account
              </button>
              <button
                type="button"
                onClick={() => { setMode("register"); setError(""); }}
                className={`flex-1 rounded-xl py-2.5 transition ${
                  mode === "register"
                    ? "bg-emerald-600 text-white shadow-md"
                    : "text-muted hover:text-ink"
                }`}
              >
                Create Patient Account
              </button>
            </div>

            <div className="mt-6">
              <h3 className="font-heading text-2xl font-black text-slate-900">
                {mode === "login" ? "Executive Check-in" : "New Patient Registration"}
              </h3>
              <p className="mt-1 text-xs text-muted">
                {mode === "login"
                  ? "Access your verified clinical documents and longitudinal health data."
                  : "Register your patient identity for instant EHR binding and verified consultations."}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={submit} className="mt-6 space-y-4">
              {mode !== "login" && (
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                    Full Legal Name
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-3.5 text-muted" />
                    <input
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 py-3 pl-10 pr-4 text-xs font-semibold text-ink placeholder:text-muted/60 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="e.g. Vikram Malhotra"
                      value={form.name}
                      onChange={update("name")}
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-3.5 text-muted" />
                  <input
                    type="email"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 py-3 pl-10 pr-4 text-xs font-semibold text-ink placeholder:text-muted/60 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="patient@example.com"
                    value={form.email}
                    onChange={update("email")}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-3.5 text-muted" />
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 py-3 pl-10 pr-10 text-xs font-semibold text-ink placeholder:text-muted/60 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="At least 6 characters"
                    value={form.password}
                    onChange={update("password")}
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-muted hover:text-ink"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {mode !== "login" && (
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                    Contact Phone (Optional)
                  </label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3.5 top-3.5 text-muted" />
                    <input
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 py-3 pl-10 pr-4 text-xs font-semibold text-ink placeholder:text-muted/60 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      placeholder="+91 98765 43210"
                      value={form.phone}
                      onChange={update("phone")}
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="rounded-2xl border border-red-300 bg-red-50 p-3 text-xs font-bold text-red-800 animate-in fade-in">
                  {error}
                </div>
              )}

              <button
                disabled={busy}
                type="submit"
                className={`w-full rounded-2xl py-3.5 text-xs font-bold text-white shadow-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                  mode === "login"
                    ? "bg-slate-900 hover:bg-slate-800"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {busy ? (
                  <span>Authenticating…</span>
                ) : mode === "login" ? (
                  <>
                    <LogIn size={16} />
                    <span>Confirm Executive Check-in</span>
                  </>
                ) : (
                  <>
                    <UserPlus size={16} />
                    <span>Create EHR Profile</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Bottom Guest Shortcut & Back */}
          <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <Link
              to="/documents-hub"
              className="text-muted hover:text-emerald-700 font-semibold"
            >
              &larr; Continue as Guest
            </Link>

            <button
              type="button"
              onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
              className="font-bold text-emerald-800 hover:underline"
            >
              {mode === "login" ? "Need an account? Register" : "Already registered? Sign in"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
