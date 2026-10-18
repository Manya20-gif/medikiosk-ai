import { useState, useRef, useEffect } from "react";
import {
  UploadCloud, FileText, CheckCircle2, AlertTriangle, ShieldAlert,
  Stethoscope, User, Volume2, VolumeX, Download, Sparkles, RefreshCw,
  Copy, HelpCircle, Activity, Pill, HeartPulse, ChevronRight, X,
  Mic, MicOff, Send, Eye, ShieldCheck, Check, CornerDownRight, ArrowRight,
  LogIn, UserCheck, Edit3, ClipboardList, Database
} from "lucide-react";
import { useSession } from "../context/SessionContext.jsx";
import { speak, stopSpeaking, isTtsSupported } from "../services/ttsService.js";
import { SpeechListener } from "../services/speechRecognitionService.js";
import { queryVirtualDoctor } from "../services/virtualDoctorService.js";
import { useTranslation } from "../services/translationService.js";
import { api } from "../services/api.js";
import { Link } from "react-router-dom";

export default function DocumentAnalysisHub() {
  const { addDocument, patient, authUser } = useSession();
  const { t, currentLang } = useTranslation();

  // Intake Mode: "file" (PDF/image upload) vs "text" (direct paste / typed vitals)
  const [intakeMode, setIntakeMode] = useState("file");
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [manualText, setManualText] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [rawTextOpen, setRawTextOpen] = useState(false);
  const [activeTileFilter, setActiveTileFilter] = useState("all"); // "all" | "doctor" | "patient" | "virtual-doctor"

  // User EHR History
  const [userHistoryDocs, setUserHistoryDocs] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showHistoryTray, setShowHistoryTray] = useState(false);

  // Virtual Doctor Interactive State inside Tile
  const [doctorQuery, setDoctorQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [doctorThinking, setDoctorThinking] = useState(false);
  const [doctorMessages, setDoctorMessages] = useState([]);
  const [copied, setCopied] = useState(false);

  // Doctor's Final Recommendation State (Generated after follow-up inquiries)
  const [doctorRecommendation, setDoctorRecommendation] = useState(null);
  const [loadingRec, setLoadingRec] = useState(false);

  const fileInputRef = useRef(null);
  const speechListenerRef = useRef(null);

  // Fetch user's saved documents if authenticated
  useEffect(() => {
    if (authUser) {
      setLoadingHistory(true);
      api("/user/documents")
        .then((res) => {
          if (Array.isArray(res?.documents)) {
            setUserHistoryDocs(res.documents);
          }
        })
        .catch((err) => console.warn("Could not load user EHR docs:", err))
        .finally(() => setLoadingHistory(false));
    } else {
      setUserHistoryDocs([]);
    }
  }, [authUser]);

  // File Upload Handler (Converts file to base64 & calls backend parser)
  const handleFileUpload = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setValidationError(null);
    setAnalysisData(null);
    setFile(selected);
    setFileName(selected.name);

    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result;
      processDocument({
        docName: selected.name,
        mimeType: selected.type,
        base64Data,
        textInput: null
      });
    };
    reader.readAsDataURL(selected);
  };

  // Direct Text Submit
  const handleDirectTextSubmit = (e) => {
    e?.preventDefault();
    if (!manualText.trim()) {
      setValidationError("Please enter or paste your medical laboratory report, clinical vitals, or prescription text.");
      return;
    }
    setFile(null);
    setFileName("Direct_Clinical_Intake.txt");
    processDocument({
      docName: "Direct_Clinical_Intake.txt",
      mimeType: "text/plain",
      base64Data: null,
      textInput: manualText.trim()
    });
  };

  // Quick Clinical Report Template Helper
  const handleFillStandardTemplate = () => {
    const template = `METROPOLIS HEALTHCARE CLINICAL DIAGNOSTICS
Patient Name: ${patient?.name || authUser?.name || "Rajesh Verma"}    Age: 52 / Male    Date: ${new Date().toLocaleDateString()}
Referring Physician: Dr. Rohan Mehta, DM (Cardiology)
CLINICAL LAB REPORT & VITALS:
Blood Pressure: 148/92 mmHg (High)
Fasting Blood Sugar: 182 mg/dL (Elevated)
HbA1c: 9.1 % (Critical High)
Serum Creatinine: 1.30 mg/dL (Elevated)
Hemoglobin: 11.2 g/dL (Mild Low)
Total Platelet Count: 142,000 /µL (Borderline)
Clinical Notes: Patient reports persistent fatigue, exertional shortness of breath, and polyuria.`;
    setManualText(template);
    setValidationError(null);
  };

  const processDocument = async ({ docName, mimeType, base64Data, textInput }) => {
    setLoading(true);
    setValidationError(null);
    stopSpeaking();
    setIsSpeaking(false);

    try {
      const payload = {
        fileName: docName,
        mimeType,
        language: currentLang
      };
      if (base64Data) payload.fileData = base64Data;
      if (textInput) payload.documentText = textInput;

      const res = await api("/ai/analyze-document-dual", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      if (!res.isValidMedicalDocument) {
        setValidationError(res.error || "The uploaded input could not be verified as an authentic medical document.");
        setAnalysisData(null);
        return;
      }

      setAnalysisData(res);

      // Save to global session context
      addDocument({
        id: `doc_${Date.now()}`,
        typeLabel: res.documentType || "Medical Report",
        fileName: docName,
        aiAnalysis: {
          decision: res.triageLevel,
          confidence: res.confidence / 100,
          summary: res.patientLevel?.explanation,
          keyFindings: res.doctorLevel?.biomarkers?.map(b => `${b.name}: ${b.value} (${b.status})`),
          redFlags: res.patientLevel?.warningSigns,
          nextSteps: res.patientLevel?.medicationGuide
        },
        dualAnalysis: res,
        uploadedAt: new Date().toISOString()
      });

      // Update history docs list if saved to user profile
      if (res.savedToProfile && authUser) {
        api("/user/documents").then(d => d.documents && setUserHistoryDocs(d.documents)).catch(() => {});
      }

      // Initialize Virtual Doctor dialogue with real extracted findings
      const firstAbnormal = res.doctorLevel?.biomarkers?.find(b => !b.status.includes("Normal") && !b.status.includes("Optimal")) || res.doctorLevel?.biomarkers?.[0];
      setDoctorMessages([
        {
          role: "doctor",
          text: `Hello! I have reviewed your verified document (${res.documentName}) for ${res.parsedEntities?.patientName || "the patient"}. ${firstAbnormal ? `I noticed your ${firstAbnormal.name} is ${firstAbnormal.value} (${firstAbnormal.status}).` : "All clinical parameters have been indexed."} You can ask me follow-up questions by speaking or typing.`,
          time: "Just now"
        }
      ]);

    } catch (err) {
      console.error("Analysis failed:", err);
      setValidationError(err.message || "Failed to analyze document. Please ensure it is an authentic medical report.");
    } finally {
      setLoading(false);
    }
  };

  // Load a previously saved document from EHR history
  const handleLoadSavedDoc = (savedDoc) => {
    setFileName(savedDoc.fileName || "Saved_Report.pdf");
    setValidationError(null);
    setAnalysisData({
      isValidMedicalDocument: true,
      documentName: savedDoc.fileName,
      documentType: savedDoc.documentType,
      analyzedAt: savedDoc.analyzedAt,
      triageLevel: savedDoc.triageLevel,
      confidence: savedDoc.confidence || 95,
      extractedText: savedDoc.extractedText || "Saved EHR Document Record",
      parsedEntities: {
        patientName: savedDoc.patientName,
        documentDate: savedDoc.documentDate,
        doctorOrFacility: savedDoc.facility,
        totalBiomarkersDetected: savedDoc.biomarkers?.length || 0
      },
      doctorLevel: savedDoc.doctorLevel,
      patientLevel: savedDoc.patientLevel,
      savedToProfile: true
    });
    setShowHistoryTray(false);
  };

  // Virtual Doctor Query Handler
  const handleAskDoctor = async (question) => {
    if (!question || !question.trim()) return;
    const cleanQ = question.trim();
    setDoctorQuery("");

    setDoctorMessages(prev => [
      ...prev,
      { role: "patient", text: cleanQ, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }
    ]);

    setDoctorThinking(true);
    try {
      const response = await queryVirtualDoctor(cleanQ, {
        languageCode: currentLang,
        patient: { name: analysisData?.parsedEntities?.patientName || patient?.name || authUser?.name },
        documents: analysisData ? [{
          type: analysisData.documentType,
          fileName: analysisData.documentName,
          keyFindings: analysisData.doctorLevel?.biomarkers?.map(b => `${b.name}: ${b.value}`),
          biomarkers: analysisData.doctorLevel?.biomarkers
        }] : []
      });

      setDoctorMessages(prev => [
        ...prev,
        {
          role: "doctor",
          text: response.answer,
          probing: response.doctorProbingQuestions,
          triageLevel: response.triageLevel,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);

      if (isTtsSupported()) {
        speak(response.answer, currentLang, {
          onStart: () => setIsSpeaking(true),
          onEnd: () => setIsSpeaking(false)
        });
      }
    } catch (err) {
      console.error("Virtual Doctor error:", err);
    } finally {
      setDoctorThinking(false);
    }
  };

  // Voice Recognition for Virtual Doctor
  const handleToggleVoice = () => {
    if (isListening) {
      setIsListening(false);
      if (speechListenerRef.current) speechListenerRef.current.stop();
      if (doctorQuery.trim()) handleAskDoctor(doctorQuery);
    } else {
      stopSpeaking();
      setIsSpeaking(false);
      setIsListening(true);
      setDoctorQuery("");

      const listener = new SpeechListener({
        languageCode: currentLang,
        onTranscript: (full) => setDoctorQuery(full),
        onEnd: (final) => {
          setIsListening(false);
          const q = (final || doctorQuery).trim();
          if (q) handleAskDoctor(q);
        }
      });
      speechListenerRef.current = listener;
      listener.start();
    }
  };

  const handleCopy = () => {
    if (!analysisData) return;
    const text = `MEDIKIOSK CLINICAL REPORT:
Patient: ${analysisData.parsedEntities.patientName} (${analysisData.parsedEntities.documentDate})
Triage: ${analysisData.triageLevel}
Diagnosis: ${analysisData.doctorLevel.diagnosticImpression}
Patient Summary: ${analysisData.patientLevel.explanation}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate Doctor's Final Official Recommendation from follow-up inquiry history & extracted lab data
  const handleGetDoctorRecommendation = async () => {
    if (!analysisData) return;
    setLoadingRec(true);
    try {
      const questionHistory = doctorMessages.map((m) => `${m.role}: ${m.text}`);
      const res = await api("/ai/virtual-doctor/recommendation", {
        method: "POST",
        body: JSON.stringify({
          questionHistory,
          language: currentLang,
          context: {
            patientName: analysisData.parsedEntities?.patientName || authUser?.name || "Patient",
            activeBiomarkers: analysisData.doctorLevel?.biomarkers,
            documentsSummary: [{
              type: analysisData.documentType,
              fileName: analysisData.documentName,
              findings: analysisData.doctorLevel?.biomarkers
            }]
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
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
      {/* Cockpit Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/70 bg-white/75 p-5 rounded-3xl shadow-sm backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md">
            <Activity size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-xl font-black text-ink sm:text-2xl">
                Medical Document Analysis Cockpit
              </h1>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800 uppercase tracking-wide">
                Bento Architecture
              </span>
            </div>
            <p className="text-xs text-muted">
              Live OCR extraction &middot; Strict medical verification &middot; Dual clinician/patient tiles &middot; No mock data
            </p>
          </div>
        </div>

        {/* View Mode Filter Tabs */}
        <div className="flex items-center gap-1.5 rounded-2xl bg-slate-100 p-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTileFilter("all")}
            className={`rounded-xl px-3 py-1.5 transition ${activeTileFilter === "all" ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink"}`}
          >
            All Tiles
          </button>
          <button
            type="button"
            onClick={() => setActiveTileFilter("doctor")}
            className={`rounded-xl px-3 py-1.5 transition ${activeTileFilter === "doctor" ? "bg-slate-900 text-white shadow-sm" : "text-muted hover:text-ink"}`}
          >
            Doctor Tile
          </button>
          <button
            type="button"
            onClick={() => setActiveTileFilter("patient")}
            className={`rounded-xl px-3 py-1.5 transition ${activeTileFilter === "patient" ? "bg-emerald-600 text-white shadow-sm" : "text-muted hover:text-ink"}`}
          >
            Patient Tile
          </button>
          <button
            type="button"
            onClick={() => setActiveTileFilter("virtual-doctor")}
            className={`rounded-xl px-3 py-1.5 transition ${activeTileFilter === "virtual-doctor" ? "bg-teal-700 text-white shadow-sm" : "text-muted hover:text-ink"}`}
          >
            Virtual Doctor Tile
          </button>
        </div>
      </div>

      {/* Authentication & EHR Status Bar */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-xs shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-2">
          {authUser ? (
            <>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
                <UserCheck size={14} />
              </span>
              <div>
                <span className="font-extrabold text-slate-900">Authenticated EHR Patient:</span>{" "}
                <span className="font-bold text-emerald-700">{authUser.name}</span>{" "}
                <span className="text-muted">({authUser.email})</span>
              </div>
              <span className="ml-2 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                Reports automatically persist to your profile
              </span>
            </>
          ) : (
            <>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-800">
                <User size={14} />
              </span>
              <div>
                <span className="font-bold text-slate-800">Guest Analysis Session:</span>{" "}
                <span className="text-muted">You can process any real document. Sign in to permanently save your lab trends to your EHR.</span>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {authUser && userHistoryDocs.length > 0 && (
            <button
              type="button"
              onClick={() => setShowHistoryTray(!showHistoryTray)}
              className="flex items-center gap-1.5 rounded-xl border border-border bg-slate-50 px-3 py-1.5 font-bold text-slate-800 hover:bg-slate-100 transition"
            >
              <Database size={13} className="text-teal-600" />
              <span>Saved Reports ({userHistoryDocs.length})</span>
            </button>
          )}

          {!authUser && (
            <Link
              to="/auth"
              state={{ from: "/documents-hub" }}
              className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-1.5 font-bold text-white shadow-sm hover:bg-slate-800 transition"
            >
              <LogIn size={13} />
              <span>Sign In / Create Patient Account</span>
            </Link>
          )}
        </div>
      </div>

      {/* Saved Reports Dropdown Tray */}
      {showHistoryTray && userHistoryDocs.length > 0 && (
        <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-lg animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-border pb-2 mb-3">
            <span className="text-xs font-black uppercase text-slate-700 flex items-center gap-1.5">
              <ClipboardList size={14} className="text-teal-600" />
              Previously Verified Documents in Your EHR:
            </span>
            <button
              type="button"
              onClick={() => setShowHistoryTray(false)}
              className="text-xs text-muted hover:text-ink"
            >
              Close
            </button>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
            {userHistoryDocs.map((doc) => (
              <div
                key={doc.id}
                onClick={() => handleLoadSavedDoc(doc)}
                className="cursor-pointer rounded-xl border border-border p-3 hover:border-emerald-500 hover:bg-emerald-50/40 transition text-left"
              >
                <div className="flex items-center justify-between">
                  <span className="truncate text-xs font-bold text-ink">{doc.fileName || "Medical Report"}</span>
                  <span className={`text-[10px] font-black rounded px-1.5 py-0.2 ${
                    doc.triageLevel === "EMERGENCY" ? "bg-red-100 text-red-900" :
                    doc.triageLevel === "URGENT" ? "bg-amber-100 text-amber-900" :
                    "bg-emerald-100 text-emerald-900"
                  }`}>
                    {doc.triageLevel}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-muted truncate">{doc.documentType}</p>
                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                  <span>{doc.patientName}</span>
                  <span>{new Date(doc.analyzedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* REJECTION ALERT: If uploaded file or text is not an authentic medical record */}
      {validationError && (
        <div className="mt-6 rounded-3xl border-2 border-red-400 bg-red-50 p-6 text-red-950 shadow-lg animate-in fade-in duration-200">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-600 text-white shadow-md">
              <ShieldAlert size={26} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-heading text-lg font-black text-red-900">
                  Document Verification Failed &mdash; Non-Medical Content Rejected
                </h3>
                <span className="rounded-full bg-red-200/80 px-2.5 py-0.5 text-xs font-bold text-red-900">
                  Strict Medical Gate Active
                </span>
              </div>
              <p className="mt-1.5 text-sm font-medium leading-relaxed text-red-800">
                {validationError}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIntakeMode("file");
                    fileInputRef.current?.click();
                  }}
                  className="rounded-xl bg-red-700 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-red-800 transition"
                >
                  Upload Authentic Medical Report File
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIntakeMode("text");
                    handleFillStandardTemplate();
                  }}
                  className="rounded-xl border border-red-300 bg-white px-4 py-2 text-xs font-bold text-red-900 hover:bg-red-100 transition"
                >
                  Switch to Text Mode & Insert Clinical Format
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ORDERED BENTO GRID TILES */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">

        {/* TILE 1: Document Intake & Medical Validator (Cols: 5) */}
        {(activeTileFilter === "all" || activeTileFilter === "doctor") && (
          <div className="lg:col-span-5 flex flex-col justify-between rounded-3xl border border-white/70 bg-white/85 p-6 shadow-sm backdrop-blur-xl">
            <div>
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-xs font-black text-white">
                    1
                  </span>
                  <h2 className="font-heading text-base font-bold text-ink">
                    {t("tileIntake", "Document Intake & Medical Validator")}
                  </h2>
                </div>
                {analysisData && (
                  <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800">
                    <ShieldCheck size={12} /> {analysisData.confidence}% Clinical Match
                  </span>
                )}
              </div>

              {/* Mode Selector Tabs */}
              <div className="mt-4 flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setIntakeMode("file");
                    setValidationError(null);
                  }}
                  className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 transition ${
                    intakeMode === "file" ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink"
                  }`}
                >
                  <UploadCloud size={14} />
                  <span>{t("uploadFileTab", "Upload Medical File")}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIntakeMode("text");
                    setValidationError(null);
                  }}
                  className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 transition ${
                    intakeMode === "text" ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink"
                  }`}
                >
                  <Edit3 size={14} />
                  <span>{t("typeReportTab", "Type / Paste Clinical Report")}</span>
                </button>
              </div>

              {/* Mode 1: File Upload Dropzone */}
              {intakeMode === "file" && (
                <div className="mt-4">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".pdf,image/*"
                    className="hidden"
                  />

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="group cursor-pointer flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-600/30 bg-emerald-50/40 p-6 text-center transition-all hover:border-emerald-600 hover:bg-emerald-50"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md transition-transform group-hover:scale-110">
                      <UploadCloud size={26} />
                    </div>
                    <h3 className="mt-3 text-sm font-bold text-ink">{t("uploadFileTab", "Upload Patient Report")}</h3>
                    <p className="mt-1 text-xs text-muted">
                      Accepts genuine Medical PDFs, Pathology Labs, Prescriptions, or Scans.
                    </p>
                    <span className="mt-2 inline-block rounded-md bg-white border border-border px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      Strict verification gate &bull; Non-medical files rejected
                    </span>
                  </div>

                  {fileName && !validationError && (
                    <div className="mt-3 flex items-center justify-between rounded-xl border border-border bg-slate-50 p-2.5">
                      <div className="flex items-center gap-2 truncate">
                        <FileText size={16} className="text-emerald-600 shrink-0" />
                        <span className="truncate text-xs font-bold text-ink">{fileName}</span>
                      </div>
                      <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                        Verified
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Mode 2: Direct Clinical Report Text / Vitals Intake */}
              {intakeMode === "text" && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-slate-700">Enter Actual Lab Text or Vitals:</span>
                    <button
                      type="button"
                      onClick={handleFillStandardTemplate}
                      className="font-bold text-teal-700 hover:text-teal-800 hover:underline flex items-center gap-1"
                    >
                      <Sparkles size={12} /> {t("fillFormatBtn", "Fill Standard Format")}
                    </button>
                  </div>

                  <textarea
                    rows={7}
                    value={manualText}
                    onChange={(e) => setManualText(e.target.value)}
                    placeholder="Paste your clinical report or type your vitals here. Example:&#10;Patient Name: Rajesh Verma, 52 Male&#10;Fasting Blood Sugar: 185 mg/dL&#10;HbA1c: 9.1 %&#10;Blood Pressure: 148/92 mmHg"
                    className="w-full rounded-2xl border border-border bg-slate-50 p-3 text-xs text-ink placeholder:text-muted focus:border-emerald-600 focus:bg-white focus:outline-none leading-relaxed font-mono"
                  />

                  <div className="mt-3 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setManualText("")}
                      className="text-xs text-muted hover:text-ink font-semibold"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      disabled={loading || !manualText.trim()}
                      onClick={handleDirectTextSubmit}
                      className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition disabled:opacity-40 flex items-center gap-1.5"
                    >
                      <CheckCircle2 size={14} />
                      <span>{t("analyzeBtn", "Analyze Real Clinical Input")}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {loading && (
              <div className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-800 animate-pulse">
                <RefreshCw size={14} className="animate-spin" />
                Parsing actual document lines & extracting clinical biomarkers...
              </div>
            )}
          </div>
        )}

        {/* TILE 2: Extracted Patient & Clinical Intelligence (Cols: 7) */}
        {(activeTileFilter === "all" || activeTileFilter === "doctor") && (
          <div className="lg:col-span-7 flex flex-col justify-between rounded-3xl border border-white/70 bg-white/85 p-6 shadow-sm backdrop-blur-xl">
            <div>
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-600 text-xs font-black text-white">
                    2
                  </span>
                  <h2 className="font-heading text-base font-bold text-ink">
                    {t("tileExtraction", "Extracted Patient & Clinical Intelligence")}
                  </h2>
                </div>
                {analysisData && (
                  <div className="flex items-center gap-2">
                    {analysisData.savedToProfile && (
                      <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800">
                        <Check size={12} /> {t("savedToEhr", "Saved to EHR")}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setRawTextOpen(!rawTextOpen)}
                      className="flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-100"
                    >
                      <Eye size={12} /> {rawTextOpen ? t("hideRawOcr", "Hide Raw OCR") : t("viewRawOcr", "View Extracted OCR Text")}
                    </button>
                  </div>
                )}
              </div>

              {!analysisData ? (
                <div className="py-12 flex flex-col items-center justify-center text-center text-muted">
                  <FileText size={32} className="opacity-30 mb-2" />
                  <p className="text-sm font-semibold">No medical report loaded yet.</p>
                  <p className="text-xs">Upload an authentic PDF/image or enter clinical values in Tile 1 to run real analysis.</p>
                </div>
              ) : (
                <div className="mt-4 space-y-4">
                  {/* Patient Info Bento Row */}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-2xl border border-border bg-slate-50 p-3">
                      <span className="text-[10px] font-bold uppercase text-muted">{t("patientName", "Patient Name")}</span>
                      <p className="font-heading text-sm font-extrabold text-ink truncate mt-0.5">
                        {analysisData.parsedEntities?.patientName || "Identified in Document"}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-border bg-slate-50 p-3">
                      <span className="text-[10px] font-bold uppercase text-muted">{t("recordDate", "Record Date")}</span>
                      <p className="font-heading text-sm font-extrabold text-ink truncate mt-0.5">
                        {analysisData.parsedEntities?.documentDate || "Current"}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-border bg-slate-50 p-3">
                      <span className="text-[10px] font-bold uppercase text-muted">{t("ageSex", "Age / Sex")}</span>
                      <p className="font-heading text-sm font-extrabold text-ink truncate mt-0.5">
                        {analysisData.parsedEntities?.patientAge ? `${analysisData.parsedEntities.patientAge}y` : "Adult"} &middot; {analysisData.parsedEntities?.patientGender || "Clinical"}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-border bg-slate-50 p-3">
                      <span className="text-[10px] font-bold uppercase text-muted">{t("triageRating", "Triage Rating")}</span>
                      <p className={`font-heading text-sm font-black mt-0.5 ${
                        analysisData.triageLevel === "EMERGENCY" ? "text-red-600" :
                        analysisData.triageLevel === "URGENT" ? "text-amber-600" :
                        "text-emerald-700"
                      }`}>
                        {analysisData.triageLevel}
                      </p>
                    </div>
                  </div>

                  {/* Clinician or Facility */}
                  <div className="flex items-center justify-between rounded-xl bg-emerald-50/70 border border-emerald-200/60 p-3 text-xs">
                    <div>
                      <span className="font-bold text-emerald-950">Facility / Prescribing Clinician: </span>
                      <span className="text-emerald-900 font-semibold">{analysisData.parsedEntities?.doctorOrFacility || "Diagnostic Center"}</span>
                    </div>
                    <span className="font-mono text-[11px] font-bold text-emerald-800">
                      {analysisData.doctorLevel?.biomarkers?.length || 0} Biomarkers Parsed
                    </span>
                  </div>

                  {/* Collapsible Raw OCR View */}
                  {rawTextOpen && (
                    <div className="rounded-2xl border border-slate-300 bg-slate-900 p-4 text-xs font-mono text-emerald-400 max-h-48 overflow-y-auto">
                      <div className="flex justify-between text-slate-400 mb-2 border-b border-slate-700 pb-1">
                        <span>EXACT TEXT EXTRACTED FROM REAL INPUT:</span>
                        <span>{analysisData.matchedMedicalTokens?.length || 0} clinical tokens matched</span>
                      </div>
                      <pre className="whitespace-pre-wrap leading-relaxed">{analysisData.extractedText}</pre>
                    </div>
                  )}
                </div>
              )}
            </div>

            {analysisData && (
              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
                <span className="text-muted">Document: {analysisData.documentName}</span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  {copied ? "Copied" : "Copy Extracted Dossier"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* TILE 3: Doctor-Level Clinical Dossier (Formal EMR Tile) (Cols: 12 or 6) */}
        {analysisData && (activeTileFilter === "all" || activeTileFilter === "doctor") && (
          <div className="lg:col-span-6 rounded-3xl border border-white/70 bg-white/90 p-6 shadow-sm backdrop-blur-xl space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-xs font-black text-white">
                  3
                </span>
                <div>
                  <h2 className="font-heading text-base font-bold text-ink">
                    {t("tileDoctorDossier", "Doctor-Level Clinical Dossier")}
                  </h2>
                  <p className="text-[11px] text-muted">Formal Clinical & Pathological Synthesis</p>
                </div>
              </div>
              <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-extrabold text-slate-800 uppercase">
                EMR Grade
              </span>
            </div>

            {/* Diagnostic Impression */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{t("diagnosticImpression", "Clinical Diagnostic Impression")}:</span>
              <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-900">
                {analysisData.doctorLevel.diagnosticImpression}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {analysisData.doctorLevel.icdCodes?.map((c, i) => (
                  <span key={i} className="rounded-md bg-white border border-slate-200 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-800">
                    ICD: {c}
                  </span>
                ))}
              </div>
            </div>

            {/* Real Biomarker Matrix Table */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                {t("observedBiomarkers", "Observed Biomarkers & Reference Deviations")}:
              </span>
              <div className="mt-2 overflow-x-auto rounded-2xl border border-border">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 font-bold text-slate-700 border-b border-border">
                    <tr>
                      <th className="px-3 py-2">Biomarker</th>
                      <th className="px-3 py-2">Observed</th>
                      <th className="px-3 py-2">Reference</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Deviation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {analysisData.doctorLevel.biomarkers?.map((b, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60">
                        <td className="px-3 py-2 font-bold text-ink">{b.name}</td>
                        <td className="px-3 py-2 font-mono font-bold">{b.value}</td>
                        <td className="px-3 py-2 text-muted">{b.reference}</td>
                        <td className="px-3 py-2">
                          <span className={`inline-block rounded px-1.5 py-0.2 text-[9px] font-extrabold ${
                            b.status.includes("Critical") ? "bg-red-100 text-red-900" :
                            b.status.includes("High") || b.status.includes("Low") ? "bg-amber-100 text-amber-900" :
                            "bg-emerald-100 text-emerald-900"
                          }`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="px-3 py-2 font-mono font-bold">{b.deviation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Differential Diagnoses */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                {t("differentialDiagnoses", "Differential Diagnostic Probabilities")}:
              </span>
              <div className="mt-2 space-y-1.5">
                {analysisData.doctorLevel.differentialDiagnoses?.map((d, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl border border-border bg-white p-2.5 text-xs">
                    <div>
                      <span className="font-bold text-ink">{d.condition}</span>
                      <p className="text-[11px] text-muted">{d.rationale}</p>
                    </div>
                    <span className="rounded bg-slate-100 px-2 py-0.5 font-bold text-slate-800 text-[10px]">
                      {d.probability}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TILE 4: Patient-Level Plain Language Guide Tile (Cols: 12 or 6) */}
        {analysisData && (activeTileFilter === "all" || activeTileFilter === "patient") && (
          <div className="lg:col-span-6 rounded-3xl border border-white/70 bg-gradient-to-b from-white to-emerald-50/40 p-6 shadow-sm backdrop-blur-xl space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-xs font-black text-white">
                  4
                </span>
                <div>
                  <h2 className="font-heading text-base font-bold text-ink">
                    {t("tilePatientGuide", "Patient-Level Plain Language Guide")}
                  </h2>
                  <p className="text-[11px] text-muted">Clear, empathetic, and jargon-free translation</p>
                </div>
              </div>
              <span className="rounded-lg bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800 uppercase">
                Plain English
              </span>
            </div>

            {/* Summary */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4">
              <h3 className="font-heading text-sm font-bold text-emerald-950">
                {analysisData.patientLevel.summaryTitle}
              </h3>
              <p className="mt-1.5 text-xs font-medium leading-relaxed text-slate-800">
                {analysisData.patientLevel.explanation}
              </p>
            </div>

            {/* Daily Life Impact */}
            <div className="rounded-2xl border border-border bg-white p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                {t("dailyImpact", "What this means for your daily routine")}:
              </span>
              <p className="mt-1 text-xs text-slate-700 leading-relaxed">
                {analysisData.patientLevel.dailyImpact}
              </p>
            </div>

            {/* Medication Safety & Red Flags */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-emerald-100 bg-white p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                  <Pill size={12} /> {t("medicationTips", "Medication Tips")}:
                </span>
                <ul className="mt-1.5 space-y-1 text-[11px] text-slate-700 list-disc pl-4">
                  {analysisData.patientLevel.medicationGuide?.slice(0, 2).map((m, i) => (
                    <li key={i}>{m}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-red-200 bg-red-50/60 p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-900 flex items-center gap-1">
                  <AlertTriangle size={12} /> {t("redFlags", "Red Flags & Emergency Triggers")}:
                </span>
                <ul className="mt-1.5 space-y-1 text-[11px] text-red-900 list-disc pl-4 font-semibold">
                  {analysisData.patientLevel.warningSigns?.slice(0, 2).map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Questions for Doctor */}
            <div className="rounded-2xl border border-border bg-white p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted flex items-center gap-1">
                <HelpCircle size={12} /> {t("questionsForDoctor", "Questions to Ask Your Doctor")}:
              </span>
              <div className="mt-2 space-y-1.5">
                {analysisData.patientLevel.questionsForDoctor?.map((q, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-800">
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-teal-100 text-[10px] font-bold text-teal-800">
                      {i + 1}
                    </span>
                    <span>{q}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TILE 5: Real-Time Virtual Doctor AI (Interactive Consultation Tile) (Cols: 12) */}
        {analysisData && (activeTileFilter === "all" || activeTileFilter === "virtual-doctor") && (
          <div className="lg:col-span-12 rounded-3xl border border-white/70 bg-gradient-to-r from-slate-900 via-teal-950 to-slate-950 p-6 text-white shadow-xl backdrop-blur-2xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500 text-xs font-black text-white">
                  5
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-heading text-lg font-bold">
                      {t("tileVirtualDoctor", "Real-Time Virtual Doctor AI")}
                    </h2>
                    <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                      Grounded on {analysisData.documentName}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Ask real follow-up questions about this patient's actual lab values or medications.
                  </p>
                </div>
              </div>

              {isSpeaking && (
                <button
                  type="button"
                  onClick={() => {
                    stopSpeaking();
                    setIsSpeaking(false);
                  }}
                  className="flex items-center gap-1 rounded-xl bg-emerald-500/20 px-3 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/30"
                >
                  <VolumeX size={14} /> Stop Voice Response
                </button>
              )}
            </div>

            {/* Interactive Messages */}
            <div className="max-h-72 overflow-y-auto space-y-3 pr-2">
              {doctorMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${msg.role === "patient" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed shadow-sm ${
                      msg.role === "patient"
                        ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
                        : "border border-white/10 bg-slate-800/90 text-slate-100"
                    }`}
                  >
                    <p className="font-medium text-sm">{msg.text}</p>

                    {msg.probing?.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-white/10">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                          Dr. MediKiosk Probing Inquiries:
                        </span>
                        <ul className="mt-1 list-disc pl-4 space-y-0.5 text-[11px] text-slate-300">
                          {msg.probing.map((p, idx) => (
                            <li key={idx}>{p}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 px-1">{msg.time}</span>
                </div>
              ))}

              {doctorThinking && (
                <div className="flex items-center gap-2 text-xs text-emerald-300 animate-pulse">
                  <RefreshCw size={13} className="animate-spin" />
                  Dr. MediKiosk is analyzing your query against the uploaded medical values...
                </div>
              )}
            </div>

            {/* Quick Contextual Questions from the Document */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {t("quickQuestionsLabel", "Quick Questions Derived From This Document")}:
              </span>
              <div className="mt-2 flex flex-wrap gap-2">
                {[
                  `Why is my ${analysisData.doctorLevel.biomarkers?.[0]?.name || "lab reading"} flagged?`,
                  "Can I take pain medication or ibuprofen with this report?",
                  "What dietary changes will help normalize these numbers?",
                  "Is this test result an emergency or routine?"
                ].map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAskDoctor(q)}
                    className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-slate-300 hover:border-emerald-400 hover:bg-emerald-500/10 hover:text-white transition"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Input & Voice Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAskDoctor(doctorQuery);
              }}
              className="flex items-center gap-2 pt-2"
            >
              <input
                type="text"
                value={doctorQuery}
                onChange={(e) => setDoctorQuery(e.target.value)}
                placeholder={t("askDoctorPlaceholder", "Ask Dr. MediKiosk anything about this document...")}
                className="flex-1 rounded-2xl border border-white/15 bg-slate-950/80 px-4 py-3 text-xs text-white placeholder:text-slate-500 outline-none focus:border-emerald-400"
              />

              <button
                type="button"
                onClick={handleToggleVoice}
                className={`flex h-11 w-11 items-center justify-center rounded-2xl transition-all ${
                  isListening
                    ? "bg-red-500 text-white animate-pulse"
                    : "bg-emerald-500 text-white hover:bg-emerald-600"
                }`}
                title={isListening ? "Stop voice listening" : "Speak question"}
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>

              <button
                type="submit"
                disabled={!doctorQuery.trim()}
                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white hover:bg-white/20 transition disabled:opacity-30"
              >
                <Send size={16} />
              </button>
            </form>

            {/* Doctor's Final Recommendation Action Strip */}
            <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <Sparkles size={14} className="text-amber-400 shrink-0" />
                <span>
                  After follow-up inquiries, receive the authoritative Doctor's Final Clinical Recommendation.
                </span>
              </div>

              <button
                type="button"
                disabled={loadingRec}
                onClick={handleGetDoctorRecommendation}
                className="group flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 px-5 py-2.5 text-xs font-black text-slate-950 shadow-lg shadow-amber-500/25 hover:scale-105 active:scale-95 transition disabled:opacity-50"
              >
                {loadingRec ? (
                  <>
                    <RefreshCw size={14} className="animate-spin text-slate-950" />
                    <span>{t("generatingRec", "Synthesizing Authorized Doctor Recommendation...")}</span>
                  </>
                ) : (
                  <>
                    <Award size={15} className="text-slate-950" />
                    <span>{t("getDoctorRecBtn", "Get Doctor's Final Recommendation")}</span>
                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* TILE 6: Official Doctor's Final Recommendation & Care Action Plan (Cols: 12) */}
        {doctorRecommendation && (
          <div className="lg:col-span-12 rounded-[32px] border-2 border-amber-400/40 bg-gradient-to-br from-slate-950 via-[#101a24] to-[#0a1219] p-6 sm:p-8 text-white shadow-2xl backdrop-blur-2xl space-y-6 animate-in fade-in duration-300">
            {/* Header with Doctor Seal & Urgency Badge */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 shadow-lg shadow-amber-500/30 font-black">
                  <Stethoscope size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-heading text-lg font-black sm:text-xl text-white">
                      {doctorRecommendation.planTitle}
                    </h2>
                    <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-300 border border-emerald-500/30">
                      OFFICIAL CLINICAL RECORD
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Patient: <strong className="text-white">{doctorRecommendation.patientName}</strong> &middot; Generated {new Date(doctorRecommendation.generatedAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`rounded-xl px-3 py-1.5 text-xs font-black uppercase tracking-wider ${
                  doctorRecommendation.urgencyLevel === "EMERGENCY"
                    ? "bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse"
                    : doctorRecommendation.urgencyLevel === "URGENT"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                }`}>
                  Triage Urgency: {doctorRecommendation.urgencyLevel}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    if (isSpeaking) {
                      stopSpeaking();
                      setIsSpeaking(false);
                    } else {
                      speak(doctorRecommendation.clinicalImpression, currentLang, {
                        onStart: () => setIsSpeaking(true),
                        onEnd: () => setIsSpeaking(false)
                      });
                    }
                  }}
                  className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-white/20 transition"
                >
                  {isSpeaking ? <VolumeX size={14} className="text-amber-400" /> : <Volume2 size={14} className="text-emerald-400" />}
                  <span>{isSpeaking ? "Stop Briefing" : "Listen to Recommendation"}</span>
                </button>
              </div>
            </div>

            {/* Authoritative Diagnostic Impression */}
            <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-5">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-300">
                Authoritative Clinical Impression:
              </span>
              <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-100">
                {doctorRecommendation.clinicalImpression}
              </p>
            </div>

            {/* Grid of Prescribed Actions & Medication Safety */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Prescribed Action Plan */}
              <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-400">
                  <CheckCircle2 size={15} />
                  <span>Prescribed Clinical Actions & Workup</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-300">
                  {doctorRecommendation.prescribedActions?.map((act, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] font-bold text-emerald-400 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{act}</span>
                    </li>
                  ))}
                </ul>

                {doctorRecommendation.diagnosticWorkup?.length > 0 && (
                  <div className="pt-2 border-t border-white/10">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Diagnostic Tests Required:</span>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {doctorRecommendation.diagnosticWorkup.map((tst, i) => (
                        <span key={i} className="rounded-lg bg-white/10 px-2 py-1 text-[11px] font-semibold text-slate-200">
                          {tst}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Medication Safety Directives */}
              <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-cyan-400">
                  <Pill size={15} />
                  <span>Medication Safety & Contraindications</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-300">
                  {doctorRecommendation.medicationSafetyDirectives?.map((med, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-[10px] font-bold text-cyan-400 mt-0.5">
                        !
                      </span>
                      <span className="leading-relaxed">{med}</span>
                    </li>
                  ))}
                </ul>

                {doctorRecommendation.lifestyleDietProtocol && (
                  <div className="pt-2 border-t border-white/10">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Diet & Lifestyle Protocol:</span>
                    <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                      {doctorRecommendation.lifestyleDietProtocol}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Red Flag Emergency Thresholds & Specialist Referral Row */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-12">
              {/* Red Flags Card */}
              <div className="md:col-span-7 rounded-2xl border border-red-500/30 bg-red-950/20 p-5">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-red-400">
                  <AlertTriangle size={15} />
                  <span>Red Flag Emergency Thresholds (Seek Immediate Care)</span>
                </div>
                <ul className="mt-3 space-y-1.5 text-xs text-red-200 font-medium">
                  {doctorRecommendation.redFlagThresholds?.map((rf, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-red-400">&bull;</span>
                      <span>{rf}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Attending Specialist Direct Referral */}
              <div className="md:col-span-5 rounded-2xl border border-emerald-500/30 bg-emerald-950/30 p-5 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                    Recommended Specialist Referral:
                  </span>
                  <h4 className="mt-1 text-base font-bold text-white">
                    {doctorRecommendation.recommendedSpecialist?.doctorName}
                  </h4>
                  <p className="text-xs text-slate-300">
                    {doctorRecommendation.recommendedSpecialist?.specialty} &middot; {doctorRecommendation.recommendedSpecialist?.hospital}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[11px] text-emerald-300 font-bold">Zero Wait Time</span>
                  <Link
                    to="/doctors"
                    className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-3.5 py-1.5 text-xs font-bold text-slate-950 shadow-md hover:scale-105 transition"
                  >
                    <span>Book Specialist</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
