import { useNavigate } from "react-router-dom";
import { Hammer, ArrowLeft } from "lucide-react";

/**
 * Used for every journey step that hasn't been built yet.
 * Each phase replaces the matching route in App.jsx with a real page —
 * this file itself does not change between phases.
 */
export default function PlaceholderPage({ title, phase }) {
  const navigate = useNavigate();

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-light text-primary">
        <Hammer size={26} />
      </span>
      <h1 className="mt-5 text-2xl font-bold text-ink">{title}</h1>
      <p className="mt-2 max-w-sm text-muted">
        This screen is built in <span className="font-semibold">Phase {phase}</span> of
        the MediKiosk roadmap. It isn't part of the app yet.
      </p>
      <button type="button" onClick={() => navigate("/")} className="kiosk-btn-secondary mt-8">
        <ArrowLeft size={18} />
        Back to start
      </button>
    </div>
  );
}
