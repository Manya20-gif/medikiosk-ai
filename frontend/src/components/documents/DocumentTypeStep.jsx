import { Pill, FlaskConical, FileText, File } from "lucide-react";
import { documentTypes } from "../../data/documentTypes.js";

const iconMap = { Pill, FlaskConical, FileText, File };

export default function DocumentTypeStep({ onSelect, onCancel }) {
  return (
    <div className="rounded-kiosk border border-border bg-surface p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-ink">What type of document is this?</h2>
        <button
          type="button"
          onClick={onCancel}
          className="shrink-0 text-sm font-semibold text-muted transition hover:text-ink"
        >
          Cancel
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {documentTypes.map((type) => {
          const Icon = iconMap[type.icon] ?? File;
          return (
            <button
              key={type.id}
              type="button"
              onClick={() => onSelect(type)}
              className="flex flex-col items-center gap-2.5 rounded-kiosk border-2 border-border bg-canvas px-4 py-6 text-center transition hover:border-primary hover:bg-primary-light"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-light text-primary">
                <Icon size={22} strokeWidth={2} />
              </span>
              <span className="text-sm font-semibold leading-tight text-ink">{type.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
