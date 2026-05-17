import { useAuth } from '@clerk/clerk-react';
import { AuthenticatedApp } from './AuthenticatedApp';
import { LandingPage } from './components/LandingPage';

/**
 * Not signed in (or Clerk still loading) → full marketing landing page.
 * Signed in → library & life books. No separate login gate screen.
 */
export default function App() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded || !isSignedIn) {
    return <LandingPage />;
  }

  return <AuthenticatedApp />;
}
