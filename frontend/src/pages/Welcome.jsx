import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mic, Sparkles, FileText, HeartPulse, CalendarDays, LogIn, TrendingUp,
  Stethoscope, Activity, CheckCircle2, ShieldCheck, ArrowRight, Star,
  Volume2, VolumeX, Building2, UserCheck, Flame, Compass, Eye, Clock,
  ChevronRight, Award, Lock, HeartHandshake, Check
} from "lucide-react";
import { useSession } from "../context/SessionContext.jsx";
import { speak, stopSpeaking, isTtsSupported } from "../services/ttsService.js";
import { useTranslation } from "../services/translationService.js";

const HOSPITALITY_SUITES = [
  {
    id: "document-lab",
    title: "Clinical Document Lab",
    subtitle: "Dual Clinician & Patient Dossier",
    badge: "Real-Time OCR",
    badgeColor: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
    description: "Upload authentic pathology reports, prescriptions, or clinical text for instant physician-grade and empathetic plain-English translation.",
    path: "/documents-hub",
    icon: FileText,
    accent: "from-emerald-600 to-teal-700",
    stats: "Sub-second OCR & Biomarker Extraction"
  },
  {
    id: "virtual-doctor",
    title: "Virtual Doctor AI Concierge",
    subtitle: "Voice-Enabled Follow-Up Care",
    badge: "Live Voice AI",
    badgeColor: "bg-cyan-500/10 text-cyan-700 border-cyan-500/20",
    description: "Converse in real time with an expert clinical AI grounded directly on your uploaded medical metrics and longitudinal health indicators.",
    path: "/virtual-doctor",
    icon: Stethoscope,
    accent: "from-cyan-600 to-blue-700",
    stats: "12+ Indian & Global Languages"
  },
  {
    id: "health-tracker",
    title: "Health Recovery Tracker",
    subtitle: "Longitudinal Biometric Trends",
    badge: "Recovery Index",
    badgeColor: "bg-amber-500/10 text-amber-800 border-amber-500/20",
    description: "Interactive visual recovery dashboard tracking blood pressure, fasting glucose, heart rate, pain levels, and medication streaks.",
    path: "/health-tracker",
    icon: TrendingUp,
    accent: "from-amber-500 to-orange-600",
    stats: "Multi-point SVG Telemetry"
  },
  {
    id: "doctor-gateway",
    title: "Executive Doctor Directory",
    subtitle: "Specialist Consultation Appointments",
    badge: "Verified Clinicians",
    badgeColor: "bg-indigo-500/10 text-indigo-700 border-indigo-500/20",
    description: "Schedule in-person or tele-consultations with top cardiologists, internists, pediatricians, and AYUSH clinicians with zero wait time.",
    path: "/doctors",
    icon: CalendarDays,
    accent: "from-indigo-600 to-violet-700",
    stats: "Instant Booking & EMR Sync"
  }
];

