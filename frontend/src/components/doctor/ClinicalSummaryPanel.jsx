import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Pencil,
  FileText,
  Sparkles,
} from "lucide-react";

function AnswerList({ answers }) {
  if (!answers || answers.length === 0) {
    return <p className="text-sm text-muted">Not recorded during intake.</p>;
  }
  return (
    <div className="divide-y divide-border rounded-lg border border-border">
      {answers.map((a) => (
        <div key={a.questionId} className="flex items-start justify-between gap-3 px-3 py-2">
          <p className="text-xs text-muted">{a.questionText}</p>
          <p className="text-right text-sm font-semibold text-ink">
            {Array.isArray(a.valueLabel) ? a.valueLabel.join(", ") : a.valueLabel}
          </p>
        </div>
      ))}
    </div>
  );
}

function StringList({ items }) {
  if (!items || items.length === 0) {
    return <p className="text-sm text-muted">Not recorded during intake.</p>;
  }
  return (
    <ul className="list-inside list-disc space-y-1 text-sm text-ink">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function Section({ id, title, defaultOpen = false, aiAssisted = true, verification, onConfirm, onSaveEdit, children }) {
  const [open, setOpen] = useState(defaultOpen);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(verification?.note ?? "");

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2">
          <span className="text-sm font-bold text-ink">{title}</span>
          {verification?.confirmed && (
            <span className="doc-badge bg-success-light text-success">
              <CheckCircle2 size={11} />
              Reviewed
            </span>
          )}
          {verification?.note && (
            <span className="doc-badge bg-accent-light text-accent-dark">
              <Pencil size={11} />
              Edited
            </span>
          )}
        </span>
        {open ? <ChevronUp size={16} className="text-muted" /> : <ChevronDown size={16} className="text-muted" />}
      </button>

      {open && (
        <div className="px-4 pb-4">
          {aiAssisted && (
            <p className="mb-2 flex items-center gap-1 text-[11px] font-medium text-muted">
              <Sparkles size={11} />
              AI-assisted / requires clinician verification
            </p>
          )}
          {children}

          {verification?.note && !editing && (
            <div className="mt-2 rounded-lg bg-accent-light px-3 py-2 text-xs text-accent-dark">
              <span className="font-semibold">Clinician correction: </span>
              {verification.note}
            </div>
          )}

          {editing ? (
            <div className="mt-3 space-y-2">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={3}
                placeholder="Add or correct this section..."
                className="doc-input"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  className="doc-btn-primary"
                  onClick={() => {
                    onSaveEdit(id, draft);
                    setEditing(false);
                  }}
                >
                  Save correction
                </button>
                <button type="button" className="doc-btn-secondary" onClick={() => setEditing(false)}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-3 flex gap-2">
              <button type="button" className="doc-btn-primary" onClick={() => onConfirm(id)}>
                <CheckCircle2 size={14} />
                Confirm section
              </button>
              <button type="button" className="doc-btn-secondary" onClick={() => setEditing(true)}>
                <Pencil size={14} />
                Edit
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * PHASE 9 — structured clinical summary, organised into the standard EMR
 * sections requested for the doctor dashboard. Everything here is
 * assembled from data already collected elsewhere in the session
 * (case-taking answers, uploaded document fields) — sections the current
 * intake flow doesn't ask about (past surgical history, family history)
 * are shown as "Not recorded during intake" rather than invented.
 */
export default function ClinicalSummaryPanel({ record, verification, onConfirm, onSaveEdit }) {
  const investigationDocs = record.documents.filter(
    (d) => d.extractedFields?.investigation?.value || d.extractedFields?.result?.value
  );
  const reviewOfSystems = record.clinicalHistory.answers.find((a) => a.questionId === "associated");
  const personalHistory =
    record.consultationType === "ayush"
      ? (record.ayushHistory?.vihara ?? [])
      : [];

  return (
    <div className="doc-card p-0">
      <div className="flex items-center gap-2 px-4 pt-4">
        <FileText size={17} className="text-primary" />
        <h2 className="text-base font-bold text-ink">Clinical summary</h2>
      </div>
      <p className="px-4 pb-2 pt-1 text-xs text-muted">
        AI-generated summary — organises what the patient reported. Does not diagnose or recommend treatment.
      </p>

      <div className="mt-1">
        <Section
          id="chief_complaint"
          title="Chief Complaint"
          defaultOpen
          verification={verification.chief_complaint}
          onConfirm={onConfirm}
          onSaveEdit={onSaveEdit}
        >
          <p className="text-sm font-semibold text-ink">{record.chiefComplaintLabel ?? "Not recorded"}</p>
        </Section>

        <Section
          id="hpi"
          title="History of Present Illness"
          defaultOpen
          verification={verification.hpi}
          onConfirm={onConfirm}
          onSaveEdit={onSaveEdit}
        >
          <AnswerList answers={record.clinicalHistory.answers} />
        </Section>

        <Section id="pmh" title="Past Medical History" verification={verification.pmh} onConfirm={onConfirm} onSaveEdit={onSaveEdit}>
          <StringList items={record.previousConditions} />
        </Section>

        <Section id="psh" title="Past Surgical History" verification={verification.psh} onConfirm={onConfirm} onSaveEdit={onSaveEdit}>
          <p className="text-sm text-muted">Not recorded during intake.</p>
        </Section>

        <Section id="medications" title="Medications" verification={verification.medications} onConfirm={onConfirm} onSaveEdit={onSaveEdit}>
          <StringList items={record.currentMedicines} />
        </Section>

        <Section id="allergies" title="Allergies" verification={verification.allergies} onConfirm={onConfirm} onSaveEdit={onSaveEdit}>
          <p className="text-sm text-ink">{record.allergies}</p>
        </Section>

        <Section id="family_history" title="Family History" verification={verification.family_history} onConfirm={onConfirm} onSaveEdit={onSaveEdit}>
          <p className="text-sm text-muted">Not recorded during intake.</p>
        </Section>

        <Section id="personal_history" title="Personal History" verification={verification.personal_history} onConfirm={onConfirm} onSaveEdit={onSaveEdit}>
          {personalHistory.length > 0 ? (
            <AnswerList answers={personalHistory} />
          ) : (
            <p className="text-sm text-muted">Not recorded during intake.</p>
          )}
        </Section>

        <Section id="ros" title="Review of Systems" verification={verification.ros} onConfirm={onConfirm} onSaveEdit={onSaveEdit}>
          {reviewOfSystems ? (
            <AnswerList answers={[reviewOfSystems]} />
          ) : (
            <p className="text-sm text-muted">Not recorded during intake.</p>
          )}
        </Section>

        <Section
          id="investigations"
          title="Previous Investigations"
          verification={verification.investigations}
          onConfirm={onConfirm}
          onSaveEdit={onSaveEdit}
        >
          {investigationDocs.length === 0 ? (
            <p className="text-sm text-muted">Not recorded during intake.</p>
          ) : (
            <div className="space-y-2">
              {investigationDocs.map((d) => (
                <div key={d.id} className="rounded-lg border border-border p-2.5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">{d.typeLabel}</p>
                  {d.extractedFields.investigation?.value && (
                    <p className="text-sm text-ink">{d.extractedFields.investigation.value}</p>
                  )}
                  {d.extractedFields.result?.value && (
                    <p className="text-sm text-muted">{d.extractedFields.result.value}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}
