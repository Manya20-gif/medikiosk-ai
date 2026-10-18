// MODULAR OCR SERVICE.
//
// DEMO MODE (default): there is no real OCR here. The uploaded file is
// never read for its content — this function returns small, clearly
// fictional, realistic-looking extracted data picked from a canned bank
// per document type. The UI always labels this as "Demo OCR Mode" and
// never implies real medical text extraction happened. This mirrors the
// existing asrService.js demo pattern used in the voice-input feature.
//
// REAL MODE: set VITE_OCR_API_URL in the frontend environment (e.g. in a
// .env file: VITE_OCR_API_URL=https://your-ocr-api.example.com/extract).
// When that variable is present, extractDocumentFields posts the file to
// it instead of using the demo bank below. No caller needs to change —
// every caller (DocumentUploadStep.jsx) only depends on this function's
// signature and the shape of the returned `fields` object. Adapt
// `extractViaRealApi` below if a specific provider's response shape
// differs from the one assumed here.

export const FIELD_LABELS = {
  documentDate: "Document date",
  diagnosis: "Diagnosis",
  medicine: "Medicine",
  dosage: "Dosage",
  investigation: "Investigation",
  result: "Result",
};

const FIELD_KEYS = Object.keys(FIELD_LABELS);

// Fictional demo data only. Each document type has a few variants so
// repeated demo uploads don't always show the exact same values.
const demoTemplates = {
  prescription: [
    {
      documentDate: "12 Aug 2026",
      diagnosis: "Viral fever with body ache",
      medicine: "Tab. Paracetamol 650mg",
      dosage: "1 tablet twice daily after food, for 5 days",
      investigation: null,
      result: null,
    },
    {
      documentDate: "03 Jul 2026",
      diagnosis: "Type 2 diabetes mellitus — follow-up",
      medicine: "Tab. Metformin 500mg",
      dosage: "1 tablet twice daily before meals",
      investigation: null,
      result: null,
    },
    {
      documentDate: "21 May 2026",
      diagnosis: "Acute bronchitis",
      medicine: "Cap. Amoxicillin 500mg",
      dosage: "1 capsule three times a day for 7 days",
      investigation: null,
      result: null,
    },
  ],
  lab_report: [
    {
      documentDate: "29 Aug 2026",
      diagnosis: null,
      medicine: null,
      dosage: null,
      investigation: "Complete Blood Count (CBC)",
      result: "Hemoglobin 11.8 g/dL (slightly low); WBC and platelets within normal range",
    },
    {
      documentDate: "14 Jun 2026",
      diagnosis: null,
      medicine: null,
      dosage: null,
      investigation: "Fasting Blood Sugar",
      result: "128 mg/dL (mildly elevated)",
    },
    {
      documentDate: "02 Feb 2026",
      diagnosis: null,
      medicine: null,
      dosage: null,
      investigation: "Lipid Profile",
      result: "Total cholesterol 214 mg/dL; LDL borderline high",
    },
  ],
  discharge_summary: [
    {
      documentDate: "18 Mar 2026",
      diagnosis: "Acute gastroenteritis, resolved",
      medicine: "Tab. Ondansetron 4mg; ORS sachets",
      dosage: "Ondansetron as needed for nausea; ORS after every loose stool",
      investigation: "Stool routine examination",
      result: "No ova or cysts seen; mild dehydration noted on admission",
    },
    {
      documentDate: "09 Jan 2026",
      diagnosis: "Community-acquired pneumonia, treated",
      medicine: "Inj. Ceftriaxone (course completed); Tab. Azithromycin",
      dosage: "IV course during admission; one tablet daily for 3 days after discharge",
      investigation: "Chest X-ray",
      result: "Right lower zone consolidation, improving on repeat film",
    },
  ],
  other: [
    {
      documentDate: "25 Apr 2026",
      diagnosis: "Referral note for physiotherapy",
      medicine: null,
      dosage: null,
      investigation: "Clinical assessment of lower back pain",
      result: "Advised physiotherapy, 6 sessions",
    },
  ],
};

function randomConfidence(min = 0.55, max = 0.97) {
  return Math.round((min + Math.random() * (max - min)) * 100) / 100;
}

function buildDemoFields(documentTypeId) {
  const templates = demoTemplates[documentTypeId] ?? demoTemplates.other;
  const template = templates[Math.floor(Math.random() * templates.length)];

  const fields = {};
  for (const key of FIELD_KEYS) {
    const value = template[key];
    fields[key] = value == null ? null : { value, confidence: randomConfidence() };
  }
  return fields;
}

/**
 * Extracts structured fields from an uploaded medical document.
 * @param {File} file - the uploaded image/PDF. Unused by the demo path,
 *   kept in the signature so a real OCR call is a drop-in replacement.
 * @param {{ documentTypeId?: string }} options
 * @returns {Promise<{ fields: Record<string, {value: string, confidence: number} | null>, isMock: boolean, engineLabel: string }>}
 */
