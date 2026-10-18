import { Stethoscope, Leaf } from "lucide-react";

/**
 * Lets the patient choose which case-taking flow to follow. Stored as
 * `consultationType` ("modern" | "ayush") on the shared session so later
 * phases (summary, doctor dashboard) know which history was collected.
 */
export default function AyushModeSelector({ onSelect }) {
  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
      <h1 className="text-3xl font-bold text-ink">How would you like to proceed?</h1>
      <p className="mt-2 text-muted">
        Choose the type of case-taking for today's visit. You can tell the front desk if you'd like to
        change this later.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onSelect("modern")}
          className="flex flex-col items-start gap-3 rounded-kiosk border-2 border-border bg-surface p-6 text-left transition hover:border-primary hover:bg-primary-light"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-light text-primary">
            <Stethoscope size={24} />
          </span>
          <span className="text-lg font-bold text-ink">Modern Medicine</span>
          <span className="text-sm text-muted">
            Standard symptom-based history taking, the same as before.
          </span>
        </button>

        <button
          type="button"
          onClick={() => onSelect("ayush")}
          className="flex flex-col items-start gap-3 rounded-kiosk border-2 border-border bg-surface p-6 text-left transition hover:border-primary hover:bg-primary-light"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-light text-accent-dark">
            <Leaf size={24} />
          </span>
          <span className="text-lg font-bold text-ink">AYUSH / Ayurveda</span>
          <span className="text-sm text-muted">
            A fuller case-taking covering constitution, digestion, diet, and lifestyle.
          </span>
        </button>
      </div>
    </div>
  );
}
