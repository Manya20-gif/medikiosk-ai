import { useEffect, useMemo, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { useSession } from "../context/SessionContext.jsx";
import { api } from "../services/api.js";
import {
  getAllDoctorRecords,
  filterRecords,
  buildImportantFindings,
  CONSULTATION_STATUSES,
} from "../services/doctorService.js";

import DoctorHeader from "../components/doctor/DoctorHeader.jsx";
import PatientList from "../components/doctor/PatientList.jsx";
import PatientOverview from "../components/doctor/PatientOverview.jsx";
import ClinicalOverview from "../components/doctor/ClinicalOverview.jsx";
import RedFlagPanel from "../components/doctor/RedFlagPanel.jsx";
import ClinicalSummaryPanel from "../components/doctor/ClinicalSummaryPanel.jsx";
import AyushSummaryPanel from "../components/doctor/AyushSummaryPanel.jsx";
import DocumentsPanel from "../components/doctor/DocumentsPanel.jsx";
import TimelinePanel from "../components/doctor/TimelinePanel.jsx";
import ImportantFindings from "../components/doctor/ImportantFindings.jsx";
import DoctorNotes from "../components/doctor/DoctorNotes.jsx";
import ConsultationStatus from "../components/doctor/ConsultationStatus.jsx";
import AbdmStatusCard, { createDefaultAbdmState } from "../components/abdm/AbdmStatusCard.jsx";

const defaultInteraction = () => ({
  notes: "",
  status: CONSULTATION_STATUSES[0],
  verification: {},
  abdm: createDefaultAbdmState(),
});

/**
 * PHASE 9 — Doctor Dashboard.
 *
 * Deliberately outside <PatientShell/> (see App.jsx) — this is a
 * desktop/tablet clinical dashboard, not a step in the kiosk journey, so
 * it doesn't get the kiosk header/footer/step-indicator chrome.
 *
 * Reads the live kiosk session (if any patient has come through
 * /details this session) plus a fictional demo patient bank, normalised
 * into one shape by services/doctorService.js. Per-patient doctor
 * interactions (notes, section verification, consultation status) are
 * kept here in local component state only — this is a prototype, no
 * backend/database wiring yet (that's a later phase).
 */
export default function DoctorDashboard() {
  const session = useSession();
  const [backendAppointments, setBackendAppointments] = useState([]);
  useEffect(() => { if (session.authUser?.role === "DOCTOR") api("/appointments").then(r=>setBackendAppointments(r.appointments)).catch(()=>{}); }, [session.authUser]);
  const allRecords = useMemo(() => getAllDoctorRecords(session), [session]);

  const [selectedId, setSelectedId] = useState(null);
  const [query, setQuery] = useState("");
  const [consultationFilter, setConsultationFilter] = useState("all");
  const [redFlagOnly, setRedFlagOnly] = useState(false);
  const [interactions, setInteractions] = useState({});

  const filteredRecords = useMemo(
    () => filterRecords(allRecords, { query, consultationType: consultationFilter, redFlagOnly }),
    [allRecords, query, consultationFilter, redFlagOnly]
  );

  const selectedRecord = allRecords.find((r) => r.id === selectedId) ?? allRecords[0];
  const interaction = (selectedRecord && interactions[selectedRecord.id]) ?? defaultInteraction();

  const updateInteraction = (patch) => {
    if (!selectedRecord) return;
    setInteractions((prev) => ({
      ...prev,
      [selectedRecord.id]: { ...defaultInteraction(), ...prev[selectedRecord.id], ...patch },
    }));
  };

  const updateAbdm = (patch) => {
    updateInteraction({ abdm: { ...interaction.abdm, ...patch } });
  };

  const handleConfirmSection = (sectionId) => {
    updateInteraction({
      verification: { ...interaction.verification, [sectionId]: { ...interaction.verification[sectionId], confirmed: true } },
    });
  };

  const handleSaveEditSection = (sectionId, note) => {
    updateInteraction({
      verification: { ...interaction.verification, [sectionId]: { ...interaction.verification[sectionId], note } },
    });
  };

  if (!selectedRecord) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted">
        No patients available.
      </div>
    );
  }

  const findings = buildImportantFindings(selectedRecord);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="mk-ambient" aria-hidden="true">
        <span className="mk-orb one" />
        <span className="mk-orb two" />
      </div>

      <DoctorHeader consultationStatus={interaction.status} />

      <div className="relative z-0 mx-auto grid max-w-[1400px] grid-cols-1 lg:grid-cols-[300px_1fr]">
        <aside className="max-h-[420px] overflow-y-auto border-b border-white/70 bg-white/55 backdrop-blur-xl lg:sticky lg:top-[65px] lg:h-[calc(100vh-65px)] lg:max-h-none lg:border-b-0 lg:border-r">
          <PatientList
            records={allRecords}
            filteredRecords={filteredRecords}
            selectedId={selectedRecord.id}
            onSelect={setSelectedId}
            query={query}
            onQueryChange={setQuery}
            consultationFilter={consultationFilter}
            onConsultationFilterChange={setConsultationFilter}
            redFlagOnly={redFlagOnly}
            onRedFlagOnlyChange={setRedFlagOnly}
          />
        </aside>

        <main className="min-w-0 space-y-5 px-4 py-5 sm:px-6 lg:py-6">
          {/* Quick Clinical Tool Navigation */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/70 bg-white/80 p-3.5 shadow-sm backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted">Clinical Tools:</span>
              <a
                href="/health-tracker"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded-xl border border-emerald-900/10 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-900 hover:bg-emerald-100 transition"
              >
                <span>📈 Patient Health Tracker</span>
              </a>
              <a
                href="/documents-hub"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded-xl border border-teal-900/10 bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-900 hover:bg-teal-100 transition"
              >
                <span>📄 AI Document Lab</span>
              </a>
              <a
                href="/virtual-doctor"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded-xl border border-slate-900/10 bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-800 hover:bg-slate-200 transition"
              >
                <span>🩺 Virtual Doctor AI</span>
              </a>
            </div>
            <a href="/" className="text-xs font-bold text-[#0b655d] hover:underline">
              ← Return to Patient Kiosk
            </a>
          </div>

          {session.authUser?.role === "DOCTOR" && <section className="kiosk-card"><h2 className="text-xl font-extrabold">My appointments</h2><p className="mt-1 text-sm text-muted">Appointments booked specifically with this doctor.</p><div className="mt-4 space-y-2">{backendAppointments.length===0 ? <p className="text-sm text-muted">No appointments assigned yet.</p> : backendAppointments.map(a=><div key={a.id} className="rounded-xl border border-border bg-white/70 p-3"><div className="flex items-center justify-between gap-3"><span className="font-bold">{a.patientName}</span><span className="text-xs font-extrabold uppercase text-primary">{a.status}</span></div><p className="mt-1 text-sm text-muted">{a.date} · {a.time} · {a.reason}</p></div>)}</div></section>}
          <PatientOverview record={selectedRecord} />
          <RedFlagPanel redFlags={selectedRecord.redFlags} />
          <ClinicalOverview record={selectedRecord} />

          <AbdmStatusCard record={selectedRecord} abdm={interaction.abdm} onUpdateAbdm={updateAbdm} />

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
            <div className="space-y-5 xl:col-span-2">
              <ClinicalSummaryPanel
                record={selectedRecord}
                verification={interaction.verification}
                onConfirm={handleConfirmSection}
                onSaveEdit={handleSaveEditSection}
              />
              {selectedRecord.consultationType === "ayush" && (
                <AyushSummaryPanel ayushHistory={selectedRecord.ayushHistory} />
              )}
              <DocumentsPanel documents={selectedRecord.documents} />
              <TimelinePanel events={selectedRecord.timelineEvents} />
            </div>

            <div className="space-y-5">
              <ImportantFindings findings={findings} />
              <ConsultationStatus status={interaction.status} onChange={(status) => updateInteraction({ status })} />
              <DoctorNotes notes={interaction.notes} onSave={(notes) => updateInteraction({ notes })} />

              <div className="flex items-start gap-2 rounded-2xl border border-white/70 bg-white/70 px-4 py-3 text-xs text-muted backdrop-blur-xl">
                <ShieldCheck size={15} className="mt-0.5 shrink-0 text-[#0f8a7d]" />
                <p>
                  Patient information is handled according to consent settings. This prototype does not implement
                  real encryption or ABDM integration.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
