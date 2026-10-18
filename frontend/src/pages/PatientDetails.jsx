import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { useSession } from "../context/SessionContext.jsx";
import { demoPatient } from "../data/demoPatients.js";
import { languages } from "../data/languages.js";

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

function validate(patient) {
  const errors = {};
  if (!patient.name.trim()) errors.name = "Please enter your name.";

  const ageNum = Number(patient.age);
  if (!patient.age) errors.age = "Please enter your age.";
  else if (!Number.isInteger(ageNum) || ageNum <= 0 || ageNum > 120)
    errors.age = "Enter a valid age between 1 and 120.";

  if (!patient.gender) errors.gender = "Please select an option.";

  if (!patient.contact.trim()) errors.contact = "Please enter a contact number.";
  else if (!/^\d{10}$/.test(patient.contact.trim()))
    errors.contact = "Enter a 10-digit phone number.";

  // ABHA ID is optional in this prototype — no validation required.
  return errors;
}

export default function PatientDetails() {
  const navigate = useNavigate();
  const { consent, languageCode, patient, updatePatient, savePatientProfile, authUser } = useSession();
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (consent.given !== true) navigate("/consent", { replace: true });
  }, [consent, navigate]);

  const languageLabel =
    languages.find((lang) => lang.code === languageCode)?.native ?? "Not set";

  const handleChange = (field) => (event) => {
    updatePatient({ [field]: event.target.value });
  };

  const handleFillDemo = () => {
    const { languageCode: _ignored, ...demoFields } = demoPatient;
    updatePatient(demoFields);
    setErrors({});
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validate(patient);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      if (!authUser) { navigate("/auth", { state: { from: "/details" } }); return; }
      try { await savePatientProfile(patient); navigate("/consultation-type"); } catch (err) { setErrors({ form: err.message }); }
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-ink">Your details</h1>
          <p className="mt-2 text-muted">
            Your patient profile is saved to the MediKiosk backend after account setup.
          </p>
        </div>
        <button
          type="button"
          onClick={handleFillDemo}
          className="flex shrink-0 items-center gap-2 rounded-lg border border-accent/40 bg-accent-light px-3 py-2 text-sm font-semibold text-accent-dark transition hover:border-accent"
        >
          <Sparkles size={16} />
          Fill demo patient
        </button>
      </div>

      {errors.form && <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{errors.form}</p>}
      <form onSubmit={handleSubmit} className="mt-8 space-y-6" noValidate>
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-ink">
            Full name
          </label>
          <input
            id="name"
            type="text"
            value={patient.name}
            onChange={handleChange("name")}
            className="mt-2 w-full rounded-kiosk border-2 border-border bg-surface px-4 py-4 text-lg text-ink outline-none focus:border-primary"
            placeholder="e.g. Rahul Sharma"
          />
          {errors.name && <p className="mt-1.5 text-sm text-alert">{errors.name}</p>}
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="age" className="block text-sm font-semibold text-ink">
              Age
            </label>
            <input
              id="age"
              type="number"
              inputMode="numeric"
              value={patient.age}
              onChange={handleChange("age")}
              className="mt-2 w-full rounded-kiosk border-2 border-border bg-surface px-4 py-4 text-lg text-ink outline-none focus:border-primary"
              placeholder="e.g. 46"
            />
            {errors.age && <p className="mt-1.5 text-sm text-alert">{errors.age}</p>}
          </div>

          <div>
            <label htmlFor="contact" className="block text-sm font-semibold text-ink">
              Contact number
            </label>
            <input
              id="contact"
              type="tel"
              inputMode="numeric"
              value={patient.contact}
              onChange={handleChange("contact")}
              className="mt-2 w-full rounded-kiosk border-2 border-border bg-surface px-4 py-4 text-lg text-ink outline-none focus:border-primary"
              placeholder="10-digit number"
            />
            {errors.contact && <p className="mt-1.5 text-sm text-alert">{errors.contact}</p>}
          </div>
        </div>

        <div>
          <span className="block text-sm font-semibold text-ink">Gender</span>
          <div className="mt-2 grid grid-cols-3 gap-3">
            {genderOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => updatePatient({ gender: option.value })}
                aria-pressed={patient.gender === option.value}
                className={`rounded-kiosk border-2 px-4 py-4 text-base font-semibold transition ${
                  patient.gender === option.value
                    ? "border-primary bg-primary-light text-primary-dark"
                    : "border-border bg-surface text-ink hover:border-primary/50"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          {errors.gender && <p className="mt-1.5 text-sm text-alert">{errors.gender}</p>}
        </div>

        <div>
          <label htmlFor="abha" className="block text-sm font-semibold text-ink">
            ABHA ID <span className="font-normal text-muted">(optional, demo field)</span>
          </label>
          <input
            id="abha"
            type="text"
            value={patient.abhaId}
            onChange={handleChange("abhaId")}
            className="mt-2 w-full rounded-kiosk border-2 border-border bg-surface px-4 py-4 text-lg text-ink outline-none focus:border-primary"
            placeholder="14-digit ABHA number (optional)"
          />
        </div>

        <div className="rounded-kiosk border border-border bg-surface px-4 py-3 text-sm text-muted">
          Preferred language: <span className="font-semibold text-ink">{languageLabel}</span>
        </div>

        <button type="submit" className="kiosk-btn-primary w-full sm:w-auto">
          Continue
          <ArrowRight size={20} />
        </button>
      </form>
    </div>
  );
}
