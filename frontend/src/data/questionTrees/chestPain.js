// Chest pain question tree.
// Structure: { start, questions: { [id]: node } }
// node.next is either:
//   - a string: always go to that question id next
//   - an object: maps the given answer to a question id, with an optional
//     "_default" key used when the answer isn't a listed key (e.g. multi_choice)
//   - "END": finishes this complaint's history taking

export const chestPainTree = {
  id: "chest_pain",
  start: "onset",
  questions: {
    onset: {
      id: "onset",
      text: "When did the chest pain start?",
      type: "single_choice",
      options: [
        { value: "lt_1h", label: "Less than 1 hour ago" },
        { value: "1_24h", label: "1–24 hours ago" },
        { value: "1_7d", label: "1–7 days ago" },
        { value: "gt_7d", label: "More than a week ago" },
      ],
      next: "location",
    },
    location: {
      id: "location",
      text: "Where exactly is the pain?",
      type: "single_choice",
      options: [
        { value: "center", label: "Centre of the chest" },
        { value: "left", label: "Left side" },
        { value: "right", label: "Right side" },
        { value: "whole", label: "Whole chest" },
      ],
      next: "nature",
    },
    nature: {
      id: "nature",
      text: "What does the pain feel like?",
      type: "single_choice",
      options: [
        { value: "sharp", label: "Sharp / stabbing" },
        { value: "pressure", label: "Dull / pressure-like" },
        { value: "burning", label: "Burning" },
        { value: "crushing", label: "Crushing / squeezing" },
      ],
      next: "severity",
    },
    severity: {
      id: "severity",
      text: "How severe is the pain right now?",
      type: "numeric_scale",
      min: 1,
      max: 10,
      minLabel: "Mild",
      maxLabel: "Worst possible",
      next: "radiates",
    },
    radiates: {
      id: "radiates",
      text: "Does the pain spread to another part of your body?",
      type: "yes_no",
      next: { yes: "radiates_where", no: "breathing_difficulty" },
    },
    radiates_where: {
      id: "radiates_where",
      text: "Where does it spread to?",
      type: "single_choice",
      options: [
        { value: "left_arm", label: "Left arm" },
        { value: "jaw", label: "Jaw" },
        { value: "back", label: "Back" },
        { value: "neck", label: "Neck" },
      ],
      next: "breathing_difficulty",
    },
    breathing_difficulty: {
      id: "breathing_difficulty",
      text: "Do you have any difficulty breathing?",
      type: "yes_no",
      next: { yes: "sweating", no: "sweating" },
    },
    sweating: {
      id: "sweating",
      text: "Have you been sweating more than usual?",
      type: "yes_no",
      next: "nausea",
    },
    nausea: {
      id: "nausea",
      text: "Do you feel nauseous or like vomiting?",
      type: "yes_no",
      next: "aggravating",
    },
    aggravating: {
      id: "aggravating",
      text: "What makes the pain worse? (select all that apply)",
      type: "multi_choice",
      options: [
        { value: "exertion", label: "Physical exertion" },
        { value: "deep_breath", label: "Deep breathing" },
        { value: "lying_down", label: "Lying down" },
        { value: "eating", label: "Eating" },
        { value: "none", label: "Nothing in particular" },
      ],
      next: "relieving",
    },
    relieving: {
      id: "relieving",
      text: "What makes it better? (select all that apply)",
      type: "multi_choice",
      options: [
        { value: "rest", label: "Resting" },
        { value: "sitting_up", label: "Sitting up" },
        { value: "medicine", label: "Medicines" },
        { value: "nothing", label: "Nothing helps" },
      ],
      next: "END",
    },
  },
};
