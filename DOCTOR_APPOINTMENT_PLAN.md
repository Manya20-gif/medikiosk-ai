# MediKiosk — Doctor & Appointment Module

This update adds the patient-side doctor directory and appointment flow without removing the existing kiosk, history, AYUSH, documents, timeline, summary, ABDM/FHIR, or doctor dashboard work.

## Included now (frontend)

- Doctor directory with doctor profiles.
- Doctor specialty, qualification, experience, hospital, location, languages and consultation fee.
- Specific doctor profile route: `/doctors/:doctorId`.
- Date and time slot selection for a specific doctor.
- Appointment reason.
- Appointment confirmation.
- Patient appointment list at `/appointments`.
- Appointment cancellation in the prototype.
- Patient name/contact are attached to the appointment.
- Appointment records are temporarily stored in browser localStorage so the flow survives refresh while backend work is pending.

## Backend phase next

Replace `src/services/appointmentService.js` with Supabase-backed calls and load doctor records from `doctor_profiles`/`profiles` rather than `src/data/doctors.js`.

The intended Supabase relationships are:

`auth.users -> profiles -> patient_profiles`

`auth.users -> profiles -> doctor_profiles`

`patient_profiles + doctor_profiles -> appointments`

No tables are dropped or recreated by this frontend update.

## Run

From `frontend/`:

```bash
npm install
npm run dev
```

The current appointment UI is intentionally independent from Supabase so the backend can be added next without rebuilding these screens.
