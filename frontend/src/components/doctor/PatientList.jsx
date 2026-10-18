import { Search, ShieldAlert, Leaf, Stethoscope, Radio } from "lucide-react";
import { consultationTypeLabel } from "../../services/doctorService.js";

export default function PatientList({
  records,
  filteredRecords,
  selectedId,
  onSelect,
  query,
  onQueryChange,
  consultationFilter,
  onConsultationFilterChange,
  redFlagOnly,
  onRedFlagOnlyChange,
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border p-4">
        <h2 className="text-sm font-bold text-ink">Patients</h2>
        <div className="relative mt-3">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search name or complaint"
            className="doc-input pl-9"
          />
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {[
            { value: "all", label: "All" },
            { value: "modern", label: "Modern" },
            { value: "ayush", label: "AYUSH" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onConsultationFilterChange(opt.value)}
              className={`rounded-full px-2.5 py-1 text-xs font-semibold transition ${
                consultationFilter === opt.value
                  ? "bg-primary text-white"
                  : "bg-canvas text-muted hover:text-ink"
              }`}
            >
              {opt.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => onRedFlagOnlyChange(!redFlagOnly)}
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition ${
              redFlagOnly ? "bg-alert text-white" : "bg-canvas text-muted hover:text-ink"
            }`}
          >
            <ShieldAlert size={12} />
            Red flag
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredRecords.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted">No patients match this filter.</p>
        ) : (
          <ul className="divide-y divide-border">
            {filteredRecords.map((record) => {
              const isSelected = record.id === selectedId;
              const isAyush = record.consultationType === "ayush";
              return (
                <li key={record.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(record.id)}
                    className={`block w-full px-4 py-3 text-left transition ${
                      isSelected ? "bg-primary-light" : "hover:bg-canvas"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-bold text-ink">{record.name}</p>
                      {record.isLive && (
                        <span className="flex items-center gap-1 rounded-full bg-success-light px-1.5 py-0.5 text-[10px] font-bold text-success">
                          <Radio size={10} />
                          LIVE
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-muted">
                      {[record.age && `${record.age} yrs`, record.gender].filter(Boolean).join(" · ")}
                    </p>
                    <p className="mt-1 truncate text-xs font-medium text-ink">
                      {record.chiefComplaintLabel ?? "No chief complaint recorded"}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <span
                        className={`doc-badge ${
                          isAyush ? "bg-accent-light text-accent-dark" : "bg-primary-light text-primary-dark"
                        }`}
                      >
                        {isAyush ? <Leaf size={10} /> : <Stethoscope size={10} />}
                        {consultationTypeLabel(record.consultationType)}
                      </span>
                      {record.redFlags.length > 0 ? (
                        <span className="doc-badge bg-alert-light text-alert">
                          <ShieldAlert size={10} />
                          {record.redFlags.length} red flag{record.redFlags.length > 1 ? "s" : ""}
                        </span>
                      ) : (
                        <span className="doc-badge bg-success-light text-success">No red flag</span>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <p className="border-t border-border px-4 py-2 text-[11px] text-muted">
        {filteredRecords.length} of {records.length} patients shown &middot; demo data
      </p>
    </div>
  );
}
