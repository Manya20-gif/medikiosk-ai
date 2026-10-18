import { Stethoscope } from "lucide-react";

export default function SummaryHistorySection({ chiefComplaintLabel, answers }) {
  return (
    <div className="kiosk-card">
      <div className="flex items-center gap-2">
        <Stethoscope size={18} className="text-primary" />
        <h2 className="text-lg font-bold text-ink">History-taking</h2>
      </div>
      <p className="mt-1 text-sm text-muted">
        Chief complaint: <span className="font-semibold text-ink">{chiefComplaintLabel}</span>
      </p>

      <div className="mt-4 divide-y divide-border rounded-kiosk border border-border">
        {answers.map((answer) => (
          <div key={answer.questionId} className="px-4 py-3">
            <p className="text-sm text-muted">{answer.questionText}</p>
            <p className="mt-0.5 font-semibold text-ink">
              {Array.isArray(answer.valueLabel) ? answer.valueLabel.join(", ") : answer.valueLabel}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
