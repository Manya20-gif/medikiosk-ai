// PHASE 10 — ABDM/FHIR Prototype Integration.
//
// Pure mapping functions: DoctorRecord (services/doctorService.js shape)
// -> mock FHIR R4-shaped resource objects. Nothing here calls a network,
// stores anything, or talks to real ABDM/FHIR infrastructure — it only
// *reshapes* data that already exists elsewhere in the app (patient,
// clinicalHistory, ayushHistory, documents, redFlags) into resources
// that look like what a real ABDM-compliant backend would exchange.
//
// IMPORTANT — this is a "FHIR-shaped" prototype, not a certified FHIR
// implementation: fields are populated on a best-effort basis from
// whatever the demo/live session already collected, and several real
// FHIR requirements (full terminology bindings, code systems, complete
// cardinality) are simplified for a hackathon prototype. See
// fhirValidator.js for the (also best-effort) checks this project does
// perform before a bundle is generated.
//
// Every resource created here is tagged with a `meta.tag` marking it as
// prototype/mock data — never presented as if it came from a real ABDM
// health record.

const MOCK_TAG = {
  system: "https://medikiosk.demo/fhir/mock",
  code: "prototype",
  display: "ABDM/FHIR Prototype Integration — mock data, not connected to real ABDM",
};

function patientResourceId(record) {
  return `patient-${record.patientId || record.id}`;
}

function patientReference(record) {
  return { reference: `Patient/${patientResourceId(record)}`, display: record.name };
}

function mapGenderCode(rawGender) {
  if (rawGender === "male" || rawGender === "female" || rawGender === "other") return rawGender;
  return "unknown";
}

/**
 * FHIR Patient resources use `birthDate`, not age — we only ever collect
 * age. Rather than inventing a false birthdate, this derives an
 * approximate birth year from the reported age and clearly flags it as
 * approximate/demo-derived instead of presenting it as an exact DOB.
 */
function approximateBirthDate(age) {
  const numericAge = Number(age);
  if (!age || Number.isNaN(numericAge)) return null;
  const year = new Date().getFullYear() - Math.floor(numericAge);
  return `${year}-01-01`;
}

export function createPatientResource(record) {
  const { patient } = record;
  const birthDate = approximateBirthDate(patient?.age);

  return {
    resourceType: "Patient",
    id: patientResourceId(record),
    meta: { tag: [MOCK_TAG] },
    identifier: [
      { system: "https://medikiosk.demo/patient-id", value: record.patientId || record.id },
      ...(patient?.abhaId ? [{ system: "https://healthid.abdm.gov.in/ABHA (demo)", value: patient.abhaId }] : []),
    ],
    name: [{ text: record.name || "Unnamed patient" }],
    gender: mapGenderCode(patient?.gender),
    ...(birthDate
      ? {
          birthDate,
          _birthDate: { extension: [{ url: "note", valueString: "Approximate — derived from reported age (demo)" }] },
        }
      : {}),
    telecom: patient?.contact ? [{ system: "phone", value: patient.contact, use: "mobile" }] : [],
  };
}

export function createEncounterResource(record) {
  return {
    resourceType: "Encounter",
    id: `encounter-${record.id}`,
    meta: { tag: [MOCK_TAG] },
    status: record.isLive ? "in-progress" : "finished",
    class: {
      system: "https://medikiosk.demo/fhir/consultation-type",
      code: record.consultationType === "ayush" ? "AYUSH" : "AMB",
      display: record.consultationType === "ayush" ? "AYUSH consultation" : "Ambulatory (modern medicine)",
    },
    type: record.chiefComplaintLabel ? [{ text: record.chiefComplaintLabel }] : [],
    subject: patientReference(record),
    period: { start: new Date().toISOString() },
    reasonCode: record.chiefComplaintLabel ? [{ text: record.chiefComplaintLabel }] : [],
  };
}

// Phrases that mean "no allergy" rather than naming one — never turned
// into an AllergyIntolerance resource.
const NO_ALLERGY_PHRASES = ["no known allerg", "not reported", "not recorded"];

export function createAllergyIntoleranceResource(record) {
  const raw = (record.allergies || "").trim();
  if (!raw || NO_ALLERGY_PHRASES.some((p) => raw.toLowerCase().includes(p))) return [];

  return raw.split(",").map((entry, idx) => ({
    resourceType: "AllergyIntolerance",
    id: `allergy-${record.id}-${idx}`,
    meta: { tag: [MOCK_TAG] },
    clinicalStatus: { coding: [{ code: "active", display: "Active" }] },
    verificationStatus: { coding: [{ code: "unconfirmed", display: "Unconfirmed — patient-reported" }] },
    code: { text: entry.trim() },
    patient: patientReference(record),
  }));
}

