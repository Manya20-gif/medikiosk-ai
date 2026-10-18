import { User, Stethoscope, Leaf } from "lucide-react";

export default function SummaryPatientCard({ patient, consultationType }) {
  const isAyush = consultationType === "ayush";

  return (
    <div className="kiosk-card flex items-start gap-4">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">
        <User size={22} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-lg font-bold text-ink">{patient.name || "Unnamed patient"}</p>
          <span
            className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              isAyush ? "bg-accent-light text-accent-dark" : "bg-primary-light text-primary-dark"
            }`}
          >
            {isAyush ? <Leaf size={12} /> : <Stethoscope size={12} />}
            {isAyush ? "AYUSH / Ayurveda" : "Modern Medicine"}
          </span>
        </div>
        <p className="mt-1 text-sm text-muted">
          {[patient.age && `${patient.age} yrs`, patient.gender].filter(Boolean).join(" · ") || "Details not recorded"}
        </p>
        {patient.abhaId && <p className="mt-0.5 text-xs text-muted">ABHA: {patient.abhaId}</p>}
      </div>
    </div>
  );
}
