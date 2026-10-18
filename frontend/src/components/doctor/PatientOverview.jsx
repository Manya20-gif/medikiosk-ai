import { User, Stethoscope, Leaf, Radio } from "lucide-react";
import { consultationTypeLabel } from "../../services/doctorService.js";

export default function PatientOverview({ record }) {
  const isAyush = record.consultationType === "ayush";

  return (
    <div className="doc-card flex flex-wrap items-start justify-between gap-4">
      <div className="flex items-start gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">
          <User size={26} />
        </span>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold text-ink">{record.name}</h1>
            {record.isLive && (
              <span className="flex items-center gap-1 rounded-full bg-success-light px-2 py-0.5 text-[11px] font-bold text-success">
                <Radio size={11} />
                Live session
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm text-muted">
            {[record.age && `${record.age} yrs`, record.gender].filter(Boolean).join(" · ") || "Details not recorded"}
            <span className="mx-1.5">&middot;</span>
            Patient ID: <span className="font-medium text-ink">{record.patientId}</span>
          </p>
        </div>
      </div>

      <div className="flex flex-col items-end gap-1.5">
        <span
          className={`doc-badge px-3 py-1 text-xs ${
            isAyush ? "bg-accent-light text-accent-dark" : "bg-primary-light text-primary-dark"
          }`}
        >
          {isAyush ? <Leaf size={13} /> : <Stethoscope size={13} />}
          Consultation: {consultationTypeLabel(record.consultationType)}
        </span>
        <span className="text-xs text-muted">
          Session: <span className="font-semibold text-ink">{record.isLive ? "In progress" : "Completed"}</span>
        </span>
      </div>
    </div>
  );
}
