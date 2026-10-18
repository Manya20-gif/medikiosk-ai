import { Sparkles, ShieldAlert } from "lucide-react";

const toneClasses = {
  alert: "bg-alert-light text-alert",
  primary: "bg-primary-light text-primary-dark",
  muted: "bg-canvas text-muted",
};

export default function ImportantFindings({ findings }) {
  return (
    <div className="doc-card">
      <div className="flex items-center gap-2">
        <Sparkles size={17} className="text-primary" />
        <h2 className="text-base font-bold text-ink">Important findings</h2>
      </div>

      {findings.length === 0 ? (
        <p className="mt-3 text-sm text-muted">Nothing notable surfaced yet.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {findings.map((finding) => (
            <li key={finding.id} className="rounded-lg border border-border p-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`doc-badge ${toneClasses[finding.tagTone] ?? toneClasses.muted}`}>
                  {finding.tagTone === "alert" && <ShieldAlert size={11} />}
                  {finding.tag}
                </span>
                {finding.needsVerification && (
                  <span className="doc-badge bg-accent-light text-accent-dark">Requires verification</span>
                )}
              </div>
              <p className="mt-1.5 text-sm font-semibold text-ink">{finding.label}</p>
              {finding.detail && <p className="text-xs text-muted">{finding.detail}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
