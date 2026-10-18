export const coughTree = {
  id: "cough",
  start: "duration",
  questions: {
    duration: {
      id: "duration",
      text: "How long have you had the cough?",
      type: "single_choice",
      options: [
        { value: "lt_1w", label: "Less than a week" },
        { value: "1_3w", label: "1–3 weeks" },
        { value: "gt_3w", label: "More than 3 weeks" },
      ],
      next: "nature",
    },
    nature: {
      id: "nature",
      text: "What kind of cough is it?",
      type: "single_choice",
      options: [
        { value: "dry", label: "Dry cough" },
        { value: "productive", label: "Cough with phlegm/mucus" },
        { value: "blood", label: "Cough with blood" },
      ],
      // Coughing blood is handled with extra weight by the red-flag engine (Phase 6).
      next: "breathing_difficulty",
    },
    breathing_difficulty: {
      id: "breathing_difficulty",
      text: "Any difficulty breathing along with the cough?",
      type: "yes_no",
      next: "fever",
    },
    fever: {
      id: "fever",
      text: "Do you also have a fever?",
      type: "yes_no",
      next: "chest_pain",
    },
    chest_pain: {
      id: "chest_pain",
      text: "Any chest pain when you cough or breathe?",
      type: "yes_no",
      next: "END",
    },
  },
};
