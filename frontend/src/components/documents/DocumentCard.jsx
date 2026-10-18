import { useState } from "react";
import { FileText, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { FIELD_LABELS } from "../../services/ocrService.js";
import ConfidenceBadge from "./ConfidenceBadge.jsx";

const FIELD_KEYS = Object.keys(FIELD_LABELS);

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentCard({ document, onRemove }) {
  const [expanded, setExpanded] = useState(false);
  const populatedFieldKeys = FIELD_KEYS.filter((key) => document.extractedFields?.[key]);

  return (
    <div className="rounded-kiosk border border-border bg-surface p-4">
      <div className="flex items-center gap-3">
        {document.fileKind === "image" && document.previewUrl ? (
          <img
            src={document.previewUrl}
            alt=""
            className="h-14 w-14 shrink-0 rounded-lg object-cover"
          />
        ) : (
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-primary-light text-primary">
            <FileText size={24} />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            {document.typeLabel}
          </p>
          <p className="truncate text-sm font-semibold text-ink">{document.fileName}</p>
          <p className="text-xs text-muted">{formatFileSize(document.fileSize)}</p>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="shrink-0 rounded-lg p-2 text-muted transition hover:bg-border/40 hover:text-ink"
          aria-label={expanded ? "Hide extracted details" : "Show extracted details"}
        >
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        <button
          type="button"
          onClick={() => onRemove(document.id)}
          className="shrink-0 rounded-lg p-2 text-muted transition hover:bg-alert-light hover:text-alert"
          aria-label="Remove document"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {expanded && (
        <div className="mt-4 space-y-3 border-t border-border pt-4">
          {document.aiAnalysis && (
            <div className={`rounded-xl border p-3 ${
              document.aiAnalysis.decision === "EMERGENCY" ? "border-red-300 bg-red-50" :
              document.aiAnalysis.decision === "URGENT" ? "border-amber-300 bg-amber-50" :
              document.aiAnalysis.decision === "UNCLEAR" ? "border-slate-300 bg-slate-50" :
              "border-green-300 bg-green-50"
            }`}>
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold uppercase tracking-wide">AI decision</p>
                <span className="rounded-full bg-white/70 px-2 py-0.5 text-xs font-bold">
                  {document.aiAnalysis.decision}
                </span>
              </div>
              <p className="mt-1 text-sm text-ink">{document.aiAnalysis.summary}</p>
              {document.aiAnalysis.nextSteps?.length > 0 && (
                <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-ink">
                  {document.aiAnalysis.nextSteps.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              )}
            </div>
          )}
          {document.isMockOcr && (
            <p className="text-xs text-muted">Demo OCR &middot; fictional extracted data</p>
          )}
          {populatedFieldKeys.length === 0 ? (
            <p className="text-sm text-muted">No fields were extracted for this document.</p>
          ) : (
            populatedFieldKeys.map((key) => (
              <div key={key} className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-muted">{FIELD_LABELS[key]}</p>
                  <p className="text-sm text-ink">{document.extractedFields[key].value}</p>
                </div>
                <ConfidenceBadge confidence={document.extractedFields[key].confidence} />
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
