import React, { useEffect, useRef, useState } from 'react';
import { Resident, Story } from '../types';
import { Mic, Square, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

interface RecordStoryViewProps {
  resident: Resident;
  onSaveStory: (newStory: Story) => void;
  onCancel: () => void;
}

interface ISpeechRecognitionAlternative {
  transcript: string;
}

interface ISpeechRecognitionResult {
  isFinal: boolean;
  0: ISpeechRecognitionAlternative;
}

interface ISpeechRecognitionResultList {
  length: number;
  [index: number]: ISpeechRecognitionResult;
}

interface ISpeechRecognitionEvent {
  resultIndex: number;
  results: ISpeechRecognitionResultList;
}

interface ISpeechRecognitionErrorEvent {
  error: string;
}

interface ISpeechRecognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: (() => void) | null;
  onresult: ((event: ISpeechRecognitionEvent) => void) | null;
  onerror: ((event: ISpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type SpeechRecognitionConstructor = new () => ISpeechRecognition;

type WindowWithSpeechRecognition = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

const SPEECH_RECOGNITION_LANG = 'ar-SA';

const getSpeechRecognitionErrorMessage = (errorCode: string): string => {
  if (errorCode === 'not-allowed' || errorCode === 'service-not-allowed') {
    return 'لم يتم منح إذن استخدام الميكروفون. يرجى السماح بالوصول ثم إعادة المحاولة.';
  }
  if (errorCode === 'no-speech') {
    return 'لم يتم التقاط صوت واضح. تحدث بوضوح ثم حاول مرة أخرى.';
  }
  if (errorCode === 'audio-capture') {
    return 'تعذر الوصول إلى الميكروفون. تأكد من توصيله وإعداده بشكل صحيح.';
  }
  if (errorCode === 'network') {
    return 'حدث خطأ في الاتصال أثناء تحويل الصوت إلى نص. حاول مرة أخرى.';
  }
  return 'حدث خطأ أثناء تحويل الصوت إلى نص. يرجى إعادة المحاولة.';
};

const generateDraftTitle = (transcript: string): string => {
  const words = transcript
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
    .slice(0, 7);

  if (words.length === 0) return '';
  return words.join(' ');
};

export const RecordStoryView: React.FC<RecordStoryViewProps> = ({
  resident,
  onSaveStory,
  onCancel
}) => {
  const [recordingState, setRecordingState] = useState<'idle' | 'recording' | 'reviewing' | 'error'>('idle');
  const [seconds, setSeconds] = useState(0);
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const [customTitle, setCustomTitle] = useState('');
  const [customContent, setCustomContent] = useState('');
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const finalTranscriptRef = useRef('');
  const shouldMoveToReviewRef = useRef(false);
  const isRecordingLiveRef = useRef(false);
  const startRequestedRef = useRef(false);
  const stopRequestedRef = useRef(false);
  const hadRecognitionErrorRef = useRef(false);

  useEffect(() => {
    const browserWindow = window as WindowWithSpeechRecognition;
    const RecognitionCtor =
      browserWindow.SpeechRecognition ?? browserWindow.webkitSpeechRecognition;

    if (!RecognitionCtor) {
      setIsSpeechSupported(false);
      setSpeechError('المتصفح الحالي لا يدعم تحويل الصوت إلى نص. استخدم Chrome أو Edge.');
      return;
    }

    const recognition = new RecognitionCtor();
    recognition.lang = SPEECH_RECOGNITION_LANG;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      startRequestedRef.current = false;
      isRecordingLiveRef.current = true;
      setSpeechError(null);
      setRecordingState('recording');
      if (stopRequestedRef.current) {
        try {
          recognition.stop();
        } catch {
          stopRequestedRef.current = false;
          shouldMoveToReviewRef.current = false;
          setIsTransitioning(false);
          setSpeechError('تعذر إيقاف التسجيل حالياً. حاول مرة أخرى.');
          setRecordingState('error');
        }
        return;
      }
      setIsTransitioning(false);
    };

    recognition.onresult = (event) => {
      let nextFinal = finalTranscriptRef.current;
      let nextInterim = '';

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const transcriptPart = result?.[0]?.transcript?.trim() ?? '';
        if (!transcriptPart) continue;

        if (result.isFinal) {
          nextFinal = `${nextFinal} ${transcriptPart}`.trim();
        } else {
          nextInterim = `${nextInterim} ${transcriptPart}`.trim();
        }
      }

      finalTranscriptRef.current = nextFinal;
      const combinedTranscript = nextInterim ? `${nextFinal} ${nextInterim}`.trim() : nextFinal;
      setInterimTranscript(nextInterim);
      setCustomContent(combinedTranscript);
      setCustomTitle((prevTitle) => (prevTitle.trim() ? prevTitle : (generateDraftTitle(combinedTranscript) || 'حكاية مسجلة من الذاكرة')));
    };

    recognition.onerror = (event) => {
      hadRecognitionErrorRef.current = true;
      shouldMoveToReviewRef.current = false;
      startRequestedRef.current = false;
      stopRequestedRef.current = false;
      isRecordingLiveRef.current = false;
      setIsTransitioning(false);
      setSpeechError(getSpeechRecognitionErrorMessage(event.error));
      setRecordingState('error');
    };

    recognition.onend = () => {
      setInterimTranscript('');
      isRecordingLiveRef.current = false;
      startRequestedRef.current = false;
      stopRequestedRef.current = false;
      setIsTransitioning(false);
      if (hadRecognitionErrorRef.current) {
        hadRecognitionErrorRef.current = false;
      } else {
        setRecordingState(shouldMoveToReviewRef.current ? 'reviewing' : 'idle');
      }
      shouldMoveToReviewRef.current = false;
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onstart = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        try {
          recognitionRef.current.stop();
        } catch {
          // No-op: stop may fail when recognition is already inactive.
        }
        recognitionRef.current.abort();
      }
      recognitionRef.current = null;
      startRequestedRef.current = false;
      stopRequestedRef.current = false;
      isRecordingLiveRef.current = false;
      hadRecognitionErrorRef.current = false;
    };
  }, []);

  // Timer effect
  useEffect(() => {
    let interval: any = null;
    if (recordingState === 'recording') {
      interval = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [recordingState]);

  const handleStartRecording = () => {
    if (!recognitionRef.current || !isSpeechSupported) {
      setSpeechError('الميزة غير مدعومة في هذا المتصفح.');
      setRecordingState('error');
      return;
    }
    if (startRequestedRef.current || isRecordingLiveRef.current || isTransitioning) {
      return;
    }

    setSeconds(0);
    setSpeechError(null);
    finalTranscriptRef.current = '';
    setInterimTranscript('');
    setCustomTitle('');
    setCustomContent('');
    shouldMoveToReviewRef.current = false;
    stopRequestedRef.current = false;
    hadRecognitionErrorRef.current = false;
    startRequestedRef.current = true;
    setIsTransitioning(true);
    setRecordingState('idle');

    try {
      recognitionRef.current.start();
    } catch {
      startRequestedRef.current = false;
      setIsTransitioning(false);
      setSpeechError('تعذر بدء التسجيل حالياً. حاول مرة أخرى بعد لحظات.');
      setRecordingState('error');
    }
  };

  const handleStopRecording = () => {
    if (!recognitionRef.current || stopRequestedRef.current) return;
    if (!isRecordingLiveRef.current && !startRequestedRef.current) return;
    shouldMoveToReviewRef.current = true;
    stopRequestedRef.current = true;
    setIsTransitioning(true);
    if (!isRecordingLiveRef.current) {
      return;
    }
    try {
      recognitionRef.current.stop();
    } catch {
      stopRequestedRef.current = false;
      shouldMoveToReviewRef.current = false;
      setIsTransitioning(false);
      setSpeechError('تعذر إيقاف التسجيل حالياً. حاول مرة أخرى.');
      setRecordingState('error');
    }
  };

  const handleResetRecordingError = () => {
    hadRecognitionErrorRef.current = false;
    startRequestedRef.current = false;
    stopRequestedRef.current = false;
    shouldMoveToReviewRef.current = false;
    setSpeechError(null);
    setInterimTranscript('');
    setIsTransitioning(false);
    setRecordingState('idle');
  };

  const handleCommitStory = () => {
    const transcript = customContent.trim();
    if (!transcript) {
      setSpeechError('لا يوجد نص محفوظ بعد. ابدأ التسجيل ثم أعد المحاولة.');
      setRecordingState('error');
      return;
    }

    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    const formattedDuration = `${min}:${sec < 10 ? '0' : ''}${sec}`;
    const safeTitle = customTitle.trim() || generateDraftTitle(transcript) || 'حكاية مسجلة من الذاكرة';

    const newStory: Story = {
      id: `story-${Date.now()}`,
      title: safeTitle,
      date: new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: '2-digit', day: '2-digit' }),
      content: transcript,
      audioDuration: formattedDuration,
      aiTags: ['تفريغ صوتي', 'توثيق شفهي']
    };

    onSaveStory(newStory);
  };

  const formatTimer = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto my-6 px-4">
      
      {/* Outer physical open page setup */}
      <div className="bg-[#f4ecd8] text-[#2c1e16] rounded-2xl shadow-2xl border-4 border-[#c9a84c] min-h-[75vh] flex flex-col justify-between relative overflow-hidden">
        
        {/* Page margin frames */}
        <div className="absolute inset-3 border-2 border-dashed border-[#c9a84c]/30 pointer-events-none rounded-xl" />

        {/* Top toolbar */}
        <div className="relative z-10 px-6 pt-5 pb-3 border-b border-[#c9a84c]/20 flex items-center justify-between bg-[#e8ddc4]/30">
          <button
            onClick={onCancel}
            className="flex items-center gap-1 text-xs text-[#593119] hover:text-black transition font-bold"
          >
            <ArrowRight size={16} />
            <span>العودة للفهرس</span>
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-xs bg-[#c9a84c]/20 text-[#a08131] px-2.5 py-1 rounded-full font-bold">
              صفحة ٢: استوديو التوثيق الصوتي
            </span>
          </div>

          <span className="text-xs font-mono text-gray-500">{resident.coverTitle}</span>
        </div>

        {/* Main Body */}
        <div className="relative z-10 p-6 md:p-10 flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full">
          
          {/* Header instructions */}
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold font-amiri text-[#2c1e16]">
              🎙️ تسجيل حكاية جديدة
            </h2>
            <p className="text-sm text-[#593119] mt-2 font-cairo">
              تحدث بحرية، وسيتم تحويل صوتك إلى نص مباشر يمكنك مراجعته وتحريره قبل الحفظ.
            </p>
            {speechError && (
              <p className="text-xs text-red-700 mt-2 font-cairo font-bold">{speechError}</p>
            )}
            {recordingState === 'error' && isSpeechSupported && (
              <button
                type="button"
                onClick={handleResetRecordingError}
                className="mt-2 text-xs text-[#593119] underline font-cairo cursor-pointer"
              >
                إعادة تهيئة التسجيل
              </button>
            )}
          </div>

          {/* Central Gold Microphone Area */}
          <div className="my-6 relative flex flex-col items-center justify-center w-full">
            
            {/* Visualizer rings based on status */}
            {recordingState === 'recording' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-40 h-40 rounded-full bg-red-500/20 animate-ping absolute" />
                <div className="w-48 h-48 rounded-full border-2 border-[#c9a84c]/40 animate-pulse absolute" />
              </div>
            )}

            {/* The Huge Gold Microphone Button */}
            <button
              type="button"
              onClick={recordingState === 'recording' ? handleStopRecording : handleStartRecording}
              disabled={!isSpeechSupported || recordingState === 'error' || isTransitioning}
              className={`relative z-10 w-32 h-32 md:w-36 md:h-36 rounded-full flex flex-col items-center justify-center border-4 transition-all transform duration-300 shadow-2xl cursor-pointer ${
                recordingState === 'idle' 
                  ? 'bg-gradient-to-br from-[#e3c778] via-[#c9a84c] to-[#a08131] border-white text-[#1c120a] hover:scale-105' 
                  : recordingState === 'recording'
                  ? 'bg-red-600 border-white text-white animate-pulse'
                  : recordingState === 'reviewing'
                  ? 'bg-emerald-100 border-emerald-400 text-emerald-700'
                  : 'bg-red-100 border-red-300 text-red-700'
              }`}
            >
              {recordingState === 'idle' && (
                <>
                  <Mic size={56} className="drop-shadow-md text-[#1c120a]" />
                  <span className="text-xs font-bold mt-1 font-cairo">ابدأ التسجيل</span>
                </>
              )}

              {recordingState === 'recording' && (
                <>
                  <Square size={40} className="fill-current animate-bounce" />
                  <span className="text-xs font-bold mt-1 font-mono">{formatTimer(seconds)}</span>
                  <span className="text-[10px] block font-cairo">انقر للإيقاف</span>
                </>
              )}

              {recordingState === 'reviewing' && (
                <>
                  <CheckCircle2 size={48} className="text-emerald-700" />
                  <span className="text-xs font-bold mt-1 text-emerald-900">جاهز للمراجعة</span>
                </>
              )}

              {recordingState === 'error' && (
                <>
                  <Mic size={48} className="text-red-700" />
                  <span className="text-xs font-bold mt-1 text-red-800">أعد المحاولة</span>
                </>
              )}
            </button>

            {/* Simulated Live waveform graphic */}
            {recordingState === 'recording' && (
              <div className="flex items-center justify-center gap-1 mt-6 h-8 w-full max-w-xs">
                {[4, 12, 8, 20, 16, 28, 12, 24, 36, 18, 8, 14, 22, 10, 30].map((h, i) => (
                  <span
                    key={i}
                    className="bg-[#c9a84c] w-1.5 rounded-full animate-pulse"
                    style={{ height: `${h}px`, animationDelay: `${i * 70}ms` }}
                  />
                ))}
              </div>
            )}

            {/* Status Feedback texts */}
            <div className="mt-4 text-center min-h-[2.5rem]">
              {recordingState === 'idle' && (
                <p className="text-xs text-gray-500 font-bold">
                  🟢 وضع الاستماع جاهز لصوت {resident.name}
                </p>
              )}
              {recordingState === 'recording' && (
                <p className="text-xs text-red-700 font-bold animate-pulse flex items-center gap-1 justify-center">
                  <span>🔴 جاري الاستماع الآن... تحدث بوضوح</span>
                </p>
              )}
              {recordingState === 'reviewing' && (
                <p className="text-xs text-emerald-700 font-bold">
                  ✅ جاهز للمراجعة: تم تحويل الصوت إلى نص ويمكنك تعديله قبل الحفظ.
                </p>
              )}
              {recordingState === 'error' && speechError && (
                <p className="text-xs text-red-700 font-bold">
                  ❌ تعذر إكمال التفريغ الصوتي. استخدم "إعادة تهيئة التسجيل" ثم حاول من جديد.
                </p>
              )}
              {interimTranscript && (
                <p className="text-xs text-[#593119] mt-1 font-cairo">
                  ✍️ جارٍ تحويل الكلام إلى نص: {interimTranscript}
                </p>
              )}
            </div>

          </div>

          {/* Editable extracted text */}
          <div className="w-full mt-2 bg-[#e8ddc4]/40 p-4 rounded-xl border border-[#c9a84c]/30 text-right">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#593119] flex items-center gap-1">
                <Sparkles size={12} className="text-[#c9a84c]" />
                <span>النص المستخرج من الصوت (قابل للتعديل):</span>
              </span>
            </div>

            <input
              type="text"
              placeholder="عنوان الحكاية المولد"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              className="w-full bg-white px-3 py-1.5 rounded border border-[#c9a84c]/40 font-amiri font-bold text-base text-[#2c1e16] mb-2 focus:outline-none"
            />

            <textarea
              rows={4}
              value={customContent}
              onChange={(e) => setCustomContent(e.target.value)}
              className="w-full bg-white p-3 rounded border border-[#c9a84c]/40 font-amiri text-base leading-relaxed text-[#2c1e16] focus:outline-none resize-none"
            />

            {/* Commit actions */}
            {recordingState === 'reviewing' && (
              <div className="mt-3 text-center">
                <button
                  type="button"
                  onClick={handleCommitStory}
                  className="w-full py-2.5 bg-[#c9a84c] hover:bg-[#a08131] text-[#1c120a] font-bold text-sm rounded-lg transition shadow-md"
                >
                  حفظ الحكاية في الفهرس وفتح صفحتها 📖
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Footer info */}
        <div className="relative z-10 px-6 py-2 border-t border-[#c9a84c]/20 text-center text-xs text-gray-500 bg-[#e8ddc4]/10 font-mono">
          <span>صفحة تسجيل مخصصة لتمكين كبار السن من التوثيق الشفهي بسهولة تامة</span>
        </div>

      </div>

    </div>
  );
};
