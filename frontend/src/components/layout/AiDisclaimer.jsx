import { ShieldCheck } from "lucide-react";

/**
 * Persistent, low-key reminder of the product's role.
 * Appears on every patient-facing screen — never let this get lost in a phase.
 */
export default function AiDisclaimer({ compact = false }) {
  return (
    <div
      className={`flex items-start gap-3 rounded-kiosk border border-primary/20 bg-primary-light px-4 py-3 text-primary-dark ${
        compact ? "text-sm" : "text-base"
      }`}
    >
      <ShieldCheck size={compact ? 18 : 22} className="mt-0.5 shrink-0" />
      <p className="leading-snug">
        <span className="font-semibold">AI assists the doctor.</span> It organises your
        answers for the physician — it does not diagnose you or replace clinical judgement.
      </p>
    </div>
  );
}
