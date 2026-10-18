// PHASE 7 — AYUSH case-taking question bank.
//
// This is a structured *information-collection* questionnaire only.
// It never computes or displays a Prakriti/Vikriti "result" — patient
// responses are recorded as-is for the clinician to interpret. See
// utils/ayushQuestionEngine.js for how these sections are stepped
// through, and components/ayush/ for the UI that renders them.
//
// Each section mirrors a concept from the SIH AYUSH problem statement.
// `sanskrit` (when present) is shown alongside the plain-English label
// so the interface stays patient-friendly without losing the underlying
// AYUSH terminology for the clinician reviewing it later.

export const ayushSections = [
  {
    id: "prakriti",
    sanskrit: "Prakriti",
    label: "Natural constitution",
    description: "A few questions about your general, everyday tendencies — not how you feel today.",
    questions: [
      {
        id: "prakriti_build",
        text: "Which best describes your usual body build?",
        type: "single_choice",
        options: [
          { value: "light", label: "Thin, light frame" },
          { value: "medium", label: "Medium, muscular build" },
          { value: "solid", label: "Larger, solid build" },
          { value: "mixed", label: "Mixed / difficult to say" },
        ],
      },
      {
        id: "prakriti_appetite",
        text: "How would you describe your usual appetite?",
        type: "single_choice",
        options: [
          { value: "variable", label: "Variable — sometimes I forget to eat" },
          { value: "strong", label: "Strong — I get irritable if a meal is delayed" },
          { value: "steady", label: "Steady — I can skip a meal easily" },
          { value: "mixed", label: "Mixed / difficult to say" },
        ],
      },
      {
        id: "prakriti_sleep",
        text: "How do you usually sleep?",
        type: "single_choice",
        options: [
          { value: "light", label: "Light sleeper, easily disturbed" },
          { value: "moderate", label: "Moderate, fairly sound sleep" },
          { value: "deep", label: "Deep sleeper, hard to wake" },
          { value: "mixed", label: "Mixed / difficult to say" },
        ],
      },
      {
        id: "prakriti_energy",
        text: "Which is closest to your usual energy and activity level?",
        type: "single_choice",
        options: [
          { value: "energetic", label: "Usually energetic and active" },
          { value: "intense", label: "Usually intense and driven" },
          { value: "calm", label: "Usually calm and steady" },
          { value: "mixed", label: "Mixed / difficult to say" },
        ],
      },
      {
        id: "prakriti_temperature",
        text: "Which temperature do you usually prefer?",
        type: "single_choice",
        options: [
          { value: "warmth", label: "I prefer warmth, feel cold easily" },
          { value: "cool", label: "I prefer cool, feel hot easily" },
          { value: "comfortable", label: "Comfortable in most temperatures" },
          { value: "mixed", label: "Mixed / difficult to say" },
        ],
      },
    ],
  },
  {
    id: "vikriti",
    sanskrit: "Vikriti",
    label: "Current changes from your usual state",
    description: "Now let's note anything that feels different from your normal routine recently.",
    questions: [
      {
        id: "vikriti_routine_change",
        text: "Have you noticed any change from your normal routine recently?",
        type: "yes_no",
      },
      {
        id: "vikriti_appetite_change",
        text: "How has your appetite changed recently?",
        type: "single_choice",
        options: [
          { value: "no_change", label: "No change" },
          { value: "increased", label: "Increased" },
          { value: "decreased", label: "Decreased" },
          { value: "comes_and_goes", label: "Comes and goes" },
        ],
      },
      {
        id: "vikriti_sleep_change",
        text: "Has your sleep changed recently?",
        type: "single_choice",
        options: [
          { value: "no_change", label: "No change" },
          { value: "less", label: "Sleeping less than usual" },
          { value: "more", label: "Sleeping more than usual" },
          { value: "disturbed", label: "Sleep feels disturbed" },
        ],
      },
      {
        id: "vikriti_digestion_change",
        text: "Has your digestion changed recently?",
        type: "single_choice",
        options: [
          { value: "no_change", label: "No change" },
          { value: "sluggish", label: "Feels sluggish / heavy" },
          { value: "quick", label: "Feels quicker than usual" },
          { value: "irregular", label: "Irregular" },
        ],
      },
      {
        id: "vikriti_energy_change",
        text: "Has your energy level changed recently?",
        type: "single_choice",
        options: [
          { value: "no_change", label: "No change" },
          { value: "lower", label: "Lower than usual" },
          { value: "higher", label: "Higher / restless than usual" },
        ],
      },
      {
        id: "vikriti_bowel_change",
        text: "Has there been a recent change in your bowel habits?",
        type: "single_choice",
        options: [
          { value: "no_change", label: "No change" },
          { value: "constipation", label: "More constipated" },
          { value: "loose", label: "Looser than usual" },
          { value: "irregular", label: "Irregular timing" },
        ],
      },
      {
        id: "vikriti_stress",
        text: "Have you been feeling more stressed than usual?",
        type: "yes_no",
      },
      {
        id: "vikriti_current_symptoms",
        text: "In your own words, please describe any current symptoms (optional).",
        type: "text",
        optional: true,
        voiceEnabled: true,
      },
    ],
  },
  {
    id: "agni",
    sanskrit: "Agni",
    label: "Digestion & metabolism",
    description: "A few questions about how your digestion usually works.",
    questions: [
      {
        id: "agni_hunger",
        text: "How is your appetite usually?",
        type: "single_choice",
        options: [
          { value: "weak", label: "Weak" },
          { value: "normal", label: "Normal" },
          { value: "strong", label: "Strong" },
          { value: "variable", label: "Variable" },
        ],
      },
      {
        id: "agni_regular_hunger",
        text: "Do you feel hungry at roughly the same times each day?",
        type: "yes_no",
      },
      {
        id: "agni_indigestion",
        text: "Do you often experience indigestion?",
        type: "yes_no",
      },
      {
        id: "agni_heaviness",
        text: "Do you feel heaviness after meals?",
        type: "yes_no",
      },
      {
        id: "agni_excessive_hunger",
        text: "Do you experience excessive hunger?",
        type: "yes_no",
      },
      {
        id: "agni_irregular",
        text: "Is your appetite irregular from day to day?",
        type: "yes_no",
      },
      {
        id: "agni_notes",
        text: "Anything else about your digestion you'd like to add? (optional)",
        type: "text",
        optional: true,
      },
    ],
  },
  {
    id: "koshtha",
    sanskrit: "Koshtha",
    label: "Bowel habits",
    description: "Simple questions about your bowel movements.",
    questions: [
      {
        id: "koshtha_frequency",
        text: "How often do you usually pass stool?",
        type: "single_choice",
        options: [
          { value: "more_than_once", label: "More than once a day" },
          { value: "once_daily", label: "Once a day" },
          { value: "every_other_day", label: "Every other day" },
          { value: "less_often", label: "Less often" },
        ],
      },
      {
        id: "koshtha_regular",
        text: "Is your bowel movement generally regular?",
        type: "yes_no",
      },
      {
        id: "koshtha_constipation",
        text: "Do you experience constipation?",
        type: "yes_no",
      },
      {
        id: "koshtha_loose",
        text: "Do you experience loose stools?",
        type: "yes_no",
      },
      {
        id: "koshtha_recent_change",
        text: "Has there been a recent change in your bowel habits?",
        type: "yes_no",
      },
    ],
  },
  {
    id: "ahara",
    sanskrit: "Ahara",
    label: "Diet",
    description: "A few questions about what and how you typically eat.",
    questions: [
      {
        id: "ahara_type",
        text: "Which best describes your diet?",
        type: "single_choice",
        options: [
          { value: "vegetarian", label: "Vegetarian" },
          { value: "non_vegetarian", label: "Non-vegetarian" },
          { value: "eggetarian", label: "Eggetarian" },
          { value: "vegan", label: "Vegan" },
          { value: "other", label: "Other" },
        ],
      },
      {
        id: "ahara_frequency",
        text: "How many meals do you typically eat a day?",
        type: "single_choice",
        options: [
          { value: "one_two", label: "1–2" },
          { value: "three", label: "3" },
          { value: "four_plus", label: "4 or more" },
          { value: "irregular", label: "Irregular" },
        ],
      },
      {
        id: "ahara_appetite",
        text: "How would you rate your appetite at meals?",
        type: "single_choice",
        options: [
          { value: "low", label: "Low" },
          { value: "moderate", label: "Moderate" },
          { value: "high", label: "High" },
          { value: "variable", label: "Variable" },
        ],
      },
      {
        id: "ahara_water",
        text: "How much water do you drink daily, roughly?",
        type: "single_choice",
        options: [
          { value: "lt_1l", label: "Less than 1 litre" },
          { value: "1_2l", label: "1–2 litres" },
          { value: "2_3l", label: "2–3 litres" },
          { value: "gt_3l", label: "More than 3 litres" },
        ],
      },
      {
        id: "ahara_recent_change",
        text: "Have you made any recent changes to your diet?",
        type: "yes_no",
      },
      {
        id: "ahara_foods",
        text: "Which of these do you eat regularly? (select all that apply)",
        type: "multi_choice",
        options: [
          { value: "rice", label: "Rice" },
          { value: "wheat", label: "Wheat" },
          { value: "pulses", label: "Pulses / legumes" },
          { value: "dairy", label: "Dairy" },
          { value: "fried", label: "Fried foods" },
          { value: "spicy", label: "Spicy foods" },
          { value: "fruits", label: "Fruits" },
          { value: "vegetables", label: "Vegetables" },
        ],
      },
      {
        id: "ahara_allergy",
        text: "Any food-related discomfort or allergies? (optional)",
        type: "text",
        optional: true,
      },
    ],
  },
  {
    id: "vihara",
    sanskrit: "Vihara",
    label: "Lifestyle",
    description: "A few questions about your day-to-day routine and activity.",
    questions: [
      {
        id: "vihara_activity",
        text: "How physically active are you, day to day?",
        type: "single_choice",
        options: [
          { value: "sedentary", label: "Mostly sedentary" },
          { value: "light", label: "Lightly active" },
          { value: "moderate", label: "Moderately active" },
          { value: "very_active", label: "Very active" },
        ],
      },
      {
        id: "vihara_exercise",
        text: "How often do you exercise?",
        type: "single_choice",
        options: [
          { value: "rarely", label: "Rarely" },
          { value: "one_two_week", label: "1–2 times a week" },
          { value: "three_five_week", label: "3–5 times a week" },
          { value: "daily", label: "Daily" },
        ],
      },
      {
        id: "vihara_sleep_duration",
        text: "How many hours do you usually sleep?",
        type: "single_choice",
        options: [
          { value: "lt_5", label: "Less than 5 hours" },
          { value: "5_6", label: "5–6 hours" },
          { value: "7_8", label: "7–8 hours" },
          { value: "gt_8", label: "More than 8 hours" },
        ],
      },
      {
        id: "vihara_sleep_quality",
        text: "How would you rate your sleep quality?",
        type: "single_choice",
        options: [
          { value: "poor", label: "Poor" },
          { value: "fair", label: "Fair" },
          { value: "good", label: "Good" },
          { value: "excellent", label: "Excellent" },
        ],
      },
      {
        id: "vihara_routine",
        text: "How regular is your daily routine?",
        type: "single_choice",
        options: [
          { value: "very_irregular", label: "Very irregular" },
          { value: "somewhat_irregular", label: "Somewhat irregular" },
          { value: "fairly_regular", label: "Fairly regular" },
          { value: "very_regular", label: "Very regular" },
        ],
      },
      {
        id: "vihara_work",
        text: "What best describes your main daily activity?",
        type: "single_choice",
        options: [
          { value: "desk", label: "Desk-based work / study" },
          { value: "physical", label: "Physically active work" },
          { value: "mixed", label: "Mixed" },
          { value: "not_working", label: "Not currently working" },
        ],
      },
      {
        id: "vihara_screen_time",
        text: "How many hours a day do you spend on screens?",
        type: "single_choice",
        options: [
          { value: "lt_2", label: "Less than 2 hours" },
          { value: "2_4", label: "2–4 hours" },
          { value: "4_8", label: "4–8 hours" },
          { value: "gt_8", label: "More than 8 hours" },
        ],
      },
      {
        id: "vihara_stress_level",
        text: "How would you rate your day-to-day stress level?",
        type: "single_choice",
        options: [
          { value: "low", label: "Low" },
          { value: "moderate", label: "Moderate" },
          { value: "high", label: "High" },
          { value: "very_high", label: "Very high" },
        ],
      },
    ],
  },
  {
    id: "nidana",
    sanskrit: "Nidana",
    label: "Possible contributing factors",
    description:
      "These are recent factors that may be relevant — not confirmed causes. The clinician will interpret them.",
    questions: [
      { id: "nidana_diet_change", text: "Any recent change in diet?", type: "yes_no" },
      { id: "nidana_sleep_irregular", text: "Any recent irregular sleep?", type: "yes_no" },
      { id: "nidana_stress", text: "Any recent stressful events?", type: "yes_no" },
      { id: "nidana_activity_change", text: "Any recent change in physical activity?", type: "yes_no" },
      { id: "nidana_travel", text: "Any recent travel?", type: "yes_no" },
      {
        id: "nidana_environment",
        text: "Any recent change in environment or weather exposure?",
        type: "yes_no",
      },
      { id: "nidana_illness", text: "Any recent illness or infection?", type: "yes_no" },
      {
        id: "nidana_notes",
        text: "Anything else you think may be relevant? (optional)",
        type: "text",
        optional: true,
      },
    ],
  },
  {
    id: "dashavidha",
    sanskrit: "Dashavidha Pariksha",
    label: "Ten-fold clinical examination",
    description:
      "A few more general questions the clinician uses alongside Prakriti and Vikriti, already covered earlier.",
    questions: [
      {
        id: "dashavidha_sara",
        sanskrit: "Sara",
        text: "Tissue quality — how would you describe your general vitality (skin, hair, nails)?",
        type: "single_choice",
        options: [
          { value: "strong", label: "Strong and resilient" },
          { value: "average", label: "Average" },
          { value: "delicate", label: "Delicate" },
          { value: "not_sure", label: "Not sure" },
        ],
      },
      {
        id: "dashavidha_samhanana",
        sanskrit: "Samhanana",
        text: "Body compactness — how would you describe your physical build?",
        type: "single_choice",
        options: [
          { value: "compact", label: "Well-knit and compact" },
          { value: "average", label: "Average" },
          { value: "loose", label: "Loosely built" },
          { value: "not_sure", label: "Not sure" },
        ],
      },
      {
        id: "dashavidha_pramana",
        sanskrit: "Pramana",
        text: "Body measurements / proportions — how would you describe your overall proportions?",
        type: "single_choice",
        options: [
          { value: "well_proportioned", label: "Well-proportioned" },
          { value: "slightly_uneven", label: "Slightly uneven" },
          { value: "not_sure", label: "Not sure" },
        ],
      },
      {
        id: "dashavidha_satmya",
        sanskrit: "Satmya",
        text: "Suitability — how well do you adapt to new foods, climates, or routines?",
        type: "single_choice",
        options: [
          { value: "easily", label: "Adapt easily" },
          { value: "some_difficulty", label: "Adapt with some difficulty" },
          { value: "struggle", label: "Struggle to adapt" },
          { value: "not_sure", label: "Not sure" },
        ],
      },
      {
        id: "dashavidha_sattva",
        sanskrit: "Sattva",
        text: "Mental strength — how would you describe your resilience under stress?",
        type: "single_choice",
        options: [
          { value: "very_resilient", label: "Very resilient" },
          { value: "moderately_resilient", label: "Moderately resilient" },
          { value: "easily_affected", label: "Easily affected" },
          { value: "not_sure", label: "Not sure" },
        ],
      },
      {
        id: "dashavidha_ahara_shakti",
        sanskrit: "Ahara Shakti",
        text: "Digestive capacity — how would you rate your overall capacity to eat and digest food?",
        type: "single_choice",
        options: [
          { value: "high", label: "High" },
          { value: "moderate", label: "Moderate" },
          { value: "low", label: "Low" },
          { value: "variable", label: "Variable" },
        ],
      },
      {
        id: "dashavidha_vyayama_shakti",
        sanskrit: "Vyayama Shakti",
        text: "Exercise capacity — how would you rate your capacity for physical exertion?",
        type: "single_choice",
        options: [
          { value: "high", label: "High" },
          { value: "moderate", label: "Moderate" },
          { value: "low", label: "Low" },
          { value: "variable", label: "Variable" },
        ],
      },
      {
        id: "dashavidha_vaya",
        sanskrit: "Vaya",
        text: "Life stage — which best describes your general life stage?",
        type: "single_choice",
        options: [
          { value: "growth", label: "Growth stage (child / young adult)" },
          { value: "adult", label: "Adult, stable stage" },
          { value: "older_adult", label: "Older adult stage" },
        ],
      },
    ],
  },
];

export const ayushSectionIds = ayushSections.map((section) => section.id);
