import React from 'react';
import { Resident } from '../types';
import { Printer, Sparkles, BookOpen } from 'lucide-react';

interface ContiguousPrintViewProps {
  resident: Resident;
  onCancel: () => void;
}

export const ContiguousPrintView: React.FC<ContiguousPrintViewProps> = ({
  resident,
  onCancel
}) => {
  // Automatically invite printing if desired or let user click button
  const handleTriggerPrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto my-4 bg-white text-[#2c1e16] rounded-xl shadow-2xl overflow-hidden print-container">
      
      {/* Persistent preview guidance banner visible on web, hidden on physical print */}
      <div className="bg-[#1c120a] text-[#f4ecd8] p-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-b-4 border-[#c9a84c] no-print">
        <div className="flex items-center gap-2">
          <Sparkles className="text-[#c9a84c]" size={20} />
          <div>
            <h3 className="font-amiri font-bold text-lg">معاينة طباعة كتاب الحياة الشامل</h3>
            <p className="text-xs text-gray-400 font-cairo">
              كل حكاية تبدأ في صفحة منفصلة تلقائياً بفضل تحسينات فواصل الصفحات (page-break)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-[#f4ecd8] text-xs font-bold rounded transition"
          >
            إلغاء والعودة
          </button>
          
          <button
            onClick={handleTriggerPrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#c9a84c] hover:bg-[#e3c778] text-[#1c120a] font-bold text-xs rounded transition shadow cursor-pointer"
          >
            <Printer size={15} />
            <span>تأكيد الطباعة الآن 🖨️</span>
          </button>
        </div>
      </div>

      {/* Contiguous Content Wrapper */}
      <div className="p-2 sm:p-6 bg-white">
        
        {/* Cover Page Equivalent for Full Book Print */}
        <div className="text-center py-16 border-4 border-double border-[#c9a84c] rounded-xl m-4 bg-[#fffaf0] story-print-page">
          <div className="w-16 h-16 rounded-full bg-[#c9a84c]/20 text-[#a08131] flex items-center justify-center mx-auto mb-4 border border-[#c9a84c]">
            <BookOpen size={32} />
          </div>
          
          <p className="text-xs uppercase tracking-widest text-[#a08131] font-mono mb-2">
            Wanis Care Home Collection
          </p>
          
          <h1 className="text-4xl sm:text-6xl font-extrabold font-amiri text-[#2c1e16] leading-tight mt-4 mb-6">
            {resident.coverTitle}
          </h1>

          <div className="w-32 h-0.5 bg-[#c9a84c] mx-auto my-6" />

          <p className="text-xl font-bold font-cairo text-[#593119]">
            النزيل: {resident.name}
          </p>
          <p className="text-sm text-gray-600 mt-2 font-cairo">
            العمر: {resident.age} سنة | تاريخ الانضمام للدار: {resident.admissionDate}
          </p>

          <p className="mt-12 text-xs italic text-gray-400 font-amiri max-w-md mx-auto">
            "هذه الصفحات تجمع خلاصة تجارب وحكايات من زمن جميل، أُعدت بكل عناية ومحبة لتبقى إرثاً ينير دروب الأجيال القادمة."
          </p>
        </div>

        {/* Dynamic Mapping with Page Break Before Always */}
        {resident.stories.length === 0 ? (
          <div className="text-center py-12 text-gray-400 font-amiri">
            لا توجد حكايات مسجلة في هذا الكتاب بعد.
          </div>
        ) : (
          resident.stories.map((story, index) => (
            <div 
              key={story.id} 
              className="story-print-page my-8 p-6 sm:p-12 border-2 border-[#c9a84c] rounded-xl bg-[#fffaf0]"
            >
              
              {/* Internal Metadata */}
              <div className="flex items-center justify-between text-xs text-[#a08131] border-b border-[#c9a84c]/30 pb-3 mb-6 font-mono">
                <span>الفصل {index + 1}</span>
                <span>تاريخ التسجيل: {story.date}</span>
                <span>المدة الأصلية: {story.audioDuration}</span>
              </div>

              {/* Title */}
              <h2 className="text-3xl font-bold font-amiri text-[#2c1e16] mb-6 text-center">
                {story.title}
              </h2>

              {/* Text content with oversized font minimum 20px */}
              <p className="story-body-text whitespace-pre-line text-justify leading-relaxed">
                {story.content}
              </p>

              {/* Generative reference metadata bottom indicator */}
              {story.aiTags && story.aiTags.length > 0 && (
                <div className="mt-8 pt-4 border-t border-gray-200 text-xs text-gray-500 flex flex-wrap items-center gap-2">
                  <span className="font-bold text-[#a08131]">الوسوم المستخرجة بالذكاء الاصطناعي:</span>
                  {story.aiTags.join(' ، ')}
                </div>
              )}

              {/* Page footer numbering */}
              <div className="text-center mt-6 text-[11px] text-gray-400 font-mono">
                كتاب حياة {resident.nickname} — صفحة {index + 3}
              </div>

            </div>
          ))
        )}

      </div>

      {/* Persistent preview exit instructions */}
      <div className="p-4 text-center bg-gray-50 border-t border-gray-200 text-xs text-gray-500 no-print">
        💡 عند اكتمال الطباعة، اضغط على زر (إلغاء والعودة) بالأعلى للرجوع إلى واجهة التصفح التفاعلية ثلاثية الأبعاد.
      </div>

    </div>
  );
};
