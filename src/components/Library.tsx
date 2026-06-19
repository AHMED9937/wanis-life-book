import React, { useEffect, useState } from 'react';
import { Resident } from '../types';
import { BookOpen, Mic, Sparkles, ChevronLeft, Loader2, Search, X, Pencil, Trash2 } from 'lucide-react';
import { WanisLogoMark } from './WanisLogo';
import { residentSearchBlob, searchMatches } from '../lib/search';

interface LibraryProps {
  residents: Resident[];
  onSelectBook: (residentId: string) => void;
  onCreateNew: () => void;
  onSearchQueryChange: (query: string) => void;
  onEditBook?: (residentId: string) => void;
  onDeleteBook?: (residentId: string) => void;
  isSearchLoading?: boolean;
}

export const Library: React.FC<LibraryProps> = ({
  residents,
  onSelectBook,
  onCreateNew,
  onSearchQueryChange,
  onEditBook,
  onDeleteBook,
  isSearchLoading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const skipInitialSearch = React.useRef(true);

  // Debounced server search (database)
  useEffect(() => {
    if (skipInitialSearch.current && !searchTerm.trim()) {
      skipInitialSearch.current = false;
      return;
    }
    skipInitialSearch.current = false;

    const timer = window.setTimeout(() => {
      onSearchQueryChange(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, onSearchQueryChange]);

  // Client-side filter as extra pass (normalization for digits / Arabic)
  const filteredResidents = residents.filter((res) => {
    if (!searchTerm.trim()) return true;
    return searchMatches(residentSearchBlob(res), searchTerm);
  });

  const getCoverBg = (color: Resident['coverColor']) => {
    switch (color) {
      case 'emerald': return 'from-[#1b382b] to-[#0d2118] border-[#2c523f]';
      case 'burgundy': return 'from-[#4a1515] to-[#2d0b0b] border-[#6e2222]';
      case 'sapphire': return 'from-[#152b4a] to-[#0b172d] border-[#254673]';
      case 'amber': return 'from-[#5e3a0d] to-[#361e04] border-[#8a5717]';
      default: return 'from-[#1b382b] to-[#0d2118] border-[#2c523f]';
    }
  };

  const getAccentText = (color: Resident['coverColor']) => {
    switch (color) {
      case 'emerald': return 'text-emerald-400';
      case 'burgundy': return 'text-red-300';
      case 'sapphire': return 'text-blue-300';
      case 'amber': return 'text-amber-400';
      default: return 'text-emerald-400';
    }
  };

  const hasActiveSearch = searchTerm.trim().length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      
      {/* Intro Header */}
      <div className="bg-[#f4ecd8] rounded-xl p-6 shadow-2xl border-2 border-[#c9a84c] mb-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-24 h-24 bg-[#c9a84c]/10 rounded-br-full pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <WanisLogoMark size={48} />
              <div>
                <p className="font-amiri font-bold text-xl text-[#2c1e16] leading-none">ونيس</p>
                <p className="text-[10px] font-cairo text-[#a08131]">مكتبة حكايات الدار</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[#a08131] font-bold text-sm mb-1">
              <Sparkles size={16} />
              <span>مفهوم "كتاب الحياة" المخصص لكبار السن</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-amiri font-bold text-[#2c1e16]">
              مكتبة حكايات الدار
            </h2>
            <p className="text-[#593119] mt-2 max-w-2xl font-cairo text-base">
              كل نزيل يملك كتاب حياة خاص به، نجمع فيه قصص شبابه وتجارب عمره المديد. اضغط على غلاف الكتاب لفتحه، قراءة الفهرس، طباعة الذكريات، أو تسجيل حكاية صوتية جديدة بالذكاء الاصطناعي.
            </p>
          </div>

          <div className="flex flex-col gap-1.5 self-stretch md:self-auto w-full md:w-72">
            <div className="relative">
              <Search
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a08131] pointer-events-none"
              />
              <input
                type="text"
                placeholder="ابحث بالاسم، الكنية، الغرفة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white pr-9 pl-9 py-2.5 rounded-lg border border-[#c9a84c] text-[#2c1e16] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c9a84c] text-sm w-full shadow-inner"
                aria-label="بحث عن نزيل"
              />
              {isSearchLoading && (
                <Loader2
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c9a84c] animate-spin"
                />
              )}
              {hasActiveSearch && !isSearchLoading && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#593119]"
                  aria-label="مسح البحث"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            {hasActiveSearch && (
              <p className="text-[11px] text-[#593119] font-cairo text-center md:text-right">
                {isSearchLoading
                  ? 'جاري البحث في قاعدة البيانات...'
                  : `${filteredResidents.length} نتيجة`}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Grid of Books */}
      {filteredResidents.length === 0 ? (
        <div className="text-center py-12 bg-black/20 rounded-xl border border-white/5">
          <p className="text-[#f4ecd8] font-amiri text-xl">
            {hasActiveSearch ? 'لم نجد كتباً مطابقة للبحث' : 'لا يوجد نزلاء مسجلون بعد'}
          </p>
          {hasActiveSearch && (
            <button 
              onClick={() => setSearchTerm('')} 
              className="mt-3 text-xs text-[#c9a84c] underline cursor-pointer"
            >
              عرض الكل
            </button>
          )}
        </div>
      ) : (
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 transition-opacity ${isSearchLoading ? 'opacity-60' : ''}`}>
          {filteredResidents.map((resident) => {
            const bgGradient = getCoverBg(resident.coverColor);
            const accentText = getAccentText(resident.coverColor);
            
            return (
              <div 
                key={resident.id}
                className="group/card relative cursor-pointer transform transition duration-300 hover:-translate-y-2 focus-within:ring-4 focus-within:ring-[#c9a84c] rounded-xl outline-none"
              >
                {(onEditBook || onDeleteBook) && (
                  <div className="absolute top-2 left-2 z-20 flex gap-1 opacity-0 group-hover/card:opacity-100 transition">
                    {onEditBook && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditBook(resident.id);
                        }}
                        className="w-8 h-8 rounded-full bg-[#f4ecd8] hover:bg-white text-[#593119] border border-[#c9a84c]/50 flex items-center justify-center shadow-md"
                        title="تعديل الكتاب"
                      >
                        <Pencil size={14} />
                      </button>
                    )}
                    {onDeleteBook && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteBook(resident.id);
                        }}
                        className="w-8 h-8 rounded-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 flex items-center justify-center shadow-md"
                        title="حذف الكتاب"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                )}

                <div
                  onClick={() => onSelectBook(resident.id)}
                  className="h-full"
                >
                <div className={`h-96 rounded-r-2xl rounded-l-md bg-gradient-to-br ${bgGradient} border-r-8 p-5 flex flex-col justify-between shadow-2xl relative overflow-hidden`}>
                  
                  <div className="absolute inset-2 border border-[#c9a84c]/40 rounded-r-xl rounded-l-sm pointer-events-none group-hover/card:border-[#c9a84c] transition duration-300" />
                  <div className="absolute inset-3 border border-dashed border-[#c9a84c]/20 rounded-r-lg rounded-l-xs pointer-events-none" />
                  
                  <div className="absolute top-0 bottom-0 right-0 w-8 bg-black/25 border-l border-white/5 pointer-events-none" />

                  <div className="relative z-10 text-center pt-2">
                    <span className="inline-block text-xs bg-black/40 text-[#f4ecd8] px-2.5 py-0.5 rounded-full mb-3 border border-[#c9a84c]/30">
                      غرفة {resident.roomNumber}
                    </span>
                    
                    <h3 className="text-xl font-bold font-amiri text-[#f4ecd8] tracking-wide leading-tight group-hover/card:text-[#e3c778] transition">
                      {resident.coverTitle}
                    </h3>
                    
                    <div className="w-12 h-0.5 bg-[#c9a84c] mx-auto my-3 rounded-full opacity-70" />

                    <p className={`text-sm font-semibold font-cairo ${accentText}`}>
                      {resident.name}
                    </p>
                    {resident.nickname && !resident.nickname.startsWith('النزيل ') && (
                      <p className="text-xs text-gray-300 mt-0.5 font-cairo">{resident.nickname}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      العمر: {resident.age} سنة
                    </p>
                  </div>

                  <div className="relative z-10 my-auto text-center flex flex-col items-center justify-center opacity-85 group-hover/card:opacity-100 transition duration-300">
                    <div className="w-16 h-16 rounded-full bg-[#c9a84c]/10 border border-[#c9a84c]/30 flex items-center justify-center text-[#c9a84c] group-hover/card:scale-110 transition duration-300">
                      <BookOpen size={32} />
                    </div>
                    <span className="text-[11px] uppercase tracking-widest text-[#c9a84c] mt-2 block font-mono">
                      LIFE BOOK
                    </span>
                  </div>

                  <div className="relative z-10 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-gray-300">
                    <div className="flex items-center gap-1">
                      <Mic size={13} className="text-[#c9a84c]" />
                      <span>{resident.stories.length} حكايات</span>
                    </div>
                    <div className="flex items-center gap-1 text-[#c9a84c] group-hover/card:translate-x-1 transition duration-300 font-bold">
                      <span>تصفح</span>
                      <ChevronLeft size={14} />
                    </div>
                  </div>

                </div>

                <div className="mt-2.5 px-2 flex items-center justify-between text-xs text-gray-400">
                  <span>تاريخ الانضمام:</span>
                  <span className="font-mono">{resident.admissionDate}</span>
                </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-12 text-center bg-[#2c1e16]/80 backdrop-blur-sm border border-[#c9a84c]/20 rounded-xl p-4 max-w-xl mx-auto">
        <p className="text-xs text-gray-300 font-cairo">
          هل استقبلتم نزيلاً جديداً اليوم؟ يمكنكم إنشاء <strong>"كتاب حياة"</strong> فارغ لتوثيق تاريخه فور انضمامه.
        </p>
        <button
          onClick={onCreateNew}
          className="mt-3 inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#c9a84c] hover:bg-[#e3c778] text-[#1c120a] font-bold text-xs rounded-md transition shadow cursor-pointer"
        >
          <span>إنشاء كتاب جديد الآن</span>
        </button>
      </div>

    </div>
  );
};
