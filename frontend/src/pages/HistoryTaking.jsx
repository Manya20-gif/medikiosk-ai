import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "../context/SessionContext.jsx";
import {
  getTreeForComplaint,
  getFirstQuestion,
  getQuestion,
  getNextQuestionId,
  isEnd,
} from "../utils/questionEngine.js";
import ChiefComplaintStep from "../components/history/ChiefComplaintStep.jsx";
import QuestionStep from "../components/history/QuestionStep.jsx";
import RecapStep from "../components/history/RecapStep.jsx";

export default function HistoryTaking() {
  const navigate = useNavigate();
  const {
    consent,
    patient,
    languageCode,
    clinicalHistory,
    startClinicalHistory,
    recordAnswer,
    removeAnswersFrom,
    consultationType,
    setConsultationType,
  } = useSession();

  const [view, setView] = useState("complaint"); // "complaint" | "question" | "recap"
  const [currentQuestionId, setCurrentQuestionId] = useState(null);
  const [visitedStack, setVisitedStack] = useState([]);

  // Guard: must have consented and registered before history taking.
  useEffect(() => {
    if (consent.given !== true) {
      navigate("/consent", { replace: true });
    } else if (!patient.name) {
      navigate("/details", { replace: true });
    }
  }, [consent, patient, navigate]);

  // A patient can reach /history directly (e.g. choosing "Modern Medicine"
  // on the consultation-type screen, or an existing deep link/back button
  // from before Phase 7). Either way this is the modern flow, so keep
  // consultationType consistent with that for any later phase that reads it.
  useEffect(() => {
    if (consultationType == null) setConsultationType("modern");
  }, [consultationType, setConsultationType]);

  const tree = clinicalHistory.chiefComplaintId
    ? getTreeForComplaint(clinicalHistory.chiefComplaintId)
    : null;

  const handleSelectComplaint = (complaintId, complaintLabel) => {
    startClinicalHistory(complaintId, complaintLabel);
    const selectedTree = getTreeForComplaint(complaintId);
    const first = getFirstQuestion(selectedTree);
    setVisitedStack([]);
    setCurrentQuestionId(first.id);
    setView("question");
  };

  const handleAnswer = (value, valueLabel) => {
    const question = getQuestion(tree, currentQuestionId);
    recordAnswer({
      questionId: question.id,
      questionText: question.text,
      type: question.type,
      value,
      valueLabel,
    });

    const nextId = getNextQuestionId(question, value);
    setVisitedStack((prev) => [...prev, question.id]);

    if (isEnd(nextId)) {
      setView("recap");
    } else {
      setCurrentQuestionId(nextId);
    }
  };

  const handleBack = () => {
    if (visitedStack.length === 0) return;
    const prevId = visitedStack[visitedStack.length - 1];
    setVisitedStack((prev) => prev.slice(0, -1));
    removeAnswersFrom(prevId);
    setCurrentQuestionId(prevId);
    setView("question");
  };

  const handleRestart = () => {
    setView("complaint");
    setCurrentQuestionId(null);
    setVisitedStack([]);
  };

  if (view === "complaint" || !tree) {
    return <ChiefComplaintStep onSelect={handleSelectComplaint} languageCode={languageCode ?? "en"} />;
  }

  if (view === "question") {
    const question = getQuestion(tree, currentQuestionId);
    if (!question)
      return <ChiefComplaintStep onSelect={handleSelectComplaint} languageCode={languageCode ?? "en"} />;
    return (
      <QuestionStep
        question={question}
        onAnswer={handleAnswer}
        onBack={handleBack}
        canGoBack={visitedStack.length > 0}
        questionNumber={visitedStack.length + 1}
        languageCode={languageCode ?? "en"}
      />
    );
  }

  return (
    <RecapStep
      chiefComplaintLabel={clinicalHistory.chiefComplaintLabel}
      answers={clinicalHistory.answers}
      onRestart={handleRestart}
    />
  );
}
