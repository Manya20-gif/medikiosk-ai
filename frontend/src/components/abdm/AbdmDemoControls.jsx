import { Fingerprint, Loader2, CheckCircle2 } from "lucide-react";

/**
 * PHASE 10 — "Digital Health Identity" demo flow. Connects a fictional
 * demo ABHA identifier to the current patient record. Never touches a
 * real ABHA number and never calls a real ABDM endpoint (see
 * services/abdmMockService.js).
 */
export default function AbdmDemoControls({ abha, onConnect }) {
  if (abha.connected) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-success/30 bg-success-light px-3 py-2 text-xs font-semibold text-success">
        <CheckCircle2 size={15} />
        <span>
          Demo ABHA connected — <span className="font-mono">{abha.abhaId}</span>
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={onConnect}
        disabled={abha.linking}
        className="doc-btn-secondary"
      >
        {abha.linking ? <Loader2 size={14} className="animate-spin" /> : <Fingerprint size={14} />}
        {abha.linking ? "Connecting…" : "Connect Demo ABHA"}
      </button>
      <span className="text-xs text-muted">Status: Not connected</span>
    </div>
  );
}
