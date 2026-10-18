import { CheckCircle2, HelpCircle, AlertTriangle } from "lucide-react";

function getTier(confidence) {
  if (confidence >= 0.85) {
    return { label: "High confidence", toneClass: "bg-success-light text-success", Icon: CheckCircle2 };
  }
  if (confidence >= 0.6) {
    return { label: "Medium confidence", toneClass: "bg-accent-light text-accent-dark", Icon: HelpCircle };
  }
  return { label: "Low confidence — verify", toneClass: "bg-alert-light text-alert", Icon: AlertTriangle };
}

/**
 * Small pill showing how confident the OCR step was in one extracted
 * field, so staff/patients know what to double-check before saving.
 */
export default function ConfidenceBadge({ confidence }) {
  const { label, toneClass, Icon } = getTier(confidence);
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${toneClass}`}
      title={`${Math.round(confidence * 100)}% confidence`}
    >
      <Icon size={12} />
      {label} &middot; {Math.round(confidence * 100)}%
    </span>
  );
}
