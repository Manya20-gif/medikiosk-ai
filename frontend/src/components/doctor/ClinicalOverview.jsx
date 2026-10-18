import { Stethoscope, Clock, Gauge, ShieldAlert, Pill, History } from "lucide-react";

const toneClasses = {
  alert: "bg-alert-light text-alert",
  accent: "bg-accent-light text-accent-dark",
  success: "bg-success-light text-success",
  neutral: "bg-canvas text-muted",
};

function OverviewCard({ icon: Icon, label, value, sub, tone = "neutral" }) {
  return (
    <div className="doc-card-tight">
      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${toneClasses[tone]}`}>
        <Icon size={17} />
      </div>
      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-0.5 text-sm font-bold leading-snug text-ink">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-muted">{sub}</p>}
    </div>
  );
}

export default function ClinicalOverview({ record }) {
  return (
    <div>
      <p className="doc-section-title">Quick clinical overview</p>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <OverviewCard
          icon={Stethoscope}
          label="Chief Complaint"
          value={record.chiefComplaintLabel ?? "Not recorded"}
        />
        <OverviewCard icon={Clock} label="Duration" value={record.duration} />
        <OverviewCard icon={Gauge} label="Severity" value={record.severity.label} tone={record.severity.tone} />
        <OverviewCard
          icon={ShieldAlert}
          label="Allergies"
          value={record.allergies}
          tone={record.allergies && record.allergies !== "No known allergies" && record.allergies !== "Not recorded during intake" ? "accent" : "neutral"}
        />
        <OverviewCard
          icon={Pill}
          label="Current Medicines"
          value={
            record.currentMedicines.length === 0
              ? "None reported"
              : `${record.currentMedicines.length} reported medication${record.currentMedicines.length > 1 ? "s" : ""}`
          }
        />
        <OverviewCard
          icon={History}
          label="Previous Conditions"
          value={
            record.previousConditions.length === 0
              ? "None reported"
              : `${record.previousConditions.length} reported condition${record.previousConditions.length > 1 ? "s" : ""}`
          }
        />
      </div>
    </div>
  );
}
