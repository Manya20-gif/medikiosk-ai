import { useEffect, useState } from "react";
import { NotebookPen, Check } from "lucide-react";

export default function DoctorNotes({ notes, onSave }) {
  const [draft, setDraft] = useState(notes ?? "");
  const [justSaved, setJustSaved] = useState(false);

  // Reset the draft whenever the selected patient (and therefore its
  // stored notes) changes.
  useEffect(() => {
    setDraft(notes ?? "");
    setJustSaved(false);
  }, [notes]);

  const handleSave = () => {
    onSave(draft);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1800);
  };

  return (
    <div className="doc-card">
      <div className="flex items-center gap-2">
        <NotebookPen size={17} className="text-primary" />
        <h2 className="text-base font-bold text-ink">Doctor notes</h2>
      </div>
      <p className="mt-1 text-xs text-muted">Kept in this session only — not yet saved to a database (prototype).</p>

      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={5}
        placeholder="Add your clinical notes for this consultation..."
        className="doc-input mt-3"
      />

      <button type="button" onClick={handleSave} className="doc-btn-primary mt-3">
        {justSaved ? <Check size={14} /> : null}
        {justSaved ? "Saved" : "Save notes"}
      </button>
    </div>
  );
}
