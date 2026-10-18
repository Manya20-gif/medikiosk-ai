import { useState } from "react";
import { CalendarClock, X } from "lucide-react";
import ClinicalTimeline from "../timeline/ClinicalTimeline.jsx";

export default function TimelinePanel({ events }) {
  const [showFull, setShowFull] = useState(false);
  const compactEvents = events.slice(0, 3);

  return (
    <div className="doc-card">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <CalendarClock size={17} className="text-primary" />
          <h2 className="text-base font-bold text-ink">Clinical timeline</h2>
        </div>
        {events.length > 0 && (
          <button type="button" onClick={() => setShowFull(true)} className="doc-btn-ghost">
            View full timeline
          </button>
        )}
      </div>

      {events.length === 0 ? (
        <p className="mt-3 text-sm text-muted">No documents or history recorded yet.</p>
      ) : (
        <div className="mt-4">
          <ol className="space-y-3">
            {compactEvents.map((event) => (
              <li key={event.id} className="rounded-lg border border-border p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">{event.dateLabel}</p>
                <p className="text-sm font-bold text-ink">{event.title}</p>
                <p className="text-xs text-muted">{event.description}</p>
              </li>
            ))}
          </ol>
          {events.length > compactEvents.length && (
            <p className="mt-2 text-xs text-muted">
              +{events.length - compactEvents.length} more event{events.length - compactEvents.length > 1 ? "s" : ""}
            </p>
          )}
        </div>
      )}

      {showFull && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setShowFull(false)}
        >
          <div
            className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-surface p-5 shadow-kiosk"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-ink">Full clinical timeline</h3>
              <button
                type="button"
                onClick={() => setShowFull(false)}
                className="rounded-lg p-1.5 text-muted hover:bg-canvas hover:text-ink"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <ClinicalTimeline events={events} />
          </div>
        </div>
      )}
    </div>
  );
}