export default function Welcome() {
  const navigate = useNavigate();
  const { authUser } = useSession();
  const { t, currentLang } = useTranslation();
  const [isPlayingGreeting, setIsPlayingGreeting] = useState(false);

  const handlePlayConciergeGreeting = () => {
    if (isPlayingGreeting) {
      stopSpeaking();
      setIsPlayingGreeting(false);
      return;
    }
    const welcomeText = currentLang === "hi"
      ? "मेडीकियोस्क ग्रैंड सुइट में आपका स्वागत है। वास्तविक दस्तावेज़ विश्लेषण, वॉइस परामर्श और व्यक्तिगत स्वास्थ्य ट्रैकिंग का अनुभव करें। आज हम आपकी स्वास्थ्य यात्रा में कैसे सहायता कर सकते हैं?"
      : "Welcome to the MediKiosk Grand Suite. Experience executive clinical intelligence with authentic document extraction, voice consultations, and seamless patient care. How may we assist your health journey today?";
    speak(welcomeText, currentLang, {
      onStart: () => setIsPlayingGreeting(true),
      onEnd: () => setIsPlayingGreeting(false)
    });
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
      {/* Hospitality Grand Hero Banner */}
      <div className="relative overflow-hidden rounded-[34px] border border-white/60 bg-gradient-to-br from-slate-950 via-[#0a2327] to-[#06181b] p-8 text-white shadow-2xl sm:p-12 lg:p-16">
        {/* Ambient Glowing Orbs */}
        <div className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="pointer-events-none absolute right-1/3 top-1/4 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />

        <div className="relative z-10 grid items-center gap-10 lg:grid-cols-12">
          {/* Left Column: Hero Typography & Actions */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="glow-badge-emerald">
                <Sparkles size={12} className="text-emerald-400" />
                {t("suiteName", "Grand Hospitality Clinical Suite")}
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-slate-300 backdrop-blur">
                Zero Mock Data &bull; Authentic EHR
              </span>
            </div>

            <h1 className="font-heading text-4xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl leading-[1.08]">
              {t("heroTitle", "Hospital-Grade AI. Five-Star Concierge.")}
            </h1>

            <p className="max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
              {t("heroSubtitle", "Step into an extraordinary digital healthcare lounge. Experience instantaneous laboratory extraction, strict non-medical document validation, personalized recovery indices, and interactive voice consultations with Dr. MediKiosk.")}
            </p>

            {/* Quick Action Fixtures */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                type="button"
                onClick={() => navigate("/documents-hub")}
                className="group flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-7 py-4 text-sm font-extrabold text-slate-950 shadow-[0_10px_30px_rgba(16,185,129,0.35)] transition-all duration-300 hover:scale-105 hover:shadow-[0_15px_40px_rgba(16,185,129,0.45)]"
              >
                <FileText size={18} />
                <span>{t("enterLab", "Enter Document Analysis Lab")}</span>
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </button>

              <button
                type="button"
                onClick={handlePlayConciergeGreeting}
                className="flex items-center justify-center gap-2.5 rounded-2xl border border-white/15 bg-white/10 px-5 py-4 text-sm font-bold text-white backdrop-blur-xl transition hover:bg-white/20"
              >
                {isPlayingGreeting ? (
                  <>
                    <VolumeX size={18} className="text-amber-400" />
                    <span>{t("stopGreeting", "Stop Voice Greeting")}</span>
                  </>
                ) : (
                  <>
                    <Volume2 size={18} className="text-emerald-400" />
                    <span>{t("playGreeting", "Play Concierge Greeting")}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate(authUser ? "/health-tracker" : "/auth")}
                className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-slate-900/60 px-5 py-4 text-sm font-bold text-slate-300 backdrop-blur-xl transition hover:text-white hover:bg-slate-800"
              >
                <UserCheck size={17} className="text-teal-400" />
                <span>{authUser ? `Welcome, ${authUser.name}` : "Executive Check-in"}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Live Telemetry Glass Console */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl border border-white/15 bg-white/5 p-6 backdrop-blur-2xl shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
                  </span>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-300">
                    Grand Suite Telemetry
                  </span>
                </div>
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-300">
                  SYSTEM READY
                </span>
              </div>

              {/* Status Metric Tiles */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-black/30 p-3.5">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Clinical Verification</span>
                  <p className="mt-1 font-heading text-lg font-black text-emerald-400">100% Strict Gate</p>
                  <p className="text-[10px] text-slate-400">Non-medical rejected</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/30 p-3.5">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Biomarker Triage</span>
                  <p className="mt-1 font-heading text-lg font-black text-cyan-400">Sub-second</p>
                  <p className="text-[10px] text-slate-400">Reference & deviation</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/30 p-3.5">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Specialist On-Call</span>
                  <p className="mt-1 font-heading text-lg font-black text-white">4 Available</p>
                  <p className="text-[10px] text-slate-400">Cardiology & AYUSH</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/30 p-3.5">
                  <span className="text-[10px] font-bold uppercase text-slate-400">EHR Encryption</span>
                  <p className="mt-1 font-heading text-lg font-black text-amber-300">256-Bit JWT</p>
                  <p className="text-[10px] text-slate-400">Persistent storage</p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 p-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-400" />
                  <span className="text-slate-200 font-semibold">Zero Mock Data Guarantee</span>
                </div>
                <span className="text-emerald-300 font-bold">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hospitality Bento Card Fixtures Section */}
      <div className="mt-12 space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-800">
              <Compass size={14} />
              Hospitality Suites Architecture
            </div>
            <h2 className="mt-1 font-heading text-2xl font-black text-slate-900 sm:text-3xl">
              Curated Clinical Facilities at Your Fingertips
            </h2>
          </div>
          <p className="text-xs text-muted max-w-md">
            Engineered with modular Bento fixtures, each card delivers high-precision clinical functions with fluid micro-interactions.
          </p>
        </div>

        {/* 4 Bento Suite Fixtures */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {HOSPITALITY_SUITES.map((suite) => {
            const Icon = suite.icon;
            return (
              <div
                key={suite.id}
                onClick={() => navigate(suite.path)}
                className="fixture-tile group cursor-pointer p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${suite.accent} text-white shadow-md transition-transform group-hover:scale-110`}>
                      <Icon size={24} />
                    </div>
                    <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase ${suite.badgeColor}`}>
                      {suite.badge}
                    </span>
                  </div>

                  <h3 className="mt-5 font-heading text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {suite.title}
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">
                    {suite.subtitle}
                  </p>

                  <p className="mt-3 text-xs leading-relaxed text-slate-600">
                    {suite.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-semibold text-emerald-800 text-[11px]">{suite.stats}</span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                    <ChevronRight size={16} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hospitality Feature Showcase Banner */}
      <div className="mt-12 overflow-hidden rounded-[30px] border border-white/80 bg-white/80 p-8 shadow-sm backdrop-blur-xl sm:p-10">
        <div className="grid items-center gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8 space-y-4">
            <span className="glow-badge-cyan">
              <Award size={12} className="text-cyan-600" />
              Accredited Clinical Architecture
            </span>
            <h3 className="font-heading text-2xl font-black text-slate-900 sm:text-3xl">
              Why Healthcare Leaders Choose MediKiosk Grand Suite
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
              From walk-up kiosk touchscreens to executive telemedicine, MediKiosk unites strict medical document verification with empathetic plain-language translations and verified specialist scheduling.
            </p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 pt-2">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-slate-900 block">Strict Verification Gate</span>
                  <span className="text-muted">Zero dummy data; rejects non-medical files</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-slate-900 block">Dual Clinician & Patient</span>
                  <span className="text-muted">Formal EMR and plain-English translation</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-slate-900 block">Voice AI Concierge</span>
                  <span className="text-muted">Speech input & TTS in 12+ languages</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-slate-900 to-teal-950 p-6 text-white text-center shadow-lg">
            <HeartPulse size={36} className="text-emerald-400 mb-2" />
            <h4 className="font-heading text-base font-bold">Ready to Start?</h4>
            <p className="text-xs text-slate-300 mt-1 mb-4">
              Begin your digital intake or upload your clinical test report now.
            </p>
            <button
              type="button"
              onClick={() => navigate("/language")}
              className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3 text-xs font-bold text-slate-950 shadow-md hover:scale-105 transition"
            >
              Start Touchscreen Kiosk
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
