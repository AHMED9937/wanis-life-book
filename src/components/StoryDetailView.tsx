import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Resident, Story } from '../types';
import { Printer, Volume2, ArrowRight, ArrowLeft, Calendar, Tag, CornerUpRight, Play, Pause, Pencil, Trash2, Save, X } from 'lucide-react';
import { speakArabic, stopSpeech, loadSpeechVoices, isTtsSupported } from '../lib/tts';

interface StoryDetailViewProps {
  resident: Resident;
  storyIndex: number;
  onGoToStoryIndex: (storyIndex: number) => void;
  onBackToIndex: () => void;
  onUpdateStory?: (storyIndex: number, updated: Story) => void;
  onDeleteStory?: (storyIndex: number) => void;
}

export const StoryDetailView: React.FC<StoryDetailViewProps> = ({
  resident,
  storyIndex,
  onGoToStoryIndex,
  onBackToIndex,
  onUpdateStory,
  onDeleteStory,
}) => {
  const { getToken } = useAuth();
  const story: Story | undefined = resident.stories[storyIndex];
  const totalStories = resident.stories.length;
  const pageNumber = storyIndex + 3;

  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [ttsError, setTtsError] = useState<string | null>(null);
  const [isTtsLoading, setIsTtsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressStartRef = useRef(0);
  const progressDurationRef = useRef(3000);
  const ttsStartedRef = useRef(false);
  const ttsWatchdogRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearProgressTimer = useCallback(() => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  }, []);

  const startProgressTimer = useCallback((text: string) => {
    clearProgressTimer();
    progressDurationRef.current = Math.max(3000, text.length * 55);
    progressStartRef.current = Date.now();
    setPlaybackProgress(0);
    progressTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - progressStartRef.current;
      const progress = Math.min(99, Math.floor((elapsed / progressDurationRef.current) * 100));
      setPlaybackProgress(progress);
    }, 120);
  }, [clearProgressTimer]);

  const stopPlayback = useCallback(() => {
    stopSpeech();
    clearProgressTimer();
    if (ttsWatchdogRef.current) {
      clearTimeout(ttsWatchdogRef.current);
      ttsWatchdogRef.current = null;
    }
    ttsStartedRef.current = false;
    setIsPlaying(false);
    setIsTtsLoading(false);
    setPlaybackProgress(0);
  }, [clearProgressTimer]);

  // Preload voices (Chrome needs this before first speak)
  useEffect(() => {
    if (isTtsSupported()) void loadSpeechVoices().catch(() => {});
  }, []);

  useEffect(() => {
    stopPlayback();
    setTtsError(null);
    setIsEditing(false);
  }, [storyIndex, stopPlayback]);

  useEffect(() => {
    if (story) {
      setEditTitle(story.title);
      setEditContent(story.content);
    }
  }, [story]);

  useEffect(() => () => stopPlayback(), [stopPlayback]);

  if (!story) {
    return (
      <div className="max-w-4xl mx-auto my-6 text-center py-12 bg-[#f4ecd8] rounded-xl p-6">
        <p className="text-xl font-amiri">الحكاية غير متوفرة</p>
        <button onClick={onBackToIndex} className="mt-4 px-4 py-2 bg-[#c9a84c] text-white rounded">
          العودة للفهرس
        </button>
      </div>
    );
  }

  const handlePrintSingle = () => {
    window.print();
  };

  const handleStartEdit = () => {
    stopPlayback();
    if (story) {
      setEditTitle(story.title);
      setEditContent(story.content);
    }
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (story) {
      setEditTitle(story.title);
      setEditContent(story.content);
    }
    setIsEditing(false);
  };

  const handleSaveEdit = () => {
    if (!story || !onUpdateStory) return;
    const trimmedTitle = editTitle.trim();
    const trimmedContent = editContent.trim();
    if (!trimmedTitle || !trimmedContent) return;

    onUpdateStory(storyIndex, {
      ...story,
      title: trimmedTitle,
      content: trimmedContent,
    });
    setIsEditing(false);
  };

  const speakStory = async () => {
    if (!story) return;
    if (!isTtsSupported()) {
      setTtsError('المتصفح لا يدعم القراءة الصوتية. استخدم Chrome أو Edge.');
      return;
    }

    setTtsError(null);
    setIsTtsLoading(true);
    ttsStartedRef.current = false;
    stopSpeech();
    clearProgressTimer();
    if (ttsWatchdogRef.current) clearTimeout(ttsWatchdogRef.current);

    ttsWatchdogRef.current = window.setTimeout(() => {
      if (!ttsStartedRef.current) {
        stopSpeech();
        setIsTtsLoading(false);
        setIsPlaying(false);
        setTtsError(
          'لم يبدأ الصوت. تأكد أن الخادم يعمل (npm run dev:server) ثم أعد المحاولة.'
        );
      }
    }, 8000);

    const token = await getToken();

    speakArabic(story.content, {
      onStart: () => {
        ttsStartedRef.current = true;
        if (ttsWatchdogRef.current) {
          clearTimeout(ttsWatchdogRef.current);
          ttsWatchdogRef.current = null;
        }
        setIsTtsLoading(false);
        setIsPlaying(true);
        startProgressTimer(story.content);
      },
      onEnd: () => {
        ttsStartedRef.current = false;
        clearProgressTimer();
        setIsPlaying(false);
        setPlaybackProgress(100);
        setTimeout(() => setPlaybackProgress(0), 800);
      },
      onError: (message) => {
        ttsStartedRef.current = false;
        if (ttsWatchdogRef.current) {
          clearTimeout(ttsWatchdogRef.current);
          ttsWatchdogRef.current = null;
        }
        clearProgressTimer();
        setIsPlaying(false);
        setIsTtsLoading(false);
        setPlaybackProgress(0);
        setTtsError(message);
      },
    }, token);
  };

  const toggleTTS = () => {
    if (isPlaying || isTtsLoading) {
      stopPlayback();
      setTtsError(null);
    } else {
      void speakStory();
    }
  };

  return (
    <div className="max-w-4xl mx-auto my-6 px-4">
      
      {/* Printable context container wrapper */}
      <div className="bg-[#f4ecd8] text-[#2c1e16] rounded-2xl shadow-2xl border-4 border-[#c9a84c] min-h-[75vh] flex flex-col justify-between relative overflow-hidden print-container">
        
        {/* Subtle decorative inner border */}
        <div className="absolute inset-3 border-2 border-dashed border-[#c9a84c]/30 pointer-events-none rounded-xl no-print" />

        {/* Top Control Toolbar (Invisible during printing) */}
        <div className="relative z-10 px-6 pt-5 pb-3 border-b border-[#c9a84c]/20 flex flex-wrap items-center justify-between gap-3 bg-[#e8ddc4]/30 no-print">
          
          <button
            onClick={onBackToIndex}
            className="flex items-center gap-1.5 text-xs font-bold text-[#593119] hover:text-black transition"
          >
            <CornerUpRight size={16} className="text-[#c9a84c]" />
            <span>العودة للفهرس (صفحة ١)</span>
          </button>

          <div className="flex items-center gap-2">
            {onUpdateStory && !isEditing && (
              <button
                type="button"
                onClick={handleStartEdit}
                className="flex items-center gap-1 px-3 py-1 bg-white hover:bg-gray-50 text-[#2c1e16] rounded border border-[#c9a84c]/60 text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Pencil size={14} className="text-[#c9a84c]" />
                <span>تعديل</span>
              </button>
            )}
            {onDeleteStory && !isEditing && (
              <button
                type="button"
                onClick={() => onDeleteStory(storyIndex)}
                className="flex items-center gap-1 px-3 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded border border-red-200 text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Trash2 size={14} />
                <span>حذف</span>
              </button>
            )}
            <button
              onClick={handlePrintSingle}
              className="flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-gray-50 text-[#2c1e16] rounded border border-[#c9a84c] text-xs font-bold transition shadow-xs cursor-pointer"
              title="طباعة هذه الحكاية فقط بالخط الكبير"
            >
              <Printer size={14} className="text-[#c9a84c]" />
              <span>طباعة 🖨️</span>
            </button>
          </div>

        </div>

        {/* Main Story Content Area optimized for elderly accessibility */}
        <div className="relative z-10 p-6 md:p-12 flex-1 flex flex-col justify-between print-only story-print-page">
          
          <div>
            {/* Story Header */}
            <div className="border-b-2 border-[#c9a84c]/40 pb-6 mb-8 text-center">
              
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mb-2 font-cairo">
                <Calendar size={13} className="text-[#c9a84c]" />
                <span>تاريخ التوثيق: {story.date}</span>
                <span className="mx-2">•</span>
                <span>المدة المسجلة: {story.audioDuration}</span>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold font-amiri text-[#2c1e16] leading-tight">
                {isEditing ? (
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-white px-3 py-2 rounded border border-[#c9a84c]/60 text-center font-amiri text-2xl md:text-3xl focus:outline-none focus:ring-2 focus:ring-[#c9a84c]"
                  />
                ) : (
                  story.title
                )}
              </h1>

              {/* Generative Keywords Ribbon */}
              {story.aiTags && story.aiTags.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3 no-print">
                  {story.aiTags.map((t, idx) => (
                    <span key={idx} className="inline-flex items-center gap-0.5 text-xs bg-[#e8ddc4] text-[#593119] px-2 py-0.5 rounded-full border border-[#c9a84c]/30 font-cairo">
                      <Tag size={10} className="text-[#c9a84c]" />
                      <span>{t}</span>
                    </span>
                  ))}
                </div>
              )}

            </div>

            {/* TTS Audio Player */}
            <div className="mb-8 bg-[#e8ddc4]/50 rounded-xl p-4 border border-[#c9a84c]/30 max-w-lg mx-auto no-print">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={toggleTTS}
                    disabled={isTtsLoading}
                    className="w-10 h-10 rounded-full bg-[#c9a84c] hover:bg-[#a08131] disabled:opacity-60 text-[#1c120a] flex items-center justify-center transition shadow cursor-pointer shrink-0"
                    title={isPlaying ? "إيقاف القراءة الصوتية" : "الاستماع للنص الصوتي"}
                  >
                    {isPlaying || isTtsLoading ? <Pause size={18} /> : <Play size={18} className="translate-x-0.5" />}
                  </button>
                  <div>
                    <span className="text-xs font-bold block text-[#2c1e16]">
                      {isTtsLoading
                        ? "جاري تحضير الصوت..."
                        : isPlaying
                          ? "جاري تلاوة الحكاية بالصوت..."
                          : "الاستماع الصوتي للذكريات (TTS)"}
                    </span>
                    <span className={`text-[11px] block font-cairo ${ttsError ? 'text-[#7a2f2f]' : 'text-gray-500'}`}>
                      {ttsError ?? "قراءة عربية واضحة (صوت زارية  السعودية)"}
                    </span>
                  </div>
                </div>

                <Volume2 size={20} className={`text-[#c9a84c] ${isPlaying || isTtsLoading ? 'animate-bounce' : 'opacity-40'}`} />
              </div>

              {/* Player Progress timeline */}
              <div className="w-full bg-black/5 h-1.5 rounded-full mt-3 overflow-hidden">
                <div 
                  className="bg-[#c9a84c] h-full transition-all duration-150" 
                  style={{ width: `${playbackProgress}%` }}
                />
              </div>
            </div>

            {/* The Core Narrative Text */}
            <div className="text-right py-2">
              {isEditing ? (
                <textarea
                  rows={12}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full bg-white p-4 rounded border border-[#c9a84c]/60 font-amiri text-base leading-relaxed text-[#2c1e16] focus:outline-none focus:ring-2 focus:ring-[#c9a84c] resize-y min-h-[280px]"
                />
              ) : (
                <p className={`story-body-text whitespace-pre-line text-justify ${isPlaying ? 'bg-[#c9a84c]/10 rounded-lg p-2 transition-all' : ''}`}>
                  {story.content}
                </p>
              )}
            </div>

            {isEditing && (
              <div className="flex items-center justify-center gap-3 mt-4 no-print">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-gray-50 text-[#593119] rounded-lg border border-[#c9a84c]/40 text-sm font-bold transition"
                >
                  <X size={16} />
                  <span>إلغاء</span>
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#c9a84c] hover:bg-[#a08131] text-[#1c120a] rounded-lg text-sm font-bold transition shadow-md"
                >
                  <Save size={16} />
                  <span>حفظ التعديلات</span>
                </button>
              </div>
            )}

          </div>

          {/* Decorative tailpiece ending symbol */}
          <div className="text-center pt-8 mt-8 border-t border-dashed border-[#c9a84c]/30">
            <span className="text-[#c9a84c] font-bold text-lg">❦ ❧</span>
          </div>

        </div>

        {/* Bottom Navigation Ribbon for Flipping Pages */}
        <div className="relative z-10 px-6 py-4 bg-[#e8ddc4]/30 border-t border-[#c9a84c]/20 flex items-center justify-between no-print">
          
          {/* Previous story link (Flip Right for RTL chronological order) */}
          {storyIndex > 0 ? (
            <button
              onClick={() => onGoToStoryIndex(storyIndex - 1)}
              className="flex items-center gap-1 px-4 py-2 bg-white hover:bg-[#f4ecd8] text-[#2c1e16] rounded-lg border border-[#c9a84c]/60 font-bold text-xs transition shadow-xs cursor-pointer"
            >
              <ArrowRight size={14} className="text-[#c9a84c]" />
              <span>الحكاية السابقة</span>
            </button>
          ) : (
            <button
              onClick={onBackToIndex}
              className="flex items-center gap-1 px-3 py-2 bg-white/40 text-gray-500 rounded-lg text-xs hover:bg-white transition"
            >
              <ArrowRight size={14} />
              <span>الفهرس العام</span>
            </button>
          )}

          {/* Current Page metadata */}
          <div className="text-center font-mono text-xs text-[#593119]">
            <span>الصفحة {pageNumber}</span>
            <span className="text-gray-400 mx-1">/</span>
            <span>{totalStories + 2}</span>
          </div>

          {/* Next story link (Flip Left for RTL chronological order) */}
          {storyIndex < totalStories - 1 ? (
            <button
              onClick={() => onGoToStoryIndex(storyIndex + 1)}
              className="flex items-center gap-1 px-4 py-2 bg-[#c9a84c] hover:bg-[#a08131] text-[#1c120a] rounded-lg font-bold text-xs transition shadow-xs cursor-pointer"
            >
              <span>الحكاية التالية</span>
              <ArrowLeft size={14} />
            </button>
          ) : (
            <button
              disabled
              className="px-3 py-2 bg-transparent text-gray-400 text-xs cursor-not-allowed"
            >
              نهاية الفصول
            </button>
          )}

        </div>

      </div>

    </div>
  );
};
