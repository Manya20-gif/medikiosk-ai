import { Routes, Route } from "react-router-dom";
import PatientShell from "./components/layout/PatientShell.jsx";
import { SessionProvider } from "./context/SessionContext.jsx";
import Welcome from "./pages/Welcome.jsx";
import LanguageSelect from "./pages/LanguageSelect.jsx";
import Consent from "./pages/Consent.jsx";
import PatientDetails from "./pages/PatientDetails.jsx";
import HistoryTaking from "./pages/HistoryTaking.jsx";
import DocumentUpload from "./pages/DocumentUpload.jsx";
import Timeline from "./pages/Timeline.jsx";
import Summary from "./pages/Summary.jsx";
import ConsultationType from "./pages/ConsultationType.jsx";
import AyushCaseTaking from "./pages/AyushCaseTaking.jsx";
import DoctorDashboard from "./pages/DoctorDashboard.jsx";
import PlaceholderPage from "./pages/PlaceholderPage.jsx";
import NotFound from "./pages/NotFound.jsx";
import Doctors from "./pages/Doctors.jsx";
import DoctorProfile from "./pages/DoctorProfile.jsx";
import Appointments from "./pages/Appointments.jsx";
import Auth from "./pages/Auth.jsx";
import DocumentAnalysisHub from "./pages/DocumentAnalysisHub.jsx";
import PatientHealthTracker from "./pages/PatientHealthTracker.jsx";
import VirtualDoctorPage from "./pages/VirtualDoctorPage.jsx";
import { journeySteps } from "./data/journeySteps.js";

// Steps with a real, built page. Everything else in journeySteps
// still renders as a placeholder until its phase is built.
const builtPages = {
  language: LanguageSelect,
  consent: Consent,
  details: PatientDetails,
  "consultation-type": ConsultationType,
  history: HistoryTaking,
  documents: DocumentUpload,
  timeline: Timeline,
  summary: Summary,
};

export default function App() {
  return (
    <SessionProvider>
      <Routes>
        <Route element={<PatientShell />}>
          <Route path="/" element={<Welcome />} />

          {journeySteps.map((step) => {
            const Page = builtPages[step.id];
            return (
              <Route
                key={step.id}
                path={step.path}
                element={
                  Page ? <Page /> : <PlaceholderPage title={step.label} phase={step.phase} />
                }
              />
            );
          })}

          {/* Not part of journeySteps / the top StepIndicator on purpose —
              this is a fork off the "history" step (see ConsultationType),
              and AyushCaseTaking renders its own AyushProgress instead. */}
          <Route path="/ayush" element={<AyushCaseTaking />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/doctors/:doctorId" element={<DoctorProfile />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/documents-hub" element={<DocumentAnalysisHub />} />
          <Route path="/health-tracker" element={<PatientHealthTracker />} />
          <Route path="/tracker" element={<PatientHealthTracker />} />
          <Route path="/virtual-doctor" element={<VirtualDoctorPage />} />

          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Doctor Dashboard (Phase 9) is deliberately OUTSIDE PatientShell —
            it's a desktop/tablet clinical dashboard, not a step in the
            patient-facing kiosk journey, so it doesn't get the kiosk
            header/footer/step-indicator chrome. */}
        <Route path="/doctor" element={<DoctorDashboard />} />
      </Routes>
    </SessionProvider>
  );
}
