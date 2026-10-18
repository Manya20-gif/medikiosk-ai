// PHASE 8 — Structured clinical summary.
//
// Combines everything already gathered elsewhere in the session
// (patient details, today's case-taking, uploaded documents, the Phase 6
// timeline + red flags) into one plain object a clinician-facing screen
// can render. This file only *shapes* data that already exists — it
// computes no new clinical judgement, score, or diagnosis of its own.

/**
 * @param {object} input
 * @returns {object} A structured, read-only summary of the visit so far.
 */
export function buildClinicalSummary({
  patient,
  consultationType,
  clinicalHistory,
  ayushHistory,
  documents = [],
  timelineEvents = [],
  redFlags = [],
}) {
  const highestSeverity = redFlags.some((f) => f.severity === "High")
    ? "High"
    : redFlags.length > 0
    ? "Moderate"
    : null;

  const hasModernHistory = Boolean(clinicalHistory?.chiefComplaintId && clinicalHistory.answers?.length);
  const hasAyushHistory = Object.values(ayushHistory ?? {}).some((answers) => answers.length > 0);

  return {
    generatedAt: new Date().toISOString(),
    patient: { ...patient },
    consultationType: consultationType ?? "modern",
    chiefComplaintLabel: clinicalHistory?.chiefComplaintLabel ?? null,
    hasModernHistory,
    hasAyushHistory,
    modernAnswerCount: clinicalHistory?.answers?.length ?? 0,
    ayushAnswerCount: Object.values(ayushHistory ?? {}).reduce((sum, arr) => sum + arr.length, 0),
    documentCount: documents.length,
    timelineEventCount: timelineEvents.length,
    redFlagCount: redFlags.length,
    highestSeverity,
  };
}
