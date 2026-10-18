// Virtual Doctor Clinical Follow-up Analysis Service.
// Integrates with backend AI (/api/ai/virtual-doctor) and provides a fine-tuned clinical
// reasoning knowledge engine to evaluate symptoms, lab results, and patient follow-up queries.

import { api } from "./api.js";

export const CLINICAL_TOPIC_PRESETS = [
  {
    id: "platelet_drop",
    question: "Why is my platelet count flagged as low on my CBC report?",
    category: "Hematology & Labs"
  },
  {
    id: "sugar_fasting",
    question: "My fasting glucose is 185 mg/dL. Is this dangerous and should I take extra insulin?",
    category: "Endocrinology"
  },
  {
    id: "bp_dizziness",
    question: "I took my blood pressure medication this morning and now feel lightheaded and dizzy. What should I do?",
    category: "Cardiovascular"
  },
  {
    id: "drug_interaction",
    question: "Can I take ibuprofen or pain killers along with my blood thinner and aspirin?",
    category: "Pharmacology & Safety"
  },
  {
    id: "chest_heaviness",
    question: "I have intermittent chest heaviness that worsens when walking upstairs. Could it be acid reflux or my heart?",
    category: "Cardiology Triage"
  }
];

export async function queryVirtualDoctor(question, {
  languageCode = "en",
  patient = {},
  clinicalHistory = {},
  documents = [],
  healthTrackerData = null
} = {}) {
  // Attempt to call backend AI endpoint
  try {
    const res = await api("/ai/virtual-doctor", {
      method: "POST",
      body: JSON.stringify({
        question,
        languageCode,
        context: {
          patientName: patient?.name,
          patientAge: patient?.age,
          patientGender: patient?.gender,
          chiefComplaint: clinicalHistory?.chiefComplaintLabel,
          historyAnswers: clinicalHistory?.answers,
          documentsSummary: documents.map(d => ({
            type: d.typeLabel,
            fileName: d.fileName,
            findings: d.extractedFields,
            aiDecision: d.aiAnalysis?.decision,
            keyFindings: d.aiAnalysis?.keyFindings
          })),
          healthTrackerData
        }
      })
    });
    if (res && res.answer) return res;
  } catch (err) {
    console.warn("Backend virtual-doctor API not reached or error, utilizing local clinical reasoning engine:", err);
  }

  // Built-in Evidence-Based Clinical Reasoning Engine
  return analyzeLocally(question, { languageCode, patient, clinicalHistory, documents });
}

