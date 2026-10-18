import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Leaf, ShieldCheck, Activity, Mic, Sparkles, FileText,
  TrendingUp, Stethoscope, Globe, Check, LogIn, LogOut,
  User, CalendarDays, ChevronDown
} from "lucide-react";
import { useSession } from "../../context/SessionContext.jsx";
import { SUPPORTED_LANGUAGES, useTranslation } from "../../services/translationService.js";
import AuraVoiceAssistant from "../voice/AuraVoiceAssistant.jsx";

export default function KioskHeader() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { authUser, setAuthUser } = useSession();
  const { t, currentLang, setLanguageCode } = useTranslation();

  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const selectedLanguage = SUPPORTED_LANGUAGES.find((l) => l.code === currentLang) || SUPPORTED_LANGUAGES[0];

  const navLinks = [
    { to: "/documents-hub", label: t("navDocuments", "Document Lab"), icon: FileText, badge: "Dual AI" },
    { to: "/health-tracker", label: t("navTracker", "Health Tracker"), icon: TrendingUp, badge: "Vitals" },
    { to: "/virtual-doctor", label: t("navVirtualDoctor", "Virtual Doctor"), icon: Stethoscope, badge: "Live AI" },
    { to: "/doctors", label: t("navDoctors", "Specialists"), icon: CalendarDays }
  ];

  const handleLogout = () => {
    localStorage.removeItem("medikiosk-auth-token");
    setAuthUser(null);
    setIsUserMenuOpen(false);
    navigate("/");
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/60 bg-white/80 backdrop-blur-2xl shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          {/* Logo & Hospitality Badge */}
          <Link to="/" className="group flex items-center gap-3">
            <span className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#0b655d] to-[#0f8a7d] text-white shadow-[0_10px_25px_rgba(11,101,93,.24)] transition-transform group-hover:scale-105">
              <span className="absolute inset-0 bg-white/10" />
              <Leaf size={22} strokeWidth={2} />
            </span>
            <span>
              <span className="block font-heading text-lg font-black tracking-tight text-[#12343a] sm:text-xl">
                Medi<span className="text-[#0f8a7d]">Kiosk</span>
              </span>
              <span className="hidden text-[10px] font-bold uppercase tracking-[.14em] text-[#6b7c7e] sm:block">
                {t("suiteName", "Grand Hospitality Suite")}
              </span>
            </span>
          </Link>

          {/* Luxury Fixture Nav Items */}
          <nav className="hidden items-center gap-1.5 md:flex">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`group relative flex items-center gap-2 rounded-2xl px-3.5 py-2 text-xs font-bold transition-all ${
                    isActive
                      ? "bg-slate-900 text-white shadow-md"
                      : "text-slate-700 hover:bg-emerald-50/80 hover:text-emerald-900"
                  }`}
                >
                  <Icon size={15} className={isActive ? "text-emerald-400" : "text-[#0f8a7d]"} />
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className={`rounded-md px-1.5 py-0.2 text-[9px] font-extrabold uppercase ${
                      isActive ? "bg-emerald-500/20 text-emerald-300" : "bg-emerald-100 text-emerald-800"
                    }`}>
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Controls: Multilingual, Voice Concierge, User Profile / Check-in */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Multilingual Selector Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="flex items-center gap-1.5 rounded-2xl border border-emerald-900/10 bg-white/80 px-3 py-2 text-xs font-bold text-ink shadow-sm transition hover:border-emerald-600/30 hover:bg-slate-50"
              >
                <span className="text-sm">{selectedLanguage.flag}</span>
                <span className="hidden sm:inline">{selectedLanguage.native}</span>
              </button>

              {isLangMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-3xl border border-white/80 bg-white p-2 shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in duration-150">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted">
                    {t("chooseLanguage", "Choose Language")}
                  </div>
                  <div className="mt-1 max-h-60 overflow-y-auto space-y-0.5">
                    {SUPPORTED_LANGUAGES.map((l) => (
                      <button
                        key={l.code}
                        type="button"
                        onClick={() => {
                          setLanguageCode(l.code);
                          setIsLangMenuOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs font-semibold transition ${
                          currentLang === l.code
                            ? "bg-emerald-50 text-emerald-900 font-bold"
                            : "text-ink hover:bg-slate-50"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{l.flag}</span>
                          <span>{l.native}</span>
                          <span className="text-[11px] text-muted">({l.name})</span>
                        </span>
                        {currentLang === l.code && <Check size={14} className="text-emerald-600" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Aura Voice Assistant Quick Launcher */}
            <button
              type="button"
              onClick={() => setIsVoiceOpen(true)}
              className="relative flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
              </span>
              <Mic size={15} />
              <span className="hidden sm:inline">{t("voiceConcierge", "Voice Concierge")}</span>
            </button>

            {/* User Session Badge / Executive Check-In */}
            {authUser ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-50/80 px-3 py-1.5 text-xs font-bold text-emerald-950 transition hover:bg-emerald-100"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-600 text-[11px] font-black text-white">
                    {authUser.name?.slice(0, 2).toUpperCase() || "PT"}
                  </span>
                  <span className="hidden sm:inline font-bold truncate max-w-[100px]">{authUser.name}</span>
                  <ChevronDown size={14} className="text-emerald-800" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-3xl border border-white/80 bg-white p-2 shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in duration-150">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="font-heading text-xs font-black text-slate-900 truncate">{authUser.name}</p>
                      <p className="text-[10px] text-muted truncate">{authUser.email}</p>
                      <span className="mt-1 inline-block rounded bg-emerald-100 px-1.5 py-0.2 text-[9px] font-bold text-emerald-800">
                        {authUser.role || "PATIENT"} EHR Profile
                      </span>
                    </div>

                    <div className="mt-1 space-y-0.5">
                      <Link
                        to="/documents-hub"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <FileText size={14} className="text-teal-600" />
                        <span>{t("myRecords", "My Clinical Records")}</span>
                      </Link>
                      <Link
                        to="/health-tracker"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <TrendingUp size={14} className="text-emerald-600" />
                        <span>{t("navTracker", "Health Tracker")}</span>
                      </Link>
                      {authUser.role === "DOCTOR" && (
                        <Link
                          to="/doctor"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <Stethoscope size={14} className="text-indigo-600" />
                          <span>Doctor EMR Console</span>
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                      >
                        <LogOut size={14} />
                        <span>{t("signOut", "Sign Out")}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/auth"
                className="flex items-center gap-1.5 rounded-2xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800 hover:scale-105"
              >
                <LogIn size={14} />
                <span className="hidden sm:inline">{t("executiveCheckIn", "Executive Check-in")}</span>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Sub-Nav */}
        <div className="flex border-t border-border/40 px-4 py-2 overflow-x-auto md:hidden gap-1.5 text-xs">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 font-bold ${
                  isActive ? "bg-slate-900 text-white" : "text-slate-700 bg-white/70"
                }`}
              >
                <Icon size={13} className={isActive ? "text-emerald-400" : "text-[#0f8a7d]"} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </header>

      {/* Aura Voice Assistant Modal */}
      <AuraVoiceAssistant isOpen={isVoiceOpen} onClose={() => setIsVoiceOpen(false)} />
    </>
  );
}