export function createMedicationStatementResource(record) {
  const fromReported = (record.currentMedicines || []).map((text, idx) => ({
    resourceType: "MedicationStatement",
    id: `medstatement-reported-${record.id}-${idx}`,
    meta: { tag: [MOCK_TAG] },
    status: "active",
    medicationCodeableConcept: { text },
    subject: patientReference(record),
    extension: [{ url: "source", valueString: "Patient-reported / demo data" }],
  }));

  const fromDocuments = (record.documents || [])
    .filter((doc) => doc.extractedFields?.medicine?.value)
    .map((doc) => ({
      resourceType: "MedicationStatement",
      id: `medstatement-doc-${doc.id}`,
      meta: { tag: [MOCK_TAG] },
      status: "active",
      medicationCodeableConcept: { text: doc.extractedFields.medicine.value },
      dosage: doc.extractedFields.dosage?.value ? [{ text: doc.extractedFields.dosage.value }] : [],
      subject: patientReference(record),
      dateAsserted: doc.uploadedAt,
      extension: [{ url: "source", valueString: `Uploaded document (${doc.typeLabel}, demo OCR)` }],
    }));

  return [...fromReported, ...fromDocuments];
}

export function createConditionResource(record) {
  const fromReported = (record.previousConditions || []).map((text, idx) => ({
    resourceType: "Condition",
    id: `condition-reported-${record.id}-${idx}`,
    meta: { tag: [MOCK_TAG] },
    clinicalStatus: { coding: [{ code: "active", display: "Active" }] },
    verificationStatus: { coding: [{ code: "unconfirmed", display: "Unconfirmed — not yet clinician-verified" }] },
    code: { text },
    subject: patientReference(record),
    extension: [{ url: "source", valueString: "Patient-reported / demo history" }],
  }));

  const fromDocuments = (record.documents || [])
    .filter((doc) => doc.extractedFields?.diagnosis?.value)
    .map((doc) => ({
      resourceType: "Condition",
      id: `condition-doc-${doc.id}`,
      meta: { tag: [MOCK_TAG] },
      clinicalStatus: { coding: [{ code: "active", display: "Active" }] },
      verificationStatus: { coding: [{ code: "unconfirmed", display: "Unconfirmed — not yet clinician-verified" }] },
      code: { text: doc.extractedFields.diagnosis.value },
      subject: patientReference(record),
      recordedDate: doc.uploadedAt,
      extension: [{ url: "source", valueString: `Uploaded document (${doc.typeLabel}, demo OCR)` }],
    }));

  return [...fromReported, ...fromDocuments];
}

function severityObservation(record) {
  const severityAnswer = record.clinicalHistory?.answers?.find((a) => a.questionId === "severity");
  if (!severityAnswer) return null;

  return {
    resourceType: "Observation",
    id: `observation-severity-${record.id}`,
    meta: { tag: [MOCK_TAG] },
    status: "final",
    code: { text: "Reported symptom severity" },
    subject: patientReference(record),
    effectiveDateTime: new Date().toISOString(),
    valueString: severityAnswer.valueLabel ?? String(severityAnswer.value),
    extension: [{ url: "source", valueString: "Patient input" }],
  };
}

export function createObservationResource(record) {
  const fromDocuments = (record.documents || [])
    .filter((doc) => doc.extractedFields?.result?.value || doc.extractedFields?.investigation?.value)
    .map((doc) => ({
      resourceType: "Observation",
      id: `observation-doc-${doc.id}`,
      meta: { tag: [MOCK_TAG] },
      status: "final",
      code: { text: doc.extractedFields.investigation?.value || "Investigation result" },
      subject: patientReference(record),
      effectiveDateTime: doc.uploadedAt,
      valueString: doc.extractedFields.result?.value ?? "Not specified",
      extension: [{ url: "source", valueString: `Uploaded document (${doc.typeLabel}, demo OCR)` }],
    }));

  const severity = severityObservation(record);
  return severity ? [severity, ...fromDocuments] : fromDocuments;
}

const DOC_CONTENT_TYPE_BY_KIND = { image: "image/jpeg", pdf: "application/pdf" };

export function createDocumentReferenceResource(record) {
  return (record.documents || []).map((doc) => ({
    resourceType: "DocumentReference",
    id: `docref-${doc.id}`,
    meta: { tag: [MOCK_TAG] },
    status: "current",
    type: { text: doc.typeLabel },
    subject: patientReference(record),
    date: doc.uploadedAt,
    description: doc.fileName,
    content: [
      {
        attachment: {
          title: doc.fileName,
          contentType: DOC_CONTENT_TYPE_BY_KIND[doc.fileKind] || "application/octet-stream",
        },
      },
    ],
    extension: [
      {
        url: "processingStatus",
        valueString: doc.isMockOcr ? "Processed via demo OCR (mock, not real text extraction)" : "Processing status unknown",
      },
    ],
  }));
}
