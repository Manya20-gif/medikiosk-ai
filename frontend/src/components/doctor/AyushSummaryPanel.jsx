import { Leaf } from "lucide-react";
import { getSections } from "../../utils/ayushQuestionEngine.js";

/**
 * Doctor-facing view of the Phase 7 AYUSH case-taking data. Same
 * information as SummaryAyushSection (patient-reported, no computed
 * Dosha/Prakriti/Vikriti result) with the terminology and clinician
 * disclaimer this dashboard needs.
 */
export default function AyushSummaryPanel({ ayushHistory }) {
  const sections = getSections();
  const populated = sections.filter((s) => (ayushHistory?.[s.id] ?? []).length > 0);

  if (populated.length === 0) return null;

  return (
    <div className="doc-card">
      <div className="flex items-center gap-2">
        <Leaf size={17} className="text-accent-dark" />
        <h2 className="text-base font-bold text-ink">AYUSH case information</h2>
      </div>
      <p className="mt-1 text-xs text-muted">
        Patient-reported information — clinician interpretation required. No Dosha/Prakriti/Vikriti result is
        computed automatically.
      </p>

      <div className="mt-4 space-y-4">
        {populated.map((section) => {
          const answers = ayushHistory[section.id];
          return (
            <div key={section.id}>
              <p className="text-sm font-bold text-ink">
                {section.label}
                {section.sanskrit && <span className="ml-1.5 font-normal text-muted">&middot; {section.sanskrit}</span>}
              </p>
              <div className="mt-1.5 divide-y divide-border rounded-lg border border-border">
                {answers.map((answer) => (
                  <div key={answer.questionId} className="px-3 py-2">
                    <p className="text-xs text-muted">
                      {answer.sanskrit ? `${answer.sanskrit} — ` : ""}
                      {answer.questionText}
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-ink">
                      {Array.isArray(answer.valueLabel) ? answer.valueLabel.join(", ") : answer.valueLabel}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
