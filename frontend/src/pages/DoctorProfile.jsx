import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CalendarDays, CheckCircle2, Clock3, Languages, MapPin, Stethoscope } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { getDoctorByIdRemote } from "../services/backendDoctorService.js";
import { useSession } from "../context/SessionContext.jsx";

function nextDates(days = 14) {
  const result = [];
  const today = new Date();
  for (let i = 1; i <= days; i += 1) {
    const date = new Date(today);
    date.setHours(0, 0, 0, 0);
    date.setDate(today.getDate() + i);
    result.push(date);
  }
  return result;
}

function formatDate(date) {
  return new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short" }).format(date);
}

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

export default function DoctorProfile() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loadingDoctor, setLoadingDoctor] = useState(true);
  const { patient, createAppointment, authUser } = useSession();
  useEffect(() => { let alive = true; getDoctorByIdRemote(doctorId).then(d=>alive&&setDoctor(d)).catch(()=>alive&&setDoctor(null)).finally(()=>alive&&setLoadingDoctor(false)); return ()=>{alive=false}; }, [doctorId]);
  const dates = useMemo(() => nextDates(), []);
  const [selectedDate, setSelectedDate] = useState(isoDate(dates[0]));
  const [selectedSlot, setSelectedSlot] = useState(doctor?.slots?.[0] ?? "");
  const [reason, setReason] = useState("");
  const [booked, setBooked] = useState(null);
  const [error, setError] = useState("");

  if (loadingDoctor) { return <div className="mx-auto flex w-full max-w-3xl flex-1 items-center justify-center px-6 py-12"><p>Loading doctor profile…</p></div>; }

  if (!doctor) {
    return <div className="mx-auto flex w-full max-w-3xl flex-1 items-center justify-center px-6 py-12"><p>Doctor not found.</p></div>;
  }

  const selectedDateObject = dates.find((date) => isoDate(date) === selectedDate);
  const dayName = selectedDateObject?.toLocaleDateString("en-IN", { weekday: "long" });
  const isAvailable = doctor.availableDays.includes(dayName);

  const handleBook = async (event) => {
    event.preventDefault();
    setError("");
    if (!authUser) {
      setError("Please sign in or create a patient account before booking.");
      navigate("/auth", { state: { from: `/doctors/${doctorId}` } });
      return;
    }
    if (!patient.name || !patient.contact) {
      setError("Please complete patient details first so this appointment can be linked to the patient.");
      navigate("/details");
      return;
    }
    if (!isAvailable || !selectedSlot) {
      setError("Please choose an available date and time.");
      return;
    }

    try {
    const appointment = await createAppointment({
      doctorId: doctor.id,
      doctorName: doctor.name,
      doctorSpecialty: doctor.specialty,
      patientName: patient.name,
      patientContact: patient.contact,
      patientId: patient.abhaId || null,
      date: selectedDate,
      time: selectedSlot,
      reason: reason.trim() || "General consultation",
    });
    setBooked(appointment);
    } catch (err) { setError(err.message); }
  };

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-5 py-8 sm:px-8 lg:py-12">
      <button type="button" onClick={() => navigate("/doctors")} className="doc-btn-ghost"><ArrowLeft size={16} /> Back to doctors</button>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_420px]">
        <section className="kiosk-card">
          <div className="flex items-start gap-5">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-primary-light text-2xl font-extrabold text-primary-dark">{doctor.initials}</div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">{doctor.name}</h1>
              <p className="mt-1 text-lg font-bold text-primary">{doctor.specialty}</p>
              <p className="mt-1 text-sm text-muted">{doctor.qualification} · {doctor.experience}</p>
            </div>
          </div>

          <p className="mt-6 leading-7 text-muted">{doctor.about}</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-white/70 p-4"><MapPin size={17} className="text-primary" /><p className="mt-2 text-sm font-bold">{doctor.hospital}</p><p className="text-xs text-muted">{doctor.location}</p></div>
            <div className="rounded-2xl bg-white/70 p-4"><Languages size={17} className="text-primary" /><p className="mt-2 text-sm font-bold">Languages</p><p className="text-xs text-muted">{doctor.languages.join(", ")}</p></div>
            <div className="rounded-2xl bg-white/70 p-4"><Stethoscope size={17} className="text-primary" /><p className="mt-2 text-sm font-bold">Department</p><p className="text-xs text-muted">{doctor.department}</p></div>
            <div className="rounded-2xl bg-white/70 p-4"><Clock3 size={17} className="text-primary" /><p className="mt-2 text-sm font-bold">Consultation</p><p className="text-xs text-muted">₹{doctor.consultationFee}</p></div>
          </div>
        </section>

        <form onSubmit={handleBook} className="kiosk-card">
          <div className="flex items-center gap-3"><CalendarDays size={21} className="text-primary" /><div><h2 className="text-xl font-extrabold">Book appointment</h2><p className="text-xs text-muted">Appointment will be assigned to this doctor.</p></div></div>

          <label className="mt-6 block text-sm font-bold">Choose date</label>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2">
            {dates.slice(0, 10).map((date) => {
              const value = isoDate(date);
              const available = doctor.availableDays.includes(date.toLocaleDateString("en-IN", { weekday: "long" }));
              return <button key={value} type="button" disabled={!available} onClick={() => { setSelectedDate(value); setSelectedSlot(""); }} className={`rounded-xl border px-3 py-3 text-left text-sm font-bold transition ${selectedDate === value ? "border-primary bg-primary-light text-primary-dark" : "border-border bg-white/70 text-ink"} disabled:cursor-not-allowed disabled:opacity-35`}>{formatDate(date)}</button>;
            })}
          </div>

          <label className="mt-5 block text-sm font-bold">Choose time</label>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {doctor.slots.map((slot) => <button key={slot} type="button" disabled={!isAvailable} onClick={() => setSelectedSlot(slot)} className={`rounded-xl border px-3 py-3 text-sm font-bold ${selectedSlot === slot ? "border-primary bg-primary-light text-primary-dark" : "border-border bg-white/70 text-ink"} disabled:opacity-35`}>{slot}</button>)}
          </div>

          <label htmlFor="reason" className="mt-5 block text-sm font-bold">Reason for visit</label>
          <textarea id="reason" value={reason} onChange={(event) => setReason(event.target.value)} rows={3} className="mt-2 doc-input resize-none" placeholder="e.g. routine check-up, follow-up, chest discomfort" />

          {error && <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p>}

          {booked ? (
            <div className="mt-5 rounded-2xl border border-primary/20 bg-primary-light p-4">
              <div className="flex items-center gap-2 font-extrabold text-primary-dark"><CheckCircle2 size={19} /> Appointment booked</div>
              <p className="mt-2 text-sm text-ink">{doctor.name} · {formatDate(new Date(`${booked.date}T12:00:00`))} · {booked.time}</p>
              <button type="button" onClick={() => navigate("/appointments")} className="mt-3 doc-btn-primary">View my appointments</button>
            </div>
          ) : (
            <button type="submit" className="kiosk-btn-primary mt-6 w-full">Book with {doctor.name.split(" ").slice(0, 2).join(" ")}</button>
          )}
        </form>
      </div>
    </div>
  );
}
