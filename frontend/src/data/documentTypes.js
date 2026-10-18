// Document categories the patient can upload at the kiosk in Phase 5.
// `icon` keys map to lucide-react icons in DocumentTypeStep.jsx.
export const documentTypes = [
  {
    id: "prescription",
    label: "Prescription",
    icon: "Pill",
    description: "A doctor's prescription with medicines and dosage.",
  },
  {
    id: "lab_report",
    label: "Laboratory Report",
    icon: "FlaskConical",
    description: "Blood test, urine test, or other lab investigation results.",
  },
  {
    id: "discharge_summary",
    label: "Discharge Summary",
    icon: "FileText",
    description: "Summary given at the end of a hospital stay.",
  },
  {
    id: "other",
    label: "Other Medical Document",
    icon: "File",
    description: "Any other medical document you'd like to share with the doctor.",
  },
];
