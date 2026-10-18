import { useState } from "react";
import { X, FileJson, Copy, Check } from "lucide-react";

/**
 * PHASE 10 — "View FHIR Bundle" developer/demo modal. Displays the
 * mock FHIR Bundle as formatted, read-only JSON. This is the one
 * deliberately developer-looking screen in the ABDM/FHIR feature (per
 * the Phase 10 brief) — everything else stays clinician-friendly.
 */
export default function FhirBundleViewer({ bundle, onClose }) {
  const [copied, setCopied] = useState(false);
  if (!bundle) return null;

  const json = JSON.stringify(bundle, null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(json);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard access can fail (permissions/insecure context) — no
      // need to surface this as a hard error in a demo viewer.
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-surface shadow-kiosk"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-border p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-light text-primary">
              <FileJson size={19} />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">FHIR Bundle (mock)</p>
              <p className="text-sm font-bold text-ink">ABDM/FHIR Prototype Integration</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted hover:bg-canvas hover:text-ink"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <p className="border-b border-border bg-accent-light px-4 py-2 text-xs font-medium text-accent-dark">
          Demo data only — fictional FHIR-shaped resources, not a real ABDM health record.
        </p>

        <div className="flex-1 overflow-auto p-4">
          <pre className="whitespace-pre-wrap break-words rounded-xl bg-canvas p-3 text-[11px] leading-relaxed text-ink">
            {json}
          </pre>
        </div>

        <div className="flex justify-end border-t border-border p-3">
          <button type="button" onClick={handleCopy} className="doc-btn-secondary">
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copied" : "Copy JSON"}
          </button>
        </div>
      </div>
    </div>
  );
}
