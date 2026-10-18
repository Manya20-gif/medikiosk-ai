import { Check, ClipboardList } from "lucide-react";
import { getSections } from "../../utils/ayushQuestionEngine.js";

/**
 * Section-level progress for the AYUSH case-taking wizard. Separate from
 * the top-level StepIndicator (Language/Consent/Details/...), which only
 * tracks the main kiosk journey — this tracks progress *within* the
 * "AYUSH Case Taking" step. Completed sections are tappable so the
 * patient can jump back and edit earlier answers.
 */
export default function AyushProgress({ currentSectionId, isReview, onJumpToSection }) {
  const sections = getSections();
  const currentIndex = sections.findIndex((s) => s.id === currentSectionId);

  return (
    <div className="mx-auto w-full max-w-2xl px-6">
      <p className="text-xs font-bold uppercase tracking-wide text-muted">AYUSH Case Taking</p>
      <ol className="mt-2 flex flex-wrap gap-2">
        {sections.map((section, index) => {
          const isPast = isReview || index < currentIndex;
          const isCurrent = !isReview && index === currentIndex;
          return (
            <li key={section.id}>
              <button
                type="button"
                disabled={!isPast && !isCurrent}
                onClick={() => isPast && onJumpToSection(section.id)}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  isCurrent
                    ? "border-primary bg-primary text-white"
                    : isPast
                    ? "border-primary/30 bg-primary-light text-primary-dark hover:border-primary"
                    : "border-border bg-surface text-muted"
                }`}
              >
                {isPast && !isCurrent ? <Check size={12} /> : null}
                {section.label}
              </button>
            </li>
          );
        })}
        <li>
          <span
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${
              isReview ? "border-primary bg-primary text-white" : "border-border bg-surface text-muted"
            }`}
          >
            <ClipboardList size={12} />
            Review
          </span>
        </li>
      </ol>
    </div>
  );
}
