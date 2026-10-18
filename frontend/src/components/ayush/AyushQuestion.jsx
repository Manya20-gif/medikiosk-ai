import { useEffect, useState } from "react";
import { ArrowRight, Check, SkipForward } from "lucide-react";
import SpeakButton from "../voice/SpeakButton.jsx";
import VoiceRecorderButton from "../voice/VoiceRecorderButton.jsx";

/**
 * Renders one AYUSH question and reports the answer back to
 * AyushCaseTaking via onAnswer(value, valueLabel). Deliberately mirrors
 * components/history/QuestionStep.jsx's interaction patterns (touch-first,
 * large targets, SpeakButton for playback) so the AYUSH flow feels like
 * the rest of the kiosk rather than a bolted-on module.
 */
export default function AyushQuestion({ question, existingAnswer, onAnswer, languageCode = "en" }) {
  const [multiSelected, setMultiSelected] = useState(
    Array.isArray(existingAnswer?.value) ? existingAnswer.value : []
  );
  const [textValue, setTextValue] = useState(
    question.type === "text" && typeof existingAnswer?.value === "string" ? existingAnswer.value : ""
  );

  useEffect(() => {
    setMultiSelected(Array.isArray(existingAnswer?.value) ? existingAnswer.value : []);
    setTextValue(question.type === "text" && typeof existingAnswer?.value === "string" ? existingAnswer.value : "");
  }, [question.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleMulti = (value) => {
    setMultiSelected((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  };

  const labelForValues = (values) =>
    question.options
      .filter((opt) => values.includes(opt.value))
      .map((opt) => opt.label)
      .join(", ");

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          {question.sanskrit && (
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">{question.sanskrit}</p>
          )}
          <h2 className="mt-1 text-xl font-bold leading-snug text-ink sm:text-2xl">{question.text}</h2>
        </div>
        <SpeakButton text={question.text} languageCode={languageCode} label="Listen" />
      </div>

      <div className="mt-6">
        {question.type === "yes_no" && (
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => onAnswer("yes", "Yes")}
              className="kiosk-btn-secondary h-20 text-lg"
            >
              Yes
            </button>
            <button type="button" onClick={() => onAnswer("no", "No")} className="kiosk-btn-secondary h-20 text-lg">
              No
            </button>
          </div>
        )}

        {question.type === "single_choice" && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {question.options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onAnswer(option.value, option.label)}
                className="rounded-kiosk border-2 border-border bg-surface px-5 py-4 text-left text-base font-medium text-ink transition hover:border-primary hover:bg-primary-light"
              >
                {option.label}
              </button>
            ))}
          </div>
        )}

        {question.type === "multi_choice" && (
          <div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {question.options.map((option) => {
                const isSelected = multiSelected.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggleMulti(option.value)}
                    aria-pressed={isSelected}
                    className={`flex items-center justify-between rounded-kiosk border-2 px-5 py-4 text-left text-base font-medium transition ${
                      isSelected
                        ? "border-primary bg-primary-light text-primary-dark"
                        : "border-border bg-surface text-ink hover:border-primary/50"
                    }`}
                  >
                    {option.label}
                    {isSelected && (
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white">
                        <Check size={14} strokeWidth={3} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              disabled={multiSelected.length === 0}
              onClick={() => onAnswer(multiSelected, labelForValues(multiSelected))}
              className="kiosk-btn-primary mt-6 w-full sm:w-auto"
            >
              Continue
              <ArrowRight size={20} />
            </button>
          </div>
        )}

        {question.type === "text" && (
          <div>
            <textarea
              value={textValue}
              onChange={(event) => setTextValue(event.target.value)}
              rows={3}
              placeholder="Type here (optional)"
              className="w-full rounded-kiosk border-2 border-border bg-surface px-4 py-4 text-base text-ink outline-none focus:border-primary"
            />
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => onAnswer(textValue.trim(), textValue.trim() || "Not specified")}
                className="kiosk-btn-primary"
              >
                Continue
                <ArrowRight size={20} />
              </button>
              {question.optional && !textValue.trim() && (
                <button
                  type="button"
                  onClick={() => onAnswer("", "Not specified")}
                  className="kiosk-btn-secondary"
                >
                  <SkipForward size={18} />
                  Skip
                </button>
              )}
            </div>
            {question.voiceEnabled && (
              <div className="mt-4">
                <VoiceRecorderButton
                  languageCode={languageCode}
                  onTranscriptConfirmed={(transcript) => {
                    setTextValue(transcript);
                    onAnswer(transcript.trim(), transcript.trim() || "Not specified");
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
