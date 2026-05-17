import React, { useState } from 'react';
import { Building2, Sparkles } from 'lucide-react';
import { WanisLogo } from './WanisLogo';

interface CareHomeSetupModalProps {
  defaultName: string;
  onComplete: (name: string) => Promise<void>;
}

export const CareHomeSetupModal: React.FC<CareHomeSetupModalProps> = ({
  defaultName,
  onComplete,
}) => {
  const [name, setName] = useState(defaultName);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('يرجى إدخال اسم دار الرعاية');
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      await onComplete(trimmed);
    } catch {
      setError('تعذر حفظ الاسم. حاول مرة أخرى.');
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#f4ecd8] border-2 border-[#c9a84c] rounded-2xl max-w-md w-full shadow-2xl p-6 text-[#2c1e16]">
        <div className="flex justify-center mb-4">
          <WanisLogo variant="stacked" size={56} theme="light" tagline="مرحباً بك" />
        </div>
        <div className="flex items-center gap-2 text-[#a08131] font-bold text-sm mb-2">
          <Sparkles size={16} />
          <span>إعداد دارك الخاصة</span>
        </div>
        <h2 className="text-2xl font-amiri font-bold mb-2">مرحباً بك في ونيس</h2>
        <p className="text-sm text-[#593119] font-cairo mb-6 leading-relaxed">
          كل حساب له <strong>دار رعاية مستقلة</strong>. لن يرى الآخرون نزلاءك أو حكاياتك.
          ستجد في مكتبتك <strong>٤ كتب حياة نموذجية</strong> (صالح، نورة، إبراهيم، لطيفة) لتجربة التطبيق — يمكنك حذفها أو إضافة نزلائك الحقيقيين.
          اختر اسماً لدارك للبدء.
        </p>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#593119] mb-1.5 font-cairo">
              اسم دار الرعاية
            </label>
            <div className="relative">
              <Building2
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#c9a84c]"
              />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pr-9 pl-3 py-2.5 rounded-lg border border-[#c9a84c] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]"
                placeholder="مثال: دار الرحمة – الرياض"
                autoFocus
                disabled={isSaving}
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-[#7a2f2f] font-cairo font-bold">{error}</p>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#c9a84c] to-[#a08131] text-[#1c120a] font-bold text-sm hover:from-[#e3c778] hover:to-[#c9a84c] transition disabled:opacity-60 cursor-pointer"
          >
            {isSaving ? 'جاري الحفظ...' : 'ابدأ بمكتبتي الخاصة'}
          </button>
        </form>
      </div>
    </div>
  );
};
