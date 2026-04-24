import { Platform } from "react-native";

type Listener = (transcript: string, isFinal: boolean) => void;

export type ASRController = {
  start: () => void;
  stop: () => void;
  isListening: () => boolean;
};

export function isAsrSupported(): boolean {
  if (Platform.OS !== "web") return false;
  if (typeof window === "undefined") return false;
  const w: any = window;
  return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
}

export function createAsr(
  bcp47: string,
  onResult: Listener,
  onError?: (msg: string) => void,
  onEnd?: () => void
): ASRController | null {
  if (!isAsrSupported()) return null;
  const w: any = window;
  const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
  const rec = new Ctor();
  rec.lang = bcp47 || "en-US";
  rec.continuous = false;
  rec.interimResults = true;
  rec.maxAlternatives = 1;

  let listening = false;
  let lastFinal = "";

  rec.onresult = (event: any) => {
    let interim = "";
    let finalText = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const res = event.results[i];
      const text = res[0]?.transcript ?? "";
      if (res.isFinal) finalText += text;
      else interim += text;
    }
    if (finalText) {
      lastFinal = (lastFinal + " " + finalText).trim();
      onResult(lastFinal, true);
    } else if (interim) {
      onResult((lastFinal + " " + interim).trim(), false);
    }
  };
  rec.onerror = (e: any) => {
    listening = false;
    onError?.(e?.error || "asr_error");
  };
  rec.onend = () => {
    listening = false;
    onEnd?.();
  };

  return {
    start: () => {
      try {
        lastFinal = "";
        rec.start();
        listening = true;
      } catch (e: any) {
        onError?.(e?.message || "asr_start_failed");
      }
    },
    stop: () => {
      try {
        rec.stop();
      } catch {}
      listening = false;
    },
    isListening: () => listening,
  };
}
