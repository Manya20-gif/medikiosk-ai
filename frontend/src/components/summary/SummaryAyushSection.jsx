import { Leaf } from "lucide-react";
import { getSections } from "../../utils/ayushQuestionEngine.js";

export default function SummaryAyushSection({ ayushHistory }) {
  const sections = getSections();

  return (
    <div className="kiosk-card">
      <div className="flex items-center gap-2">
        <Leaf size={18} className="text-accent-dark" />
        <h2 className="text-lg font-bold text-ink">AYUSH case-taking</h2>
      </div>

      <div className="mt-4 space-y-4">
        {sections.map((section) => {
          const answers = ayushHistory[section.id] ?? [];
          if (answers.length === 0) return null;
          return (
            <div key={section.id}>
              <p className="text-sm font-bold text-ink">
                {section.label}
                {section.sanskrit && <span className="ml-1.5 font-normal text-muted">· {section.sanskrit}</span>}
              </p>
              <div className="mt-2 divide-y divide-border rounded-kiosk border border-border">
                {answers.map((answer) => (
                  <div key={answer.questionId} className="px-4 py-2.5">
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
