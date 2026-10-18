import { ClipboardCheck, Pencil, ShieldCheck, ShieldAlert, ArrowRight } from "lucide-react";
import { getSections } from "../../utils/ayushQuestionEngine.js";

/**
 * Final review of everything collected across every AYUSH section.
 * Read-only summary + "Edit" jump per section — no diagnosis, dosha
 * result, or recommendation is computed or shown here, per the Phase 7
 * clinician-safety requirement (see redFlagPrompt for the one exception:
 * surfacing the *existing* red-flag check, never a new one).
 */
export default function AyushReview({ ayushHistory, onEditSection, redFlagPrompt, onStartSymptomCheck, onConfirm }) {
  const sections = getSections();

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-success-light text-success">
        <ClipboardCheck size={22} />
      </span>
      <h1 className="mt-4 text-3xl font-bold text-ink">AYUSH case summary</h1>
      <p className="mt-2 text-muted">Please review your responses before submitting.</p>

      <div className="mt-4 flex items-start gap-3 rounded-kiosk border border-primary/20 bg-primary-light px-4 py-3 text-sm text-primary-dark">
        <ShieldCheck size={20} className="mt-0.5 shrink-0" />
        <p className="leading-snug">
          <span className="font-semibold">AI-assisted information collection.</span> Final assessment and
          diagnosis must be performed by a qualified healthcare professional.
        </p>
      </div>

      {redFlagPrompt && (
        <div className="mt-4 rounded-kiosk border-2 border-alert/40 bg-alert-light p-4">
          <div className="flex items-start gap-3">
            <ShieldAlert size={22} className="mt-0.5 shrink-0 text-alert" />
            <div className="min-w-0 flex-1">
              <p className="font-bold text-ink">This may need a closer symptom check</p>
              <p className="mt-1 text-sm text-ink">
                What you described sounds related to{" "}
                <span className="font-semibold">{redFlagPrompt.label}</span>. A few quick follow-up
                questions can help flag anything urgent for the healthcare professional.
              </p>
              <button
                type="button"
                onClick={() => onStartSymptomCheck(redFlagPrompt.complaintId, redFlagPrompt.label)}
                className="mt-3 flex items-center gap-1.5 rounded-kiosk bg-alert px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-alert/90"
              >
                Answer a few quick questions
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 space-y-4">
        {sections.map((section) => {
          const answers = ayushHistory[section.id] ?? [];
          return (
            <div key={section.id} className="rounded-kiosk border border-border bg-surface">
              <div className="flex items-center justify-between border-b border-border px-5 py-3">
                <div>
                  <p className="font-bold text-ink">{section.label}</p>
                  {section.sanskrit && <p className="text-xs text-muted">{section.sanskrit}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => onEditSection(section.id)}
                  className="flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-dark"
                >
                  <Pencil size={14} />
                  Edit
                </button>
              </div>
              <div className="divide-y divide-border">
                {answers.length === 0 && <p className="px-5 py-3 text-sm text-muted">Not answered yet.</p>}
                {answers.map((answer) => (
                  <div key={answer.questionId} className="px-5 py-3">
                    <p className="text-sm text-muted">{answer.questionText}</p>
                    <p className="mt-0.5 font-semibold text-ink">{answer.valueLabel}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex justify-end">
        <button type="button" onClick={onConfirm} className="kiosk-btn-primary">
          Confirm and continue
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}
