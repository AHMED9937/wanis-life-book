import React, { useEffect, useState } from 'react';
import { Resident } from '../types';
import { X, BookPlus, Sparkles, Pencil } from 'lucide-react';

interface CreateResidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (resident: Resident) => void;
  editingResident?: Resident | null;
}

export const CreateResidentModal: React.FC<CreateResidentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingResident = null,
}) => {
  const isEditing = Boolean(editingResident);
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [age, setAge] = useState<number>(75);
  const [roomNumber, setRoomNumber] = useState('');
  const [coverTitle, setCoverTitle] = useState('');
  const [coverColor, setCoverColor] = useState<Resident['coverColor']>('emerald');

  useEffect(() => {
    if (!isOpen) return;

    if (editingResident) {
      setName(editingResident.name);
      setNickname(editingResident.nickname);
      setAge(editingResident.age);
      setRoomNumber(editingResident.roomNumber);
      setCoverTitle(editingResident.coverTitle);
      setCoverColor(editingResident.coverColor);
    } else {
      setName('');
      setNickname('');
      setAge(75);
      setRoomNumber('');
      setCoverTitle('');
      setCoverColor('emerald');
    }
  }, [isOpen, editingResident]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const finalNickname = nickname.trim() || name.split(' ')[0];
    const finalCoverTitle = coverTitle.trim() || `كتاب حياة ${finalNickname}`;

    const resident: Resident = {
      id: editingResident?.id ?? `res-${Date.now()}`,
      name: name.trim(),
      nickname: finalNickname,
      age: Number(age) || 75,
      roomNumber: roomNumber.trim() || 'عام',
      admissionDate: editingResident?.admissionDate ?? new Date().toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }),
      coverTitle: finalCoverTitle,
      coverColor,
      stories: editingResident?.stories ?? [],
      _lifeBookId: editingResident?._lifeBookId,
    };

    onSave(resident);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#f4ecd8] border-2 border-[#c9a84c] rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden text-[#2c1e16]">
        <div className="bg-[#2c1e16] text-[#f4ecd8] px-6 py-4 flex items-center justify-between border-b border-[#c9a84c]">
          <div className="flex items-center gap-2">
            {isEditing ? (
              <Pencil className="text-[#c9a84c]" size={20} />
            ) : (
              <BookPlus className="text-[#c9a84c]" size={20} />
            )}
            <h3 className="font-amiri font-bold text-xl">
              {isEditing ? 'تعديل كتاب الحياة' : 'تأسيس "كتاب حياة" جديد'}
            </h3>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-white transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 font-cairo">
          <div>
            <label className="block text-sm font-bold text-[#593119] mb-1">
              الاسم الكامل للنزيل <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="مثال: صالح العبدالله"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white px-3 py-2 border border-[#c9a84c]/60 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c9a84c] text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-[#593119] mb-1">الكنية أو الاسم المختصر</label>
              <input
                type="text"
                placeholder="مثال: أبو محمد"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full bg-white px-3 py-2 border border-[#c9a84c]/60 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c9a84c] text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#593119] mb-1">رقم الغرفة أو الجناح</label>
              <input
                type="text"
                placeholder="مثال: ١٠٤"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                className="w-full bg-white px-3 py-2 border border-[#c9a84c]/60 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c9a84c] text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-[#593119] mb-1">عنوان الغلاف</label>
            <input
              type="text"
              placeholder="مثال: كتاب حياة أبو محمد"
              value={coverTitle}
              onChange={(e) => setCoverTitle(e.target.value)}
              className="w-full bg-white px-3 py-2 border border-[#c9a84c]/60 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c9a84c] text-sm font-amiri"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#593119] mb-1">العمر التقريبي</label>
            <input
              type="number"
              min="50"
              max="120"
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              className="w-full bg-white px-3 py-2 border border-[#c9a84c]/60 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c9a84c] text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#593119] mb-2">لون غلاف كتاب الحياة</label>
            <div className="grid grid-cols-4 gap-3">
              {[
                { id: 'emerald', label: 'أخضر زمردي', bg: 'bg-[#1b382b]' },
                { id: 'burgundy', label: 'أحمر قاني', bg: 'bg-[#4a1515]' },
                { id: 'sapphire', label: 'أزرق ملكي', bg: 'bg-[#152b4a]' },
                { id: 'amber', label: 'بني عنبري', bg: 'bg-[#5e3a0d]' },
              ].map((theme) => (
                <button
                  type="button"
                  key={theme.id}
                  onClick={() => setCoverColor(theme.id as Resident['coverColor'])}
                  className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border-2 transition ${
                    coverColor === theme.id
                      ? 'border-[#c9a84c] bg-[#c9a84c]/10 font-bold'
                      : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <div className={`w-full h-8 rounded ${theme.bg} shadow-md`} />
                  <span className="text-[11px] text-center">{theme.label}</span>
                </button>
              ))}
            </div>
          </div>

          {!isEditing && (
            <div className="bg-[#e8ddc4] p-3 rounded-lg flex items-center gap-2 text-xs text-[#593119] border border-[#c9a84c]/30">
              <Sparkles size={16} className="text-[#c9a84c] shrink-0" />
              <span>سيتم إنشاء الفهرس تلقائياً ليكون جاهزاً لإضافة أول حكاية للنزيل.</span>
            </div>
          )}

          <div className="pt-4 border-t border-[#c9a84c]/20 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-[#593119] hover:bg-black/5 rounded-md transition"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#c9a84c] hover:bg-[#a08131] text-[#1c120a] font-bold text-sm rounded-md transition shadow-md cursor-pointer"
            >
              {isEditing ? 'حفظ التعديلات' : 'حفظ وفتح الكتاب'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
