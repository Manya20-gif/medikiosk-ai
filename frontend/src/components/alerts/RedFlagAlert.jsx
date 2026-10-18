import { AlertTriangle, ShieldAlert } from "lucide-react";
import { AI_SAFETY_DISCLAIMER } from "../../services/redFlagService.js";

const severityStyles = {
  High: {
    wrap: "border-alert/40 bg-alert-light",
    badge: "bg-alert text-white",
    icon: "text-alert",
  },
  Moderate: {
    wrap: "border-accent/40 bg-accent-light",
    badge: "bg-accent text-white",
    icon: "text-accent-dark",
  },
};

/**
 * Renders one detected symptom pattern. Never names a condition or
 * diagnosis — only the reported symptom, why it was flagged, and a
 * recommendation to have a clinician look at it. See redFlagService.js.
 */
export default function RedFlagAlert({ flag }) {
  const style = severityStyles[flag.severity] ?? severityStyles.Moderate;

  return (
    <div className={`rounded-kiosk border-2 p-4 ${style.wrap}`}>
      <div className="flex items-start gap-3">
        <span className={`mt-0.5 shrink-0 ${style.icon}`}>
          <AlertTriangle size={22} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-bold text-ink">Possible urgent symptom detected</p>
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${style.badge}`}>
              {flag.severity} priority
            </span>
          </div>
          <p className="mt-1.5 text-sm text-ink">
            <span className="font-semibold">{flag.symptom}.</span> {flag.reason}
          </p>
          <p className="mt-1.5 text-sm font-semibold text-ink">{flag.recommendation}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1.5 border-t border-ink/10 pt-2.5 text-xs text-muted">
        <ShieldAlert size={13} />
        {AI_SAFETY_DISCLAIMER}
      </div>
    </div>
  );
}
