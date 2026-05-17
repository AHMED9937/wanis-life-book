import React from 'react';
import { Resident } from '../types';
import { BookOpen, Printer, Sparkles } from 'lucide-react';

interface BookCoverViewProps {
  resident: Resident;
  onOpenBook: () => void;
  onPrintEntireBook: () => void;
}

export const BookCoverView: React.FC<BookCoverViewProps> = ({
  resident,
  onOpenBook,
  onPrintEntireBook
}) => {
  const getBgClass = (color: Resident['coverColor']) => {
    switch (color) {
      case 'emerald': return 'from-[#1b382b] via-[#12261d] to-[#08140f] border-[#2c523f]';
      case 'burgundy': return 'from-[#4a1515] via-[#330e0e] to-[#1c0606] border-[#6e2222]';
      case 'sapphire': return 'from-[#152b4a] via-[#0d1c33] to-[#07101f] border-[#254673]';
      case 'amber': return 'from-[#5e3a0d] via-[#402607] to-[#261603] border-[#8a5717]';
      default: return 'from-[#1b382b] via-[#12261d] to-[#08140f] border-[#2c523f]';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] p-4">
      
      {/* Container holding the 3D Perspective shell */}
      <div className="w-full max-w-xl book-perspective relative">
        
        {/* Shadow cast on the wooden table */}
        <div className="absolute inset-x-4 -bottom-4 h-12 bg-black/60 blur-xl rounded-full pointer-events-none" />

        {/* The Closed Book Cover Wrapper */}
        <div className={`relative w-full aspect-[1/1.35] rounded-r-3xl rounded-l-md bg-gradient-to-br ${getBgClass(resident.coverColor)} border-r-[16px] shadow-2xl p-8 md:p-12 flex flex-col justify-between text-center overflow-hidden transition-all duration-500 hover:scale-[1.01]`}>
          
          {/* Subtle page texture patterns */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
          
          {/* Beautiful Gold Embossed Border */}
          <div className="absolute inset-4 md:inset-6 border-2 border-[#c9a84c] rounded-r-2xl rounded-l pointer-events-none flex flex-col justify-between p-2">
            <div className="border border-dashed border-[#c9a84c]/40 absolute inset-2 pointer-events-none rounded-r-xl" />
          </div>

          {/* Spine indicator on the right side */}
          <div className="absolute top-0 bottom-0 right-0 w-12 bg-black/40 border-l border-white/5 pointer-events-none" />

          {/* Top section: Subheading */}
          <div className="relative z-10 pt-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-black/40 text-[#c9a84c] rounded-full border border-[#c9a84c]/30 text-xs mb-4">
              <Sparkles size={12} />
              <span>مبادرة التوثيق الشفهي لكبار السن</span>
            </div>
            
            <p className="text-xs uppercase tracking-widest text-[#e3c778] font-mono">
              The Life Book Collection
            </p>
          </div>

          {/* Center section: Massive traditional title */}
          <div className="relative z-10 my-auto py-6">
            <h1 className="text-4xl md:text-5xl font-extrabold font-amiri text-[#f4ecd8] leading-tight drop-shadow-md">
              {resident.coverTitle}
            </h1>
            
            {/* Elegant double-line accent */}
            <div className="flex items-center justify-center gap-2 my-6">
              <div className="w-16 h-0.5 bg-gradient-to-r from-transparent to-[#c9a84c]" />
              <div className="w-3 h-3 rotate-45 bg-[#c9a84c] border border-black" />
              <div className="w-16 h-0.5 bg-gradient-to-l from-transparent to-[#c9a84c]" />
            </div>

            <p className="text-xl md:text-2xl font-bold font-cairo text-[#e3c778] mt-2">
              حكايات وتجارب {resident.name}
            </p>
            
            <p className="text-sm text-gray-300 mt-3 font-amiri">
              الجناح: {resident.roomNumber} | العمر: {resident.age} عاماً
            </p>
          </div>

          {/* Bottom section: Action controls */}
          <div className="relative z-10 pb-4 flex flex-col items-center gap-4">
            
            {/* Huge Primary CTA to open the book */}
            <button
              onClick={onOpenBook}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#c9a84c] via-[#e3c778] to-[#c9a84c] hover:from-[#e3c778] hover:to-[#a08131] text-[#1c120a] font-black font-cairo text-lg rounded-xl shadow-xl hover:shadow-2xl transition transform hover:-translate-y-1 flex items-center justify-center gap-3 border-2 border-white/20 cursor-pointer"
            >
              <BookOpen size={24} />
              <span>فتح كتاب الحياة (الفهرس)</span>
            </button>

            {/* Quick print trigger */}
            <button
              onClick={onPrintEntireBook}
              className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#f4ecd8] transition underline"
              title="طباعة كافة الفصول والحكايات معاً"
            >
              <Printer size={14} className="text-[#c9a84c]" />
              <span>طباعة الكتاب كاملاً للمقيم أو أسرته</span>
            </button>

          </div>

        </div>

      </div>

      {/* Helpful Hint */}
      <div className="mt-6 text-center text-xs text-[#f4ecd8]/60 bg-black/40 px-4 py-2 rounded-full border border-white/5">
        📖 اتجاه التصفح عربي أصيل (من اليمين إلى اليسار)  انقر لفتح الغلاف الأيمن
      </div>

    </div>
  );
};
