import { useLocation } from "react-router-dom";
import { Check } from "lucide-react";
import { journeySteps } from "../../data/journeySteps.js";

/**
 * Shows the patient where they are in the intake journey.
 * Purely visual for now — no step is "complete" until later phases
 * add real session state.
 */
export default function StepIndicator() {
  const { pathname } = useLocation();
  const currentIndex = journeySteps.findIndex((step) => step.path === pathname);

  return (
    <ol className="mx-auto flex max-w-3xl items-center justify-between gap-1 px-2">
      {journeySteps.map((step, index) => {
        const isCurrent = index === currentIndex;
        const isPast = currentIndex > -1 && index < currentIndex;

        return (
          <li key={step.id} className="flex flex-1 flex-col items-center gap-1.5">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition
                ${isCurrent ? "bg-primary text-white" : ""}
                ${isPast ? "bg-primary/15 text-primary" : ""}
                ${!isCurrent && !isPast ? "bg-border text-muted" : ""}`}
            >
              {isPast ? <Check size={16} /> : index + 1}
            </span>
            <span
              className={`text-center text-[11px] font-medium leading-tight ${
                isCurrent ? "text-ink" : "text-muted"
              }`}
            >
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