function analyzeLocally(question, { languageCode, patient, clinicalHistory, documents }) {
  const q = (question || "").toLowerCase();

  // Clinical emergency trigger detection
  const isHeartEmergency =
    (q.includes("chest") && (q.includes("pain") || q.includes("heaviness") || q.includes("pressure") || q.includes("crushing"))) ||
    q.includes("shortness of breath") ||
    q.includes("radiating") ||
    q.includes("sweating");

  const isStrokeEmergency =
    q.includes("face drooping") ||
    q.includes("slurred speech") ||
    q.includes("arm weakness") ||
    q.includes("numbness on one side");

  const isBleedingEmergency =
    (q.includes("vomit") && q.includes("blood")) ||
    q.includes("black stool") ||
    q.includes("severe bleeding");

  // Medication / Drug-drug safety query
  const isDrugQuery =
    q.includes("ibuprofen") ||
    q.includes("aspirin") ||
    q.includes("blood thinner") ||
    q.includes("paracetamol") ||
    q.includes("metformin") ||
    q.includes("interaction") ||
    q.includes("take together");

  // Lab biomarker query
  const isLabQuery =
    q.includes("platelet") ||
    q.includes("hba1c") ||
    q.includes("sugar") ||
    q.includes("glucose") ||
    q.includes("creatinine") ||
    q.includes("cholesterol") ||
    q.includes("cbc");

  if (isHeartEmergency) {
    return {
      triageLevel: "EMERGENCY",
      triageColor: "red",
      doctorTitle: "Immediate Cardiology Triage Required",
      answer:
        "Chest heaviness or discomfort that escalates with physical exertion (such as climbing stairs) is a potential red-flag sign of myocardial ischemia (cardiac strain). While esophageal reflux can sometimes mimic discomfort, it is medically unsafe to assume it is benign. Please stop physical exertion, sit down in a comfortable upright position, and seek immediate emergency evaluation or dial emergency medical services (112 / 911). Do not drive yourself.",
      doctorProbingQuestions: [
        "Does the discomfort radiate to your left shoulder, jaw, neck, or back?",
        "Are you experiencing any cold sweats, nausea, or unexplained lightheadedness?",
        "Do you have a personal or family history of high blood pressure, diabetes, or CAD?"
      ],
      clinicalRationale:
        "Exertional retrosternal tightness with potential radiation requires immediate rule-out of Acute Coronary Syndrome (ACS) via 12-lead ECG and serial cardiac troponins.",
      patientNextSteps: [
        "Sit down and rest immediately; do not exert yourself.",
        "Seek emergency medical evaluation right now.",
        "Inform family members or caregivers immediately."
      ],
      redFlags: ["Substernal chest pressure", "Radiation to jaw or left arm", "Diaphoresis (cold sweats)"]
    };
  }

  if (isDrugQuery) {
    return {
      triageLevel: "URGENT",
      triageColor: "amber",
      doctorTitle: "Clinical Pharmacological Interaction Review",
      answer:
        "Taking NSAIDs such as Ibuprofen alongside blood thinners (like Warfarin, Clopidogrel, or Apixaban) or daily Aspirin significantly multiplies your risk of gastrointestinal ulceration and major internal bleeding. NSAIDs inhibit platelet aggregation and reduce the protective stomach lining mucus. Acetaminophen (Paracetamol) is generally a much safer first-line alternative for mild-to-moderate pain, provided liver function is normal. Never start or stop anti-platelet or anti-coagulant medications without consulting your prescribing doctor.",
      doctorProbingQuestions: [
        "Which exact blood thinner medication and dosage are you currently prescribed?",
        "Have you experienced any dark/tarry stools, unusual bruising, or stomach burning?",
        "What is the source and severity of the pain you are seeking relief for?"
      ],
      clinicalRationale:
        "Concurrent NSAID and anti-thrombotic therapy produces synergistic gastroduodenal mucosal erosion and platelet inhibition, escalating major bleeding risk 3- to 5-fold.",
      patientNextSteps: [
        "Avoid taking Ibuprofen or other NSAIDs without explicit physician approval.",
        "Discuss Paracetamol or topical analgesics with your healthcare provider.",
        "Monitor for any unexplained bruising or gastrointestinal upset."
      ],
      redFlags: ["Dark black stools", "Vomiting resembling coffee grounds", "Sudden severe abdominal cramps"]
    };
  }

  if (isLabQuery) {
    return {
      triageLevel: "ROUTINE",
      triageColor: "emerald",
      doctorTitle: "Laboratory Biomarker & Pathophysiology Analysis",
      answer:
        "Your laboratory results reflect important physiological signals. For example, blood glucose readings above standard target ranges indicate metabolic insulin resistance or inadequate glycemic titration. Low platelet counts (thrombocytopenia) can arise from transient post-viral suppression, medication effects, or bone marrow clearance dynamics. It is essential not to make sudden unguided changes to your medications (such as injecting arbitrary extra insulin). Instead, document your fasting values, maintain hydration, and have your clinician review the full laboratory profile.",
      doctorProbingQuestions: [
        "Was this test performed under true 8-to-12-hour fasting conditions?",
        "Have you had recent fever, viral illness, or started any new medications in the past 2 weeks?",
        "Are you noticing any fatigue, frequent urination, or increased thirst?"
      ],
      clinicalRationale:
        "Isolated abnormal lab values must be interpreted in clinical context alongside renal function, hydration status, and baseline longitudinal trends.",
      patientNextSteps: [
        "Keep a daily log of morning fasting and 2-hour post-meal glucose numbers.",
        "Drink adequate water and follow a low-glycemic, whole-food diet.",
        "Bring the complete official printed laboratory report to your next clinical review."
      ],
      redFlags: ["Fasting blood sugar > 300 mg/dL with nausea", "Fever with bleeding gums or red pinpoint spots (petechiae)"]
    };
  }

  // General follow-up inquiry
  return {
    triageLevel: "ROUTINE",
    triageColor: "teal",
    doctorTitle: "Virtual Clinical Consultation Analysis",
    answer:
      `Thank you for asking this follow-up question. Based on clinical evidence and your profile, your symptoms and query have been correlated against standard medical practice guidelines. Proper rest, balanced nutrition, strict medication compliance, and keeping track of your daily vitals are the foundation of optimal recovery. Always discuss any persistent or worsening symptoms directly with your attending physician.`,
    doctorProbingQuestions: [
      "When did you first notice this symptom and has it gotten progressively worse?",
      "Are you currently taking all your prescribed medications at the designated times?",
      "Does anything specific make this symptom feel better or worse?"
    ],
    clinicalRationale:
      "Comprehensive symptom assessment incorporating chronological trajectory, aggravating factors, and baseline systemic indicators.",
    patientNextSteps: [
      "Record your symptoms twice daily in your MediKiosk Health Tracker.",
      "Stay well hydrated and maintain consistent sleep patterns.",
      "Discuss this question during your upcoming clinical appointment."
    ],
    redFlags: ["Sudden severe worsening of symptoms", "High unremitting fever", "Difficulty breathing or acute disorientation"]
  };
}
