import React from 'react';
import { Resident } from '../types';
import { Printer, BookOpen, ChevronRight, FileText, Calendar, Clock, Tag, Pencil, Trash2 } from 'lucide-react';

interface BookIndexViewProps {
  resident: Resident;
  onSelectStory: (storyIndex: number) => void;
  onGoToRecord: () => void;
  onPrintEntireBook: () => void;
  onCloseBook: () => void;
  onEditBook?: () => void;
  onDeleteStory?: (storyIndex: number) => void;
}

export const BookIndexView: React.FC<BookIndexViewProps> = ({
  resident,
  onSelectStory,
  onGoToRecord,
  onPrintEntireBook,
  onCloseBook,
  onEditBook,
  onDeleteStory,
}) => {
  return (
    <div className="max-w-4xl mx-auto my-6 px-4">
      
      {/* Outer book binding frame simulating open pages */}
      <div className="bg-[#f4ecd8] text-[#2c1e16] rounded-2xl shadow-2xl border-4 border-[#c9a84c] min-h-[75vh] flex flex-col justify-between relative overflow-hidden">
        
        {/* Subtle decorative internal book margins */}
        <div className="absolute inset-3 border-2 border-dashed border-[#c9a84c]/30 pointer-events-none rounded-xl" />
        
        {/* Simulating central open fold / spine crease shadow */}
        <div className="absolute top-0 bottom-0 left-1/2 w-4 -ml-2 bg-gradient-to-r from-transparent via-black/10 to-transparent pointer-events-none hidden md:block" />

        {/* Top actions toolbar */}
        <div className="relative z-10 px-6 pt-6 pb-4 border-b border-[#c9a84c]/20 flex flex-wrap items-center justify-between gap-3 bg-[#e8ddc4]/40">
          
          <button
            onClick={onCloseBook}
            className="flex items-center gap-1.5 text-sm font-bold text-[#593119] hover:text-black transition"
          >
            <ChevronRight size={18} className="text-[#c9a84c]" />
            <span>إغلاق الكتاب (الغلاف)</span>
          </button>

          <div className="text-center">
            <span className="text-xs font-mono text-[#a08131] block">الفهرس العام</span>
            <h2 className="text-lg font-bold font-amiri text-[#2c1e16]">{resident.coverTitle}</h2>
          </div>

          <button
            onClick={onPrintEntireBook}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-gray-50 text-[#2c1e16] rounded-md border border-[#c9a84c] text-xs font-bold transition shadow-sm"
            title="طباعة كامل الكتاب بصفحات منفصلة"
          >
            <Printer size={15} className="text-[#c9a84c]" />
            <span>طباعة الكتاب كاملاً</span>
          </button>

          {onEditBook && (
            <button
              type="button"
              onClick={onEditBook}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-gray-50 text-[#2c1e16] rounded-md border border-[#c9a84c]/60 text-xs font-bold transition shadow-sm"
            >
              <Pencil size={14} className="text-[#c9a84c]" />
              <span>تعديل الكتاب</span>
            </button>
          )}

        </div>

        {/* Core Content Area */}
        <div className="relative z-10 p-6 md:p-10 flex-1">
          
          {/* Header Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold font-amiri text-[#2c1e16] mb-2">
              فهرس الحكايات والذكريات
            </h1>
            <div className="w-24 h-1 bg-[#c9a84c] mx-auto rounded-full" />
            <p className="text-sm text-[#593119] mt-2 font-cairo">
              اضغط على أي عنوان لقراءة أو الاستماع إلى تفاصيل الحكاية الموثقة
            </p>
          </div>

          {/* Primary CTA: Record New Story */}
          <div className="mb-10 text-center">
            <button
              onClick={onGoToRecord}
              className="w-full md:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-[#c9a84c] to-[#a08131] hover:from-[#e3c778] hover:to-[#c9a84c] text-[#1c120a] rounded-xl font-bold font-cairo text-lg shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5 border border-white/30 cursor-pointer"
            >
              <span className="text-2xl animate-pulse">🎙️</span>
              <span>تسجيل حكاية جديدة بالصوت</span>
            </button>
            <span className="block text-xs text-gray-500 mt-2 font-cairo">
              يتم تحويل الصوت مباشرة إلى نص قابل للمراجعة والتحرير قبل حفظ الحكاية.
            </span>
          </div>

          {/* List of recorded stories */}
          <div className="space-y-4 max-w-3xl mx-auto">
            {resident.stories.length === 0 ? (
              <div className="text-center py-12 bg-white/50 rounded-xl border border-dashed border-[#c9a84c] p-8">
                <FileText size={48} className="mx-auto text-[#c9a84c]/40 mb-3" />
                <p className="text-lg font-amiri text-[#593119]">الكتاب لا يزال في بدايته، لم تسجل أي حكاية بعد.</p>
                <p className="text-xs text-gray-500 mt-1">ابدأ بتسجيل أول حكاية لتبقى إرثاً طيباً للمقيم وأسرته.</p>
              </div>
            ) : (
              resident.stories.map((story, index) => (
                <div
                  key={story.id}
                  onClick={() => onSelectStory(index)}
                  className="group bg-white/70 hover:bg-white p-4 rounded-xl border border-[#c9a84c]/40 hover:border-[#c9a84c] transition duration-200 cursor-pointer shadow-sm hover:shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-3"
                >
                  {/* Right side: title and details */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#c9a84c]/20 text-[#a08131] flex items-center justify-center text-xs font-bold font-mono">
                        {index + 1}
                      </span>
                      <h3 className="text-xl font-bold font-amiri text-[#2c1e16] group-hover:text-[#a08131] transition">
                        {story.title}
                      </h3>
                    </div>

                    {/* Metadata tags */}
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500 pr-8">
                      <span className="inline-flex items-center gap-1">
                        <Calendar size={12} className="text-[#c9a84c]" />
                        <span>{story.date}</span>
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock size={12} className="text-[#c9a84c]" />
                        <span>المدة: {story.audioDuration}</span>
                      </span>
                      
                      {/* Generative tags */}
                      {story.aiTags && story.aiTags.slice(0, 2).map((tag, tIdx) => (
                        <span key={tIdx} className="inline-flex items-center gap-0.5 bg-[#f4ecd8] px-1.5 py-0.5 rounded text-[#593119] border border-[#c9a84c]/20 text-[10px]">
                          <Tag size={10} />
                          <span>{tag}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Left side: actions + page navigation */}
                  <div className="self-end md:self-center flex items-center gap-2">
                    {onDeleteStory && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteStory(index);
                        }}
                        className="w-8 h-8 rounded-full bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition opacity-0 group-hover:opacity-100"
                        title="حذف الحكاية"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                    <span className="text-xs text-gray-400 font-mono group-hover:text-[#c9a84c] transition">
                      الصفحة {index + 3}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-[#f4ecd8] group-hover:bg-[#c9a84c] group-hover:text-white text-[#2c1e16] flex items-center justify-center transition">
                      <BookOpen size={14} />
                    </div>
                  </div>

                </div>
              ))
            )}
          </div>

        </div>

        {/* Footer pagination info */}
        <div className="relative z-10 px-6 py-3 border-t border-[#c9a84c]/20 flex items-center justify-between text-xs text-[#593119] bg-[#e8ddc4]/20 font-mono">
          <span>{resident.coverTitle}</span>
          <span>الصفحة ١ (الفهرس)</span>
          <span>إجمالي الحكايات: {resident.stories.length}</span>
        </div>

      </div>

    </div>
  );
};
