import { redFlagRules } from "../data/redFlagRules.js";

// Shown on every red-flag alert so nobody mistakes this for a clinician's
// own assessment. The physician remains responsible for the final call.
export const AI_SAFETY_DISCLAIMER = "AI-generated safety alert — requires clinician verification.";

function buildAnswerLookup(answers = []) {
  const map = new Map();
  answers.forEach((answer) => map.set(answer.questionId, answer));
  return map;
}

function recommendationFor(severity) {
  return severity === "High"
    ? "Please inform the healthcare professional immediately."
    : "Please mention this to the healthcare professional during the consultation.";
}

/**
 * Rule-based, deterministic red-flag screening — NOT autonomous diagnosis.
 * Every rule lives in data/redFlagRules.js and is plain, readable code a
 * clinician can audit. This only ever returns symptom-pattern flags and a
 * recommendation to seek professional evaluation; it never names a
 * condition or diagnosis.
 *
 * @param {{ chiefComplaintId: string|null, answers: Array }} clinicalHistory
 * @returns {Array<{ id: string, symptom: string, reason: string, severity: "High"|"Moderate", recommendation: string }>}
 */
export function detectRedFlags(clinicalHistory) {
  if (!clinicalHistory?.chiefComplaintId || !clinicalHistory.answers?.length) return [];

  const answers = buildAnswerLookup(clinicalHistory.answers);

  return redFlagRules
    .filter((rule) => rule.complaintId === clinicalHistory.chiefComplaintId)
    .filter((rule) => {
      try {
        return Boolean(rule.test(answers));
      } catch {
        // A rule referencing a question the patient never reached should
        // never crash the app — treat it as "not triggered".
        return false;
      }
    })
    .map((rule) => ({
      id: rule.id,
      symptom: rule.symptom,
      reason: rule.reason,
      severity: rule.severity,
      recommendation: recommendationFor(rule.severity),
    }))
    .sort((a, b) => (a.severity === b.severity ? 0 : a.severity === "High" ? -1 : 1));
}
