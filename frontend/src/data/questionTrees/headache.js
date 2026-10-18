export const headacheTree = {
  id: "headache",
  start: "onset",
  questions: {
    onset: {
      id: "onset",
      text: "When did the headache start?",
      type: "single_choice",
      options: [
        { value: "sudden", label: "Suddenly, out of nowhere" },
        { value: "gradual", label: "Gradually, over hours/days" },
        { value: "chronic", label: "It's been recurring for a long time" },
      ],
      next: "location",
    },
    location: {
      id: "location",
      text: "Where is the pain?",
      type: "single_choice",
      options: [
        { value: "one_side", label: "One side of the head" },
        { value: "both_sides", label: "Both sides" },
        { value: "back_of_head", label: "Back of the head / neck" },
        { value: "whole_head", label: "Whole head" },
      ],
      next: "severity",
    },
    severity: {
      id: "severity",
      text: "How severe is it?",
      type: "numeric_scale",
      min: 1,
      max: 10,
      minLabel: "Mild",
      maxLabel: "Worst possible",
      next: "vision",
    },
    vision: {
      id: "vision",
      text: "Any blurred vision, sensitivity to light, or seeing flashes?",
      type: "yes_no",
      next: "weakness",
    },
    weakness: {
      id: "weakness",
      text: "Any weakness, numbness, or difficulty speaking?",
      type: "yes_no",
      next: "vomiting",
    },
    vomiting: {
      id: "vomiting",
      text: "Any nausea or vomiting with the headache?",
      type: "yes_no",
      next: "END",
    },
  },
};
