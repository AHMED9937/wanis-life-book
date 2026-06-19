import { useAuth } from '@clerk/clerk-react';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Navigate, Route, Routes, useLocation, useMatch, useNavigate } from 'react-router-dom';
import { CaregiverHeader } from './components/CaregiverHeader';
import { Library } from './components/Library';
import { BookCoverView } from './components/BookCoverView';
import { BookIndexView } from './components/BookIndexView';
import { RecordStoryView } from './components/RecordStoryView';
import { StoryDetailView } from './components/StoryDetailView';
import { ContiguousPrintView } from './components/ContiguousPrintView';
import { CreateResidentModal } from './components/CreateResidentModal';
import { ConfirmDialog } from './components/ConfirmDialog';
import { Resident, Story } from './types';
import { CareHomeSetupModal } from './components/CareHomeSetupModal';
import { WanisLogoMark } from './components/WanisLogo';
import {
  createResident,
  createStory,
  deleteResident,
  deleteStory,
  fetchMeProfile,
  fetchResidents,
  resolveApiErrorMessage,
  updateCareHome,
  updateResident,
  updateStory,
} from './lib/api';
import { paths } from './lib/routes';

export function AuthenticatedApp() {
  const { getToken, isSignedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const bookMatch = useMatch({ path: '/books/:residentId', end: false });
  const storyMatch = useMatch('/books/:residentId/stories/:storyId');
  const residentId = bookMatch?.params.residentId;
  const storyId = storyMatch?.params.storyId;

  const [residents, setResidents] = useState<Resident[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingResident, setEditingResident] = useState<Resident | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isResidentsLoading, setIsResidentsLoading] = useState(false);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [hasLoadedResidents, setHasLoadedResidents] = useState(false);
  const [residentsError, setResidentsError] = useState<string | null>(null);
  const [careHomeName, setCareHomeName] = useState<string | null>(null);
  const [needsCareHomeSetup, setNeedsCareHomeSetup] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  const currentResident = residentId ? residents.find((r) => r.id === residentId) ?? null : null;
  const storyIndex = currentResident && storyId
    ? currentResident.stories.findIndex((s) => s.id === storyId)
    : -1;

  const currentView = location.pathname.includes('/print')
    ? 'print_entire'
    : location.pathname.startsWith('/books/')
      ? 'book'
      : 'library';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  const loadResidents = useCallback(async (
    query = '',
    options?: { isSearch?: boolean },
  ): Promise<Resident[] | null> => {
    if (!isSignedIn) {
      setResidents([]);
      setResidentsError(null);
      setIsResidentsLoading(false);
      setIsSearchLoading(false);
      setHasLoadedResidents(false);
      return [];
    }

    if (options?.isSearch) {
      setIsSearchLoading(true);
    } else {
      setIsResidentsLoading(true);
    }
    setResidentsError(null);

    try {
      const token = await getToken();
      if (!token) {
        setResidentsError('❌ تعذر الحصول على جلسة المصادقة. حاول تسجيل الدخول مرة أخرى.');
        setResidents([]);
        return null;
      }

      const data = await fetchResidents(token, query);
      setResidents(data);
      setHasLoadedResidents(true);
      return data;
    } catch (error) {
      console.error(error);
      setResidentsError(
        resolveApiErrorMessage(error, '❌ تعذر تحميل بيانات النزلاء من الخادم.'),
      );
      if (!options?.isSearch) {
        setResidents([]);
      }
      return null;
    } finally {
      if (options?.isSearch) {
        setIsSearchLoading(false);
      } else {
        setIsResidentsLoading(false);
      }
    }
  }, [getToken, isSignedIn]);

  const handleSearchQueryChange = useCallback((query: string) => {
    void loadResidents(query, { isSearch: true });
  }, [loadResidents]);

  const loadProfile = useCallback(async () => {
    if (!isSignedIn) {
      setCareHomeName(null);
      setNeedsCareHomeSetup(false);
      setIsProfileLoading(false);
      return;
    }
    setIsProfileLoading(true);
    try {
      const token = await getToken();
      if (!token) return;
      const profile = await fetchMeProfile(token);
      setCareHomeName(profile.careHome.name);
      setNeedsCareHomeSetup(!profile.careHome.setupCompleted);
    } catch (error) {
      console.error(error);
    } finally {
      setIsProfileLoading(false);
    }
  }, [getToken, isSignedIn]);

  useEffect(() => {
    void loadProfile();
    void loadResidents('');
  }, [loadProfile, loadResidents]);

  const handleCareHomeSetupComplete = async (name: string) => {
    const token = await getToken();
    if (!token) return;
    const updated = await updateCareHome(token, { name });
    setCareHomeName(updated.name);
    setNeedsCareHomeSetup(false);
    showToast('✅ تم إعداد دارك بنجاح  بياناتك خاصة بحسابك فقط');
    await loadResidents('');
  };

  const handleGoToLibrary = () => navigate(paths.library);

  const handleSelectBook = (id: string) => navigate(paths.book(id));

  const handleOpenBook = () => {
    if (residentId) navigate(paths.bookIndex(residentId));
  };

  const handleGoToRecord = () => {
    if (residentId) navigate(paths.bookRecord(residentId));
  };

  const handleSelectStory = (index: number) => {
    const story = currentResident?.stories[index];
    if (story && residentId) navigate(paths.bookStory(residentId, story.id));
  };

  const handleGoToStoryIndex = (index: number) => {
    const story = currentResident?.stories[index];
    if (story && residentId) navigate(paths.bookStory(residentId, story.id));
  };

  const handleTriggerPrintEntireBook = () => {
    if (residentId) navigate(paths.bookPrint(residentId));
  };

  const handleCancelPrintEntireBook = () => {
    if (residentId) {
      navigate(paths.bookIndex(residentId));
    } else {
      navigate(paths.library);
    }
  };

  const handleSaveNewResident = async (newResident: Resident) => {
    const token = await getToken();
    if (!token) {
      showToast('❌ تعذر الحصول على جلسة المصادقة. حاول تسجيل الدخول مرة أخرى.');
      return;
    }

    try {
      if (editingResident) {
        const updated = await updateResident(token, editingResident.id, newResident);
        await loadResidents('');
        setIsCreateModalOpen(false);
        setEditingResident(null);
        showToast(`✅ تم تحديث كتاب حياة ${updated.name} بنجاح`);
        return;
      }

      const created = await createResident(token, newResident);
      await loadResidents('');
      setIsCreateModalOpen(false);
      showToast(`✨ تم تأسيس كتاب حياة جديد للمقيم ${created.name} بنجاح!`);
      navigate(paths.bookIndex(created.id));
    } catch (e) {
      console.error(e);
      showToast(resolveApiErrorMessage(e, editingResident ? '❌ حدث خطأ أثناء تحديث الكتاب' : '❌ حدث خطأ أثناء إنشاء الكتاب'));
    }
  };

  const handleOpenEditResident = (id: string) => {
    const resident = residents.find((r) => r.id === id);
    if (!resident) return;
    setEditingResident(resident);
    setIsCreateModalOpen(true);
  };

  const handleRequestDeleteResident = (id: string) => {
    const resident = residents.find((r) => r.id === id);
    if (!resident) return;

    setConfirmDialog({
      title: 'حذف كتاب الحياة',
      message: `هل أنت متأكد من حذف "${resident.coverTitle}"؟ سيتم حذف جميع الحكايات المرتبطة به نهائياً.`,
      onConfirm: () => void handleDeleteResident(id),
    });
  };

  const handleDeleteResident = async (id: string) => {
    setConfirmDialog(null);
    const token = await getToken();
    if (!token) {
      showToast('❌ تعذر الحصول على جلسة المصادقة. حاول تسجيل الدخول مرة أخرى.');
      return;
    }

    try {
      await deleteResident(token, id);
      await loadResidents('');
      if (residentId === id) {
        navigate(paths.library);
      }
      showToast('🗑️ تم حذف كتاب الحياة بنجاح');
    } catch (e) {
      console.error(e);
      showToast(resolveApiErrorMessage(e, '❌ حدث خطأ أثناء حذف الكتاب'));
    }
  };

  const handleUpdateStory = async (_storyIndex: number, updatedStory: Story) => {
    const token = await getToken();
    if (!token) {
      showToast('❌ تعذر الحصول على جلسة المصادقة. حاول تسجيل الدخول مرة أخرى.');
      return;
    }

    try {
      await updateStory(token, updatedStory.id, updatedStory);
      await loadResidents('');
      showToast(`✅ تم تحديث الحكاية "${updatedStory.title}" بنجاح`);
    } catch (e) {
      console.error(e);
      showToast(resolveApiErrorMessage(e, '❌ حدث خطأ أثناء تحديث الحكاية'));
    }
  };

  const handleRequestDeleteStory = (index: number) => {
    const story = currentResident?.stories[index];
    if (!story) return;

    setConfirmDialog({
      title: 'حذف الحكاية',
      message: `هل أنت متأكد من حذف "${story.title}"؟ لا يمكن التراجع عن هذا الإجراء.`,
      onConfirm: () => void handleDeleteStory(index),
    });
  };

  const handleDeleteStory = async (index: number) => {
    setConfirmDialog(null);
    if (!residentId || !currentResident) return;

    const story = currentResident.stories[index];
    if (!story) return;

    const token = await getToken();
    if (!token) {
      showToast('❌ تعذر الحصول على جلسة المصادقة. حاول تسجيل الدخول مرة أخرى.');
      return;
    }

    try {
      await deleteStory(token, story.id);
      await loadResidents('');
      showToast(`🗑️ تم حذف الحكاية "${story.title}"`);
      navigate(paths.bookIndex(residentId));
    } catch (e) {
      console.error(e);
      showToast(resolveApiErrorMessage(e, '❌ حدث خطأ أثناء حذف الحكاية'));
    }
  };

  const handleSaveNewStory = async (newStory: Story) => {
    if (!residentId) return;

    const targetRes = residents.find((r) => r.id === residentId);
    if (!targetRes) return;

    const lifeBookId = targetRes._lifeBookId;
    if (!lifeBookId) {
      showToast('❌ لم يتم العثور على معرف كتاب الحياة لهذا النزيل');
      return;
    }

    const token = await getToken();
    if (!token) {
      showToast('❌ تعذر الحصول على جلسة المصادقة. حاول تسجيل الدخول مرة أخرى.');
      return;
    }

    try {
      const createdStory = await createStory(token, lifeBookId, newStory);
      await loadResidents('');
      showToast(`📖 تمت إضافة الحكاية "${createdStory.title}" إلى الفهرس بنجاح!`);
      navigate(paths.bookStory(residentId, createdStory.id));
    } catch (e) {
      console.error(e);
      showToast(resolveApiErrorMessage(e, '❌ حدث خطأ أثناء حفظ الحكاية'));
    }
  };

  const renderBookLoading = () => (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-[#f4ecd8] rounded-xl p-6 shadow-2xl border-2 border-[#c9a84c] text-center">
        <p className="text-[#2c1e16] font-cairo">جاري تحميل بيانات الكتاب...</p>
      </div>
    </div>
  );

  const renderBookNotFound = () => (
    <div className="text-center py-20 text-[#f4ecd8]">
      <p>تعذر تحميل بيانات هذا الكتاب.</p>
      <button type="button" onClick={handleGoToLibrary} className="mt-4 underline text-[#c9a84c]">
        العودة للمكتبة
      </button>
    </div>
  );

  const requireResident = (render: (resident: Resident) => ReactNode) => {
    if (isResidentsLoading || !hasLoadedResidents) return renderBookLoading();
    if (!currentResident) return renderBookNotFound();
    return render(currentResident);
  };

  return (
    <div className="wood-desk min-h-screen flex flex-col justify-between font-cairo">
      <CaregiverHeader
        currentView={currentView}
        careHomeName={careHomeName}
        onGoToLibrary={handleGoToLibrary}
        onCreateNewResident={() => {
          setEditingResident(null);
          setIsCreateModalOpen(true);
        }}
      />

      {needsCareHomeSetup && careHomeName && !isProfileLoading && (
        <CareHomeSetupModal
          defaultName={careHomeName}
          onComplete={handleCareHomeSetupComplete}
        />
      )}

      {toastMessage && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 bg-[#c9a84c] text-[#1c120a] font-bold px-6 py-3 rounded-full shadow-2xl border-2 border-white text-sm animate-bounce text-center max-w-md w-11/12 no-print">
          {toastMessage}
        </div>
      )}

      <main className="flex-1 transition-all duration-300">
        <Routes>
          <Route
            path={paths.library}
            element={
              <>
                {isResidentsLoading && (
                  <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="bg-[#f4ecd8] rounded-xl p-6 shadow-2xl border-2 border-[#c9a84c] text-center">
                      <p className="text-[#2c1e16] font-cairo">جاري تحميل بيانات النزلاء من الخادم...</p>
                    </div>
                  </div>
                )}

                {residentsError && !isResidentsLoading && (
                  <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="bg-[#f4ecd8] rounded-xl p-6 shadow-2xl border-2 border-[#c9a84c] text-center">
                      <p className="text-[#7a2f2f] font-cairo">{residentsError}</p>
                      <button
                        type="button"
                        onClick={() => void loadResidents('')}
                        className="mt-4 px-4 py-2 rounded-md bg-[#3a2010] hover:bg-[#4d2a15] text-[#f4ecd8] font-semibold border border-[#c9a84c]/30"
                      >
                        إعادة المحاولة
                      </button>
                    </div>
                  </div>
                )}

                {!residentsError && hasLoadedResidents && (
                  <Library
                    residents={residents}
                    onSelectBook={handleSelectBook}
                    onCreateNew={() => {
                      setEditingResident(null);
                      setIsCreateModalOpen(true);
                    }}
                    onSearchQueryChange={handleSearchQueryChange}
                    onEditBook={handleOpenEditResident}
                    onDeleteBook={handleRequestDeleteResident}
                    isSearchLoading={isSearchLoading}
                  />
                )}
              </>
            }
          />

          <Route
            path="/books/:residentId"
            element={requireResident((resident) => (
              <div className="py-4">
                <BookCoverView
                  resident={resident}
                  onOpenBook={handleOpenBook}
                  onPrintEntireBook={handleTriggerPrintEntireBook}
                  onEditBook={() => handleOpenEditResident(resident.id)}
                  onDeleteBook={() => handleRequestDeleteResident(resident.id)}
                />
              </div>
            ))}
          />

          <Route
            path="/books/:residentId/index"
            element={requireResident((resident) => (
              <div className="py-4">
                <BookIndexView
                  resident={resident}
                  onSelectStory={handleSelectStory}
                  onGoToRecord={handleGoToRecord}
                  onPrintEntireBook={handleTriggerPrintEntireBook}
                  onCloseBook={() => navigate(paths.book(resident.id))}
                  onEditBook={() => handleOpenEditResident(resident.id)}
                  onDeleteStory={handleRequestDeleteStory}
                />
              </div>
            ))}
          />

          <Route
            path="/books/:residentId/record"
            element={requireResident((resident) => (
              <div className="py-4">
                <RecordStoryView
                  resident={resident}
                  onSaveStory={handleSaveNewStory}
                  onCancel={handleOpenBook}
                />
              </div>
            ))}
          />

          <Route
            path="/books/:residentId/stories/:storyId"
            element={
              requireResident((resident) => {
                if (storyIndex < 0) {
                  return (
                    <div className="text-center py-20 text-[#f4ecd8]">
                      <p>الحكاية غير متوفرة.</p>
                      <button type="button" onClick={handleOpenBook} className="mt-4 underline text-[#c9a84c]">
                        العودة للفهرس
                      </button>
                    </div>
                  );
                }

                return (
                  <div className="py-4">
                    <StoryDetailView
                      resident={resident}
                      storyIndex={storyIndex}
                      onGoToStoryIndex={handleGoToStoryIndex}
                      onBackToIndex={handleOpenBook}
                      onUpdateStory={handleUpdateStory}
                      onDeleteStory={handleRequestDeleteStory}
                    />
                  </div>
                );
              })
            }
          />

          <Route
            path="/books/:residentId/print"
            element={requireResident((resident) => (
              <ContiguousPrintView
                resident={resident}
                onCancel={handleCancelPrintEntireBook}
              />
            ))}
          />

          <Route path="*" element={<Navigate to={paths.library} replace />} />
        </Routes>
      </main>

      <CreateResidentModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingResident(null);
        }}
        onSave={handleSaveNewResident}
        editingResident={editingResident}
      />

      <ConfirmDialog
        isOpen={Boolean(confirmDialog)}
        title={confirmDialog?.title ?? ''}
        message={confirmDialog?.message ?? ''}
        confirmLabel="نعم، احذف"
        variant="danger"
        onConfirm={() => confirmDialog?.onConfirm()}
        onCancel={() => setConfirmDialog(null)}
      />

      <footer className="bg-[#1c120a]/90 text-center py-4 text-xs text-gray-500 border-t border-[#3a2010] no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="flex items-center justify-center sm:justify-start gap-2">
            <WanisLogoMark size={28} className="opacity-90" />
            <span>
              <strong className="text-[#c9a84c]">ونيس (Wanis)</strong>  كتاب الحياة لرعاية كبار السن ©{' '}
              {new Date().getFullYear()}
            </span>
          </p>
          <div className="flex items-center gap-4 text-[#c9a84c]">
            <span>التوافقية: WCAG AAA</span>
            <span>•</span>
            <span>الخطوط: أميري للأدب، كايرو للأزرار</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
