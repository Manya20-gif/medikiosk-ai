// PHASE 10 — ABDM/FHIR Prototype Integration.
//
// Basic, best-effort validation performed *before* generating a FHIR
// bundle for a patient record. This is deliberately not a full FHIR
// conformance validator (that would need a real terminology server and
// structure-definition checks) — it only checks the handful of things
// this prototype can meaningfully verify from the data already in the
// app, per the Phase 10 brief. Never claim more than that in the UI.

const UNIT_HINT_PATTERN = /(mg\/dl|g\/dl|mmhg|mmol|bpm|%|kg|mg|iu\/l|units?)/i;

function hasNumericValue(text) {
  return /\d/.test(text || "");
}

/**
 * @param {object} record DoctorRecord (services/doctorService.js shape)
 * @returns {{ valid: boolean, errors: string[], warnings: string[] }}
 */
export function validateRecordForFhir(record) {
  const errors = [];
  const warnings = [];

  if (!record?.patientId) {
    errors.push("Patient identifier is missing — cannot generate a FHIR Patient resource.");
  }
  if (!record?.name || record.name === "Unnamed patient") {
    errors.push("Patient name is missing — cannot generate a FHIR Patient resource.");
  }
  if (!record?.consultationType) {
    errors.push("Encounter/consultation type is missing.");
  }

  (record?.documents || []).forEach((doc) => {
    if (doc.uploadedAt && Number.isNaN(Date.parse(doc.uploadedAt))) {
      errors.push(`Document "${doc.fileName}" has an invalid date and was skipped.`);
    }
    const resultValue = doc.extractedFields?.result?.value;
    if (resultValue && hasNumericValue(resultValue) && !UNIT_HINT_PATTERN.test(resultValue)) {
      warnings.push(`Observation from "${doc.fileName}" may be missing a unit — please verify manually.`);
    }
  });

  return { valid: errors.length === 0, errors, warnings };
}
