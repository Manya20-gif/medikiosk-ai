// PHASE 9 — Doctor Dashboard data flow.
//
// The dashboard needs to show patients from two sources:
//  1. The LIVE kiosk session in SessionContext (today's real walk-in,
//     if the patient made it through /details).
//  2. A fictional DEMO patient list (data/demoDoctorPatients.js) so the
//     dashboard is browsable on its own for a demo/review.
//
// Both are normalised into the same "DoctorRecord" shape here, and both
// run through the *same* redFlagService.detectRedFlags() and
// timelineUtils.buildTimelineEvents() already used by the patient-facing
// flow — so a demo patient's red flags/timeline are computed exactly the
// way a real one's would be, not hand-faked separately.
//
// This file only shapes and derives from data that already exists
// elsewhere (session state, demo bank, existing services) — like
// summaryUtils.js, it computes no new clinical judgement of its own.

import { detectRedFlags } from "./redFlagService.js";
import { buildTimelineEvents } from "../utils/timelineUtils.js";
import { demoDoctorPatients } from "../data/demoDoctorPatients.js";

export const CONSULTATION_STATUSES = [
  "Intake Completed",
  "Under Review",
  "Consultation Started",
  "Consultation Completed",
];

const GENDER_LABELS = { male: "Male", female: "Female", other: "Other" };

function genderLabel(gender) {
  return GENDER_LABELS[gender] ?? gender ?? "Not recorded";
}

/**
 * Buckets a 1–10 severity answer (or a token like fever's "high") into a
 * clinician-scannable label. Never used to infer anything beyond what the
 * patient reported on that single scale question.
 */
export function bucketSeverity(answers) {
  const severityAnswer = answers?.find((a) => a.questionId === "severity");
  if (!severityAnswer) return { label: "Not recorded", tone: "neutral", raw: null };

  const numeric = Number(severityAnswer.value);
  if (!Number.isNaN(numeric)) {
    if (numeric >= 7) return { label: `Severe (${numeric}/10)`, tone: "alert", raw: numeric };
    if (numeric >= 4) return { label: `Moderate (${numeric}/10)`, tone: "accent", raw: numeric };
    return { label: `Mild (${numeric}/10)`, tone: "success", raw: numeric };
  }
  // Non-numeric severity tokens (e.g. fever's "high" / "mild" / "moderate")
  const label = severityAnswer.valueLabel ?? String(severityAnswer.value);
  const tone = /high|severe/i.test(String(severityAnswer.value)) ? "alert" : "accent";
  return { label, tone, raw: severityAnswer.value };
}

function durationLabel(answers) {
  const onsetAnswer = answers?.find((a) => a.questionId === "onset");
  if (!onsetAnswer) return "Not recorded";
  return Array.isArray(onsetAnswer.valueLabel) ? onsetAnswer.valueLabel.join(", ") : onsetAnswer.valueLabel;
}

function documentSummaryCounts(documents) {
  const medicines = new Set();
  const conditions = new Set();
  documents.forEach((doc) => {
    const fields = doc.extractedFields ?? {};
    if (fields.medicine?.value) medicines.add(fields.medicine.value);
    if (fields.diagnosis?.value) conditions.add(fields.diagnosis.value);
  });
  return { medicines: [...medicines], conditions: [...conditions] };
}

/**
 * Builds the normalised DoctorRecord for whichever patient is common to
 * every panel on the dashboard.
 */
function normalizeRecord({
  id,
  isLive,
  patientId,
  patient,
  consultationType,
  clinicalHistory,
  ayushHistory,
  documents,
  allergies,
  currentMedicines,
  previousConditions,
}) {
  const safeClinicalHistory = clinicalHistory?.chiefComplaintId
    ? clinicalHistory
    : { chiefComplaintId: null, chiefComplaintLabel: null, answers: [] };
  const safeDocuments = documents ?? [];
  const redFlags = detectRedFlags(safeClinicalHistory);
  const timelineEvents = buildTimelineEvents({
    documents: safeDocuments,
    clinicalHistory: safeClinicalHistory,
    redFlags,
  });
  const hasAyushHistory = Object.values(ayushHistory ?? {}).some((arr) => (arr ?? []).length > 0);
  const docCounts = documentSummaryCounts(safeDocuments);

  return {
    id,
    isLive,
    patientId,
    patient,
    name: patient?.name || "Unnamed patient",
    age: patient?.age || null,
    gender: genderLabel(patient?.gender),
    consultationType: consultationType ?? "modern",
    chiefComplaintLabel: safeClinicalHistory.chiefComplaintLabel,
    clinicalHistory: safeClinicalHistory,
    ayushHistory: ayushHistory ?? null,
    hasAyushHistory,
    documents: safeDocuments,
    redFlags,
    timelineEvents,
    severity: bucketSeverity(safeClinicalHistory.answers),
    duration: durationLabel(safeClinicalHistory.answers),
    // Allergies/medicines/conditions: hand-authored for demo patients (the
    // Phase 1–8 intake flow doesn't collect these directly); for the live
    // session, derived only from what documents actually contain — never
    // invented.
    allergies: allergies ?? "Not recorded during intake",
    currentMedicines: currentMedicines ?? docCounts.medicines,
    previousConditions: previousConditions ?? docCounts.conditions,
  };
}

