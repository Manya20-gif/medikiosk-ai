// Central definition of the patient-facing kiosk journey.
// Each phase of the build lights up the corresponding route.
// `ready` = false renders a "coming in a later phase" placeholder.

export const journeySteps = [
  { id: "language", path: "/language", label: "Language", phase: 2, ready: true },
  { id: "consent", path: "/consent", label: "Consent", phase: 2, ready: true },
  { id: "details", path: "/details", label: "Your Details", phase: 2, ready: true },
  {
    id: "consultation-type",
    path: "/consultation-type",
    label: "Consultation Type",
    phase: 7,
    ready: true,
  },
  { id: "history", path: "/history", label: "History", phase: 3, ready: true },
  { id: "documents", path: "/documents", label: "Documents", phase: 5, ready: true },
  { id: "timeline", path: "/timeline", label: "Timeline", phase: 6, ready: true },
  { id: "summary", path: "/summary", label: "Summary", phase: 8, ready: true },
];
