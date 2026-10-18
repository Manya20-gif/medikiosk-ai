import { Outlet, useLocation } from "react-router-dom";
import KioskHeader from "./KioskHeader.jsx";
import KioskFooter from "./KioskFooter.jsx";
import StepIndicator from "../navigation/StepIndicator.jsx";

export default function PatientShell() {
  const { pathname } = useLocation();
  const showStepIndicator = pathname !== "/";

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <div className="mk-ambient" aria-hidden="true">
        <span className="mk-orb one" />
        <span className="mk-orb two" />
      </div>
      <KioskHeader />
      {showStepIndicator && (
        <div className="border-b border-white/70 bg-white/55 py-4 backdrop-blur-xl">
          <StepIndicator />
        </div>
      )}
      <main className="relative z-0 flex flex-1 flex-col">
        <Outlet />
      </main>
      <KioskFooter />
    </div>
  );
}