function normalizeDemoPatient(entry) {
  return normalizeRecord({
    id: entry.id,
    isLive: false,
    patientId: entry.patientId,
    patient: entry.patient,
    consultationType: entry.consultationType,
    clinicalHistory: entry.clinicalHistory,
    ayushHistory: entry.ayushHistory,
    documents: entry.documents,
    allergies: entry.allergies,
    currentMedicines: entry.currentMedicines,
    previousConditions: entry.previousConditions,
  });
}

/**
 * Builds the DoctorRecord for today's live kiosk session, or null if no
 * patient has come through /details yet this session.
 */
export function buildLiveRecord(session) {
  if (!session?.patient?.name) return null;
  return normalizeRecord({
    id: "live-session",
    isLive: true,
    patientId: "MK-2026-LIVE",
    patient: session.patient,
    consultationType: session.consultationType,
    clinicalHistory: session.clinicalHistory,
    ayushHistory: session.ayushHistory,
    documents: session.documents,
  });
}

/**
 * All patients the dashboard can show: today's live session first (if
 * any), followed by the demo bank.
 */
export function getAllDoctorRecords(session) {
  const live = buildLiveRecord(session);
  const demo = demoDoctorPatients.map(normalizeDemoPatient);
  return live ? [live, ...demo] : demo;
}

export function filterRecords(records, { query = "", consultationType = "all", redFlagOnly = false } = {}) {
  const q = query.trim().toLowerCase();
  return records.filter((r) => {
    if (q && !r.name.toLowerCase().includes(q) && !(r.chiefComplaintLabel ?? "").toLowerCase().includes(q)) {
      return false;
    }
    if (consultationType !== "all" && r.consultationType !== consultationType) return false;
    if (redFlagOnly && r.redFlags.length === 0) return false;
    return true;
  });
}

/**
 * "Important Findings" — pulls together only what's already known
 * elsewhere (red flags, extracted document fields, reported symptoms),
 * each labelled with where it came from. Never invents a finding.
 */
export function buildImportantFindings(record) {
  const findings = [];

  record.redFlags.forEach((flag) => {
    findings.push({
      id: `flag-${flag.id}`,
      tag: "AI-generated",
      tagTone: "alert",
      label: flag.symptom,
      detail: flag.reason,
      needsVerification: true,
    });
  });

  record.documents.forEach((doc) => {
    const fields = doc.extractedFields ?? {};
    if (fields.result?.value) {
      findings.push({
        id: `${doc.id}-result`,
        tag: "Extracted from document",
        tagTone: "primary",
        label: `${doc.typeLabel}: ${fields.result.value}`,
        detail: fields.investigation?.value ? `Investigation: ${fields.investigation.value}` : doc.fileName,
        needsVerification: true,
      });
    }
    if (fields.medicine?.value) {
      findings.push({
        id: `${doc.id}-medicine`,
        tag: "Extracted from document",
        tagTone: "primary",
        label: fields.medicine.value,
        detail: fields.dosage?.value ?? doc.typeLabel,
        needsVerification: true,
      });
    }
  });

  if (record.chiefComplaintLabel) {
    findings.push({
      id: "reported-chief-complaint",
      tag: "Reported",
      tagTone: "muted",
      label: record.chiefComplaintLabel,
      detail: `Duration: ${record.duration} · Severity: ${record.severity.label}`,
      needsVerification: false,
    });
  }

  return findings;
}

export function consultationTypeLabel(consultationType) {
  return consultationType === "ayush" ? "AYUSH / Ayurveda" : "Modern Medicine";
}
