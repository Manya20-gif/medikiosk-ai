// TEXT-TO-SPEECH SERVICE.
//
// Unlike asrService.js, this one is NOT mocked — it uses the browser's
// built-in SpeechSynthesis API, which is a real capability. What varies is
// voice quality and language coverage, which depend entirely on the
// user's browser/OS and are outside this prototype's control. If no voice
// is available for the requested language, the browser will typically
// fall back to a default voice rather than staying silent.

const languageToBcp47 = {
  en: "en-IN",
  hi: "hi-IN",
  bn: "bn-IN",
  ta: "ta-IN",
  te: "te-IN",
  mr: "mr-IN",
  gu: "gu-IN",
  pa: "pa-IN",
};

export function isTtsSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/**
 * Speaks the given text aloud. Calls onStart/onEnd so UI can reflect
 * speaking state (e.g. swap a "Listen" icon for a "Stop" icon).
 */
export function speak(text, languageCode = "en", { onStart, onEnd } = {}) {
  if (!isTtsSupported() || !text) return;

  window.speechSynthesis.cancel(); // stop anything already playing

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = languageToBcp47[languageCode] ?? "en-IN";
  utterance.rate = 0.95;
  if (onStart) utterance.onstart = onStart;
  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (isTtsSupported()) window.speechSynthesis.cancel();
}
