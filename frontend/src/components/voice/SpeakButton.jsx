import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { speak, stopSpeaking, isTtsSupported } from "../../services/ttsService.js";

export default function SpeakButton({ text, languageCode = "en", label = "Listen" }) {
  const [speaking, setSpeaking] = useState(false);
  const supported = isTtsSupported();

  useEffect(() => stopSpeaking, []); // stop any playback if the component unmounts

  const handleClick = () => {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }
    speak(text, languageCode, {
      onStart: () => setSpeaking(true),
      onEnd: () => setSpeaking(false),
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!supported || !text}
      title={supported ? "Browser text-to-speech" : "Text-to-speech isn't supported in this browser"}
      className="flex shrink-0 items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted transition hover:border-primary hover:text-primary disabled:opacity-50"
    >
      {speaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
      {speaking ? "Stop" : label}
    </button>
  );
}
