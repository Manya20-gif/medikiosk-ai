import { useEffect, useState } from "react";
import { getDoctors } from "../services/backendDoctorService.js";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CalendarDays, Clock3, Languages, MapPin, Stethoscope } from "lucide-react";

export default function Doctors() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { getDoctors().then(setDoctors).finally(() => setLoading(false)); }, []);

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-5 py-8 sm:px-8 lg:py-12">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[.16em] text-primary">Doctor appointments</p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl">Choose your doctor</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted">
            View doctor profiles, specialties, languages and available consultation slots. Pick one doctor and book a specific appointment time.
          </p>
        </div>
        <button type="button" onClick={() => navigate("/appointments")} className="kiosk-btn-secondary text-base">
          <CalendarDays size={18} /> My appointments
        </button>
      </div>

      {loading ? <div className="kiosk-card mt-8">Loading doctors…</div> : <div className="mt-8 grid gap-5 md:grid-cols-2">
        {doctors.map((doctor) => (
          <article key={doctor.id} className="kiosk-card group">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary-light text-xl font-extrabold text-primary-dark">
                {doctor.initials}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-extrabold">{doctor.name}</h2>
                <p className="mt-1 font-semibold text-primary">{doctor.specialty}</p>
                <p className="mt-1 text-sm text-muted">{doctor.qualification} · {doctor.experience}</p>
              </div>
            </div>

            <p className="mt-5 text-sm leading-6 text-muted">{doctor.about}</p>

            <div className="mt-5 grid gap-2 text-sm text-ink sm:grid-cols-2">
              <span className="flex items-center gap-2"><MapPin size={16} className="text-primary" /> {doctor.hospital}</span>
              <span className="flex items-center gap-2"><Stethoscope size={16} className="text-primary" /> {doctor.department}</span>
              <span className="flex items-center gap-2"><Languages size={16} className="text-primary" /> {doctor.languages.join(", ")}</span>
              <span className="flex items-center gap-2"><Clock3 size={16} className="text-primary" /> ₹{doctor.consultationFee} consultation</span>
            </div>

            <button
              type="button"
              onClick={() => navigate(`/doctors/${doctor.id}`)}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-primary/20 bg-primary-light px-5 py-4 font-bold text-primary-dark transition hover:border-primary/40 hover:bg-white"
            >
              View profile & book <ArrowRight size={18} />
            </button>
          </article>
        ))}
      </div>}
    </div>
  );
}
