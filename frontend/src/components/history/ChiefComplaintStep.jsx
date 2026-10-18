import { useState } from "react";
import {
  HeartPulse,
  Thermometer,
  Wind,
  BrainCircuit,
  Circle,
  Activity,
  Bone,
  MoreHorizontal,
  ArrowRight,
  Info,
} from "lucide-react";
import { chiefComplaints } from "../../data/chiefComplaints.js";
import { matchChiefComplaint } from "../../utils/symptomMatcher.js";
import VoiceRecorderButton from "../voice/VoiceRecorderButton.jsx";

const iconMap = {
  HeartPulse,
  Thermometer,
  Wind,
  BrainCircuit,
  Circle,
  Activity,
  Bone,
  MoreHorizontal,
};

export default function ChiefComplaintStep({ onSelect, languageCode = "en" }) {
  const [freeText, setFreeText] = useState("");
  const [noMatchNotice, setNoMatchNotice] = useState(false);

  const matchAndSelect = (text) => {
    const matchedId = matchChiefComplaint(text);
    if (matchedId) {
      const complaint = chiefComplaints.find((c) => c.id === matchedId);
      onSelect(matchedId, complaint?.label ?? matchedId);
    } else {
      setNoMatchNotice(true);
      onSelect("other", text.trim() || "Other complaint");
    }
  };

  const handleFreeTextSubmit = (event) => {
    event.preventDefault();
    matchAndSelect(freeText);
  };

  const handleVoiceTranscript = (transcript) => {
    setFreeText(transcript);
    matchAndSelect(transcript);
  };

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      <h1 className="text-3xl font-bold text-ink">What's bothering you today?</h1>
      <p className="mt-2 text-muted">Choose the one that fits best, or describe it below.</p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {chiefComplaints.map((complaint) => {
          const Icon = iconMap[complaint.icon] ?? Circle;
          return (
            <button
              key={complaint.id}
              type="button"
              onClick={() => onSelect(complaint.id, complaint.label)}
              className="flex flex-col items-center gap-2.5 rounded-kiosk border-2 border-border bg-surface px-4 py-6 text-center transition hover:border-primary hover:bg-primary-light"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-light text-primary">
                <Icon size={22} strokeWidth={2} />
              </span>
              <span className="text-sm font-semibold leading-tight text-ink">
                {complaint.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-10 rounded-kiosk border border-border bg-surface p-5">
        <h2 className="text-sm font-semibold text-ink">Or describe it in your own words</h2>
        <p className="mt-1 text-xs text-muted">
          Demo rule-based matching &middot; works in English or Hindi (e.g. "सीने में दर्द")
        </p>
        <form onSubmit={handleFreeTextSubmit} className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={freeText}
            onChange={(event) => {
              setFreeText(event.target.value);
              setNoMatchNotice(false);
            }}
            placeholder="e.g. मुझे सीने में दर्द हो रहा है"
            className="flex-1 rounded-kiosk border-2 border-border bg-canvas px-4 py-3.5 text-base text-ink outline-none focus:border-primary"
          />
          <button type="submit" className="kiosk-btn-primary shrink-0" disabled={!freeText.trim()}>
            Continue
            <ArrowRight size={18} />
          </button>
        </form>
        {noMatchNotice && (
          <p className="mt-3 flex items-start gap-2 text-sm text-muted">
            <Info size={16} className="mt-0.5 shrink-0" />
            We couldn't match that to a specific complaint, so we'll ask some general
            questions instead.
          </p>
        )}
      </div>

      <div className="mt-4">
        <VoiceRecorderButton languageCode={languageCode} onTranscriptConfirmed={handleVoiceTranscript} />
      </div>
    </div>
  );
}
