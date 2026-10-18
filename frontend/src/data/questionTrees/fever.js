export const feverTree = {
  id: "fever",
  start: "duration",
  questions: {
    duration: {
      id: "duration",
      text: "How long have you had the fever?",
      type: "single_choice",
      options: [
        { value: "lt_1d", label: "Less than a day" },
        { value: "1_3d", label: "1–3 days" },
        { value: "4_7d", label: "4–7 days" },
        { value: "gt_7d", label: "More than a week" },
      ],
      next: "pattern",
    },
    pattern: {
      id: "pattern",
      text: "How does the fever behave?",
      type: "single_choice",
      options: [
        { value: "continuous", label: "Constant, all day" },
        { value: "intermittent", label: "Comes and goes" },
        { value: "evening_rise", label: "Rises in the evening" },
      ],
      next: "severity",
    },
    severity: {
      id: "severity",
      text: "How high would you say the fever feels?",
      type: "single_choice",
      options: [
        { value: "mild", label: "Mild, feels warm" },
        { value: "moderate", label: "Moderate" },
        { value: "high", label: "Very high / burning" },
      ],
      next: "chills",
    },
    chills: {
      id: "chills",
      text: "Do you get chills or shivering?",
      type: "yes_no",
      next: "associated",
    },
    associated: {
      id: "associated",
      text: "Any of these along with the fever? (select all that apply)",
      type: "multi_choice",
      options: [
        { value: "body_ache", label: "Body ache" },
        { value: "sore_throat", label: "Sore throat" },
        { value: "rash", label: "Skin rash" },
        { value: "vomiting", label: "Vomiting" },
        { value: "none", label: "None of these" },
      ],
      next: "consciousness",
    },
    consciousness: {
      id: "consciousness",
      text: "Any confusion, drowsiness, or difficulty staying awake?",
      type: "yes_no",
      next: "END",
    },
  },
};
