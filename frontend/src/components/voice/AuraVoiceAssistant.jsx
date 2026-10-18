import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2, VolumeX, X, Sparkles, Activity, ShieldCheck, HeartPulse, Send, RefreshCw } from "lucide-react";
import { speak, stopSpeaking, isTtsSupported } from "../../services/ttsService.js";
import { SpeechListener, isSpeechRecognitionSupported } from "../../services/speechRecognitionService.js";
import { useSession } from "../../context/SessionContext.jsx";
import { queryVirtualDoctor } from "../../services/virtualDoctorService.js";
import { getTranslation } from "../../services/translationService.js";

export default function AuraVoiceAssistant({ isOpen, onClose }) {
  const { languageCode, documents, patient, clinicalHistory } = useSession();
  const currentLang = languageCode || "en";

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [conversation, setConversation] = useState([
    {
      role: "assistant",
      text: "Hello! I am Aura, your MediKiosk Voice Health Assistant. You can speak to me or type any medical or document question in your language.",
      time: "Just now"
    }
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const [inputText, setInputText] = useState("");

  const speechListenerRef = useRef(null);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation, isThinking]);

  useEffect(() => {
    return () => {
      stopSpeaking();
      if (speechListenerRef.current) {
        speechListenerRef.current.stop();
      }
    };
  }, []);

  const handleStartListening = () => {
    stopSpeaking();
    setIsSpeaking(false);
    setTranscript("");
    setInterim("");
    setIsListening(true);

    const listener = new SpeechListener({
      languageCode: currentLang,
      onTranscript: (full) => {
        setTranscript(full);
      },
      onInterim: (temp) => {
        setInterim(temp);
      },
      onVolumeChange: (vol) => {
        setVolumeLevel(vol);
      },
      onError: (err) => {
        console.warn("Aura voice recognition note:", err);
      },
      onEnd: (final) => {
        setIsListening(false);
        const queryText = (final || transcript).trim();
        if (queryText) {
          handleUserQuery(queryText);
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
    const queryText = (transcript || interim).trim();
    if (queryText) {
      handleUserQuery(queryText);
    }
  };

  const handleUserQuery = async (userText) => {
    if (!userText || !userText.trim()) return;
    const cleanText = userText.trim();
    setInputText("");
    setTranscript("");
    setInterim("");

    setConversation((prev) => [
      ...prev,
      { role: "user", text: cleanText, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }
    ]);

    setIsThinking(true);

    try {
      const response = await queryVirtualDoctor(cleanText, {
        languageCode: currentLang,
        patient,
        clinicalHistory,
        documents
      });

      const assistantReply = response.answer || "I have analyzed your query based on clinical protocols. Please let me know if you would like me to explain anything further.";

      setConversation((prev) => [
        ...prev,
        {
          role: "assistant",
          text: assistantReply,
          severity: response.triageLevel,
          redFlags: response.redFlags,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);

      // Speak aloud in selected language
      if (isTtsSupported()) {
        speak(assistantReply, currentLang, {
          onStart: () => setIsSpeaking(true),
          onEnd: () => setIsSpeaking(false)
        });
      }
    } catch (err) {
      setConversation((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "I encountered an issue processing that query. Please make sure to discuss your symptoms directly with the attending clinician.",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const quickPrompts = [
    "Explain my latest document in simple words",
    "What are the warning signs I should watch for?",
    "Can you explain my blood pressure and vitals?",
    "What questions should I ask the doctor?"
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative flex h-[90vh] sm:h-[650px] w-full sm:max-w-xl flex-col rounded-t-3xl sm:rounded-3xl border border-white/20 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white shadow-2xl overflow-hidden">
        {/* Glow orb */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-32 bg-emerald-500/20 blur-3xl pointer-events-none rounded-full" />

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-lg">
              <Sparkles size={20} className={isSpeaking ? "animate-spin" : ""} />
              {isSpeaking && (
                <span className="absolute inset-0 rounded-2xl border-2 border-emerald-300 animate-ping opacity-60" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading text-lg font-bold">Aura Voice Health Assistant</h3>
                <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                  <Activity size={10} /> Online
                </span>
              </div>
              <p className="text-xs text-slate-400">Multilingual speech recognition & voice synthesis</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Audio Wave Visualizer Area */}
        <div className="relative z-10 border-b border-white/10 bg-slate-950/60 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Voice Frequency:</span>
            <div className="flex items-center gap-1 h-5">
              {[0.3, 0.6, 1.0, 0.7, 0.4, 0.8, 0.5, 0.9, 0.4].map((f, i) => (
                <span
                  key={i}
                  className={`w-1 rounded-full transition-all duration-100 ${
                    isListening ? "bg-red-400" : isSpeaking ? "bg-emerald-400" : "bg-slate-700"
                  }`}
                  style={{
                    height: `${Math.max(4, Math.min(20, (isListening ? volumeLevel || 0.4 : isSpeaking ? 0.6 : 0.15) * 20 * f))}px`
                  }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isSpeaking && (
              <button
                type="button"
                onClick={() => {
                  stopSpeaking();
                  setIsSpeaking(false);
                }}
                className="flex items-center gap-1 rounded-lg bg-emerald-500/20 px-2.5 py-1 text-xs font-bold text-emerald-300 hover:bg-emerald-500/30"
              >
                <VolumeX size={13} /> Stop Voice
              </button>
            )}
            <span className="rounded-md bg-white/10 px-2 py-0.5 text-[11px] font-bold text-slate-300 uppercase tracking-wide">
              {currentLang.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Conversation Message Feed */}
        <div className="relative z-10 flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {conversation.map((msg, index) => (
            <div
              key={index}
              className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
                    : "border border-white/10 bg-slate-800/80 text-slate-100 backdrop-blur-md"
                }`}
              >
                <p>{msg.text}</p>

                {msg.redFlags?.length > 0 && (
                  <div className="mt-2 rounded-xl bg-red-950/70 border border-red-500/30 p-2 text-xs text-red-200">
                    <span className="font-bold">Urgent alert:</span> {msg.redFlags.join("; ")}
                  </div>
                )}
              </div>
              <span className="mt-1 text-[10px] text-slate-500 px-1">{msg.time}</span>
            </div>
          ))}

          {isThinking && (
            <div className="flex items-center gap-2 text-xs text-emerald-300 animate-pulse">
              <RefreshCw size={14} className="animate-spin" />
              <span>Aura is analyzing medical clinical context...</span>
            </div>
          )}

          {isListening && (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-950/40 p-3 text-xs text-red-200">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
              <span>
                Listening: <span className="font-bold text-white">{transcript || interim || "Say something..."}</span>
              </span>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Quick Prompts */}
        <div className="relative z-10 px-6 py-2 border-t border-white/5 bg-slate-950/40">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Quick Voice Inquiries:</p>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {quickPrompts.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleUserQuery(q)}
                className="shrink-0 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-slate-300 hover:border-emerald-400 hover:bg-emerald-500/10 hover:text-white transition"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar & Mic Trigger */}
        <div className="relative z-10 border-t border-white/10 bg-slate-900/90 p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleUserQuery(inputText);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask by typing or tap the microphone..."
              className="flex-1 rounded-xl border border-white/15 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-emerald-400"
            />

            <button
              type="button"
              onClick={isListening ? handleStopListening : handleStartListening}
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-bold transition-all ${
                isListening
                  ? "bg-red-500 text-white animate-pulse shadow-[0_0_20px_rgba(239,68,68,.5)]"
                  : "bg-emerald-500 text-white hover:bg-emerald-600 shadow-[0_0_15px_rgba(16,185,129,.3)]"
              }`}
              title={isListening ? "Stop listening" : "Tap to speak with voice"}
            >
              {isListening ? <MicOff size={22} /> : <Mic size={22} />}
            </button>

            <button
              type="submit"
              disabled={!inputText.trim()}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 transition disabled:opacity-30"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
