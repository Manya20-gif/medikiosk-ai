// REAL MEDICAL DOCUMENT EXTRACTOR & VALIDATOR.
// Extracts real text from PDFs and images, checks for authentic medical tokens,
// and rejects non-medical files.

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { PDFParse } = require("pdf-parse");
import { createWorker } from "tesseract.js";

// Comprehensive clinical vocabulary for medical authenticity verification
const MEDICAL_TOKENS = [
  "patient", "hospital", "clinic", "doctor", "dr.", "physician", "consultant",
  "prescription", "diagnosis", "symptoms", "history", "investigation", "pathology",
  "laboratory", "report", "specimen", "hemoglobin", "hb", "wbc", "rbc", "platelet",
  "glucose", "blood sugar", "fasting", "pp", "hba1c", "cholesterol", "triglycerides",
  "creatinine", "urea", "bun", "bilirubin", "sgot", "sgpt", "alt", "ast", "tsh",
  "troponin", "ck-mb", "crp", "esr", "urine", "ecg", "eeg", "x-ray", "ct scan",
  "blood pressure", "bp", "pulse", "heart rate", "spo2", "mg/dl", "g/dl", "mmhg",
  "cells/cumm", "fl", "pg", "tab", "cap", "inj", "syp", "dosage", "mg", "ml",
  "twice daily", "once daily", "before food", "after food", "rx", "radiology",
  "discharge summary", "vital signs", "hypertension", "diabetes", "anemia", "infection"
];

// Reference ranges for common medical biomarkers
export const BIOMARKER_REFERENCES = {
  hemoglobin: { name: "Hemoglobin (Hb)", min: 12.0, max: 16.0, unit: "g/dL" },
  platelets: { name: "Platelet Count", min: 150000, max: 450000, unit: "/µL" },
  wbc: { name: "Total Leucocyte Count (WBC)", min: 4000, max: 11000, unit: "/µL" },
  rbc: { name: "Red Blood Cell Count (RBC)", min: 4.2, max: 5.8, unit: "mil/µL" },
  fastingGlucose: { name: "Fasting Blood Glucose", min: 70, max: 100, unit: "mg/dL" },
  randomGlucose: { name: "Random Blood Sugar", min: 70, max: 140, unit: "mg/dL" },
  hba1c: { name: "HbA1c (Glycated Hb)", min: 4.0, max: 5.7, unit: "%" },
  creatinine: { name: "Serum Creatinine", min: 0.6, max: 1.2, unit: "mg/dL" },
  cholesterol: { name: "Total Cholesterol", min: 120, max: 200, unit: "mg/dL" },
  triglycerides: { name: "Triglycerides", min: 50, max: 150, unit: "mg/dL" },
  systolicBp: { name: "Systolic Blood Pressure", min: 90, max: 120, unit: "mmHg" },
  diastolicBp: { name: "Diastolic Blood Pressure", min: 60, max: 80, unit: "mmHg" },
  troponin: { name: "High-Sensitivity Troponin-I", min: 0.0, max: 0.014, unit: "ng/mL" },
  pulse: { name: "Heart Rate", min: 60, max: 100, unit: "bpm" },
  spo2: { name: "Oxygen Saturation (SpO2)", min: 95, max: 100, unit: "%" },
  urea: { name: "Blood Urea / BUN", min: 15, max: 45, unit: "mg/dL" },
  bilirubin: { name: "Total Bilirubin", min: 0.2, max: 1.2, unit: "mg/dL" },
  sgpt: { name: "SGPT / Alanine Aminotransferase (ALT)", min: 7, max: 56, unit: "U/L" },
  sgot: { name: "SGOT / Aspartate Aminotransferase (AST)", min: 10, max: 40, unit: "U/L" },
  tsh: { name: "Thyroid Stimulating Hormone (TSH)", min: 0.4, max: 4.5, unit: "µIU/mL" },
  potassium: { name: "Serum Potassium", min: 3.5, max: 5.1, unit: "mmol/L" },
  sodium: { name: "Serum Sodium", min: 136, max: 145, unit: "mmol/L" }
};

/**
 * Extracts plain text from a base64 or Buffer data payload with magic-byte validation.
 */
