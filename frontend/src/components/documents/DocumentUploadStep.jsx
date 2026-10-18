import { useRef, useState } from "react";
import { UploadCloud, FileText, Loader2, RotateCcw, Check, X, Radio, AlertCircle } from "lucide-react";
import { extractDocumentFields, FIELD_LABELS } from "../../services/ocrService.js";
import { analyzeMedicalDocument } from "../../services/aiDocumentService.js";
import { Brain, ShieldAlert } from "lucide-react";
import ConfidenceBadge from "./ConfidenceBadge.jsx";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB
const FIELD_KEYS = Object.keys(FIELD_LABELS);

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Handles ONE document being added: choose a file, preview it, run it
 * through the OCR service, let the patient/staff review and correct the
 * extracted fields, then hand a finished record back via onSave.
 */
export default function DocumentUploadStep({ documentType, onSave, onCancel, patient, clinicalHistory }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileKind, setFileKind] = useState(null); // "image" | "pdf"
  const [status, setStatus] = useState("idle"); // idle | processing | review | error
  const [fields, setFields] = useState(null);
  const [engineLabel, setEngineLabel] = useState("");
  const [isMock, setIsMock] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [validation, setValidation] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [analysisStatus, setAnalysisStatus] = useState("idle"); // idle | processing | done | error
  const [analysisError, setAnalysisError] = useState("");

  const resetFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setFileKind(null);
    setStatus("idle");
    setFields(null);
    setErrorMsg("");
    setValidation(null);
    setAnalysis(null);
    setAnalysisStatus("idle");
    setAnalysisError("");
  };

  const handleFileChange = (event) => {
    const selected = event.target.files?.[0];
    event.target.value = ""; // allow re-selecting the same file afterwards
    if (!selected) return;

    if (!ACCEPTED_TYPES.includes(selected.type)) {
      setErrorMsg("Please upload a JPG, PNG, WEBP image or a PDF file.");
      return;
    }
    if (selected.size > MAX_FILE_BYTES) {
      setErrorMsg("That file is too large. Please upload a file under 10MB.");
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const kind = selected.type === "application/pdf" ? "pdf" : "image";
    setFile(selected);
    setFileKind(kind);
    setPreviewUrl(kind === "image" ? URL.createObjectURL(selected) : null);
    setStatus("idle");
    setFields(null);
    setErrorMsg("");
  };

  const handleExtract = async () => {
    if (!file) return;
    setStatus("processing");
    setErrorMsg("");
    setValidation(null);
    setAnalysis(null);
    setAnalysisError("");
    setAnalysisStatus("processing");
    try {
      const result = await extractDocumentFields(file, { documentTypeId: documentType.id });
      setFields(result.fields);
      setValidation(result.validation ?? { valid: result.isValid !== false, reason: result.validationReason });
      setEngineLabel(result.engineLabel);
      setIsMock(result.isMock);
      setStatus("review");

      // Run document-aware AI analysis independently of OCR/demo extraction.
      try {
        const aiResult = await analyzeMedicalDocument(file, {
          patientAge: patient?.age || null,
          patientGender: patient?.gender || null,
          chiefComplaint: clinicalHistory?.chiefComplaintLabel || null,
          documentType: documentType.label,
        });
        setAnalysis(aiResult);
        setAnalysisStatus("done");
      } catch (aiError) {
        setAnalysisStatus("error");
        setAnalysisError(aiError.message || "AI analysis could not be completed.");
      }
    } catch (err) {
      setAnalysisStatus("idle");
      setErrorMsg(err.message || "Could not process this document. Please try again.");
      setStatus("error");
    }
  };

  const handleFieldEdit = (key, value) => {
    setFields((prev) => ({ ...prev, [key]: { ...prev[key], value } }));
  };

  const handleSave = () => {
    if (!validation?.valid) {
      setErrorMsg(validation?.reason || "This document could not be validated as a supported medical document.");
      return;
    }
    onSave({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      typeId: documentType.id,
      typeLabel: documentType.label,
      fileName: file.name,
      fileSize: file.size,
      fileKind,
      previewUrl,
      extractedFields: fields,
      aiAnalysis: analysis,
      isMockOcr: isMock,
      engineLabel,
      uploadedAt: new Date().toISOString(),
    });
  };

  const populatedFieldKeys = fields ? FIELD_KEYS.filter((key) => fields[key]) : [];

  const validationBanner = validation && (
    <div className={`mt-4 rounded-xl border p-3 text-sm font-semibold ${validation.valid ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-800"}`}>
      {validation.valid ? "✓ Document validated" : "✕ Document not validated"}
      {validation.reason ? ` — ${validation.reason}` : ""}
    </div>
  );

  return (
    <div className="rounded-kiosk border border-border bg-surface p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-ink">Upload: {documentType.label}</h2>
        <button
          type="button"
          onClick={onCancel}
          className="shrink-0 text-sm font-semibold text-muted transition hover:text-ink"
        >
          Cancel
        </button>
      </div>

      {!file && (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex w-full flex-col items-center gap-2 rounded-kiosk border-2 border-dashed border-border bg-canvas py-10 text-muted transition hover:border-primary hover:text-primary"
          >
            <UploadCloud size={28} />
            <span className="text-sm font-semibold">Tap to choose an image or PDF</span>
            <span className="text-xs">JPG, PNG, WEBP or PDF &middot; up to 10MB</span>
          </button>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}

      {errorMsg && status !== "processing" && (
        <p className="mt-3 flex items-start gap-2 text-sm text-alert">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          {errorMsg}
        </p>
      )}

      {file && (
        <div className="mt-4">
          <div className="flex items-center gap-3 rounded-kiosk border border-border bg-canvas p-3">
            {fileKind === "image" ? (
              <img
                src={previewUrl}
                alt="Uploaded document preview"
                className="h-16 w-16 shrink-0 rounded-lg object-cover"
              />
            ) : (
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-primary-light text-primary">
                <FileText size={26} />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink">{file.name}</p>
              <p className="text-xs text-muted">{formatFileSize(file.size)}</p>
            </div>
            <button
              type="button"
              onClick={resetFile}
              disabled={status === "processing"}
              className="shrink-0 rounded-lg p-2 text-muted transition hover:bg-border/40 hover:text-ink disabled:opacity-40"
              aria-label="Remove file"
            >
              <X size={18} />
            </button>
          </div>

          {status === "idle" && (
            <button type="button" onClick={handleExtract} className="kiosk-btn-primary mt-4 w-full">
              Extract details
            </button>
          )}

          {status === "processing" && (
            <div className="mt-4 flex flex-col items-center gap-2 rounded-kiosk border border-border bg-canvas py-6 text-muted">
              <Loader2 size={26} className="animate-spin text-primary" />
              <p className="text-sm">Reading document and preparing AI analysis&hellip;</p>
            </div>
          )}

          {status === "error" && (
            <button type="button" onClick={handleExtract} className="kiosk-btn-secondary mt-4 w-full">
              <RotateCcw size={18} />
              Try again
            </button>
          )}

          {status === "review" && fields && (
            <div className="mt-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-light px-2.5 py-1 text-xs font-semibold text-accent-dark">
                <Radio size={12} />
                {isMock ? "Demo OCR Mode" : engineLabel}
              </span>
              {isMock && (
                <p className="mt-1.5 text-xs text-muted">
                  Fictional extracted data for demonstration — this was not actually read from
                  your file. Please check and correct anything below before saving.
                </p>
              )}

              {analysisStatus === "processing" && (
                <div className="mt-4 flex items-center gap-3 rounded-xl border border-primary/20 bg-primary-light p-4">
                  <Brain size={22} className="shrink-0 animate-pulse text-primary" />
                  <div>
                    <p className="text-sm font-bold text-ink">AI is analyzing the document</p>
                    <p className="text-xs text-muted">Checking findings, possible red flags and the safest next step.</p>
                  </div>
                </div>
              )}

              {analysisStatus === "error" && (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                  <p className="font-semibold">AI analysis unavailable</p>
                  <p className="mt-1">{analysisError}</p>
                </div>
              )}

              {analysis && (
                <div className={`mt-4 rounded-xl border p-4 ${
                  analysis.decision === "EMERGENCY" ? "border-red-300 bg-red-50" :
                  analysis.decision === "URGENT" ? "border-amber-300 bg-amber-50" :
                  analysis.decision === "UNCLEAR" ? "border-slate-300 bg-slate-50" :
                  "border-green-300 bg-green-50"
                }`}>
                  <div className="flex items-start gap-3">
                    <ShieldAlert size={22} className="mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-bold">AI decision: {analysis.decision}</p>
                        <span className="rounded-full bg-white/70 px-2 py-0.5 text-xs font-semibold">
                          {Math.round(Number(analysis.confidence || 0) * 100)}% confidence
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6">{analysis.summary}</p>

                      {analysis.keyFindings?.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-bold uppercase tracking-wide">Key findings</p>
                          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
                            {analysis.keyFindings.map((item, i) => <li key={i}>{item}</li>)}
                          </ul>
                        </div>
                      )}

                      {analysis.redFlags?.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-bold uppercase tracking-wide">Red flags</p>
                          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
                            {analysis.redFlags.map((item, i) => <li key={i}>{item}</li>)}
                          </ul>
                        </div>
                      )}

                      {analysis.nextSteps?.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-bold uppercase tracking-wide">Recommended next steps</p>
                          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
                            {analysis.nextSteps.map((item, i) => <li key={i}>{item}</li>)}
                          </ul>
                        </div>
                      )}

                      <p className="mt-3 text-xs font-medium opacity-80">
                        {analysis.disclaimer || "AI decision support is not a diagnosis and does not replace a qualified clinician."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {populatedFieldKeys.length === 0 ? (
                <p className="mt-3 text-sm text-muted">
                  No fields applied to this document type.
                </p>
              ) : (
                <div className="mt-3 space-y-4">
                  {populatedFieldKeys.map((key) => (
                    <div key={key}>
                      <div className="flex items-center justify-between gap-2">
                        <label className="text-sm font-semibold text-ink">{FIELD_LABELS[key]}</label>
                        <ConfidenceBadge confidence={fields[key].confidence} />
                      </div>
                      <textarea
                        value={fields[key].value}
                        onChange={(event) => handleFieldEdit(key, event.target.value)}
                        rows={2}
                        className="mt-1.5 w-full rounded-kiosk border-2 border-border bg-canvas px-3 py-2.5 text-sm text-ink outline-none focus:border-primary"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                <button type="button" onClick={handleSave} className="kiosk-btn-primary flex-1">
                  <Check size={18} />
                  Save document
                </button>
                <button type="button" onClick={handleExtract} className="kiosk-btn-secondary">
                  <RotateCcw size={18} />
                  Re-run OCR
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
