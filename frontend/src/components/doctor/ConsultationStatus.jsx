import { CheckCircle2, Circle, ActivitySquare } from "lucide-react";
import { CONSULTATION_STATUSES } from "../../services/doctorService.js";

export default function ConsultationStatus({ status, onChange }) {
  const currentIndex = CONSULTATION_STATUSES.indexOf(status);

  return (
    <div className="doc-card">
      <div className="flex items-center gap-2">
        <ActivitySquare size={17} className="text-primary" />
        <h2 className="text-base font-bold text-ink">Consultation status</h2>
      </div>

      <ol className="mt-4 space-y-2">
        {CONSULTATION_STATUSES.map((label, index) => {
          const isDone = index < currentIndex;
          const isCurrent = index === currentIndex;
          return (
            <li key={label}>
              <button
                type="button"
                onClick={() => onChange(label)}
                className={`flex w-full items-center gap-2.5 rounded-lg border px-3 py-2 text-left text-sm font-semibold transition ${
                  isCurrent
                    ? "border-primary bg-primary-light text-primary-dark"
                    : isDone
                    ? "border-border bg-canvas text-ink"
                    : "border-border bg-surface text-muted hover:border-primary/50 hover:text-ink"
                }`}
              >
                {isDone || isCurrent ? (
                  <CheckCircle2 size={16} className={isCurrent ? "text-primary" : "text-success"} />
                ) : (
                  <Circle size={16} />
                )}
                {label}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
