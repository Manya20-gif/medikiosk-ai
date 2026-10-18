import { useState } from "react";
import { Pill, FlaskConical, FileText, File, Eye } from "lucide-react";
import DocumentViewerModal from "./DocumentViewerModal.jsx";

const iconMap = {
  prescription: Pill,
  lab_report: FlaskConical,
  discharge_summary: FileText,
  other: File,
};

export default function DocumentsPanel({ documents }) {
  const [viewing, setViewing] = useState(null);

  return (
    <div className="doc-card">
      <div className="flex items-center gap-2">
        <FileText size={17} className="text-primary" />
        <h2 className="text-base font-bold text-ink">Medical documents ({documents.length})</h2>
      </div>

      {documents.length === 0 ? (
        <p className="mt-3 text-sm text-muted">No documents uploaded for this visit.</p>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => {
            const Icon = iconMap[doc.typeId] ?? File;
            const dateLabel = doc.extractedFields?.documentDate?.value ?? "Date not recorded";
            return (
              <div key={doc.id} className="rounded-xl border border-border p-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-light text-primary">
                  <Icon size={17} />
                </span>
                <p className="mt-2 text-sm font-bold text-ink">{doc.typeLabel}</p>
                <p className="text-xs text-muted">{dateLabel}</p>
                <p className="mt-1 text-xs font-medium text-success">OCR processed &#10003;</p>
                <button type="button" onClick={() => setViewing(doc)} className="doc-btn-secondary mt-3 w-full">
                  <Eye size={14} />
                  View
                </button>
              </div>
            );
          })}
        </div>
      )}

      <DocumentViewerModal document={viewing} onClose={() => setViewing(null)} />
    </div>
  );
}
