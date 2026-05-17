import { useAuth } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';
import { AuthLoadingView } from '../components/AuthLoadingView';
import { AuthenticatedApp } from '../AuthenticatedApp';

/** Protected app: requires sign-in; guests go back to landing */
export function AppRoute() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <AuthLoadingView />;
  }

  if (!isSignedIn) {
    return <Navigate to="/" replace />;
  }

  return <AuthenticatedApp />;
}
