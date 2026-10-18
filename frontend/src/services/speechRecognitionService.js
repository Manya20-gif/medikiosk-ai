// Real Web Speech API Recognition Service.
// Automatically connects to browser's SpeechRecognition / webkitSpeechRecognition
// for live, real-time voice transcription in 12+ languages.

const SpeechRecognitionAPI =
  typeof window !== "undefined"
    ? window.SpeechRecognition || window.webkitSpeechRecognition || null
    : null;

export function isSpeechRecognitionSupported() {
  return Boolean(SpeechRecognitionAPI);
}

const LANGUAGE_SPEECH_MAP = {
  en: "en-IN",
  hi: "hi-IN",
  bn: "bn-IN",
  ta: "ta-IN",
  te: "te-IN",
  mr: "mr-IN",
  gu: "gu-IN",
  pa: "pa-IN",
  es: "es-ES",
  fr: "fr-FR",
  de: "de-DE",
  ar: "ar-SA"
};

export class SpeechListener {
  constructor({ languageCode = "en", onTranscript, onInterim, onError, onEnd, onVolumeChange } = {}) {
    this.languageCode = languageCode;
    this.onTranscript = onTranscript;
    this.onInterim = onInterim;
    this.onError = onError;
    this.onEnd = onEnd;
    this.onVolumeChange = onVolumeChange;
    this.recognition = null;
    this.isListening = false;
    this.audioContext = null;
    this.mediaStream = null;
    this.analyser = null;
    this.animFrameId = null;
  }

  start() {
    if (!SpeechRecognitionAPI) {
      if (this.onError) {
        this.onError(new Error("Web Speech API is not supported in this browser. Please type or use Chrome/Edge."));
      }
      return false;
    }

    try {
      this.recognition = new SpeechRecognitionAPI();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = LANGUAGE_SPEECH_MAP[this.languageCode] || "en-IN";

      let finalTranscript = "";

      this.recognition.onstart = () => {
        this.isListening = true;
        this.setupAudioMeter();
      };

      this.recognition.onresult = (event) => {
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const res = event.results[i];
          if (res.isFinal) {
            finalTranscript += (finalTranscript ? " " : "") + res[0].transcript;
          } else {
            interim += res[0].transcript;
          }
        }

        if (this.onInterim) this.onInterim(interim);
        if (this.onTranscript) this.onTranscript(finalTranscript || interim);
      };

      this.recognition.onerror = (event) => {
        console.warn("Speech recognition notice:", event.error);
        if (event.error === "no-speech") return;
        if (this.onError) this.onError(new Error(event.error));
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.cleanupAudioMeter();
        if (this.onEnd) this.onEnd(finalTranscript);
      };

      this.recognition.start();
      return true;
    } catch (err) {
      console.error("Speech recognition start failed:", err);
      if (this.onError) this.onError(err);
      return false;
    }
  }

  stop() {
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
    }
    this.cleanupAudioMeter();
  }

  async setupAudioMeter() {
    if (!navigator.mediaDevices?.getUserMedia || !this.onVolumeChange) return;
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.audioContext = new AudioCtx();
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 64;
      source.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateMeter = () => {
        if (!this.isListening) return;
        this.analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        const normalized = Math.min(1, average / 128); // 0.0 to 1.0
        if (this.onVolumeChange) this.onVolumeChange(normalized);
        this.animFrameId = requestAnimationFrame(updateMeter);
      };
      updateMeter();
    } catch (e) {
      // Audio meter optional
    }
  }

  cleanupAudioMeter() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
    if (this.audioContext && this.audioContext.state !== "closed") {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
    if (this.onVolumeChange) this.onVolumeChange(0);
  }
}
