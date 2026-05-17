import { UserButton, useUser } from '@clerk/clerk-react';
import React from 'react';
import { Library, UserCheck, PlusCircle } from 'lucide-react';
import { WanisLogo } from './WanisLogo';

interface CaregiverHeaderProps {
  currentView: string;
  careHomeName?: string | null;
  onGoToLibrary: () => void;
  onCreateNewResident: () => void;
}

export const CaregiverHeader: React.FC<CaregiverHeaderProps> = ({
  currentView,
  careHomeName,
  onGoToLibrary,
  onCreateNewResident
}) => {
  const { user, isLoaded } = useUser();
  const caregiverName = isLoaded
    ? (user?.fullName || user?.primaryEmailAddress?.emailAddress || 'مستخدم')
    : '...';

  return (
    <header className="bg-[#1c120a] border-b border-[#3a2010] text-[#f4ecd8] py-3 px-4 shadow-xl no-print">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* App Title & Current Caregiver Status */}
        <div className="flex items-center gap-3">
          <WanisLogo
            size={44}
            variant="full"
            tagline="كتاب الحياة"
            onClick={onGoToLibrary}
          />
          <div>
            <div className="flex items-center gap-2 text-xs text-[#c9a84c] font-bold">
              <UserCheck size={14} className="text-[#e3c778]" />
              مصادقة موثوقة عبر Clerk
            </div>
            <h1 className="text-sm font-cairo text-gray-300">
              الأخصائي: <span className="text-white font-semibold">{caregiverName}</span>
              {careHomeName && (
                <>
                  <span className="text-gray-500 mx-1">|</span>
                  <span className="text-[#e3c778] font-semibold">{careHomeName}</span>
                </>
              )}
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="ml-1">
            <UserButton afterSignOutUrl="/" />
          </div>

          {currentView !== 'library' && (
            <button
              onClick={onGoToLibrary}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#3a2010] hover:bg-[#4d2a15] text-[#f4ecd8] rounded-md border border-[#c9a84c]/30 transition text-sm font-semibold cursor-pointer"
              title="العودة لجميع الكتب"
            >
              <Library size={16} className="text-[#c9a84c]" />
              <span>مكتبة الدار</span>
            </button>
          )}

          {currentView === 'library' && (
            <button
              onClick={onCreateNewResident}
              className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-[#c9a84c] to-[#a08131] hover:from-[#e3c778] hover:to-[#c9a84c] text-[#1c120a] rounded-md transition text-sm font-bold shadow-md cursor-pointer"
            >
              <PlusCircle size={16} />
              <span>إضافة نزيل جديد (كتاب حياة)</span>
            </button>
          )}

        </div>

      </div>

      {/* Philosophy banner */}
      <div className="max-w-7xl mx-auto mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-1.5 text-[#e3c778]">
          <span className="font-amiri italic text-sm">"لكل جد وجدة كتاب حياة فريد ينمو بحكاياتهم"</span>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <span>💡 انقر على أي كتاب لفتحه وتصفح فهرس الحكايات أو تسجيل حكاية صوتية جديدة</span>
        </div>
      </div>
    </header>
  );
};
