import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "../context/SessionContext.jsx";
import { flattenQuestions, getSection } from "../utils/ayushQuestionEngine.js";
import { matchChiefComplaint } from "../utils/symptomMatcher.js";
import { chiefComplaints } from "../data/chiefComplaints.js";
import AiDisclaimer from "../components/layout/AiDisclaimer.jsx";
import AyushProgress from "../components/ayush/AyushProgress.jsx";
import AyushSection from "../components/ayush/AyushSection.jsx";
import AyushReview from "../components/ayush/AyushReview.jsx";

export default function AyushCaseTaking() {
  const navigate = useNavigate();
  const {
    consent,
    patient,
    languageCode,
    consultationType,
    ayushHistory,
    recordAyushAnswer,
    startClinicalHistory,
  } = useSession();

  const flatQuestions = useMemo(() => flattenQuestions(), []);
  const [pointerIndex, setPointerIndex] = useState(0);
  const [view, setView] = useState("questions"); // "questions" | "review"

  // Guard: consent + registration, same pattern as every other built
  // step, plus this step specifically requires "AYUSH" to have been
  // chosen on the consultation-type screen.
  useEffect(() => {
    if (consent.given !== true) navigate("/consent", { replace: true });
    else if (!patient.name) navigate("/details", { replace: true });
    else if (consultationType !== "ayush") navigate("/consultation-type", { replace: true });
  }, [consent, patient, consultationType, navigate]);

  const currentEntry = flatQuestions[pointerIndex];
  const currentSection = currentEntry ? getSection(currentEntry.sectionId) : null;
  const existingAnswer = currentEntry
    ? (ayushHistory[currentEntry.sectionId] ?? []).find((a) => a.questionId === currentEntry.question.id)
    : null;

  const handleAnswer = (value, valueLabel) => {
    if (!currentEntry) return;
    const { question, sectionId } = currentEntry;
    recordAyushAnswer(sectionId, {
      questionId: question.id,
      questionText: question.text,
      sanskrit: question.sanskrit ?? null,
      type: question.type,
      value,
      valueLabel,
    });

    if (pointerIndex + 1 < flatQuestions.length) {
      setPointerIndex(pointerIndex + 1);
    } else {
      setView("review");
    }
  };

  const handleBack = () => {
    if (pointerIndex > 0) setPointerIndex(pointerIndex - 1);
  };

  const handleJumpToSection = (sectionId) => {
    const targetIndex = flatQuestions.findIndex((entry) => entry.sectionId === sectionId);
    if (targetIndex === -1) return;
    setPointerIndex(targetIndex);
    setView("questions");
  };

  // Phase 6 integration: reuse the existing, already-audited red-flag
  // system rather than building a second one. If the patient described
  // current symptoms in the Vikriti section that match a known chief
  // complaint, offer to run that complaint's real question tree — the
  // existing detectRedFlags()/Timeline page then takes over from there.
  const redFlagPrompt = useMemo(() => {
    const symptomAnswer = (ayushHistory.vikriti ?? []).find((a) => a.questionId === "vikriti_current_symptoms");
    const text = symptomAnswer?.value;
    if (!text || typeof text !== "string" || !text.trim()) return null;
    const matchedId = matchChiefComplaint(text);
    if (!matchedId) return null;
    const complaint = chiefComplaints.find((c) => c.id === matchedId);
    if (!complaint) return null;
    return { complaintId: matchedId, label: complaint.label };
  }, [ayushHistory.vikriti]);

  const handleStartSymptomCheck = (complaintId, label) => {
    startClinicalHistory(complaintId, label);
    navigate("/history");
  };

  const handleConfirm = () => {
    navigate("/documents");
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="mx-auto mt-6 w-full max-w-2xl px-6">
        <AiDisclaimer compact />
      </div>

      <div className="mt-6">
        <AyushProgress
          currentSectionId={currentSection?.id}
          isReview={view === "review"}
          onJumpToSection={handleJumpToSection}
        />
      </div>

      {view === "questions" && currentEntry && currentSection && (
        <AyushSection
          section={currentSection}
          question={currentEntry.question}
          questionNumberInSection={currentEntry.questionIndexInSection + 1}
          questionCountInSection={currentSection.questions.length}
          existingAnswer={existingAnswer}
          onAnswer={handleAnswer}
          onBack={handleBack}
          canGoBack={pointerIndex > 0}
          languageCode={languageCode ?? "en"}
        />
      )}

      {view === "review" && (
        <AyushReview
          ayushHistory={ayushHistory}
          onEditSection={handleJumpToSection}
          redFlagPrompt={redFlagPrompt}
          onStartSymptomCheck={handleStartSymptomCheck}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
}
