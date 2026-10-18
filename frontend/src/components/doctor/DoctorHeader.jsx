import { Link, useNavigate } from "react-router-dom";
import { Leaf, Lock, LogOut, UserRound } from "lucide-react";

export default function DoctorHeader({ consultationStatus }) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 border-b border-white/70 bg-white/72 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-8">
        <div className="flex items-center gap-6">
          <Link to="/" className="group flex items-center gap-3">
            <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#0b655d] to-[#0f8a7d] text-white shadow-[0_10px_25px_rgba(11,101,93,.24)] transition-transform group-hover:scale-105">
              <span className="absolute inset-0 bg-white/10" />
              <Leaf size={19} strokeWidth={2.2} />
            </span>
            <span>
              <span className="block font-heading text-lg font-extrabold tracking-tight text-[#12343a]">
                Medi<span className="text-[#0f8a7d]">Kiosk</span>
              </span>
              <span className="block text-[10px] font-bold uppercase tracking-[.14em] text-[#6b7c7e]">
                Doctor Dashboard
              </span>
            </span>
          </Link>

          <span className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-[#17695f] sm:flex">
            {consultationStatus}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-1.5 rounded-full border border-emerald-900/10 bg-white/70 px-3 py-2 text-xs font-semibold text-[#416466] md:flex">
            <Lock size={13} />
            Secure session
          </span>

          <div className="flex items-center gap-2 border-l border-[#10444614] pl-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-[#0b655d]">
              <UserRound size={16} />
            </span>
            <span className="hidden text-sm font-semibold text-[#12343a] sm:block">Dr. Attending Physician</span>
          </div>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="doc-btn-ghost"
            aria-label="Log out"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
