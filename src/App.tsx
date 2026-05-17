import { SignedIn, SignedOut, useAuth } from '@clerk/clerk-react';
import { useCallback, useEffect, useState } from 'react';
import { CaregiverHeader } from './components/CaregiverHeader';
import { Library } from './components/Library';
import { BookCoverView } from './components/BookCoverView';
import { BookIndexView } from './components/BookIndexView';
import { RecordStoryView } from './components/RecordStoryView';
import { StoryDetailView } from './components/StoryDetailView';
import { ContiguousPrintView } from './components/ContiguousPrintView';
import { CreateResidentModal } from './components/CreateResidentModal';
import { Resident, Story } from './types';
import { CareHomeSetupModal } from './components/CareHomeSetupModal';
import { LandingPage } from './components/LandingPage';
import { WanisLogoMark } from './components/WanisLogo';
import {
  createResident,
  createStory,
  fetchMeProfile,
  fetchResidents,
  resolveApiErrorMessage,
  updateCareHome,
} from './lib/api';

export default function App() {
  const { getToken, isSignedIn } = useAuth();

  // Core application state
  const [residents, setResidents] = useState<Resident[]>([]);
  const [view, setView] = useState<'library' | 'book' | 'print_entire'>('library');
  const [selectedResidentId, setSelectedResidentId] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  
  // Modals and feedback state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isResidentsLoading, setIsResidentsLoading] = useState(false);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [hasLoadedResidents, setHasLoadedResidents] = useState(false);
  const [residentsError, setResidentsError] = useState<string | null>(null);
  const [careHomeName, setCareHomeName] = useState<string | null>(null);
  const [needsCareHomeSetup, setNeedsCareHomeSetup] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  // Display helpful confirmation toast messages
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

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

  const handleCareHomeSetupComplete = async (name: string) => {
    const token = await getToken();
    if (!token) return;
    const updated = await updateCareHome(token, { name });
    setCareHomeName(updated.name);
    setNeedsCareHomeSetup(false);
    showToast('✅ تم إعداد دارك بنجاح  بياناتك خاصة بحسابك فقط');
    await loadResidents('');
  };

  useEffect(() => {
    void loadProfile();
    void loadResidents('');
  }, [loadProfile, loadResidents]);

  // Find currently selected resident object
  const currentResident = residents.find(r => r.id === selectedResidentId) || null;

  // --- Route & View Navigation Handlers ---

  const handleSelectBook = (residentId: string) => {
    setSelectedResidentId(residentId);
    setView('book');
    setPage(0); // View = 'book' & page = 0 (Cover)
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoToLibrary = () => {
    setView('library');
    setSelectedResidentId(null);
    setPage(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenBook = () => {
    setPage(1); // View = 'book' & page = 1 (The Index)
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoToRecord = () => {
    setPage(2); // View = 'book' & page = 2 (Record View)
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectStory = (storyIndex: number) => {
    setPage(3 + storyIndex); // View = 'book' & page = 3+ (Story Detail)
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoToSpecificPage = (targetPage: number) => {
    setPage(targetPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- Write Operations ---

  const handleSaveNewResident = async (newResident: Resident) => {
    const token = await getToken();
    if (!token) {
      showToast('❌ تعذر الحصول على جلسة المصادقة. حاول تسجيل الدخول مرة أخرى.');
      return;
    }

    try {
      const created = await createResident(token, newResident);
      await loadResidents('');
      setIsCreateModalOpen(false);
      showToast(`✨ تم تأسيس كتاب حياة جديد للمقيم ${created.name} بنجاح!`);
      
      // Auto-select and open the new book to its Index (page = 1)
      setSelectedResidentId(created.id);
      setView('book');
      setPage(1);
    } catch (e) {
      console.error(e);
      showToast(resolveApiErrorMessage(e, '❌ حدث خطأ أثناء إنشاء الكتاب'));
    }
  };

  const handleSaveNewStory = async (newStory: Story) => {
    if (!selectedResidentId) return;
    
    const targetRes = residents.find(r => r.id === selectedResidentId);
    if (!targetRes) return;

    // Get the _lifeBookId mapped by the API layer.
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
      const refreshedResidents = await loadResidents('');
      const refreshedResident = refreshedResidents?.find(r => r.id === selectedResidentId);
      const newIdx = refreshedResident
        ? (() => {
            const exactIdx = refreshedResident.stories.findIndex(story => story.id === createdStory.id);
            return exactIdx >= 0 ? exactIdx : refreshedResident.stories.length - 1;
          })()
        : -1;

      showToast(`📖 تمت إضافة الحكاية "${createdStory.title}" إلى الفهرس بنجاح!`);

      if (newIdx >= 0) {
        // Flip straight to the newly created chapter.
        setPage(3 + newIdx);
      } else {
        // Fallback to index if updated chapter position is unknown.
        setPage(1);
      }
    } catch (e) {
      console.error(e);
      showToast(resolveApiErrorMessage(e, '❌ حدث خطأ أثناء حفظ الحكاية'));
    }
  };

  const handleTriggerPrintEntireBook = () => {
    setView('print_entire');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelPrintEntireBook = () => {
    if (selectedResidentId) {
      setView('book');
      // keep same page or reset to index
    } else {
      setView('library');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <SignedOut>
        <LandingPage />
      </SignedOut>

      <SignedIn>
        <div className="wood-desk min-h-screen flex flex-col justify-between font-cairo">
          
          {/* Caregiver Authorization Header */}
          <CaregiverHeader
            currentView={view}
            careHomeName={careHomeName}
            onGoToLibrary={handleGoToLibrary}
            onCreateNewResident={() => setIsCreateModalOpen(true)}
          />

          {needsCareHomeSetup && careHomeName && !isProfileLoading && (
            <CareHomeSetupModal
              defaultName={careHomeName}
              onComplete={handleCareHomeSetupComplete}
            />
          )}

          {/* Floating Notification Toast */}
          {toastMessage && (
            <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 bg-[#c9a84c] text-[#1c120a] font-bold px-6 py-3 rounded-full shadow-2xl border-2 border-white text-sm animate-bounce text-center max-w-md w-11/12 no-print">
              {toastMessage}
            </div>
          )}

          {/* Primary Dynamic Workspace View rendering */}
          <main className="flex-1 transition-all duration-300">
            
            {/* State 1: The Care Home Library */}
            {view === 'library' && (
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
                    onCreateNew={() => setIsCreateModalOpen(true)}
                    onSearchQueryChange={handleSearchQueryChange}
                    isSearchLoading={isSearchLoading}
                  />
                )}
              </>
            )}

            {/* State 2: Viewing a specific resident's Life Book */}
            {view === 'book' && currentResident && (
              <div className="py-4 transition-all duration-500">
                
                {/* Page 0: The Closed Cover */}
                {page === 0 && (
                  <BookCoverView
                    resident={currentResident}
                    onOpenBook={handleOpenBook}
                    onPrintEntireBook={handleTriggerPrintEntireBook}
                  />
                )}

                {/* Page 1: The Index (الفهرس) */}
                {page === 1 && (
                  <BookIndexView
                    resident={currentResident}
                    onSelectStory={handleSelectStory}
                    onGoToRecord={handleGoToRecord}
                    onPrintEntireBook={handleTriggerPrintEntireBook}
                    onCloseBook={() => setPage(0)}
                  />
                )}

                {/* Page 2: Record View (الميكروفون الذهبي) */}
                {page === 2 && (
                  <RecordStoryView
                    resident={currentResident}
                    onSaveStory={handleSaveNewStory}
                    onCancel={handleOpenBook}
                  />
                )}

                {/* Page 3+: Story Detail (حكاية محددة) */}
                {page >= 3 && (
                  <StoryDetailView
                    resident={currentResident}
                    storyIndex={page - 3}
                    onGoToPage={handleGoToSpecificPage}
                    onBackToIndex={handleOpenBook}
                  />
                )}

              </div>
            )}

            {/* State 3: Contiguous Master Document Print Mode */}
            {view === 'print_entire' && currentResident && (
              <ContiguousPrintView
                resident={currentResident}
                onCancel={handleCancelPrintEntireBook}
              />
            )}

            {/* Fallback guard if book view misses id */}
            {view === 'book' && !currentResident && (
              <div className="text-center py-20 text-[#f4ecd8]">
                <p>تعذر تحميل بيانات هذا الكتاب.</p>
                <button onClick={handleGoToLibrary} className="mt-4 underline text-[#c9a84c]">
                  العودة للمكتبة
                </button>
              </div>
            )}

          </main>

          {/* Modal for creating incoming resident books */}
          <CreateResidentModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSave={handleSaveNewResident}
          />

          {/* Custom nostalgic static desktop footer */}
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
      </SignedIn>
    </>
  );
}
