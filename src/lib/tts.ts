export type TtsCallbacks = {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (message: string) => void;
};

const ARABIC_LANGS = ['ar-SA', 'ar-EG', 'ar-AE', 'ar-KW', 'ar'];

let activeAudio: HTMLAudioElement | null = null;
let activeObjectUrl: string | null = null;

function getSynth(): SpeechSynthesis | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  return window.speechSynthesis;
}

function isArabicVoice(voice: SpeechSynthesisVoice): boolean {
  const lang = voice.lang.toLowerCase();
  if (lang.startsWith('ar')) return true;
  const name = voice.name.toLowerCase();
  return /arabic|عرب|hoda|naayf|salma|zariyah|shakir|amani|laith/i.test(name);
}

function isEnglishVoice(voice: SpeechSynthesisVoice): boolean {
  return voice.lang.toLowerCase().startsWith('en');
}

/** Wait until the browser exposes voices (Chrome returns [] on first call). */
export function loadSpeechVoices(timeoutMs = 2000): Promise<SpeechSynthesisVoice[]> {
  const synth = getSynth();
  if (!synth) return Promise.reject(new Error('unsupported'));

  const existing = synth.getVoices();
  if (existing.length > 0) return Promise.resolve(existing);

  return new Promise((resolve, reject) => {
    let settled = false;

    const finish = (voices: SpeechSynthesisVoice[]) => {
      if (settled) return;
      settled = true;
      synth.removeEventListener('voiceschanged', onChange);
      clearTimeout(timer);
      resolve(voices.length > 0 ? voices : synth.getVoices());
    };

    const onChange = () => {
      const voices = synth.getVoices();
      if (voices.length > 0) finish(voices);
    };

    synth.addEventListener('voiceschanged', onChange);
    synth.getVoices();

    const timer = window.setTimeout(() => {
      if (settled) return;
      const voices = synth.getVoices();
      if (voices.length > 0) finish(voices);
      else {
        settled = true;
        synth.removeEventListener('voiceschanged', onChange);
        reject(new Error('voices-timeout'));
      }
    }, timeoutMs);
  });
}

export function pickArabicVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  const arabicOnly = voices.filter((v) => isArabicVoice(v) && !isEnglishVoice(v));
  if (arabicOnly.length === 0) return undefined;

  for (const lang of ARABIC_LANGS) {
    const exact = arabicOnly.find((v) => v.lang === lang || v.lang.startsWith(lang));
    if (exact) return exact;
  }

  return arabicOnly[0];
}

function unpauseSynth(synth: SpeechSynthesis): void {
  if (synth.paused) synth.resume();
}

function clearActiveAudio(): void {
  if (activeAudio) {
    activeAudio.pause();
    activeAudio.src = '';
    activeAudio = null;
  }
  if (activeObjectUrl) {
    URL.revokeObjectURL(activeObjectUrl);
    activeObjectUrl = null;
  }
}

export function stopSpeech(): void {
  getSynth()?.cancel();
  clearActiveAudio();
}

async function speakViaServer(text: string, token: string, callbacks: TtsCallbacks): Promise<boolean> {
  const res = await fetch('/api/tts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) return false;

  const blob = await res.blob();
  if (!blob.size) return false;

  clearActiveAudio();
  activeObjectUrl = URL.createObjectURL(blob);
  const audio = new Audio(activeObjectUrl);
  activeAudio = audio;

  return new Promise((resolve) => {
    let settled = false;
    const finish = (ok: boolean) => {
      if (settled) return;
      settled = true;
      resolve(ok);
    };

    audio.onplay = () => {
      callbacks.onStart?.();
      finish(true);
    };
    audio.onended = () => {
      clearActiveAudio();
      callbacks.onEnd?.();
    };
    audio.onerror = () => {
      clearActiveAudio();
      finish(false);
    };

    void audio.play().catch(() => finish(false));
  });
}

function speakViaBrowser(text: string, voice: SpeechSynthesisVoice, callbacks: TtsCallbacks): void {
  const synth = getSynth();
  if (!synth) {
    callbacks.onError?.('المتصفح لا يدعم القراءة الصوتية.');
    return;
  }

  synth.cancel();

  window.setTimeout(() => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = voice.lang || 'ar-SA';
    utterance.voice = voice;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => callbacks.onStart?.();
    utterance.onend = () => callbacks.onEnd?.();
    utterance.onerror = (e) => {
      const err = e as SpeechSynthesisErrorEvent;
      if (err.error === 'canceled' || err.error === 'interrupted') return;
      callbacks.onError?.('تعذّر تشغيل الصوت العربي من المتصفح.');
    };

    unpauseSynth(synth);
    synth.speak(utterance);
    unpauseSynth(synth);
  }, 50);
}

/**
 * Speak Arabic text: server neural voice first, then browser Arabic voice only.
 */
export function speakArabic(
  text: string,
  callbacks: TtsCallbacks = {},
  authToken?: string | null,
): void {
  const trimmed = text?.trim();
  if (!trimmed) {
    callbacks.onError?.('لا يوجد نص للقراءة');
    return;
  }

  stopSpeech();

  const tryBrowserArabic = (voices: SpeechSynthesisVoice[]) => {
    const arabicVoice = pickArabicVoice(voices);
    if (!arabicVoice) {
      callbacks.onError?.(
        'تعذّر تشغيل الصوت العربي. تأكد أن الخادم يعمل (npm run dev:server) أو ثبّت اللغة العربية في Windows.',
      );
      return;
    }
    speakViaBrowser(trimmed, arabicVoice, callbacks);
  };

  const run = async () => {
    if (authToken) {
      try {
        const ok = await speakViaServer(trimmed, authToken, callbacks);
        if (ok) return;
      } catch {
        // fall through to browser
      }
    }

    const synth = getSynth();
    if (!synth) {
      callbacks.onError?.('المتصفح لا يدعم القراءة الصوتية. استخدم Chrome أو Edge.');
      return;
    }

    let voices = synth.getVoices();
    if (voices.length === 0) {
      try {
        voices = await loadSpeechVoices();
      } catch {
        callbacks.onError?.(
          'تعذّر تحميل الصوت العربي. شغّل الخادم (npm run dev:server) وأعد المحاولة.',
        );
        return;
      }
    }

    tryBrowserArabic(voices);
  };

  void run();
}

export function isTtsSupported(): boolean {
  return getSynth() !== null || typeof fetch !== 'undefined';
}
