import { ArrowLeft } from "lucide-react";
import AyushQuestion from "./AyushQuestion.jsx";

/**
 * Presentational wrapper around the current section's active question.
 * All step logic (which question, which section, back/forward) lives in
 * pages/AyushCaseTaking.jsx — this component just renders one step of it,
 * the same division of responsibility as HistoryTaking + QuestionStep.
 */
export default function AyushSection({
  section,
  question,
  questionNumberInSection,
  questionCountInSection,
  existingAnswer,
  onAnswer,
  onBack,
  canGoBack,
  languageCode,
}) {
  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          {section.sanskrit ? `${section.label} · ${section.sanskrit}` : section.label} — question{" "}
          {questionNumberInSection} of {questionCountInSection}
        </p>
        {section.description && <p className="mt-1 text-sm text-muted">{section.description}</p>}
      </div>

      <div className="mt-6 kiosk-card">
        <AyushQuestion
          question={question}
          existingAnswer={existingAnswer}
          onAnswer={onAnswer}
          languageCode={languageCode}
        />
      </div>

      {canGoBack && (
        <button
          type="button"
          onClick={onBack}
          className="mt-8 flex items-center gap-1.5 text-sm font-semibold text-muted transition hover:text-primary"
        >
          <ArrowLeft size={16} />
          Back to previous question
        </button>
      )}
    </div>
  );
}