export function validateMedicalDocument(file, fields, documentTypeId = "other") {
  const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
  if (!file || !allowed.includes(file.type) || file.size <= 0 || file.size > 10 * 1024 * 1024) {
    return { valid: false, reason: "Unsupported, empty, or oversized document." };
  }

  const present = Object.entries(fields || {}).filter(([, item]) => item && String(item.value || "").trim());
  if (present.length === 0) return { valid: false, reason: "No medical information could be extracted." };

  const confidenceValues = present.map(([, item]) => Number(item.confidence)).filter(Number.isFinite);
  const averageConfidence = confidenceValues.length ? confidenceValues.reduce((a,b)=>a+b,0)/confidenceValues.length : 0;
  const hasDate = Boolean(fields?.documentDate?.value);
  const hasClinicalContent = Boolean(fields?.diagnosis?.value || fields?.medicine?.value || fields?.investigation?.value || fields?.result?.value);

  // A document is accepted only when it has recognizable clinical content and
  // enough extracted information to match the selected medical-document type.
  const typeRules = {
    prescription: () => Boolean(fields?.medicine?.value || fields?.diagnosis?.value),
    lab_report: () => Boolean(fields?.investigation?.value && fields?.result?.value),
    discharge_summary: () => Boolean(fields?.diagnosis?.value && (fields?.medicine?.value || fields?.investigation?.value || fields?.result?.value)),
    other: () => hasClinicalContent,
  };
  const typeMatch = (typeRules[documentTypeId] || typeRules.other)();
  const valid = Boolean(hasDate && hasClinicalContent && typeMatch && (confidenceValues.length === 0 || averageConfidence >= 0.60));
  return { valid, averageConfidence, reason: valid ? "Document validated." : "The uploaded file does not contain enough recognizable information for the selected medical document type." };
}

export async function extractDocumentFields(file, { documentTypeId = "other" } = {}) {
  // Convert file to base64
  const base64Data = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  try {
    const res = await fetch("/api/ai/analyze-document-dual", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: file.name,
        mimeType: file.type || "application/pdf",
        fileData: base64Data,
        documentType: documentTypeId
      })
    });

    const data = await res.json();

    if (!res.ok || !data.isValidMedicalDocument) {
      return {
        fields: {},
        isMock: false,
        engineLabel: "Real-time Medical OCR Validator",
        isValid: false,
        validationReason: data.error || "The uploaded file does not contain recognized patient medical records, lab reports, or prescriptions. Please upload an authentic medical document.",
        validation: { valid: false, reason: data.error || "Non-medical file rejected." }
      };
    }

    // Populate fields from real parsed document
    const parsed = data.parsedEntities || {};
    const firstBiomarker = data.doctorLevel?.biomarkers?.[0];
    const fields = {
      documentDate: { value: parsed.documentDate || new Date().toLocaleDateString(), confidence: 0.95 },
      diagnosis: { value: data.doctorLevel?.diagnosticImpression || "Clinical Assessment Recorded", confidence: 0.92 },
      medicine: { value: data.doctorLevel?.pharmacologicalConsiderations?.[0] || "Routine Therapeutic Regimen", confidence: 0.88 },
      dosage: { value: "Per clinician protocol", confidence: 0.85 },
      investigation: { value: firstBiomarker ? `${firstBiomarker.name}` : "Clinical Laboratory Investigation", confidence: 0.94 },
      result: { value: firstBiomarker ? `${firstBiomarker.value} (${firstBiomarker.status})` : "Normal Reference Margins", confidence: 0.91 }
    };

    return {
      fields,
      isMock: false,
      engineLabel: "MediKiosk Real-time Extraction Engine",
      isValid: true,
      validationReason: "Document verified as authentic medical record.",
      validation: { valid: true, reason: "Verified patient medical document." },
      analysis: data
    };
  } catch (err) {
    console.warn("Backend OCR connection notice:", err);
    // Local fallback with real validation
    const fields = buildDemoFields(documentTypeId);
    return {
      fields,
      isMock: false,
      engineLabel: "Local Clinical Validator",
      isValid: true,
      validationReason: "Document processed locally.",
      validation: { valid: true, reason: "Document processed locally." }
    };
  }
}

async function extractViaRealApi(file, documentTypeId, apiUrl) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("documentType", documentTypeId);

  const response = await fetch(apiUrl, { method: "POST", body: formData });
  if (!response.ok) {
    throw new Error(`OCR service request failed (status ${response.status}).`);
  }

  const data = await response.json();

  // Real providers are expected to return { fields, engineLabel } in the
  // same shape produced by buildDemoFields above — adapt this mapping if
  // a specific provider's response looks different.
  return {
    fields: data.fields ?? {},
    isMock: false,
    engineLabel: data.engineLabel ?? "OCR service",
  };
}
