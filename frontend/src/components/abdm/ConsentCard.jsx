import { CheckCircle2, XCircle, Undo2, Loader2, ShieldCheck } from "lucide-react";

const DATA_CATEGORIES = [
  "Clinical history",
  "Investigations",
  "Medications",
  "Medical documents",
  "Clinical summary",
];

const STATUS_STYLES = {
  none: { label: "Not requested", className: "bg-white/70 text-muted" },
  granted: { label: "Granted for demo session", className: "bg-success-light text-success" },
  declined: { label: "Declined", className: "bg-alert-light text-alert" },
  revoked: { label: "Revoked", className: "bg-alert-light text-alert" },
};

/**
 * PHASE 10 — Health Record Sharing Consent. Explicit, visible, and
 * revocable, per the Phase 10 brief. Declining never simulates sharing
 * (enforced by the parent, which only allows "Simulate Share" once
 * consent.status === "granted").
 */
export default function ConsentCard({ consent, onAllow, onDecline, onRevoke }) {
  const statusInfo = STATUS_STYLES[consent.status] ?? STATUS_STYLES.none;

  return (
    <div className="doc-card-tight">
      <div className="flex items-center gap-2">
        <ShieldCheck size={16} className="text-primary" />
        <h3 className="text-sm font-bold text-ink">Health Record Sharing Consent</h3>
      </div>

      <p className="mt-2 text-xs text-muted">
        <span className="font-semibold text-ink">Purpose:</span> Clinical consultation and record continuity
      </p>

      <div className="mt-2">
        <p className="text-xs font-semibold text-ink">Data covered:</p>
        <ul className="mt-1 flex flex-wrap gap-1.5">
          {DATA_CATEGORIES.map((cat) => (
            <li key={cat} className="doc-badge bg-primary-light text-primary-dark">
              {cat}
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-2 text-xs text-muted">
        <span className="font-semibold text-ink">Duration:</span> Demo session only
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className={`doc-badge ${statusInfo.className}`}>{statusInfo.label}</span>
      </div>

      {consent.error && <p className="mt-2 text-xs font-medium text-alert">{consent.error}</p>}

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onAllow}
          disabled={consent.requesting || consent.status === "granted"}
          className="doc-btn-primary"
        >
          {consent.requesting ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
          Allow Sharing
        </button>
        <button
          type="button"
          onClick={onDecline}
          disabled={consent.requesting || consent.status === "granted"}
          className="doc-btn-secondary"
        >
          <XCircle size={13} />
          Decline
        </button>
        <button
          type="button"
          onClick={onRevoke}
          disabled={consent.status !== "granted"}
          className="doc-btn-secondary"
        >
          <Undo2 size={13} />
          Revoke Consent
        </button>
      </div>
    </div>
  );
}
