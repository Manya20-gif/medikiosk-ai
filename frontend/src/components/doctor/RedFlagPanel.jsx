import { useState } from "react";
import { ShieldAlert, ShieldCheck, ChevronDown, ChevronUp } from "lucide-react";
import RedFlagAlert from "../alerts/RedFlagAlert.jsx";

export default function RedFlagPanel({ redFlags }) {
  const [expanded, setExpanded] = useState(true);

  if (redFlags.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-success/30 bg-success-light px-4 py-3 text-sm font-semibold text-success">
        <ShieldCheck size={18} />
        No predefined red-flag symptoms detected
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-2 border-alert/40 bg-alert-light p-4">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex w-full items-center justify-between gap-2 text-left"
      >
        <span className="flex items-center gap-2 font-bold text-alert">
          <ShieldAlert size={20} />
          Possible urgent symptom{redFlags.length > 1 ? "s" : ""} — {redFlags.length} detected
        </span>
        {expanded ? <ChevronUp size={18} className="text-alert" /> : <ChevronDown size={18} className="text-alert" />}
      </button>
      <p className="mt-1 text-xs text-ink/70">
        AI-generated safety alert. Requires clinician verification. This does not confirm a diagnosis or that the
        patient is medically safe.
      </p>
      {expanded && (
        <div className="mt-3 space-y-2">
          {redFlags.map((flag) => (
            <RedFlagAlert key={flag.id} flag={flag} />
          ))}
        </div>
      )}
    </div>
  );
}
