import { History } from "lucide-react";

function formatTime(isoString) {
  try {
    return new Date(isoString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

/**
 * PHASE 10 — Consent Activity audit trail. Every entry here comes from
 * an actual demo action taken in this session (ABHA connect, consent
 * grant/decline/revoke, bundle generation, simulated share) — nothing
 * is pre-seeded or fabricated ahead of time.
 */
export default function ConsentAuditLog({ entries }) {
  return (
    <div className="doc-card-tight">
      <div className="flex items-center gap-2">
        <History size={16} className="text-primary" />
        <h3 className="text-sm font-bold text-ink">Consent Activity</h3>
        <span className="doc-badge bg-accent-light text-accent-dark">Prototype / demo events</span>
      </div>

      {entries.length === 0 ? (
        <p className="mt-2 text-xs text-muted">No activity yet this session.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {entries
            .slice()
            .reverse()
            .map((entry) => (
              <li key={entry.id} className="flex items-start gap-2 text-xs">
                <span className="mt-0.5 w-14 shrink-0 font-mono text-muted">{formatTime(entry.time)}</span>
                <span className="text-ink">
                  {entry.icon} {entry.text}
                </span>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
