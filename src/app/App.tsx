import { AuthScreen } from '@/features/auth/AuthScreen';
import { AppShell } from '@/app/AppShell';
import { useMockApp } from '@/shared/lib/mockStore';

export function App() {
  const { isAuthenticated } = useMockApp();

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return <AppShell />;
}

export default App;
