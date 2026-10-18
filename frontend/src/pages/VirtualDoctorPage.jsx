import { useState, useRef, useEffect } from "react";
import {
  Stethoscope, Mic, MicOff, Volume2, VolumeX, Sparkles, AlertTriangle,
  CheckCircle2, ShieldAlert, Send, RefreshCw, HelpCircle, Activity,
  HeartPulse, FileText, ChevronRight, User, Pill, Award, ArrowRight
} from "lucide-react";
import { useSession } from "../context/SessionContext.jsx";
import { speak, stopSpeaking, isTtsSupported } from "../services/ttsService.js";
import { SpeechListener } from "../services/speechRecognitionService.js";
import { queryVirtualDoctor, CLINICAL_TOPIC_PRESETS } from "../services/virtualDoctorService.js";
import { SUPPORTED_LANGUAGES, useTranslation } from "../services/translationService.js";
import { api } from "../services/api.js";
import { Link } from "react-router-dom";

export default function VirtualDoctorPage() {
  const { patient, clinicalHistory, documents } = useSession();
  const { t, currentLang, setLanguageCode } = useTranslation();

  const [inputQuery, setInputQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingIdx, setSpeakingIdx] = useState(null);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [interimText, setInterimText] = useState("");
  const [loading, setLoading] = useState(false);

  // Doctor's Final Recommendation State
  const [doctorRecommendation, setDoctorRecommendation] = useState(null);
  const [loadingRec, setLoadingRec] = useState(false);

  const [consultationHistory, setConsultationHistory] = useState([
    {
      id: "init",
      role: "doctor",
      triageLevel: "ROUTINE",
      triageColor: "emerald",
      doctorTitle: "Dr. MediKiosk Virtual Clinical Consultation",
      answer: `Hello ${patient?.name || "there"}. I am your Virtual Doctor AI. I have reviewed your clinical context${documents.length > 0 ? ` and your ${documents.length} uploaded medical document(s)` : ""}. Ask me any medical follow-up questions regarding your symptoms, medications, lab values, or lifestyle adjustments in your preferred language.`,
      doctorProbingQuestions: [
        "How are your symptoms progressing compared to earlier this week?",
        "Have you taken all your prescribed medicines today?",
        "Are there any specific lab results you would like me to interpret?"
      ],
      clinicalRationale: "Baseline clinical follow-up engagement and diagnostic readiness check.",
      patientNextSteps: [
        "Feel free to speak using your microphone or select any suggested inquiry below.",
        "Mention any medications or new discomfort you have noticed."
      ],
      redFlags: []
    }
  ]);

  const speechListenerRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [consultationHistory, loading]);

  useEffect(() => {
    return () => {
      stopSpeaking();
      if (speechListenerRef.current) speechListenerRef.current.stop();
    };
  }, []);

  const handleStartListening = () => {
    stopSpeaking();
    setIsSpeaking(false);
    setIsListening(true);
    setInterimText("");

    const listener = new SpeechListener({
      languageCode: currentLang,
      onTranscript: (full) => {
        setInputQuery(full);
      },
      onInterim: (temp) => {
        setInterimText(temp);
      },
      onVolumeChange: (vol) => {
        setVolumeLevel(vol);
      },
      onError: (err) => {
        console.warn("Virtual Doctor speech notice:", err);
      },
      onEnd: (final) => {
        setIsListening(false);
        const q = (final || inputQuery).trim();
        if (q) {
          executeConsultation(q);
        }
      }
    });

    speechListenerRef.current = listener;
    listener.start();
  };

  const handleStopListening = () => {
    setIsListening(false);
    if (speechListenerRef.current) {
      speechListenerRef.current.stop();
      speechListenerRef.current = null;
    }
    const q = (inputQuery || interimText).trim();
    if (q) {
      executeConsultation(q);
    }
  };

  const executeConsultation = async (question) => {
    if (!question || !question.trim()) return;
    const cleanQ = question.trim();
    setInputQuery("");
    setInterimText("");

    // Add user message to dialogue
    const userMsg = {
      id: `user_${Date.now()}`,
      role: "patient",
      question: cleanQ,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setConsultationHistory((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const response = await queryVirtualDoctor(cleanQ, {
        languageCode: currentLang,
        patient,
        clinicalHistory,
        documents
      });

      const doctorMsg = {
        id: `doc_${Date.now()}`,
        role: "doctor",
        ...response,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setConsultationHistory((prev) => [...prev, doctorMsg]);

      // Speak aloud doctor's response
      if (isTtsSupported()) {
        speak(response.answer, currentLang, {
          onStart: () => setIsSpeaking(true),
          onEnd: () => setIsSpeaking(false)
        });
      }
    } catch (err) {
      console.error("Virtual Doctor analysis error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSpeakItem = (text, idx) => {
    if (speakingIdx === idx) {
      stopSpeaking();
      setSpeakingIdx(null);
      setIsSpeaking(false);
      return;
    }
    stopSpeaking();
    setSpeakingIdx(idx);
    setIsSpeaking(true);
    speak(text, currentLang, {
      onEnd: () => {
        setSpeakingIdx(null);
        setIsSpeaking(false);
      }
    });
  };

  const handleGetDoctorRecommendation = async () => {
    setLoadingRec(true);
    try {
      const questionHistory = consultationHistory.map((m) =>
        m.role === "patient" ? `Patient: ${m.question}` : `Doctor: ${m.answer}`
      );
      const res = await api("/ai/virtual-doctor/recommendation", {
        method: "POST",
        body: JSON.stringify({
          questionHistory,
          language: currentLang,
          context: {
            patientName: patient?.name || "Patient",
            documentsSummary: documents
          }
        })
      });
      setDoctorRecommendation(res);
      if (isTtsSupported() && res.clinicalImpression) {
        speak(res.clinicalImpression, currentLang, {
          onStart: () => setIsSpeaking(true),
          onEnd: () => setIsSpeaking(false)
        });
      }
    } catch (err) {
      console.error("Failed to generate doctor recommendation:", err);
    } finally {
      setLoadingRec(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      {/* Top Banner with Virtual Doctor Persona */}
      <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-gradient-to-r from-slate-950 via-teal-950 to-slate-900 p-6 sm:p-10 text-white shadow-2xl backdrop-blur-2xl">
        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/20 px-3.5 py-1 text-xs font-bold text-emerald-300">
              <Sparkles size={14} />
              AI Clinical Reasoning & Follow-Up Engine
            </div>
            <h1 className="mt-3 font-heading text-3xl font-extrabold tracking-tight sm:text-5xl">
              Virtual Doctor Consultation
            </h1>
            <p className="mt-2 text-sm text-slate-300 sm:text-base">
              Trained on evidence-based triage protocols. Ask clinical follow-up questions, drug-safety checks, symptom clarification, and report explanations.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              {/* Language Selector */}
              <div className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-1.5 backdrop-blur-md">
                <span className="text-xs font-semibold text-slate-300">Language:</span>
                <select
                  value={currentLang}
                  onChange={(e) => setLanguageCode(e.target.value)}
                  className="bg-transparent text-xs font-bold text-emerald-300 outline-none cursor-pointer"
                >
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code} className="bg-slate-900 text-white">
                      {l.flag} {l.native} ({l.name})
                    </option>
                  ))}
                </select>
              </div>

              {documents.length > 0 && (
                <div className="flex items-center gap-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400/30 px-3 py-1.5 text-xs font-bold text-emerald-300">
                  <FileText size={14} />
                  Context: {documents.length} Report(s) Linked
                </div>
              )}
            </div>
          </div>

          {/* Doctor Stethoscope Avatar Card */}
          <div className="flex items-center gap-4 rounded-3xl border border-white/15 bg-white/5 p-5 backdrop-blur-xl shadow-inner">
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-lg">
              <Stethoscope size={32} />
              {isSpeaking && (
                <span className="absolute inset-0 rounded-2xl border-2 border-emerald-300 animate-ping opacity-60" />
              )}
            </div>
            <div>
              <h3 className="font-heading text-base font-bold text-white">Dr. MediKiosk, MD</h3>
              <p className="text-xs text-emerald-300">AI Clinical Fellow</p>
              <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-400">
                <Activity size={12} className="text-emerald-400" />
                Active Knowledge Graph
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Suggested Follow-up Topic Chips */}
      <div className="mt-6 rounded-3xl border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur-xl">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
            <HelpCircle size={15} className="text-emerald-700" />
            Suggested Real Clinical Follow-up Inquiries:
          </span>
          <span className="text-[11px] text-muted">Tap any to run full analysis</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {CLINICAL_TOPIC_PRESETS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => executeConsultation(item.question)}
              className="group flex items-center gap-2 rounded-2xl border border-emerald-900/10 bg-white px-3.5 py-2 text-xs font-medium text-slate-800 shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-600/40 hover:bg-emerald-50/50 hover:text-emerald-900"
            >
              <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
                {item.category}
              </span>
              <span className="line-clamp-1">{item.question}</span>
              <ChevronRight size={13} className="text-muted group-hover:text-emerald-700" />
            </button>
          ))}
        </div>
      </div>

      {/* Consultation Chat Feed */}
      <div className="mt-6 space-y-6">
        {consultationHistory.map((item, idx) => (
          <div key={item.id || idx}>
            {item.role === "patient" ? (
              /* Patient Query Card */
              <div className="flex justify-end">
                <div className="max-w-2xl rounded-3xl rounded-tr-sm bg-gradient-to-r from-emerald-700 to-teal-800 p-5 text-white shadow-md">
                  <div className="flex items-center justify-between gap-4 border-b border-white/20 pb-2 mb-2">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-200">
                      <User size={14} /> You (Patient)
                    </span>
                    <span className="text-[10px] text-emerald-200">{item.time}</span>
                  </div>
                  <p className="text-base font-semibold leading-relaxed">{item.question}</p>
                </div>
              </div>
            ) : (
              /* Doctor Clinical Analysis Card */
              <div className="rounded-3xl border border-white/70 bg-white/90 p-6 sm:p-8 shadow-sm backdrop-blur-xl space-y-6">
                {/* Doctor Card Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
                      <Stethoscope size={22} />
                    </div>
                    <div>
                      <h3 className="font-heading text-lg font-bold text-ink">{item.doctorTitle}</h3>
                      <p className="text-xs text-muted">Physician-Level Clinical Decision Support</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`rounded-xl px-3 py-1 text-xs font-extrabold uppercase tracking-wider ${
                      item.triageLevel === "EMERGENCY" ? "bg-red-100 text-red-800 border border-red-200" :
                      item.triageLevel === "URGENT" ? "bg-amber-100 text-amber-800 border border-amber-200" :
                      "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    }`}>
                      Triage: {item.triageLevel}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleSpeakItem(item.answer, idx)}
                      className="flex items-center gap-1.5 rounded-xl border border-border bg-white px-3 py-1.5 text-xs font-bold text-ink shadow-sm hover:bg-slate-50 transition"
                    >
                      {speakingIdx === idx ? <VolumeX size={15} /> : <Volume2 size={15} />}
                      {speakingIdx === idx ? "Stop Voice" : "Listen"}
                    </button>
                  </div>
                </div>

                {/* Primary Clinical Formulation */}
                <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Clinical Analysis & Doctor Formulation:
                  </h4>
                  <p className="text-base font-medium leading-relaxed text-slate-900">
                    {item.answer}
                  </p>
                </div>

                {/* Clinical Probing Questions (What the Doctor Would Ask) */}
                {item.doctorProbingQuestions?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                      <Stethoscope size={14} className="text-emerald-700" />
                      Doctor's Diagnostic Follow-up Inquiries:
                    </h4>
                    <div className="mt-2.5 space-y-2">
                      {item.doctorProbingQuestions.map((prob, i) => (
                        <div key={i} className="flex items-start gap-2.5 rounded-xl border border-emerald-900/10 bg-emerald-50/50 p-3 text-xs text-slate-800">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-200 font-bold text-emerald-800 text-[10px]">
                            {i + 1}
                          </span>
                          <span className="font-semibold">{prob}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Clinical Rationale & Next Steps Grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Pathophysiological Rationale */}
                  <div className="rounded-2xl border border-border bg-white p-4">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-muted">
                      Clinical & Pharmacological Rationale:
                    </h5>
                    <p className="mt-2 text-xs leading-relaxed text-slate-700">
                      {item.clinicalRationale}
                    </p>
                  </div>

                  {/* Patient Action Plan */}
                  <div className="rounded-2xl border border-border bg-white p-4">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-muted">
                      Immediate Action Steps:
                    </h5>
                    <ul className="mt-2 space-y-1.5 text-xs text-slate-700 list-disc pl-4">
                      {item.patientNextSteps?.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Red Flags Alert if present */}
                {item.redFlags?.length > 0 && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-red-900 flex items-center gap-1.5">
                      <ShieldAlert size={15} className="text-red-600" />
                      Critical Red Flags to Watch For:
                    </h5>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {item.redFlags.map((flag, i) => (
                        <span key={i} className="rounded-lg bg-red-100 border border-red-300 px-2.5 py-1 text-xs font-bold text-red-900">
                          {flag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Doctor's Final Recommendation CTA Strip */}
        <div className="rounded-3xl border border-amber-300/60 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 p-5 backdrop-blur-xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-black shadow-md">
              <Award size={20} />
            </div>
            <div>
              <h4 className="font-heading text-sm font-bold text-ink">
                Doctor's Final Clinical Recommendation
              </h4>
              <p className="text-xs text-muted">
                Synthesize all follow-up questions and clinical metrics into an authoritative care action plan.
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={loadingRec}
            onClick={handleGetDoctorRecommendation}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-xs font-black text-slate-950 shadow-md hover:scale-105 active:scale-95 transition disabled:opacity-40"
          >
            {loadingRec ? (
              <>
                <RefreshCw size={14} className="animate-spin text-slate-950" />
                <span>{t("generatingRec", "Synthesizing Authorized Doctor Recommendation...")}</span>
              </>
            ) : (
              <>
                <Sparkles size={14} className="text-slate-950" />
                <span>{t("getDoctorRecBtn", "Get Doctor's Final Recommendation")}</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>

        {/* Render Doctor's Official Recommendation Card */}
        {doctorRecommendation && (
          <div className="rounded-[30px] border-2 border-amber-400/40 bg-gradient-to-br from-slate-950 via-[#101a24] to-[#0a1219] p-6 text-white shadow-2xl space-y-5 animate-in fade-in duration-300">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-black">
                  <Stethoscope size={18} />
                </span>
                <div>
                  <h3 className="font-heading text-base font-bold text-white">
                    {doctorRecommendation.planTitle}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Patient: {doctorRecommendation.patientName} &middot; Urgency: <strong className="text-amber-300">{doctorRecommendation.urgencyLevel}</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => speak(doctorRecommendation.clinicalImpression, currentLang)}
                  className="flex items-center gap-1 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-white/20 transition"
                >
                  <Volume2 size={13} className="text-emerald-400" />
                  <span>Audio Briefing</span>
                </button>
                <Link
                  to="/doctors"
                  className="rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-black text-slate-950 hover:bg-emerald-400 transition"
                >
                  Book Specialist
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                Diagnostic Impression:
              </span>
              <p className="mt-1 text-xs font-medium leading-relaxed text-slate-200">
                {doctorRecommendation.clinicalImpression}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
                <span className="text-[10px] font-bold uppercase text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 size={13} /> Prescribed Actions:
                </span>
                <ul className="mt-2 space-y-1 text-xs text-slate-300 list-disc pl-4">
                  {doctorRecommendation.prescribedActions?.map((act, i) => (
                    <li key={i}>{act}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
                <span className="text-[10px] font-bold uppercase text-cyan-400 flex items-center gap-1.5">
                  <Pill size={13} /> Medication Directives:
                </span>
                <ul className="mt-2 space-y-1 text-xs text-slate-300 list-disc pl-4">
                  {doctorRecommendation.medicationSafetyDirectives?.map((med, i) => (
                    <li key={i}>{med}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* Floating Audio Wave & Speech Input Bar */}
      <div className="sticky bottom-4 z-40 mt-8 rounded-3xl border border-white/70 bg-white/90 p-4 shadow-2xl backdrop-blur-2xl">
        {/* Animated wave bars if recording */}
        {isListening && (
          <div className="mb-3 flex items-center justify-between rounded-2xl bg-red-50 border border-red-200 px-4 py-2.5 text-xs text-red-900">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
              </span>
              <span className="font-bold">Listening in real-time... Speak your medical question now</span>
            </div>

            {/* Live soundwave */}
            <div className="flex items-center gap-1 h-5">
              {[0.4, 0.8, 1.0, 0.6, 0.9, 0.5, 0.7].map((factor, i) => (
                <span
                  key={i}
                  className="w-1 rounded-full bg-red-500 transition-all duration-75"
                  style={{
                    height: `${Math.max(4, Math.min(20, (volumeLevel || 0.4) * 20 * factor))}px`
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {interimText && (
          <p className="mb-2 text-xs text-muted px-2 italic">
            Recognizing: <span className="text-ink font-semibold">{interimText}</span>
          </p>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            executeConsultation(inputQuery);
          }}
          className="flex items-center gap-3"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Type your medical follow-up question or tap microphone..."
            className="flex-1 rounded-2xl border-2 border-emerald-900/10 bg-white px-5 py-3.5 text-base text-ink placeholder:text-muted outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
          />

          <button
            type="button"
            onClick={isListening ? handleStopListening : handleStartListening}
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-md transition-all ${
              isListening
                ? "bg-red-600 animate-pulse hover:bg-red-700 shadow-red-500/30"
                : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
            }`}
            title={isListening ? "Stop listening" : "Tap to speak question"}
          >
            {isListening ? <MicOff size={24} /> : <Mic size={24} />}
          </button>

          <button
            type="submit"
            disabled={!inputQuery.trim()}
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-md transition hover:bg-slate-800 disabled:opacity-40"
            title="Send query"
          >
            <Send size={22} />
          </button>
        </form>
      </div>
    </div>
  );
}
