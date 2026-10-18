import { FileText } from "lucide-react";
import { FIELD_LABELS } from "../../services/ocrService.js";

const FIELD_KEYS = Object.keys(FIELD_LABELS);

export default function SummaryDocumentsSection({ documents }) {
  if (documents.length === 0) return null;

  return (
    <div className="kiosk-card">
      <div className="flex items-center gap-2">
        <FileText size={18} className="text-primary" />
        <h2 className="text-lg font-bold text-ink">Uploaded documents ({documents.length})</h2>
      </div>

      <div className="mt-4 space-y-3">
        {documents.map((document) => {
          const populatedKeys = FIELD_KEYS.filter((key) => document.extractedFields?.[key]);
          return (
            <div key={document.id} className="rounded-kiosk border border-border p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">{document.typeLabel}</p>
              <p className="truncate text-sm font-semibold text-ink">{document.fileName}</p>
              {populatedKeys.length > 0 && (
                <p className="mt-1 text-xs text-muted">
                  {populatedKeys.map((key) => document.extractedFields[key].value).join(" · ")}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
