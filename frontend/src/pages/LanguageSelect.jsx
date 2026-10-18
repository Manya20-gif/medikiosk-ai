import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ArrowRight } from "lucide-react";
import { languages } from "../data/languages.js";
import { useSession } from "../context/SessionContext.jsx";

export default function LanguageSelect() {
  const navigate = useNavigate();
  const { languageCode, setLanguageCode } = useSession();
  const [selected, setSelected] = useState(languageCode);

  const handleContinue = () => {
    if (!selected) return;
    setLanguageCode(selected);
    navigate("/consent");
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-10">
      <h1 className="text-3xl font-bold text-ink">Choose your language</h1>
      <p className="mt-2 text-muted">अपनी भाषा चुनें &middot; உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்</p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {languages.map((lang) => {
          const isSelected = selected === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => setSelected(lang.code)}
              aria-pressed={isSelected}
              className={`relative flex flex-col items-start rounded-kiosk border-2 px-5 py-6 text-left transition
                ${
                  isSelected
                    ? "border-primary bg-primary-light"
                    : "border-border bg-surface hover:border-primary/50"
                }`}
            >
              {isSelected && (
                <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white">
                  <Check size={14} strokeWidth={3} />
                </span>
              )}
              <span className="text-xl font-heading font-semibold text-ink">
                {lang.native}
              </span>
              <span className="mt-1 text-sm text-muted">{lang.name}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-10 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          You can switch languages at any time during your session.
        </p>
        <button
          type="button"
          onClick={handleContinue}
          disabled={!selected}
          className="kiosk-btn-primary w-full sm:w-auto"
        >
          Continue
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}
