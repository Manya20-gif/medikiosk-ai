import { useState } from "react";
import { Pill, FlaskConical, FileText, File, Stethoscope, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import RedFlagAlert from "../alerts/RedFlagAlert.jsx";

const iconMap = {
  prescription: Pill,
  lab_report: FlaskConical,
  discharge_summary: FileText,
  other: File,
  current_visit: Stethoscope,
};

export default function TimelineItem({ event, isLast }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = iconMap[event.type] ?? File;
  const hasRedFlags = event.redFlags && event.redFlags.length > 0;

  return (
    <li className="relative pl-12">
      {!isLast && (
        <span className="absolute left-[19px] top-10 h-full w-px bg-border" aria-hidden="true" />
      )}
      <span
        className={`absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full ${
          hasRedFlags ? "bg-alert-light text-alert" : "bg-primary-light text-primary"
        }`}
      >
        <Icon size={19} />
      </span>

      <div className="rounded-kiosk border border-border bg-surface p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">{event.dateLabel}</p>
            <p className="mt-0.5 truncate text-base font-bold text-ink">{event.title}</p>
            <p className="mt-0.5 text-sm text-muted">{event.description}</p>
          </div>
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="shrink-0 rounded-lg p-2 text-muted transition hover:bg-border/40 hover:text-ink"
            aria-label={expanded ? "Hide details" : "Show details"}
          >
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>

        {hasRedFlags && !expanded && (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="mt-3 flex items-center gap-1.5 rounded-full bg-alert-light px-2.5 py-1 text-xs font-semibold text-alert"
          >
            <AlertTriangle size={13} />
            {event.redFlags.length} urgent symptom{event.redFlags.length > 1 ? "s" : ""} flagged &middot; tap for
            details
          </button>
        )}

        {expanded && (
          <div className="mt-4 space-y-3 border-t border-border pt-4">
            <p className="text-xs font-semibold text-muted">{event.source}</p>

            {hasRedFlags && (
              <div className="space-y-2">
                {event.redFlags.map((flag) => (
                  <RedFlagAlert key={flag.id} flag={flag} />
                ))}
              </div>
            )}

            {event.details.length === 0 ? (
              <p className="text-sm text-muted">No further details recorded.</p>
            ) : (
              <div className="space-y-2">
                {event.details.map((detail) => (
                  <div key={detail.key} className="flex items-start justify-between gap-3">
                    <p className="w-1/3 shrink-0 text-xs font-semibold text-muted">{detail.label}</p>
                    <p className="flex-1 text-right text-sm text-ink">{detail.value}</p>
                  </div>
                ))}
              </div>
            )}

            {event.isMockOcr && (
              <p className="text-xs text-muted">Demo OCR &middot; fictional extracted data</p>
            )}
          </div>
        )}
      </div>
    </li>
  );
}
