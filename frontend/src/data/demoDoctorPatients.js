// PHASE 9 — Doctor Dashboard demo patient list.
//
// Purely fictional demo data for SIH demonstration purposes only — no real
// patient information. Shaped exactly like the objects the live kiosk
// session produces (SessionContext: patient / consultationType /
// clinicalHistory / ayushHistory / documents) so doctorService.js can run
// the *same* redFlagService.detectRedFlags() and timelineUtils.buildTimelineEvents()
// pipeline used by the real patient flow, instead of hand-authoring
// separate red-flag/timeline data that could drift out of sync with it.
//
// "Allergies", "current medicines", and "previous conditions" aren't
// collected anywhere in the Phase 1–8 patient flow, so those three fields
// are the only hand-authored fictional values here (clearly demo data,
// per the Phase 9 brief) — everything else is derived the same way a real
// session's data would be.

export const demoDoctorPatients = [
  {
    id: "demo-1",
    patientId: "MK-2026-00124",
    patient: { name: "Rahul Sharma", age: "42", gender: "male", contact: "9876500000", abhaId: "" },
    consultationType: "modern",
    ayushConsultationNote: null,
    allergies: "No known allergies",
    currentMedicines: ["Tab. Amlodipine 5mg — once daily, for blood pressure (ongoing)"],
    previousConditions: ["Hypertension, diagnosed ~2 years ago", "Seasonal allergic rhinitis"],
    clinicalHistory: {
      chiefComplaintId: "chest_pain",
      chiefComplaintLabel: "Chest discomfort",
      answers: [
        { questionId: "onset", questionText: "When did the chest pain start?", value: "1_24h", valueLabel: "1–24 hours ago" },
        { questionId: "location", questionText: "Where exactly is the pain?", value: "center", valueLabel: "Centre of the chest" },
        { questionId: "nature", questionText: "What does the pain feel like?", value: "pressure", valueLabel: "Dull / pressure-like" },
        { questionId: "severity", questionText: "How severe is the pain right now?", value: 7, valueLabel: "7 / 10" },
        { questionId: "radiates", questionText: "Does the pain spread to another part of your body?", value: "yes", valueLabel: "Yes" },
        { questionId: "radiates_where", questionText: "Where does it spread to?", value: "left_arm", valueLabel: "Left arm" },
        { questionId: "breathing_difficulty", questionText: "Do you have any difficulty breathing?", value: "yes", valueLabel: "Yes" },
        { questionId: "sweating", questionText: "Have you been sweating more than usual?", value: "yes", valueLabel: "Yes" },
        { questionId: "nausea", questionText: "Do you feel nauseous or like vomiting?", value: "no", valueLabel: "No" },
        { questionId: "aggravating", questionText: "What makes the pain worse?", value: ["exertion"], valueLabel: ["Physical exertion"] },
        { questionId: "relieving", questionText: "What makes it better?", value: ["rest", "sitting_up"], valueLabel: ["Resting", "Sitting up"] },
      ],
    },
    ayushHistory: null,
    documents: [
      {
        id: "demo-1-doc-1",
        typeId: "lab_report",
        typeLabel: "Laboratory Report",
        fileName: "lipid_profile_aug2026.jpg",
        fileKind: "image",
        isMockOcr: true,
        uploadedAt: "2026-08-12T09:00:00.000Z",
        extractedFields: {
          documentDate: { value: "12 Aug 2026", confidence: 0.94 },
          diagnosis: null,
          medicine: null,
          dosage: null,
          investigation: { value: "Lipid Profile", confidence: 0.9 },
          result: { value: "Total cholesterol 228 mg/dL; LDL high", confidence: 0.81 },
        },
      },
      {
        id: "demo-1-doc-2",
        typeId: "prescription",
        typeLabel: "Prescription",
        fileName: "prescription_jul2026.jpg",
        fileKind: "image",
        isMockOcr: true,
        uploadedAt: "2026-07-28T09:00:00.000Z",
        extractedFields: {
          documentDate: { value: "28 Jul 2026", confidence: 0.92 },
          diagnosis: { value: "Essential hypertension", confidence: 0.87 },
          medicine: { value: "Tab. Amlodipine 5mg", confidence: 0.9 },
          dosage: { value: "1 tablet once daily, morning", confidence: 0.88 },
          investigation: null,
          result: null,
        },
      },
    ],
  },
  {
    id: "demo-2",
    patientId: "MK-2026-00131",
    patient: { name: "Ananya Verma", age: "29", gender: "female", contact: "9876500001", abhaId: "" },
    consultationType: "modern",
    allergies: "Penicillin (rash)",
    currentMedicines: [],
    previousConditions: ["Migraine, occasional, since college"],
    clinicalHistory: {
      chiefComplaintId: "headache",
      chiefComplaintLabel: "Headache",
      answers: [
        { questionId: "onset", questionText: "When did the headache start?", value: "gradual", valueLabel: "Gradually, over hours/days" },
        { questionId: "location", questionText: "Where is the pain?", value: "one_side", valueLabel: "One side of the head" },
        { questionId: "severity", questionText: "How severe is it?", value: 4, valueLabel: "4 / 10" },
        { questionId: "vision", questionText: "Any blurred vision, sensitivity to light, or seeing flashes?", value: "no", valueLabel: "No" },
        { questionId: "weakness", questionText: "Any weakness, numbness, or difficulty speaking?", value: "no", valueLabel: "No" },
        { questionId: "vomiting", questionText: "Any nausea or vomiting with the headache?", value: "no", valueLabel: "No" },
      ],
    },
    ayushHistory: null,
    documents: [
      {
        id: "demo-2-doc-1",
        typeId: "other",
        typeLabel: "Other Medical Document",
        fileName: "old_migraine_notes.jpg",
        fileKind: "image",
        isMockOcr: true,
        uploadedAt: "2026-05-02T09:00:00.000Z",
        extractedFields: {
          documentDate: { value: "02 May 2026", confidence: 0.7 },
          diagnosis: { value: "Migraine without aura", confidence: 0.75 },
          medicine: null,
          dosage: null,
          investigation: null,
          result: null,
        },
      },
    ],
  },
  {
    id: "demo-3",
    patientId: "MK-2026-00119",
    patient: { name: "Arjun Singh", age: "55", gender: "male", contact: "9876500002", abhaId: "" },
    consultationType: "ayush",
    allergies: "Not reported",
    currentMedicines: ["Tab. Metformin 500mg — twice daily, for diabetes"],
    previousConditions: ["Type 2 diabetes mellitus, on treatment"],
    clinicalHistory: {
      chiefComplaintId: "abdominal_pain",
      chiefComplaintLabel: "Abdominal discomfort",
      answers: [
        { questionId: "location", questionText: "Where is the pain in your abdomen?", value: "upper", valueLabel: "Upper abdomen" },
        { questionId: "onset", questionText: "When did it start?", value: "1_3d", valueLabel: "1–3 days ago" },
        { questionId: "severity", questionText: "How severe is the pain?", value: 6, valueLabel: "6 / 10" },
        { questionId: "vomiting", questionText: "Any vomiting?", value: "yes", valueLabel: "Yes" },
        { questionId: "bowel", questionText: "Any change in bowel movements?", value: "normal", valueLabel: "Normal" },
        { questionId: "fever", questionText: "Do you also have a fever?", value: "no", valueLabel: "No" },
      ],
    },
    ayushHistory: {
      prakriti: [
        { questionId: "prakriti_build", questionText: "Which best describes your usual body build?", sanskrit: null, value: "solid", valueLabel: "Larger, solid build" },
        { questionId: "prakriti_appetite", questionText: "How would you describe your usual appetite?", sanskrit: null, value: "steady", valueLabel: "Steady — I can skip a meal easily" },
        { questionId: "prakriti_sleep", questionText: "How do you usually sleep?", sanskrit: null, value: "deep", valueLabel: "Deep sleeper, hard to wake" },
      ],
      vikriti: [
        { questionId: "vikriti_appetite_change", questionText: "How has your appetite changed recently?", sanskrit: null, value: "decreased", valueLabel: "Decreased" },
        { questionId: "vikriti_digestion_change", questionText: "Has your digestion changed recently?", sanskrit: null, value: "sluggish", valueLabel: "Feels sluggish / heavy" },
      ],
      agni: [
        { questionId: "agni_hunger", questionText: "How is your appetite usually?", sanskrit: null, value: "weak", valueLabel: "Weak" },
        { questionId: "agni_heaviness", questionText: "Do you feel heaviness after meals?", sanskrit: null, value: "yes", valueLabel: "Yes" },
      ],
      koshtha: [
        { questionId: "koshtha_frequency", questionText: "How often do you usually pass stool?", sanskrit: null, value: "every_other_day", valueLabel: "Every other day" },
        { questionId: "koshtha_constipation", questionText: "Do you experience constipation?", sanskrit: null, value: "yes", valueLabel: "Yes" },
      ],
      ahara: [
        { questionId: "ahara_type", questionText: "Which best describes your diet?", sanskrit: null, value: "vegetarian", valueLabel: "Vegetarian" },
      ],
      vihara: [
        { questionId: "vihara_activity", questionText: "How physically active are you, day to day?", sanskrit: null, value: "sedentary", valueLabel: "Mostly sedentary" },
        { questionId: "vihara_stress_level", questionText: "How would you rate your day-to-day stress level?", sanskrit: null, value: "high", valueLabel: "High" },
      ],
      nidana: [
        { questionId: "nidana_diet_change", questionText: "Any recent change in diet?", sanskrit: null, value: "yes", valueLabel: "Yes" },
        { questionId: "nidana_stress", questionText: "Any recent stressful events?", sanskrit: null, value: "yes", valueLabel: "Yes" },
      ],
      dashavidha: [
        { questionId: "dashavidha_sara", questionText: "Tissue quality — how would you describe your general vitality (skin, hair, nails)?", sanskrit: "Sara", value: "average", valueLabel: "Average" },
      ],
    },
    documents: [
      {
        id: "demo-3-doc-1",
        typeId: "discharge_summary",
        typeLabel: "Discharge Summary",
        fileName: "discharge_jun2026.jpg",
        fileKind: "image",
        isMockOcr: true,
        uploadedAt: "2026-06-14T09:00:00.000Z",
        extractedFields: {
          documentDate: { value: "14 Jun 2026", confidence: 0.89 },
          diagnosis: { value: "Acute gastroenteritis, resolved", confidence: 0.83 },
          medicine: { value: "Tab. Ondansetron 4mg; ORS sachets", confidence: 0.85 },
          dosage: { value: "Ondansetron as needed; ORS after every loose stool", confidence: 0.8 },
          investigation: { value: "Stool routine examination", confidence: 0.78 },
          result: { value: "No ova or cysts seen; mild dehydration on admission", confidence: 0.76 },
        },
      },
    ],
  },
];
