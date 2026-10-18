import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, ArrowRight, RotateCcw } from "lucide-react";
import { consentSections } from "../data/consentContent.js";
import { useSession } from "../context/SessionContext.jsx";
import SpeakButton from "../components/voice/SpeakButton.jsx";

export default function Consent() {
  const navigate = useNavigate();
  const { languageCode, consent, setConsent } = useSession();
  const [view, setView] = useState("form"); // "form" | "rejected"

  // Guard: language must be chosen before consent is asked.
  useEffect(() => {
    if (!languageCode) navigate("/language", { replace: true });
  }, [languageCode, navigate]);

  const handleAccept = () => {
    setConsent(true);
    navigate("/details");
  };

  const handleReject = () => {
    setConsent(false);
    setView("rejected");
  };

  const consentSpeechText = [
    "Before we begin. Please review how your information will be used.",
    ...consentSections.map((s) => `${s.title}. ${s.body}`),
    "This is a demo consent. This prototype does not store real patient data.",
  ].join(" ");

  if (view === "rejected") {
    return (
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-alert-light text-alert">
          <ShieldAlert size={26} />
        </span>
        <h1 className="mt-5 text-2xl font-bold text-ink">No problem.</h1>
        <p className="mt-2 text-muted">
          We won't collect any information through this kiosk. Please speak with the
          front-desk staff, who can register you the usual way.
        </p>
        <button
          type="button"
          onClick={() => setView("form")}
          className="kiosk-btn-secondary mt-8"
        >
          <RotateCcw size={18} />
          I changed my mind
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-ink">Before we begin</h1>
          <p className="mt-2 text-muted">Please review how your information will be used.</p>
        </div>
        <SpeakButton text={consentSpeechText} languageCode={languageCode ?? "en"} />
      </div>

      <div className="mt-6 space-y-4">
        {consentSections.map((section) => (
          <div key={section.title} className="kiosk-card">
            <h2 className="text-base font-semibold text-ink">{section.title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{section.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-kiosk border-2 border-dashed border-accent/50 bg-accent-light px-4 py-3 text-sm font-medium text-accent-dark">
        Demo consent — this prototype does not store real patient data.
      </div>

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button type="button" onClick={handleReject} className="kiosk-btn-secondary">
          I do not consent
        </button>
        <button type="button" onClick={handleAccept} className="kiosk-btn-primary">
          I understand and agree
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}
