// PROTOTYPE, RULE-BASED RED-FLAG RULES — NOT A DIAGNOSTIC SYSTEM.
//
// Each rule only ever names a *symptom pattern*, never a condition or
// diagnosis. `test(answers)` receives a lookup where answers.get(questionId)
// returns the recorded { value, valueLabel } for that question in the
// current chief complaint's tree (see data/questionTrees/), or undefined
// if the patient never reached/answered it — rules must handle that
// gracefully (redFlagService.js also wraps every test() in a try/catch).
//
// Coverage note: a few of the illustrative red flags in the Phase 6 brief
// (e.g. "fainting with chest pain", "loss of consciousness with headache",
// "headache after major injury", "inability to speak" with breathlessness)
// aren't representable yet because the corresponding question trees don't
// ask about them. Rather than guess at unasked information, those are left
// out here — extending the relevant tree in data/questionTrees/ with the
// missing question is enough to add the rule later; no other file changes.

export const redFlagRules = [
  // ---- Chest pain ----
  {
    id: "chest_pain_severe",
    complaintId: "chest_pain",
    severity: "High",
    symptom: "Severe chest pain",
    reason: "Chest pain was rated 8 or higher out of 10.",
    test: (a) => Number(a.get("severity")?.value) >= 8,
  },
  {
    id: "chest_pain_sweating",
    complaintId: "chest_pain",
    severity: "High",
    symptom: "Chest pain with sweating",
    reason: "The patient reported sweating more than usual along with the chest pain.",
    test: (a) => a.get("sweating")?.value === "yes",
  },
  {
    id: "chest_pain_breathless",
    complaintId: "chest_pain",
    severity: "High",
    symptom: "Chest pain with difficulty breathing",
    reason: "The patient reported difficulty breathing along with the chest pain.",
    test: (a) => a.get("breathing_difficulty")?.value === "yes",
  },
  {
    id: "chest_pain_radiating",
    complaintId: "chest_pain",
    severity: "High",
    symptom: "Chest pain spreading to arm or jaw",
    reason: "The pain was reported as spreading to the left arm or jaw.",
    test: (a) =>
      a.get("radiates")?.value === "yes" && ["left_arm", "jaw"].includes(a.get("radiates_where")?.value),
  },

  // ---- Breathlessness ----
  {
    id: "breathless_at_rest",
    complaintId: "breathlessness",
    severity: "High",
    symptom: "Severe difficulty breathing",
    reason: "Breathlessness was reported even at rest, not only on exertion.",
    test: (a) => a.get("trigger")?.value === "rest",
  },
  {
    id: "breathless_bluish",
    complaintId: "breathlessness",
    severity: "High",
    symptom: "Bluish lips or fingertips",
    reason: "The patient reported bluish discolouration of the lips or fingertips.",
    test: (a) => a.get("bluish")?.value === "yes",
  },
  {
    id: "breathless_chest_pain",
    complaintId: "breathlessness",
    severity: "Moderate",
    symptom: "Breathlessness with chest pain",
    reason: "Chest pain was reported alongside the breathlessness.",
    test: (a) => a.get("chest_pain")?.value === "yes",
  },

  // ---- Headache ----
  {
    id: "headache_sudden_severe",
    complaintId: "headache",
    severity: "High",
    symptom: "Sudden, severe headache",
    reason: "A headache that started suddenly ('thunderclap') was rated 8 or higher out of 10.",
    test: (a) => a.get("onset")?.value === "sudden" && Number(a.get("severity")?.value) >= 8,
  },
  {
    id: "headache_weakness",
    complaintId: "headache",
    severity: "High",
    symptom: "Headache with weakness or numbness",
    reason: "The patient reported weakness, numbness, or difficulty speaking with the headache.",
    test: (a) => a.get("weakness")?.value === "yes",
  },
  {
    id: "headache_vision",
    complaintId: "headache",
    severity: "Moderate",
    symptom: "Headache with visual disturbance",
    reason: "The patient reported blurred vision, light sensitivity, or flashes with the headache.",
    test: (a) => a.get("vision")?.value === "yes",
  },

  // ---- Fever ----
  {
    id: "fever_very_high",
    complaintId: "fever",
    severity: "Moderate",
    symptom: "Very high fever",
    reason: "The fever was described as very high / burning.",
    test: (a) => a.get("severity")?.value === "high",
  },
  {
    id: "fever_confusion",
    complaintId: "fever",
    severity: "High",
    symptom: "Fever with confusion",
    reason: "The patient reported confusion, drowsiness, or difficulty staying awake with the fever.",
    test: (a) => a.get("consciousness")?.value === "yes",
  },

  // ---- Abdominal pain ----
  {
    id: "abdo_severe_sudden",
    complaintId: "abdominal_pain",
    severity: "High",
    symptom: "Severe, sudden abdominal pain",
    reason: "Abdominal pain that started today was rated 8 or higher out of 10.",
    test: (a) => a.get("onset")?.value === "lt_1d" && Number(a.get("severity")?.value) >= 8,
  },
  {
    id: "abdo_blood",
    complaintId: "abdominal_pain",
    severity: "High",
    symptom: "Blood in stool",
    reason: "The patient reported blood in the stool.",
    test: (a) => a.get("bowel")?.value === "blood",
  },
  {
    id: "abdo_vomiting",
    complaintId: "abdominal_pain",
    severity: "Moderate",
    symptom: "Abdominal pain with vomiting",
    reason: "The patient reported vomiting along with the abdominal pain.",
    test: (a) => a.get("vomiting")?.value === "yes",
  },

  // ---- Cough (the existing question tree already flags this as a
  // Phase 6 concern — see the comment in data/questionTrees/cough.js) ----
  {
    id: "cough_blood",
    complaintId: "cough",
    severity: "High",
    symptom: "Coughing blood",
    reason: "The patient reported coughing up blood.",
    test: (a) => a.get("nature")?.value === "blood",
  },
  {
    id: "cough_breathless",
    complaintId: "cough",
    severity: "Moderate",
    symptom: "Cough with difficulty breathing",
    reason: "The patient reported difficulty breathing along with the cough.",
    test: (a) => a.get("breathing_difficulty")?.value === "yes",
  },
];