export async function extractTextFromDocument(fileData, mimeType, fileName) {
  let rawText = "";

  try {
    const buffer = Buffer.isBuffer(fileData)
      ? fileData
      : Buffer.from(String(fileData).replace(/^data:.*?;base64,/, ""), "base64");

    if (!buffer || buffer.length === 0) {
      return "";
    }

    const isPdfMagic = buffer.length >= 4 && buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46; // %PDF
    const isJpegMagic = buffer.length >= 2 && buffer[0] === 0xff && buffer[1] === 0xd8;
    const isPngMagic = buffer.length >= 4 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
    const isGifMagic = buffer.length >= 3 && buffer.slice(0, 3).toString() === "GIF";

    if (isPdfMagic) {
      try {
        const uint8 = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
        const parser = new PDFParse(uint8);
        await parser.load();
        rawText = await parser.getText();
        await parser.destroy();
      } catch (pdfErr) {
        console.warn("PDF parser notice:", pdfErr.message);
        rawText = buffer.toString("utf8");
      }
    } else if (isJpegMagic || isPngMagic || isGifMagic || mimeType.startsWith("image/") || /\.(png|jpe?g|webp)$/i.test(fileName)) {
      if (isJpegMagic || isPngMagic || isGifMagic) {
        let worker = null;
        try {
          worker = await createWorker("eng");
          const { data } = await worker.recognize(buffer);
          rawText = data?.text || "";
        } catch (ocrErr) {
          console.warn("Tesseract OCR notice:", ocrErr.message);
          rawText = buffer.toString("utf8");
        } finally {
          if (worker) {
            try { await worker.terminate(); } catch (e) {}
          }
        }
      } else {
        rawText = buffer.toString("utf8");
      }
    } else {
      rawText = buffer.toString("utf8");
    }
  } catch (err) {
    console.error("Document extraction error:", err);
    throw new Error(`Failed to extract text from file: ${err.message}`);
  }

  return rawText.trim();
}

/**
 * Evaluates whether extracted text represents an authentic medical document.
 * Returns validation decision, confidence score, and matched clinical markers.
 */
export function validateMedicalDocument(text, fileName = "") {
  const lower = (text + " " + fileName).toLowerCase();

  // Match medical tokens
  const matchedTokens = MEDICAL_TOKENS.filter((token) => lower.includes(token));
  const hasNumbers = /\d+([.,]\d+)?\s*(mg|g|ml|mmhg|%|\/ul|\/cumm|bpm)?/i.test(lower);

  // Compute confidence score (0% - 100%)
  let score = 0;
  if (matchedTokens.length >= 1) score += 20;
  if (matchedTokens.length >= 3) score += 30;
  if (matchedTokens.length >= 6) score += 30;
  if (hasNumbers) score += 20;

  // Strict check: Must have at least 2 distinct medical tokens or specific clinical marker
  const isValid = score >= 50 && matchedTokens.length >= 2;

  let rejectionReason = null;
  if (!isValid) {
    rejectionReason = `The uploaded file "${fileName}" could not be verified as a valid medical document. It lacks clinical markers, laboratory metrics, or medical credentials. Only authentic patient records, prescriptions, or lab reports are accepted.`;
  }

  return {
    isValid,
    confidence: Math.min(100, score),
    matchedTokens,
    rejectionReason
  };
}

/**
 * Parses real patient details and specific laboratory biomarkers from extracted text.
 */
