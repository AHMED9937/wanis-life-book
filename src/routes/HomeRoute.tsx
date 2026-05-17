import { useAuth } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';
import { LandingPage } from '../components/LandingPage';
import { APP_AUTH_PATH } from './authPaths';

/** Public home: landing page for guests; redirect signed-in users to the app */
export function HomeRoute() {
  const { isLoaded, isSignedIn } = useAuth();

  if (isLoaded && isSignedIn) {
    return <Navigate to={APP_AUTH_PATH} replace />;
  }

  return <LandingPage />;
}
