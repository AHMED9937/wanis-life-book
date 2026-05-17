import { WanisLogo } from './WanisLogo';

/** Shown on /app while Clerk session is loading */
export function AuthLoadingView() {
  return (
    <div className="wood-desk min-h-screen flex flex-col items-center justify-center p-6 gap-4">
      <WanisLogo variant="stacked" size={64} tagline="جاري التحميل..." />
      <p className="font-cairo text-sm text-[#c9a84c]/70">يتم التحقق من جلسة الدخول...</p>
    </div>
  );
}
