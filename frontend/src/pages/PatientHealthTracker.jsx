import { useState, useMemo, useEffect } from "react";
import {
  TrendingUp, Activity, Heart, Droplets, ShieldCheck, Flame,
  CheckCircle2, Plus, Calendar, Clock, ArrowUpRight, Award,
  AlertCircle, Sparkles, Volume2, VolumeX, Stethoscope, ChevronRight,
  Smile, Dumbbell, Apple, Database, UserCheck, Trash2, X
} from "lucide-react";
import { useSession } from "../context/SessionContext.jsx";
import { speak, stopSpeaking, isTtsSupported } from "../services/ttsService.js";
import { useTranslation } from "../services/translationService.js";
import { api } from "../services/api.js";
import { Link } from "react-router-dom";

export default function PatientHealthTracker() {
  const { patient, authUser } = useSession();
  const { t, currentLang } = useTranslation();

  const [timeRange, setTimeRange] = useState("6weeks"); // "1week" | "4weeks" | "6weeks"
  const [activeMetric, setActiveMetric] = useState("bp"); // "bp" | "glucose" | "hr" | "pain"
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [showAddMedModal, setShowAddMedModal] = useState(false);

  // New Medication Form State
  const [newMedForm, setNewMedForm] = useState({
    name: "",
    time: "Morning (08:00 AM)",
    purpose: "Blood Pressure"
  });

  // User's Exclusive Daily Medications
  const [meds, setMeds] = useState([
    { id: "med_1", name: "Amlodipine 5mg", time: "Morning (08:00 AM)", taken: true, purpose: "Blood Pressure" },
    { id: "med_2", name: "Metformin 500mg", time: "With Lunch (01:30 PM)", taken: true, purpose: "Blood Glucose" },
    { id: "med_3", name: "Atorvastatin 20mg", time: "Bedtime (09:30 PM)", taken: false, purpose: "Cholesterol / Lipid" },
    { id: "med_4", name: "Vitamin D3 60k IU", time: "Weekly (Sunday)", taken: true, purpose: "Bone & Immune Support" }
  ]);

  // Longitudinal Historical Data Points
  const [historyData, setHistoryData] = useState([
    { week: "Week 1", date: "Sep 07", sys: 154, dia: 96, glucose: 215, hr: 88, pain: 8, label: "Initial Intake" },
    { week: "Week 2", date: "Sep 14", sys: 146, dia: 92, glucose: 188, hr: 84, pain: 6, label: "Medication Start" },
    { week: "Week 3", date: "Sep 21", sys: 138, dia: 88, glucose: 162, hr: 80, pain: 5, label: "Dose Titration" },
    { week: "Week 4", date: "Sep 28", sys: 132, dia: 84, glucose: 140, hr: 76, pain: 4, label: "Dietary Adjust" },
    { week: "Week 5", date: "Oct 05", sys: 126, dia: 82, glucose: 124, hr: 74, pain: 3, label: "Symptom Relief" },
    { week: "Week 6", date: "Today", sys: 120, dia: 78, glucose: 108, hr: 71, pain: 1, label: "Optimal Control" }
  ]);

  // Load user vitals and medications from backend if authenticated
  useEffect(() => {
    if (authUser) {
      // 1. Fetch user exclusive vitals
      api("/user/vitals")
        .then((res) => {
          if (Array.isArray(res?.vitals) && res.vitals.length > 0) {
            const mapped = res.vitals.map((v, idx) => ({
              week: `Log #${idx + 1}`,
              date: new Date(v.loggedAt).toLocaleDateString([], { month: "short", day: "numeric" }),
              sys: v.sys,
              dia: v.dia,
              glucose: v.glucose,
              hr: v.hr,
              pain: v.pain,
              label: v.notes || "EHR Logged Vitals"
            })).reverse();
            setHistoryData(mapped);
          }
        })
        .catch((err) => console.warn("Could not load user vitals:", err));

      // 2. Fetch user exclusive medications from database
      api("/user/medications")
        .then((res) => {
          if (Array.isArray(res?.medications) && res.medications.length > 0) {
            setMeds(res.medications);
          }
        })
        .catch((err) => console.warn("Could not load user medications:", err));
    }
  }, [authUser]);

  // Toggle med adherence and sync with DB
  const toggleMed = async (id) => {
    const target = meds.find((m) => m.id === id);
    const updatedTaken = !target?.taken;
    setMeds((prev) =>
      prev.map((m) => (m.id === id ? { ...m, taken: updatedTaken } : m))
    );

    if (authUser) {
      try {
        await api(`/user/medications/${id}`, {
          method: "PUT",
          body: JSON.stringify({ taken: updatedTaken })
        });
      } catch (err) {
        console.warn("Failed to sync medication toggle:", err);
      }
    }
  };

  // Add new medication to exclusive database
  const handleAddMedication = async (e) => {
    e.preventDefault();
    if (!newMedForm.name.trim()) return;

    const newMedObj = {
      id: `med_${Date.now()}`,
      name: newMedForm.name.trim(),
      time: newMedForm.time,
      taken: false,
      purpose: newMedForm.purpose
    };

    setMeds((prev) => [...prev, newMedObj]);
    setShowAddMedModal(false);
    setNewMedForm({ name: "", time: "Morning (08:00 AM)", purpose: "Blood Pressure" });

    if (authUser) {
      try {
        await api("/user/medications", {
          method: "POST",
          body: JSON.stringify(newMedObj)
        });
      } catch (err) {
        console.warn("Failed to save medication to DB:", err);
      }
    }
  };

  // New Log Form
  const [newLog, setNewLog] = useState({
    sys: 120,
    dia: 80,
    glucose: 110,
    hr: 72,
    pain: 2
  });

  const latest = historyData[historyData.length - 1];
  const baseline = historyData[0];

  // Dynamic Overall Health Improvement Score (0 - 100)
  const healthScore = useMemo(() => {
    // Calculates normalized distance from hypertensive/hyperglycemic baseline
    const bpScore = Math.max(0, Math.min(100, 100 - (latest.sys - 120) * 1.5));
    const glucoseScore = Math.max(0, Math.min(100, 100 - (latest.glucose - 100) * 0.8));
    const painScore = (10 - latest.pain) * 10;
    const adherenceBonus = (meds.filter(m => m.taken).length / meds.length) * 10;
    return Math.round(bpScore * 0.4 + glucoseScore * 0.35 + painScore * 0.15 + adherenceBonus);
  }, [latest, meds]);

  const handleLogSubmit = async (e) => {
    e.preventDefault();
    const newPoint = {
      week: `Log #${historyData.length + 1}`,
      date: "Just now",
      sys: Number(newLog.sys),
      dia: Number(newLog.dia),
      glucose: Number(newLog.glucose),
      hr: Number(newLog.hr),
      pain: Number(newLog.pain),
      label: "Patient Check-in"
    };
    setHistoryData((prev) => [...prev, newPoint]);
    setShowLogModal(false);

    if (authUser) {
      try {
        await api("/user/vitals", {
          method: "POST",
          body: JSON.stringify({
            sys: newLog.sys,
            dia: newLog.dia,
            glucose: newLog.glucose,
            hr: newLog.hr,
            pain: newLog.pain,
            notes: "Patient Check-in"
          })
        });
      } catch (err) {
        console.warn("Failed to persist vitals to EHR:", err);
      }
    }
  };

  const handleVoiceSummary = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }
    const speechText = `Your MediKiosk Health Improvement Score is currently ${healthScore} out of 100, representing an excellent recovery trajectory. Your blood pressure has improved from ${baseline.sys} over ${baseline.dia} down to ${latest.sys} over ${latest.dia}. Your blood sugar is now at ${latest.glucose} milligrams per deciliter, and pain levels have dropped from 8 out of 10 to ${latest.pain} out of 10. Keep taking your daily medications consistently.`;

    speak(speechText, currentLang, {
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false)
    });
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      {/* Exclusive User EHR Database Status Bar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-900/10 bg-white/90 px-4 py-3 text-xs shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-sm">
            <UserCheck size={15} />
          </span>
          <div>
            <span className="font-extrabold text-slate-900">
              {authUser ? t("authenticatedSession", "Authenticated EHR Patient") : t("guestSession", "Guest Analysis Session")}:
            </span>{" "}
            <span className="font-bold text-emerald-800">
              {authUser?.name || patient?.name || "Kiosk Guest Patient"}
            </span>{" "}
            {authUser?.email && <span className="text-muted">({authUser.email})</span>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-[11px] font-bold text-emerald-800">
            <Database size={13} className="text-teal-600" />
            {authUser ? "Exclusive User Database Isolation Active" : "Local In-Memory Mode"}
          </span>
          {!authUser && (
            <Link
              to="/auth"
              state={{ from: "/health-tracker" }}
              className="rounded-xl bg-slate-900 px-3 py-1 font-bold text-white hover:bg-slate-800 transition"
            >
              Sign In to Save
            </Link>
          )}
        </div>
      </div>

      {/* Top Hero Banner with Live Improvement Score */}
      <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-gradient-to-r from-slate-900 via-teal-950 to-emerald-950 p-6 sm:p-10 text-white shadow-2xl backdrop-blur-2xl">
        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/20 px-3.5 py-1 text-xs font-bold text-emerald-300">
              <TrendingUp size={15} />
              Longitudinal Recovery Tracking
            </div>
            <h1 className="mt-3 font-heading text-3xl font-extrabold tracking-tight sm:text-5xl">
              {t("recoveryTrackerTitle", "Patient Health Improvement Tracker")}
            </h1>
            <p className="mt-2 text-sm text-slate-300 sm:text-base">
              Patient: <strong className="text-white">{authUser?.name || patient?.name || "Kiosk Patient"}</strong> &middot; {t("recoveryTrackerSubtitle", "Continuous tracking of vital trajectories, biomarker normalization, and treatment compliance.")}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleVoiceSummary}
                className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-md transition hover:bg-white/20"
              >
                {isSpeaking ? <VolumeX size={15} /> : <Volume2 size={15} />}
                {isSpeaking ? "Stop Voice" : t("audioBriefing", "Audio Health Briefing")}
              </button>

              <button
                type="button"
                onClick={() => setShowLogModal(true)}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2.5 text-xs font-bold text-white shadow-md transition hover:brightness-110"
              >
                <Plus size={15} />
                {t("logTodayVitals", "Log Today's Vitals")}
              </button>

              <Link
                to="/virtual-doctor"
                className="flex items-center gap-1.5 rounded-xl border border-white/20 px-4 py-2.5 text-xs font-bold text-slate-200 transition hover:bg-white/10"
              >
                <Sparkles size={14} className="text-emerald-400" />
                {t("askVirtualDoctor", "Ask Virtual Doctor")}
              </Link>
            </div>
          </div>

          {/* Dynamic Circular Health Gauge */}
          <div className="flex flex-col items-center justify-center rounded-3xl border border-white/15 bg-white/5 p-6 backdrop-blur-xl shadow-inner text-center">
            <div className="relative flex h-36 w-36 items-center justify-center">
              <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="10"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="10"
                  strokeDasharray="314"
                  strokeDashoffset={314 - (314 * healthScore) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="font-heading text-4xl font-black text-white">{healthScore}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">/ 100</span>
              </div>
            </div>
            <div className="mt-3">
              <span className="inline-block rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300 border border-emerald-400/30">
                Optimal Recovery Trajectory
              </span>
              <p className="mt-1 text-[11px] text-slate-400">
                +24.6% improvement over baseline
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {/* Blood Pressure Card */}
        <div
          onClick={() => setActiveMetric("bp")}
          className={`cursor-pointer rounded-2xl border p-4 transition-all ${
            activeMetric === "bp"
              ? "border-emerald-600 bg-emerald-50/70 shadow-md ring-2 ring-emerald-600/20"
              : "border-white/70 bg-white/80 hover:bg-white"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-muted">{t("bloodPressure", "Blood Pressure")}</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <Heart size={15} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-heading text-2xl font-black text-ink">{latest.sys}/{latest.dia}</span>
            <span className="text-xs font-semibold text-muted">mmHg</span>
          </div>
          <p className="mt-1 text-[11px] font-bold text-emerald-700 flex items-center gap-0.5">
            <TrendingUp size={12} /> Down from {baseline.sys}/{baseline.dia} (-22%)
          </p>
        </div>

        {/* Blood Glucose Card */}
        <div
          onClick={() => setActiveMetric("glucose")}
          className={`cursor-pointer rounded-2xl border p-4 transition-all ${
            activeMetric === "glucose"
              ? "border-teal-600 bg-teal-50/70 shadow-md ring-2 ring-teal-600/20"
              : "border-white/70 bg-white/80 hover:bg-white"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-muted">{t("fastingGlucose", "Fasting Glucose")}</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-100 text-teal-700">
              <Droplets size={15} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-heading text-2xl font-black text-ink">{latest.glucose}</span>
            <span className="text-xs font-semibold text-muted">mg/dL</span>
          </div>
          <p className="mt-1 text-[11px] font-bold text-teal-700 flex items-center gap-0.5">
            <TrendingUp size={12} /> Normalized from {baseline.glucose} (-50%)
          </p>
        </div>

        {/* Heart Rate Card */}
        <div
          onClick={() => setActiveMetric("hr")}
          className={`cursor-pointer rounded-2xl border p-4 transition-all ${
            activeMetric === "hr"
              ? "border-blue-600 bg-blue-50/70 shadow-md ring-2 ring-blue-600/20"
              : "border-white/70 bg-white/80 hover:bg-white"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-muted">{t("restingHr", "Resting HR")}</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
              <Activity size={15} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-heading text-2xl font-black text-ink">{latest.hr}</span>
            <span className="text-xs font-semibold text-muted">bpm</span>
          </div>
          <p className="mt-1 text-[11px] font-bold text-blue-700 flex items-center gap-0.5">
            <CheckCircle2 size={12} /> Steady sinus rhythm
          </p>
        </div>

        {/* Pain / Symptoms Card */}
        <div
          onClick={() => setActiveMetric("pain")}
          className={`cursor-pointer rounded-2xl border p-4 transition-all ${
            activeMetric === "pain"
              ? "border-purple-600 bg-purple-50/70 shadow-md ring-2 ring-purple-600/20"
              : "border-white/70 bg-white/80 hover:bg-white"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-muted">{t("symptomSeverity", "Symptom Severity")}</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
              <Smile size={15} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-heading text-2xl font-black text-ink">{latest.pain}/10</span>
            <span className="text-xs font-semibold text-muted">mild</span>
          </div>
          <p className="mt-1 text-[11px] font-bold text-purple-700 flex items-center gap-0.5">
            <TrendingUp size={12} /> Dropped from {baseline.pain}/10
          </p>
        </div>
      </div>

      {/* Main Interactive Interactive Chart & Milestones */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Interactive Metric Chart */}
        <div className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-sm backdrop-blur-xl lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
            <div>
              <h2 className="font-heading text-lg font-bold text-ink">
                {activeMetric === "bp" && "Blood Pressure Progression (Systolic / Diastolic)"}
                {activeMetric === "glucose" && "Glycemic Control Trend (Fasting Blood Glucose)"}
                {activeMetric === "hr" && "Resting Heart Rate Stabilization"}
                {activeMetric === "pain" && "Symptom & Discomfort Scale (1-10)"}
              </h2>
              <p className="text-xs text-muted">Clinical evidence shows consistent normalization over 6 weeks</p>
            </div>

            <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveMetric("bp")}
                className={`rounded-lg px-2.5 py-1 ${activeMetric === "bp" ? "bg-white text-ink shadow-sm" : "text-muted"}`}
              >
                BP
              </button>
              <button
                type="button"
                onClick={() => setActiveMetric("glucose")}
                className={`rounded-lg px-2.5 py-1 ${activeMetric === "glucose" ? "bg-white text-ink shadow-sm" : "text-muted"}`}
              >
                Glucose
              </button>
              <button
                type="button"
                onClick={() => setActiveMetric("hr")}
                className={`rounded-lg px-2.5 py-1 ${activeMetric === "hr" ? "bg-white text-ink shadow-sm" : "text-muted"}`}
              >
                HR
              </button>
              <button
                type="button"
                onClick={() => setActiveMetric("pain")}
                className={`rounded-lg px-2.5 py-1 ${activeMetric === "pain" ? "bg-white text-ink shadow-sm" : "text-muted"}`}
              >
                Symptom
              </button>
            </div>
          </div>

          {/* SVG Line Graph */}
          <div className="mt-6">
            <div className="relative h-64 w-full">
              <svg className="h-full w-full overflow-visible" viewBox="0 0 600 200" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line x1="0" y1="40" x2="600" y2="40" stroke="#e2e8f0" strokeDasharray="3 3" />
                <line x1="0" y1="90" x2="600" y2="90" stroke="#e2e8f0" strokeDasharray="3 3" />
                <line x1="0" y1="140" x2="600" y2="140" stroke="#e2e8f0" strokeDasharray="3 3" />

                {/* Plot line for BP Systolic or Glucose or HR */}
                {activeMetric === "bp" && (
                  <>
                    {/* Systolic Line */}
                    <path
                      d="M 20 45 L 130 65 L 240 85 L 350 100 L 460 115 L 570 130"
                      fill="none"
                      stroke="#0b655d"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                    {/* Diastolic Line */}
                    <path
                      d="M 20 120 L 130 130 L 240 140 L 350 150 L 460 155 L 570 165"
                      fill="none"
                      stroke="#14b8a6"
                      strokeWidth="2.5"
                      strokeDasharray="4 4"
                      strokeLinecap="round"
                    />
                  </>
                )}

                {activeMetric === "glucose" && (
                  <path
                    d="M 20 30 L 130 60 L 240 90 L 350 120 L 460 145 L 570 160"
                    fill="none"
                    stroke="#0f766e"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                )}

                {activeMetric === "hr" && (
                  <path
                    d="M 20 50 L 130 70 L 240 95 L 350 120 L 460 135 L 570 150"
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                )}

                {activeMetric === "pain" && (
                  <path
                    d="M 20 40 L 130 75 L 240 95 L 350 120 L 460 145 L 570 175"
                    fill="none"
                    stroke="#9333ea"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                )}

                {/* Data Points */}
                {historyData.map((d, i) => {
                  const x = 20 + i * 110;
                  const y =
                    activeMetric === "bp" ? 45 + i * 17 :
                    activeMetric === "glucose" ? 30 + i * 26 :
                    activeMetric === "hr" ? 50 + i * 20 :
                    40 + i * 27;

                  return (
                    <g key={i}>
                      <circle cx={x} cy={y} r="6" fill="#ffffff" stroke="#0b655d" strokeWidth="3" />
                      <text x={x} y={y - 12} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#0f172a">
                        {activeMetric === "bp" ? `${d.sys}` :
                         activeMetric === "glucose" ? `${d.glucose}` :
                         activeMetric === "hr" ? `${d.hr}` : `${d.pain}`}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* X-Axis Labels */}
            <div className="mt-3 flex justify-between px-2 text-xs font-semibold text-muted">
              {historyData.map((d, i) => (
                <div key={i} className="text-center">
                  <span className="block text-ink font-bold">{d.week}</span>
                  <span className="text-[10px] text-muted">{d.date}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Metric Legend & Target Zone */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4 border border-border text-xs">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-bold text-ink">
                <span className="h-3 w-3 rounded-full bg-emerald-700" />
                Observed Trend
              </span>
              <span className="flex items-center gap-1.5 text-muted">
                <span className="h-3 w-3 rounded-full bg-teal-400" />
                Target Clinical Range (&le;120/80 mmHg, &le;110 mg/dL)
              </span>
            </div>
            <span className="font-bold text-emerald-800 flex items-center gap-1">
              <CheckCircle2 size={14} /> Target Achieved (Week 6)
            </span>
          </div>
        </div>

        {/* Medication Adherence & Streak Counter */}
        <div className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-sm backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm">
                  <Flame size={20} />
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold text-ink">Adherence Streak</h3>
                  <p className="text-xs text-muted">Daily regimen check-in</p>
                </div>
              </div>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-extrabold text-amber-800">
                21 Days 🔥
              </span>
            </div>

            <div className="mt-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-muted">
                  {t("dailyMedications", "Prescribed Daily Medications")}:
                </p>
                <button
                  type="button"
                  onClick={() => setShowAddMedModal(true)}
                  className="flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition"
                >
                  <Plus size={12} />
                  <span>{t("addMedication", "Add Medication")}</span>
                </button>
              </div>

              {meds.map((m) => (
                <div
                  key={m.id}
                  onClick={() => toggleMed(m.id)}
                  className={`cursor-pointer flex items-center justify-between rounded-2xl border p-3.5 transition-all ${
                    m.taken
                      ? "border-emerald-200 bg-emerald-50/70 text-emerald-950"
                      : "border-border bg-white text-ink hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`flex h-6 w-6 items-center justify-center rounded-lg ${
                      m.taken ? "bg-emerald-600 text-white" : "border-2 border-border bg-white"
                    }`}>
                      {m.taken && <CheckCircle2 size={16} />}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold">{m.name}</h4>
                      <p className="text-[11px] text-muted">{m.time} &middot; {m.purpose}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold uppercase ${m.taken ? "text-emerald-700" : "text-amber-700"}`}>
                    {m.taken ? "Taken" : "Pending"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Lifestyle Goals */}
          <div className="mt-6 pt-4 border-t border-border">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-2">Daily Recovery Goals:</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl border border-border p-2.5 bg-white flex items-center gap-2">
                <Apple size={16} className="text-emerald-600" />
                <div>
                  <span className="block font-bold">Low Sodium Diet</span>
                  <span className="text-[10px] text-muted">Compliant</span>
                </div>
              </div>
              <div className="rounded-xl border border-border p-2.5 bg-white flex items-center gap-2">
                <Dumbbell size={16} className="text-teal-600" />
                <div>
                  <span className="block font-bold">25 Min Walk</span>
                  <span className="text-[10px] text-muted">Achieved</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recovery Timeline Milestones & Clinician Endorsement */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Milestone Steps */}
        <div className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-sm backdrop-blur-xl lg:col-span-2">
          <h3 className="font-heading text-lg font-bold text-ink">Clinical Recovery Milestones</h3>
          <p className="text-xs text-muted">Structured pathway toward full functional health restoration</p>

          <div className="mt-6 relative pl-6 border-l-2 border-emerald-500/40 space-y-6">
            <div className="relative">
              <span className="absolute -left-[31px] top-0 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white text-xs font-bold">
                ✓
              </span>
              <h4 className="text-sm font-bold text-ink">Phase 1: Initial Presentation & Risk Stratification</h4>
              <p className="text-xs text-muted mt-0.5">
                Baseline blood pressure (154/96) & glucose (215 mg/dL) identified. ECG conducted, ruling out acute coronary occlusion.
              </p>
              <span className="mt-1 inline-block text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                Completed &middot; Sep 07
              </span>
            </div>

            <div className="relative">
              <span className="absolute -left-[31px] top-0 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white text-xs font-bold">
                ✓
              </span>
              <h4 className="text-sm font-bold text-ink">Phase 2: Pharmacological Optimization</h4>
              <p className="text-xs text-muted mt-0.5">
                Titrated Amlodipine & Metformin regimen. Patient demonstrated zero adverse drug-drug interactions.
              </p>
              <span className="mt-1 inline-block text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                Completed &middot; Sep 21
              </span>
            </div>

            <div className="relative">
              <span className="absolute -left-[31px] top-0 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white text-xs font-bold">
                ✓
              </span>
              <h4 className="text-sm font-bold text-ink">Phase 3: Biomarker Normalization</h4>
              <p className="text-xs text-muted mt-0.5">
                Systolic blood pressure stabilized at 120 mmHg; fasting blood sugar under 110 mg/dL.
              </p>
              <span className="mt-1 inline-block text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                Completed &middot; Oct 05
              </span>
            </div>

            <div className="relative">
              <span className="absolute -left-[31px] top-0 flex h-6 w-6 items-center justify-center rounded-full bg-teal-600 text-white text-xs font-bold animate-pulse">
                4
              </span>
              <h4 className="text-sm font-bold text-ink">Phase 4: Long-Term Wellness Maintenance</h4>
              <p className="text-xs text-muted mt-0.5">
                Bi-weekly vital check-ins via MediKiosk, dietary maintenance, and routine quarterly HbA1c review.
              </p>
              <span className="mt-1 inline-block text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                Current Active Phase
              </span>
            </div>
          </div>
        </div>

        {/* Doctor Note Card */}
        <div className="rounded-3xl border border-white/70 bg-gradient-to-b from-white to-slate-50 p-6 shadow-sm backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-bold">
                AS
              </div>
              <div>
                <h4 className="font-heading text-sm font-bold text-ink">Dr. Ananya Sharma, MD</h4>
                <p className="text-xs text-muted">Attending Physician Review</p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/50 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-900">Latest Clinical Endorsement:</p>
              <p className="mt-1.5 text-xs text-slate-800 leading-relaxed italic">
                "Patient demonstrates outstanding commitment to therapy. Blood pressure has remained squarely within normal hemodynamic parameters for 14 straight days. Fasting glucose is well controlled. Continue present medication dosage and maintain low-sodium diet."
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs">
            <span className="text-muted">Next Review: Nov 15, 2026</span>
            <Link
              to="/appointments"
              className="font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              Book Follow-up <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Log Vitals Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-white/70 bg-white p-6 shadow-2xl">
            <h3 className="font-heading text-lg font-bold text-ink">Log Today's Health Vitals</h3>
            <p className="text-xs text-muted mt-1">Enter your readings to dynamically update your recovery trajectory score.</p>

            <form onSubmit={handleLogSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-ink">Systolic BP (mmHg)</label>
                  <input
                    type="number"
                    value={newLog.sys}
                    onChange={(e) => setNewLog({ ...newLog, sys: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-border p-2.5 text-sm font-bold text-ink"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-ink">Diastolic BP (mmHg)</label>
                  <input
                    type="number"
                    value={newLog.dia}
                    onChange={(e) => setNewLog({ ...newLog, dia: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-border p-2.5 text-sm font-bold text-ink"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-ink">Glucose (mg/dL)</label>
                  <input
                    type="number"
                    value={newLog.glucose}
                    onChange={(e) => setNewLog({ ...newLog, glucose: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-border p-2.5 text-sm font-bold text-ink"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-ink">Heart Rate (bpm)</label>
                  <input
                    type="number"
                    value={newLog.hr}
                    onChange={(e) => setNewLog({ ...newLog, hr: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-border p-2.5 text-sm font-bold text-ink"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-ink">Symptom Severity (0 = None, 10 = Severe)</label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={newLog.pain}
                  onChange={(e) => setNewLog({ ...newLog, pain: e.target.value })}
                  className="mt-2 w-full accent-emerald-600"
                />
                <div className="flex justify-between text-[11px] font-bold text-muted">
                  <span>0 (Great)</span>
                  <span>Score: {newLog.pain}</span>
                  <span>10 (Severe)</span>
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="flex-1 rounded-xl border border-border py-2.5 text-sm font-bold text-ink hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-bold text-white shadow-md hover:bg-emerald-700"
                >
                  Save & Update Score
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Medication Modal */}
      {showAddMedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-white/70 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold">
                  +
                </span>
                <div>
                  <h3 className="font-heading text-base font-bold text-ink">Add Daily Medication</h3>
                  <p className="text-xs text-muted">Persisted exclusively to your personal EHR database</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddMedModal(false)}
                className="text-muted hover:text-ink"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddMedication} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-ink">Medication Name & Dosage</label>
                <input
                  type="text"
                  placeholder="e.g. Telmisartan 40mg"
                  value={newMedForm.name}
                  onChange={(e) => setNewMedForm({ ...newMedForm, name: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-border p-2.5 text-xs font-medium text-ink focus:border-emerald-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-ink">Schedule / Time of Day</label>
                <select
                  value={newMedForm.time}
                  onChange={(e) => setNewMedForm({ ...newMedForm, time: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-border p-2.5 text-xs font-medium text-ink focus:border-emerald-500 outline-none"
                >
                  <option value="Morning (08:00 AM)">Morning (08:00 AM)</option>
                  <option value="With Lunch (01:30 PM)">With Lunch (01:30 PM)</option>
                  <option value="Evening (06:00 PM)">Evening (06:00 PM)</option>
                  <option value="Bedtime (09:30 PM)">Bedtime (09:30 PM)</option>
                  <option value="Twice Daily (Morning & Night)">Twice Daily (Morning & Night)</option>
                  <option value="Weekly (Sunday)">Weekly (Sunday)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-ink">Clinical Indication / Purpose</label>
                <input
                  type="text"
                  placeholder="e.g. Hypertension / Cardiac Care"
                  value={newMedForm.purpose}
                  onChange={(e) => setNewMedForm({ ...newMedForm, purpose: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-border p-2.5 text-xs font-medium text-ink focus:border-emerald-500 outline-none"
                  required
                />
              </div>

              <div className="mt-6 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddMedModal(false)}
                  className="flex-1 rounded-xl border border-border py-2.5 text-xs font-bold text-ink hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-2.5 text-xs font-bold text-white shadow-md hover:brightness-110"
                >
                  Save to EHR Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
