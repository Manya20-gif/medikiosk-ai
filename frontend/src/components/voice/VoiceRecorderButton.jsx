import { Mic, Square, Loader2, Check, RotateCcw, Radio, Sparkles } from "lucide-react";
import { useVoiceRecorder } from "../../hooks/useVoiceRecorder.js";

export default function VoiceRecorderButton({ languageCode = "en", onTranscriptConfirmed }) {
  const {
    status,
    elapsedSeconds,
    transcript,
    setTranscript,
    interimText,
    micAvailable,
    volumeLevel,
    isRealAsr,
    startRecording,
    stopRecording,
    reset,
  } = useVoiceRecorder({ languageCode });

  const minutes = String(Math.floor(elapsedSeconds / 60)).padStart(2, "0");
  const seconds = String(elapsedSeconds % 60).padStart(2, "0");

  return (
    <div className="rounded-2xl border border-emerald-900/10 bg-white/80 p-5 shadow-sm backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <Mic size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-ink">Voice Clinical Input</h2>
            <p className="text-[11px] text-muted">Real-time speech recognition in your chosen language</p>
          </div>
        </div>
        <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
          isRealAsr
            ? "bg-emerald-100 text-emerald-800"
            : "bg-teal-50 text-teal-800"
        }`}>
          <Radio size={12} className={status === "recording" ? "animate-pulse" : ""} />
          {isRealAsr ? "Live Speech-to-Text" : "Assisted Voice Input"}
        </span>
      </div>

      <div className="mt-4">
        {status === "idle" && (
          <button
            type="button"
            onClick={startRecording}
            className="group flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-primary/30 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 py-4 text-base font-bold text-primary-dark transition-all hover:border-primary hover:shadow-md"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-sm transition-transform group-hover:scale-110">
              <Mic size={20} />
            </span>
            <span>Tap to speak symptoms / details</span>
          </button>
        )}

        {status === "recording" && (
          <div className="flex flex-col items-center gap-4 py-3">
            <div className="relative flex items-center justify-center">
              {/* Animated audio waves */}
              <div
                className="absolute h-24 w-24 rounded-full bg-red-400/20 transition-all duration-150"
                style={{ transform: `scale(${1 + volumeLevel * 1.5})` }}
              />
              <div
                className="absolute h-20 w-20 rounded-full bg-red-500/30 transition-all duration-150"
                style={{ transform: `scale(${1 + volumeLevel * 0.8})` }}
              />
              <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-red-500 text-white shadow-lg">
                <Mic size={26} className="animate-pulse" />
              </span>
            </div>

            {/* Sound wave bars */}
            <div className="flex items-center justify-center gap-1 h-6">
              {[0.4, 0.7, 1.0, 0.6, 0.9, 0.5, 0.8, 0.3].map((factor, idx) => (
                <span
                  key={idx}
                  className="w-1 rounded-full bg-red-500 transition-all duration-100"
                  style={{
                    height: `${Math.max(6, Math.min(24, (volumeLevel || 0.3) * 24 * factor))}px`,
                    opacity: 0.6 + factor * 0.4
                  }}
                />
              ))}
            </div>

            <div className="text-center">
              <p className="font-mono text-xl font-extrabold text-ink">
                {minutes}:{seconds}
              </p>
              <p className="text-xs font-semibold text-emerald-700 animate-pulse mt-0.5">
                Listening... Speak naturally in your selected language
              </p>
            </div>

            {(transcript || interimText) && (
              <div className="w-full rounded-xl border border-primary/20 bg-primary-light/40 p-3 text-sm text-ink">
                <p className="font-medium">{transcript} <span className="text-muted italic">{interimText}</span></p>
              </div>
            )}

            <button
              type="button"
              onClick={stopRecording}
              className="flex items-center gap-2 rounded-xl bg-red-600 px-6 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-red-700 hover:shadow-lg active:scale-95"
            >
              <Square size={16} />
              Done speaking
            </button>
          </div>
        )}

        {status === "processing" && (
          <div className="flex flex-col items-center gap-2 py-6 text-muted">
            <Loader2 size={28} className="animate-spin text-primary" />
            <p className="text-sm font-semibold text-ink">Processing your voice input&hellip;</p>
          </div>
        )}

        {status === "done" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-muted">
                Recognized Voice Input:
              </label>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                <Sparkles size={13} />
                You can review & edit before confirming
              </span>
            </div>
            <textarea
              value={transcript}
              onChange={(event) => setTranscript(event.target.value)}
              rows={3}
              className="w-full rounded-xl border-2 border-emerald-900/15 bg-white px-3.5 py-3 text-base text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => onTranscriptConfirmed(transcript)}
                disabled={!transcript.trim()}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-primary-dark disabled:opacity-40"
              >
                <Check size={18} />
                Use this voice response
              </button>
              <button
                type="button"
                onClick={reset}
                className="flex items-center justify-center gap-2 rounded-xl border-2 border-border bg-white px-5 py-3 text-sm font-bold text-ink transition hover:border-primary hover:bg-slate-50"
              >
                <RotateCcw size={16} />
                Record again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
