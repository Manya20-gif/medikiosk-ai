import { CalendarDays, Clock3, Stethoscope, XCircle } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "../context/SessionContext.jsx";

function readableDate(value) {
  return new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" }).format(new Date(`${value}T12:00:00`));
}

export default function Appointments() {
  const navigate = useNavigate();
  const { appointments, cancelAppointment, authUser, authLoading } = useSession();
  const [busyId, setBusyId] = useState(null);
  const mine = appointments;
  if (authLoading) return <div className="mx-auto flex w-full max-w-3xl flex-1 items-center justify-center px-6 py-12">Loading account…</div>;
  if (!authUser) return <div className="mx-auto flex w-full max-w-3xl flex-1 items-center justify-center px-6 py-12"><div className="kiosk-card text-center"><h1 className="text-2xl font-extrabold">Sign in to view appointments</h1><button onClick={()=>navigate("/auth")} className="kiosk-btn-primary mt-5">Sign in</button></div></div>;

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-5 py-8 sm:px-8 lg:py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-xs font-extrabold uppercase tracking-[.16em] text-primary">Patient appointments</p><h1 className="mt-2 text-4xl font-extrabold">My appointments</h1><p className="mt-2 text-muted">Appointments are stored in the MediKiosk backend and linked to the selected doctor.</p></div>
        <button type="button" onClick={() => navigate("/doctors")} className="kiosk-btn-primary text-base">Find a doctor</button>
      </div>

      {mine.length === 0 ? (
        <div className="kiosk-card mt-8 text-center"><CalendarDays size={32} className="mx-auto text-primary" /><h2 className="mt-4 text-xl font-extrabold">No appointments yet</h2><p className="mt-2 text-muted">Choose a doctor and select a date and time to create one.</p></div>
      ) : (
        <div className="mt-8 space-y-4">
          {mine.map((appointment) => (
            <article key={appointment.id} className="kiosk-card">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div><div className="flex items-center gap-2"><Stethoscope size={18} className="text-primary" /><h2 className="text-xl font-extrabold">{appointment.doctorName}</h2></div><p className="mt-1 text-sm font-semibold text-primary">{appointment.doctorSpecialty}</p><p className="mt-3 text-sm text-muted">Patient: <span className="font-bold text-ink">{appointment.patientName}</span></p></div>
                <span className={`rounded-full px-3 py-1 text-xs font-extrabold uppercase ${appointment.status === "cancelled" ? "bg-red-50 text-red-700" : "bg-primary-light text-primary-dark"}`}>{appointment.status}</span>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-xl bg-white/70 p-3"><CalendarDays size={16} className="text-primary" /><p className="mt-1 text-sm font-bold">{readableDate(appointment.date)}</p></div><div className="rounded-xl bg-white/70 p-3"><Clock3 size={16} className="text-primary" /><p className="mt-1 text-sm font-bold">{appointment.time}</p></div><div className="rounded-xl bg-white/70 p-3"><Stethoscope size={16} className="text-primary" /><p className="mt-1 text-sm font-bold">{appointment.reason}</p></div></div>
              {appointment.status !== "cancelled" && <button type="button" onClick={async () => { setBusyId(appointment.id); try { await cancelAppointment(appointment.id); } finally { setBusyId(null); } }} className="mt-4 doc-btn-secondary"><XCircle size={15} /> {busyId===appointment.id ? "Cancelling…" : "Cancel appointment"}</button>}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
