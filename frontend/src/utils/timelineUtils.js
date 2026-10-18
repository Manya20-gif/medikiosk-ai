import { FIELD_LABELS } from "../services/ocrService.js";

function formatDateLabel(timestamp) {
  return new Date(timestamp).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Tries to parse a free-text date (e.g. the demo OCR's "12 Aug 2026") into
 * a sortable timestamp. Returns null instead of NaN so callers can fall
 * back to something else — never throws.
 */
export function parseLooseDate(value) {
  if (!value) return null;
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? null : timestamp;
}

function documentToEvent(doc) {
  const fields = doc.extractedFields || {};
  const dateValue = fields.documentDate?.value ?? null;
  const parsed = parseLooseDate(dateValue);
  const sortDate = parsed ?? new Date(doc.uploadedAt).getTime();

  const description =
    fields.medicine?.value ||
    fields.investigation?.value ||
    fields.diagnosis?.value ||
    fields.result?.value ||
    doc.typeLabel;

  const details = Object.entries(fields)
    .filter(([key, field]) => field && key !== "documentDate")
    .map(([key, field]) => ({
      key,
      label: FIELD_LABELS[key] ?? key,
      value: field.value,
      confidence: field.confidence,
    }));

  return {
    id: doc.id,
    sortDate,
    dateLabel: dateValue ?? formatDateLabel(sortDate),
    type: doc.typeId,
    title: doc.typeLabel,
    description,
    source: `Document · ${doc.fileName}`,
    details,
    isMockOcr: doc.isMockOcr,
    redFlags: [],
  };
}

function historyToEvent(clinicalHistory, redFlags) {
  const now = Date.now();
  const summary = clinicalHistory.answers
    .slice(0, 2)
    .map((a) => (Array.isArray(a.valueLabel) ? a.valueLabel.join(", ") : a.valueLabel))
    .filter(Boolean)
    .join(" · ");

  return {
    id: "current-visit",
    sortDate: now,
    dateLabel: formatDateLabel(now),
    type: "current_visit",
    title: `Current visit — ${clinicalHistory.chiefComplaintLabel}`,
    description: summary || "Reported via kiosk today",
    source: "Today's history-taking",
    details: clinicalHistory.answers.map((a) => ({
      key: a.questionId,
      label: a.questionText,
      value: Array.isArray(a.valueLabel) ? a.valueLabel.join(", ") : a.valueLabel,
    })),
    isMockOcr: false,
    redFlags,
  };
}

/**
 * Combines uploaded documents (Phase 5) and today's clinical history into
 * one chronological list, newest first. Handles an entirely empty session
 * gracefully — returns [].
 * @param {{ documents?: Array, clinicalHistory: object, redFlags?: Array }} input
 */
export function buildTimelineEvents({ documents = [], clinicalHistory, redFlags = [] }) {
  const events = documents.map(documentToEvent);

  if (clinicalHistory?.chiefComplaintId && clinicalHistory.answers?.length > 0) {
    events.push(historyToEvent(clinicalHistory, redFlags));
  }

  return events.sort((a, b) => b.sortDate - a.sortDate);
}
