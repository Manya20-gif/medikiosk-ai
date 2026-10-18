import { useNavigate } from "react-router-dom";
import { ArrowRight, RotateCcw, ClipboardCheck } from "lucide-react";

export default function RecapStep({ chiefComplaintLabel, answers, onRestart }) {
  const navigate = useNavigate();

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-success-light text-success">
        <ClipboardCheck size={22} />
      </span>
      <h1 className="mt-4 text-3xl font-bold text-ink">Thanks — here's what we noted</h1>
      <p className="mt-2 text-muted">
        Chief complaint: <span className="font-semibold text-ink">{chiefComplaintLabel}</span>
      </p>

      <div className="mt-6 divide-y divide-border rounded-kiosk border border-border bg-surface">
        {answers.map((answer) => (
          <div key={answer.questionId} className="px-5 py-4">
            <p className="text-sm text-muted">{answer.questionText}</p>
            <p className="mt-0.5 font-semibold text-ink">{answer.valueLabel}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <button type="button" onClick={onRestart} className="kiosk-btn-secondary">
          <RotateCcw size={18} />
          Start history over
        </button>
        <button type="button" onClick={() => navigate("/doctors")} className="kiosk-btn-primary">
          Choose a doctor
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}
