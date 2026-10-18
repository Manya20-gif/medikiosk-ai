import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import SpeakButton from "../voice/SpeakButton.jsx";

export default function QuestionStep({
  question,
  onAnswer,
  onBack,
  canGoBack,
  questionNumber,
  languageCode = "en",
}) {
  const [multiSelected, setMultiSelected] = useState([]);
  const [textValue, setTextValue] = useState("");

  // Reset local input state whenever we move to a new question.
  useEffect(() => {
    setMultiSelected([]);
    setTextValue("");
  }, [question.id]);

  const toggleMulti = (value) => {
    setMultiSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const labelForValues = (values) =>
    question.options
      .filter((opt) => values.includes(opt.value))
      .map((opt) => opt.label)
      .join(", ");

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Question {questionNumber}
          </p>
          <h1 className="mt-2 text-2xl font-bold leading-snug text-ink sm:text-3xl">
            {question.text}
          </h1>
        </div>
        <SpeakButton text={question.text} languageCode={languageCode} label="Listen" />
      </div>

      <div className="mt-8">
        {question.type === "yes_no" && (
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => onAnswer("yes", "Yes")}
              className="kiosk-btn-secondary h-24 text-xl"
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => onAnswer("no", "No")}
              className="kiosk-btn-secondary h-24 text-xl"
            >
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
                className="rounded-kiosk border-2 border-border bg-surface px-5 py-5 text-left text-lg font-medium text-ink transition hover:border-primary hover:bg-primary-light"
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
                    className={`flex items-center justify-between rounded-kiosk border-2 px-5 py-5 text-left text-lg font-medium transition ${
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

        {question.type === "numeric_scale" && (
          <div>
            <div className="flex justify-between text-sm font-medium text-muted">
              <span>{question.minLabel}</span>
              <span>{question.maxLabel}</span>
            </div>
            <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-10">
              {Array.from(
                { length: question.max - question.min + 1 },
                (_, i) => question.min + i
              ).map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => onAnswer(num, `${num}/${question.max}`)}
                  className="flex aspect-square items-center justify-center rounded-lg border-2 border-border bg-surface text-lg font-semibold text-ink transition hover:border-primary hover:bg-primary-light"
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        )}

        {question.type === "text" && (
          <div>
            <textarea
              value={textValue}
              onChange={(event) => setTextValue(event.target.value)}
              rows={4}
              placeholder="Type here (optional)"
              className="w-full rounded-kiosk border-2 border-border bg-surface px-4 py-4 text-lg text-ink outline-none focus:border-primary"
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
                  Skip
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {canGoBack && (
        <button
          type="button"
          onClick={onBack}
          className="mt-8 flex items-center gap-1.5 text-sm font-semibold text-muted transition hover:text-primary"
        >
          <ArrowLeft size={16} />
          Back to previous question
        </button>
      )}
    </div>
  );
}
