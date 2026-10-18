import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ShieldAlert } from "lucide-react";
import { useSession } from "../context/SessionContext.jsx";
import AiDisclaimer from "../components/layout/AiDisclaimer.jsx";
import ClinicalTimeline from "../components/timeline/ClinicalTimeline.jsx";
import RedFlagAlert from "../components/alerts/RedFlagAlert.jsx";
import { detectRedFlags } from "../services/redFlagService.js";
import { buildTimelineEvents } from "../utils/timelineUtils.js";

export default function Timeline() {
  const navigate = useNavigate();
  const { consent, patient, documents, clinicalHistory, setRedFlags, setTimelineEvents } = useSession();

  // Guard: same pattern as every other built step.
  useEffect(() => {
    if (consent.given !== true) navigate("/consent", { replace: true });
    else if (!patient.name) navigate("/details", { replace: true });
  }, [consent, patient, navigate]);

  const computedRedFlags = useMemo(() => detectRedFlags(clinicalHistory), [clinicalHistory]);
  const computedEvents = useMemo(
    () => buildTimelineEvents({ documents, clinicalHistory, redFlags: computedRedFlags }),
    [documents, clinicalHistory, computedRedFlags]
  );

  // Store the computed timeline + red flags in the shared session so later
  // phases (clinical summary, doctor dashboard) can read them directly
  // instead of recomputing from raw documents/history.
  useEffect(() => {
    setRedFlags(computedRedFlags);
    setTimelineEvents(computedEvents);
  }, [computedRedFlags, computedEvents, setRedFlags, setTimelineEvents]);

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
      <h1 className="text-3xl font-bold text-ink">Clinical timeline</h1>
      <p className="mt-2 text-muted">
        A chronological view combining today's history with any documents you've uploaded.
      </p>

      <div className="mt-6">
        <AiDisclaimer compact />
      </div>

      {computedRedFlags.length > 0 && (
        <div className="mt-6 space-y-3">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-alert">
            <ShieldAlert size={16} />
            {computedRedFlags.length} possible urgent symptom
            {computedRedFlags.length > 1 ? "s" : ""} found in today's history
          </p>
          {computedRedFlags.map((flag) => (
            <RedFlagAlert key={flag.id} flag={flag} />
          ))}
        </div>
      )}

      <div className="mt-8">
        <ClinicalTimeline events={computedEvents} />
      </div>

      <div className="mt-8 flex justify-end">
        <button type="button" onClick={() => navigate("/summary")} className="kiosk-btn-primary">
          Continue
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}
