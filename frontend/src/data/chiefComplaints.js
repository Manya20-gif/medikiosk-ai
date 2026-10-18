// Chief complaints selectable by touch. Each maps to a question tree
// in data/questionTrees/. Complaints without a dedicated tree fall back
// to the "generic" tree in the engine.
export const chiefComplaints = [
  { id: "chest_pain", label: "Chest Pain", icon: "HeartPulse" },
  { id: "fever", label: "Fever", icon: "Thermometer" },
  { id: "cough", label: "Cough / Cold", icon: "Wind" },
  { id: "headache", label: "Headache", icon: "BrainCircuit" },
  { id: "abdominal_pain", label: "Stomach / Abdominal Pain", icon: "Circle" },
  { id: "breathlessness", label: "Breathlessness", icon: "Activity" },
  { id: "joint_pain", label: "Joint / Body Pain", icon: "Bone" },
  { id: "other", label: "Something else", icon: "MoreHorizontal" },
];
