export const breathlessnessTree = {
  id: "breathlessness",
  start: "onset",
  questions: {
    onset: {
      id: "onset",
      text: "When did the breathlessness start?",
      type: "single_choice",
      options: [
        { value: "sudden", label: "Suddenly" },
        { value: "gradual", label: "Gradually, over days/weeks" },
        { value: "chronic", label: "It's a long-standing problem" },
      ],
      next: "trigger",
    },
    trigger: {
      id: "trigger",
      text: "When does it happen?",
      type: "single_choice",
      options: [
        { value: "rest", label: "Even at rest" },
        { value: "exertion", label: "On exertion / walking" },
        { value: "lying_down", label: "When lying down" },
      ],
      next: "chest_pain",
    },
    chest_pain: {
      id: "chest_pain",
      text: "Any chest pain along with it?",
      type: "yes_no",
      next: "swelling",
    },
    swelling: {
      id: "swelling",
      text: "Any swelling in your legs or feet?",
      type: "yes_no",
      next: "bluish",
    },
    bluish: {
      id: "bluish",
      text: "Any bluish discolouration of lips or fingertips?",
      type: "yes_no",
      next: "END",
    },
  },
};
