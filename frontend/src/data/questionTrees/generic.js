export const genericTree = {
  id: "generic",
  start: "onset",
  questions: {
    onset: {
      id: "onset",
      text: "When did this problem start?",
      type: "single_choice",
      options: [
        { value: "lt_1d", label: "Today" },
        { value: "1_7d", label: "1–7 days ago" },
        { value: "1_4w", label: "1–4 weeks ago" },
        { value: "gt_4w", label: "More than a month ago" },
      ],
      next: "severity",
    },
    severity: {
      id: "severity",
      text: "How severe would you say it is?",
      type: "numeric_scale",
      min: 1,
      max: 10,
      minLabel: "Mild",
      maxLabel: "Worst possible",
      next: "associated",
    },
    associated: {
      id: "associated",
      text: "Any of these along with it? (select all that apply)",
      type: "multi_choice",
      options: [
        { value: "fever", label: "Fever" },
        { value: "fatigue", label: "Fatigue" },
        { value: "appetite_loss", label: "Loss of appetite" },
        { value: "weight_loss", label: "Weight loss" },
        { value: "none", label: "None of these" },
      ],
      next: "getting_worse",
    },
    getting_worse: {
      id: "getting_worse",
      text: "Is it getting worse over time?",
      type: "yes_no",
      next: "notes",
    },
    notes: {
      id: "notes",
      text: "Anything else you'd like to add? (optional)",
      type: "text",
      optional: true,
      next: "END",
    },
  },
};
