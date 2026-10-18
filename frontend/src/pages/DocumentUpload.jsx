import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Plus, FolderOpen } from "lucide-react";
import { useSession } from "../context/SessionContext.jsx";
import AiDisclaimer from "../components/layout/AiDisclaimer.jsx";
import DocumentTypeStep from "../components/documents/DocumentTypeStep.jsx";
import DocumentUploadStep from "../components/documents/DocumentUploadStep.jsx";
import DocumentCard from "../components/documents/DocumentCard.jsx";

export default function DocumentUpload() {
  const navigate = useNavigate();
  const { consent, patient, clinicalHistory, documents, addDocument, removeDocument } = useSession();
  const [view, setView] = useState("list"); // "list" | "type" | "upload"
  const [selectedType, setSelectedType] = useState(null);

  // Guard: must have consented and registered before this step, same
  // pattern as PatientDetails.jsx / HistoryTaking.jsx.
  useEffect(() => {
    if (consent.given !== true) navigate("/consent", { replace: true });
    else if (!patient.name) navigate("/details", { replace: true });
  }, [consent, patient, navigate]);

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setView("upload");
  };

  const handleSaveDocument = (documentRecord) => {
    addDocument(documentRecord);
    setSelectedType(null);
    setView("list");
  };

  const handleCancelAdd = () => {
    setSelectedType(null);
    setView("list");
  };

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
      <h1 className="text-3xl font-bold text-ink">Medical documents</h1>
      <p className="mt-2 text-muted">
        Upload any prescriptions, lab reports, or discharge summaries you'd like the doctor
        to see. This step is optional — you can continue without uploading anything.
      </p>

      <div className="mt-4 flex items-center justify-between rounded-2xl border border-emerald-600/30 bg-emerald-50/70 p-4">
        <div>
          <span className="font-heading text-sm font-bold text-emerald-950">Looking for In-Depth Dual Analysis?</span>
          <p className="text-xs text-emerald-800">Explore the dedicated AI Document Lab with Doctor & Patient views, sample test cases, and speech playback.</p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/documents-hub")}
          className="shrink-0 rounded-xl bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-800"
        >
          Open Document Lab
        </button>
      </div>

      <div className="mt-6">
        <AiDisclaimer compact />
      </div>

      <div className="mt-6 space-y-4">
        {documents.length === 0 && view === "list" && (
          <div className="flex flex-col items-center gap-2 rounded-kiosk border border-dashed border-border bg-surface py-10 text-center text-muted">
            <FolderOpen size={26} />
            <p className="text-sm">No documents added yet.</p>
          </div>
        )}

        {documents.map((doc) => (
          <DocumentCard key={doc.id} document={doc} onRemove={removeDocument} />
        ))}

        {view === "type" && <DocumentTypeStep onSelect={handleTypeSelect} onCancel={handleCancelAdd} />}

        {view === "upload" && selectedType && (
          <DocumentUploadStep
            documentType={selectedType}
            onSave={handleSaveDocument}
            onCancel={handleCancelAdd}
            patient={patient}
            clinicalHistory={clinicalHistory}
          />
        )}

        {view === "list" && (
          <button
            type="button"
            onClick={() => setView("type")}
            className="flex w-full items-center justify-center gap-2 rounded-kiosk border-2 border-dashed border-primary/40 bg-primary-light py-4 text-base font-semibold text-primary-dark transition hover:bg-primary/20"
          >
            <Plus size={20} />
            Add a document
          </button>
        )}
      </div>

      <div className="mt-8 flex justify-end">
        <button type="button" onClick={() => navigate("/timeline")} className="kiosk-btn-primary">
          Continue
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}
