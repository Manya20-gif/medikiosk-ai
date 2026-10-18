import { X, FileText } from "lucide-react";
import { FIELD_LABELS } from "../../services/ocrService.js";

const FIELD_KEYS = Object.keys(FIELD_LABELS);

export default function DocumentViewerModal({ document, onClose }) {
  if (!document) return null;
  const populatedKeys = FIELD_KEYS.filter((key) => document.extractedFields?.[key]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-surface shadow-kiosk"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-border p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-light text-primary">
              <FileText size={19} />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">{document.typeLabel}</p>
              <p className="text-sm font-bold text-ink">{document.fileName}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-muted hover:bg-canvas hover:text-ink" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3 p-4">
          {document.isMockOcr && (
            <p className="rounded-lg bg-accent-light px-3 py-2 text-xs font-medium text-accent-dark">
              Demo OCR mode &middot; fictional extracted data, not real document text extraction.
            </p>
          )}
          {populatedKeys.length === 0 ? (
            <p className="text-sm text-muted">No fields were extracted for this document.</p>
          ) : (
            populatedKeys.map((key) => (
              <div key={key} className="rounded-lg border border-border p-3">
                <p className="text-xs font-semibold text-muted">{FIELD_LABELS[key]}</p>
                <p className="mt-0.5 text-sm text-ink">{document.extractedFields[key].value}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
