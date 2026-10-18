import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, ShieldAlert, RotateCcw, Send, CheckCircle2, FolderCheck } from "lucide-react";
import { useSession } from "../context/SessionContext.jsx";
import { buildClinicalSummary } from "../utils/summaryUtils.js";
import ClinicalTimeline from "../components/timeline/ClinicalTimeline.jsx";
import RedFlagAlert from "../components/alerts/RedFlagAlert.jsx";
import SummaryPatientCard from "../components/summary/SummaryPatientCard.jsx";
import SummaryHistorySection from "../components/summary/SummaryHistorySection.jsx";
import SummaryAyushSection from "../components/summary/SummaryAyushSection.jsx";
import SummaryDocumentsSection from "../components/summary/SummaryDocumentsSection.jsx";

/**
 * PHASE 8 — pulls together patient details, today's case-taking (modern
 * or AYUSH — see consultationType), uploaded documents, and the Phase 6
 * timeline + red flags into one clinician-facing summary. It computes no
 * new clinical judgement of its own; see utils/summaryUtils.js. The
 * "Send to doctor" action is a demo hand-off only — Phase 9 builds the
 * real doctor dashboard that would receive this.
 */
export default function Summary() {
  const navigate = useNavigate();
  const {
    consent,
    patient,
    consultationType,
    clinicalHistory,
    ayushHistory,
    documents,
    redFlags,
    timelineEvents,
    setClinicalSummary,
    resetSession,
  } = useSession();

  const [sent, setSent] = useState(false);

  // Guard: same pattern as every other built step.
  useEffect(() => {
    if (consent.given !== true) navigate("/consent", { replace: true });
    else if (!patient.name) navigate("/details", { replace: true });
  }, [consent, patient, navigate]);

  const summary = useMemo(
    () =>
      buildClinicalSummary({
        patient,
        consultationType,
        clinicalHistory,
        ayushHistory,
        documents,
        timelineEvents,
        redFlags,
      }),
    [patient, consultationType, clinicalHistory, ayushHistory, documents, timelineEvents, redFlags]
  );

  // Store the computed summary in the shared session so a later phase
  // (doctor dashboard, ABDM/FHIR export) can read it directly.
  useEffect(() => {
    setClinicalSummary(summary);
  }, [summary, setClinicalSummary]);

  const handleSend = () => setSent(true);

  const handleFinishVisit = () => {
    resetSession();
    navigate("/");
  };

  if (sent) {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-success-light text-success">
          <CheckCircle2 size={26} />
        </span>
        <h1 className="mt-5 text-2xl font-bold text-ink">Summary sent (demo)</h1>
        <p className="mt-2 max-w-sm text-muted">
          In this prototype nothing leaves the browser — a real deployment would hand this summary to the
          doctor dashboard here. Phase 9 builds that dashboard.
        </p>
        <button type="button" onClick={handleFinishVisit} className="kiosk-btn-primary mt-8">
          <RotateCcw size={18} />
          Finish visit &amp; start next patient
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
      <h1 className="text-3xl font-bold text-ink">Clinical summary</h1>
      <p className="mt-2 text-muted">Everything gathered during this visit, ready for clinician review.</p>

      <div className="mt-6 flex items-start gap-3 rounded-kiosk border border-primary/20 bg-primary-light px-4 py-3 text-sm text-primary-dark">
        <ShieldCheck size={20} className="mt-0.5 shrink-0" />
        <p className="leading-snug">
          <span className="font-semibold">AI-generated summary — requires clinician verification.</span> It
          organises what the patient reported; it does not diagnose or recommend treatment.
        </p>
      </div>

      <div className="mt-6">
        <SummaryPatientCard patient={summary.patient} consultationType={summary.consultationType} />
      </div>

      {redFlags.length > 0 && (
        <div className="mt-6 space-y-3">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-alert">
            <ShieldAlert size={16} />
            {redFlags.length} possible urgent symptom{redFlags.length > 1 ? "s" : ""}
          </p>
          {redFlags.map((flag) => (
            <RedFlagAlert key={flag.id} flag={flag} />
          ))}
        </div>
      )}

      {summary.hasModernHistory && (
        <div className="mt-6">
          <SummaryHistorySection
            chiefComplaintLabel={clinicalHistory.chiefComplaintLabel}
            answers={clinicalHistory.answers}
          />
        </div>
      )}

      {summary.hasAyushHistory && (
        <div className="mt-6">
          <SummaryAyushSection ayushHistory={ayushHistory} />
        </div>
      )}

      {!summary.hasModernHistory && !summary.hasAyushHistory && (
        <p className="mt-6 rounded-kiosk border border-dashed border-border bg-surface px-4 py-6 text-center text-sm text-muted">
          No case-taking history recorded for this visit.
        </p>
      )}

      <div className="mt-6">
        <SummaryDocumentsSection documents={documents} />
      </div>

      {/* PHASE 10 — patient-facing note only; no technical FHIR/ABDM
          detail here on purpose (see components/abdm/ for the
          clinician-facing "ABDM/FHIR Prototype Integration" tools). */}
      <div className="mt-6 flex items-start gap-3 rounded-kiosk border border-border bg-surface px-4 py-3 text-sm text-muted">
        <FolderCheck size={20} className="mt-0.5 shrink-0 text-primary" />
        <div>
          <p className="font-semibold text-ink">Your digital health record</p>
          <p className="mt-1 leading-snug">
            Your information has been organised into a standardised digital health record (ABDM/FHIR integration —
            prototype mode). It is shared only with your consent, and this prototype does not connect to real
            health records.
          </p>
        </div>
      </div>

      {timelineEvents.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-bold text-ink">Timeline</h2>
          <div className="mt-3">
            <ClinicalTimeline events={timelineEvents} />
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <button type="button" onClick={handleFinishVisit} className="kiosk-btn-secondary">
          <RotateCcw size={18} />
          Finish visit
        </button>
        <button type="button" onClick={handleSend} className="kiosk-btn-primary">
          <Send size={18} />
          Send to doctor (demo)
        </button>
      </div>
    </div>
  );
}
