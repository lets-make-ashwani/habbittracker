import { useState } from 'react';
import { useAppSelector } from './store';
import { SplashScreen } from './components/ui/SplashScreen';
import { AuthScreen } from './features/auth/AuthScreen';
import { AppLayout } from './components/layout/AppLayout';
import { useFirebaseSync } from './hooks/useFirebaseSync';

function App() {
  useFirebaseSync();
  const [showSplash, setShowSplash] = useState(true);
  const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (!isLoggedIn) {
    return <AuthScreen />;
  }

  return <AppLayout />;
}

export default App;