export function parseClinicalEntities(text) {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const lower = text.toLowerCase();

  // Extract Patient Name if present
  let patientName = null;
  const nameMatch = text.match(/(?:patient\s*name|name\s*of\s*patient|patient|name)\s*[:\-]\s*([a-zA-Z\s.]+?)(?=\s+(?:age|yrs|date|sex|gender|id|mrn|dr|dob|ref|test|investigation)|[,\n\r]|$)/i);
  if (nameMatch && nameMatch[1]) {
    patientName = nameMatch[1].trim();
  }

  // Extract Date if present
  let documentDate = null;
  const dateMatch = text.match(/(?:date|dated|collection\s*date)\s*[:\-]\s*([0-9]{1,4}[-/.][0-9]{1,2}[-/.][0-9]{1,4}|[A-Za-z]{3,9}\s+\d{1,2},?\s+\d{4})/i);
  if (dateMatch && dateMatch[1]) {
    documentDate = dateMatch[1].trim();
  }

  // Extract Age / Gender if present
  let patientAge = null;
  let patientGender = null;
  const ageMatch = text.match(/(?:age|yrs?)\s*[:\-]?\s*(\d{1,3})\s*(?:years?|yrs?|\/([mf]|male|female))?/i);
  if (ageMatch && ageMatch[1]) patientAge = ageMatch[1];
  const genderMatch = text.match(/(?:gender|sex)\s*[:\-]?\s*(male|female|m|f)/i);
  if (genderMatch && genderMatch[1]) patientGender = genderMatch[1].toUpperCase();

  // Extract Doctor or Lab Facility
  let doctorOrFacility = null;
  const docMatch = text.match(/(?:dr\.|doctor|consultant|hospital|clinic|laboratory|lab)\s*[:\-]?\s*([a-zA-Z\s.&]+)/i);
  if (docMatch && docMatch[1]) {
    doctorOrFacility = docMatch[0].trim().slice(0, 50);
  }

  // Real Biomarker Matrix Parsing
  const parsedBiomarkers = [];

  // 1. Hemoglobin
  const hbMatch = text.match(/(?:hemoglobin|hb)\s*[:\-]?\s*(\d{1,2}(?:\.\d{1,2})?)\s*(?:g\/dl)?/i);
  if (hbMatch) {
    const val = parseFloat(hbMatch[1]);
    const ref = BIOMARKER_REFERENCES.hemoglobin;
    const isLow = val < ref.min;
    const isHigh = val > ref.max;
    const dev = isLow ? `-${Math.round(((ref.min - val) / ref.min) * 100)}%` : isHigh ? `+${Math.round(((val - ref.max) / ref.max) * 100)}%` : "0%";
    parsedBiomarkers.push({
      name: ref.name,
      value: `${val} ${ref.unit}`,
      reference: `${ref.min} - ${ref.max} ${ref.unit}`,
      status: isLow ? (val < 9 ? "Critical Low" : "Low (Anemia)") : isHigh ? "High" : "Normal",
      deviation: dev
    });
  }

  // 2. Platelets
  const pltMatch = text.match(/(?:platelet|platelets|thrombocytes)\s*[:\-]?\s*(\d{2,3}(?:[,.]\d{3})?|\d{5,6})\s*(?:\/ul|\/cumm)?/i);
  if (pltMatch) {
    const rawVal = pltMatch[1].replace(/[,.]/g, "");
    const val = parseInt(rawVal, 10);
    const ref = BIOMARKER_REFERENCES.platelets;
    const isLow = val < ref.min;
    const isHigh = val > ref.max;
    const dev = isLow ? `-${Math.round(((ref.min - val) / ref.min) * 100)}%` : isHigh ? `+${Math.round(((val - ref.max) / ref.max) * 100)}%` : "0%";
    parsedBiomarkers.push({
      name: ref.name,
      value: `${val.toLocaleString()} ${ref.unit}`,
      reference: "150,000 - 450,000 /µL",
      status: isLow ? (val < 100000 ? "Critical Low" : "Low (Thrombocytopenia)") : isHigh ? "High" : "Normal",
      deviation: dev
    });
  }

  // 3. Fasting or Random Blood Sugar
  const fbsMatch = text.match(/(?:fasting\s*blood\s*sugar|fbs|fasting\s*glucose|blood\s*sugar|glucose)\s*[:\-]?\s*(\d{2,3}(?:\.\d{1,2})?)\s*(?:mg\/dl)?/i);
  if (fbsMatch) {
    const val = parseFloat(fbsMatch[1]);
    const ref = BIOMARKER_REFERENCES.fastingGlucose;
    const isHigh = val > ref.max;
    const isLow = val < ref.min;
    const dev = isHigh ? `+${Math.round(((val - ref.max) / ref.max) * 100)}%` : isLow ? `-${Math.round(((ref.min - val) / ref.min) * 100)}%` : "0%";
    parsedBiomarkers.push({
      name: ref.name,
      value: `${val} ${ref.unit}`,
      reference: `${ref.min} - ${ref.max} ${ref.unit}`,
      status: isHigh ? (val >= 180 ? "Critical High" : "Elevated (Hyperglycemia)") : isLow ? "Low (Hypoglycemia)" : "Normal",
      deviation: dev
    });
  }

  // 4. HbA1c
  const a1cMatch = text.match(/(?:hba1c|glycated\s*hemoglobin)\s*[:\-]?\s*(\d{1,2}(?:\.\d{1,2})?)\s*(?:%)?/i);
  if (a1cMatch) {
    const val = parseFloat(a1cMatch[1]);
    const ref = BIOMARKER_REFERENCES.hba1c;
    const isHigh = val > ref.max;
    const dev = isHigh ? `+${Math.round(((val - ref.max) / ref.max) * 100)}%` : "0%";
    parsedBiomarkers.push({
      name: ref.name,
      value: `${val}%`,
      reference: "< 5.7%",
      status: val >= 8.5 ? "Critical High" : val >= 6.5 ? "High (Diabetes)" : val >= 5.7 ? "Borderline (Prediabetes)" : "Optimal",
      deviation: dev
    });
  }

  // 5. Blood Pressure
  const bpMatch = text.match(/(?:blood\s*pressure|b\.?p\.?)\s*[:\-]?\s*(\d{2,3})\s*[\/x-]\s*(\d{2,3})\s*(?:mmhg)?/i);
  if (bpMatch) {
    const sys = parseInt(bpMatch[1], 10);
    const dia = parseInt(bpMatch[2], 10);
    const isHigh = sys >= 140 || dia >= 90;
    parsedBiomarkers.push({
      name: "Blood Pressure (Hemodynamics)",
      value: `${sys}/${dia} mmHg`,
      reference: "< 120/80 mmHg",
      status: sys >= 160 || dia >= 100 ? "Stage 2 Hypertension" : isHigh ? "Stage 1 Hypertension" : "Optimal Normotensive",
      deviation: sys > 120 ? `+${Math.round(((sys - 120) / 120) * 100)}%` : "0%"
    });
  }

  // 6. Serum Creatinine
  const crMatch = text.match(/(?:serum\s*creatinine|creatinine)\s*[:\-]?\s*(\d{1,2}(?:\.\d{1,2})?)\s*(?:mg\/dl)?/i);
  if (crMatch) {
    const val = parseFloat(crMatch[1]);
    const ref = BIOMARKER_REFERENCES.creatinine;
    const isHigh = val > ref.max;
    parsedBiomarkers.push({
      name: ref.name,
      value: `${val} ${ref.unit}`,
      reference: `${ref.min} - ${ref.max} ${ref.unit}`,
      status: isHigh ? (val > 2.0 ? "Critical Renal Elevation" : "Mildly Elevated") : "Normal",
      deviation: isHigh ? `+${Math.round(((val - ref.max) / ref.max) * 100)}%` : "0%"
    });
  }

  // 7. Troponin
  const tropMatch = text.match(/(?:troponin|c-tni|hs-ctni)\s*[:\-]?\s*(\d{1,2}(?:\.\d{1,4})?)\s*(?:ng\/ml)?/i);
  if (tropMatch) {
    const val = parseFloat(tropMatch[1]);
    const ref = BIOMARKER_REFERENCES.troponin;
    const isHigh = val > ref.max;
    parsedBiomarkers.push({
      name: ref.name,
      value: `${val} ${ref.unit}`,
      reference: `< 0.014 ${ref.unit}`,
      status: isHigh ? "Critical High (Myocardial Injury Alert)" : "Normal",
      deviation: isHigh ? `+${Math.round(((val - ref.max) / ref.max) * 100)}%` : "0%"
    });
  }

  // 8. Total Leucocyte Count (WBC)
  const wbcMatch = text.match(/(?:total\s*leucocyte\s*count|wbc|tlc|leucocytes)\s*[:\-]?\s*(\d{1,2}(?:[,.]\d{3})?|\d{4,5})\s*(?:\/ul|\/cumm)?/i);
  if (wbcMatch) {
    const val = parseInt(wbcMatch[1].replace(/[,.]/g, ""), 10);
    const ref = BIOMARKER_REFERENCES.wbc;
    const isLow = val < ref.min;
    const isHigh = val > ref.max;
    parsedBiomarkers.push({
      name: ref.name,
      value: `${val.toLocaleString()} ${ref.unit}`,
      reference: `${ref.min.toLocaleString()} - ${ref.max.toLocaleString()} ${ref.unit}`,
      status: isHigh ? (val > 15000 ? "Critical High (Severe Infection Risk)" : "High (Leukocytosis)") : isLow ? "Low (Leukopenia)" : "Normal",
      deviation: isHigh ? `+${Math.round(((val - ref.max) / ref.max) * 100)}%` : isLow ? `-${Math.round(((ref.min - val) / ref.min) * 100)}%` : "0%"
    });
  }

  // 9. Total Cholesterol
  const cholMatch = text.match(/(?:total\s*cholesterol|cholesterol)\s*[:\-]?\s*(\d{2,3}(?:\.\d{1,2})?)\s*(?:mg\/dl)?/i);
  if (cholMatch) {
    const val = parseFloat(cholMatch[1]);
    const ref = BIOMARKER_REFERENCES.cholesterol;
    const isHigh = val > ref.max;
    parsedBiomarkers.push({
      name: ref.name,
      value: `${val} ${ref.unit}`,
      reference: `< 200 ${ref.unit}`,
      status: isHigh ? (val > 240 ? "High Hypercholesterolemia" : "Borderline High") : "Desirable",
      deviation: isHigh ? `+${Math.round(((val - ref.max) / ref.max) * 100)}%` : "0%"
    });
  }

  // 10. Pulse / Heart Rate
  const pulseMatch = text.match(/(?:heart\s*rate|pulse|pulse\s*rate|hr)\s*[:\-]?\s*(\d{2,3})\s*(?:bpm)?/i);
  if (pulseMatch) {
    const val = parseInt(pulseMatch[1], 10);
    const ref = BIOMARKER_REFERENCES.pulse;
    const isHigh = val > ref.max;
    const isLow = val < ref.min;
    parsedBiomarkers.push({
      name: ref.name,
      value: `${val} ${ref.unit}`,
      reference: "60 - 100 bpm",
      status: isHigh ? "Tachycardia (Elevated)" : isLow ? "Bradycardia (Low)" : "Normal Sinus Rhythm",
      deviation: isHigh ? `+${Math.round(((val - ref.max) / ref.max) * 100)}%` : isLow ? `-${Math.round(((ref.min - val) / ref.min) * 100)}%` : "0%"
    });
  }

  // 11. Thyroid (TSH)
  const tshMatch = text.match(/(?:tsh|thyroid\s*stimulating\s*hormone)\s*[:\-]?\s*(\d{1,2}(?:\.\d{1,2})?)\s*(?:µiu\/ml|uiu\/ml)?/i);
  if (tshMatch) {
    const val = parseFloat(tshMatch[1]);
    const ref = BIOMARKER_REFERENCES.tsh;
    const isHigh = val > ref.max;
    const isLow = val < ref.min;
    parsedBiomarkers.push({
      name: ref.name,
      value: `${val} ${ref.unit}`,
      reference: "0.4 - 4.5 µIU/mL",
      status: isHigh ? "Hypothyroidism Indicator (High)" : isLow ? "Hyperthyroidism Indicator (Low)" : "Euthyroid (Normal)",
      deviation: isHigh ? `+${Math.round(((val - ref.max) / ref.max) * 100)}%` : isLow ? `-${Math.round(((ref.min - val) / ref.min) * 100)}%` : "0%"
    });
  }

  return {
    patientName: patientName || "Patient (Identified in Record)",
    documentDate: documentDate || new Date().toLocaleDateString(),
    patientAge: patientAge || null,
    patientGender: patientGender || null,
    doctorOrFacility: doctorOrFacility || "Clinical Care Facility",
    extractedLineCount: lines.length,
    rawTextPreview: text.slice(0, 1000),
    parsedBiomarkers
  };
}
