export const abdominalPainTree = {
  id: "abdominal_pain",
  start: "location",
  questions: {
    location: {
      id: "location",
      text: "Where is the pain in your abdomen?",
      type: "single_choice",
      options: [
        { value: "upper", label: "Upper abdomen" },
        { value: "lower", label: "Lower abdomen" },
        { value: "right_side", label: "Right side" },
        { value: "left_side", label: "Left side" },
        { value: "all_over", label: "All over" },
      ],
      next: "onset",
    },
    onset: {
      id: "onset",
      text: "When did it start?",
      type: "single_choice",
      options: [
        { value: "lt_1d", label: "Today" },
        { value: "1_3d", label: "1–3 days ago" },
        { value: "gt_3d", label: "More than 3 days ago" },
      ],
      next: "severity",
    },
    severity: {
      id: "severity",
      text: "How severe is the pain?",
      type: "numeric_scale",
      min: 1,
      max: 10,
      minLabel: "Mild",
      maxLabel: "Worst possible",
      next: "vomiting",
    },
    vomiting: {
      id: "vomiting",
      text: "Any vomiting?",
      type: "yes_no",
      next: "bowel",
    },
    bowel: {
      id: "bowel",
      text: "Any change in bowel movements?",
      type: "single_choice",
      options: [
        { value: "normal", label: "Normal" },
        { value: "loose", label: "Loose motions / diarrhoea" },
        { value: "constipated", label: "Constipation" },
        { value: "blood", label: "Blood in stool" },
      ],
      next: "fever",
    },
    fever: {
      id: "fever",
      text: "Do you also have a fever?",
      type: "yes_no",
      next: "END",
    },
  },
};
