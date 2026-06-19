import { useAuth } from '@clerk/clerk-react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthenticatedApp } from './AuthenticatedApp';
import { LandingPage } from './components/LandingPage';
import { paths } from './lib/routes';

function AuthLoading() {
  return (
    <div className="wood-desk min-h-screen flex items-center justify-center">
      <p className="text-[#f4ecd8] font-cairo">جاري التحميل...</p>
    </div>
  );
}

export default function App() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <AuthLoading />;
  }

  return (
    <Routes>
      <Route
        path={paths.home}
        element={isSignedIn ? <Navigate to={paths.library} replace /> : <LandingPage />}
      />

      {isSignedIn ? (
        <Route path="/*" element={<AuthenticatedApp />} />
      ) : (
        <Route path="*" element={<Navigate to={paths.home} replace />} />
      )}
    </Routes>
  );
}
