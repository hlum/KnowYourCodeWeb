import { useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { useRouteManager } from './useRouteManager';

interface ProtectedRouteProps {
  children: (user: User, authenticating: boolean) => ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [authData, setAuthData] = useState<User | null | undefined>(undefined);
  const [checking, setChecking] = useState(true);
  const routeManager = useRouteManager();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthData(user);
      setChecking(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (authData === null) {
      routeManager.toLogin();
    }
  }, [authData]);

  // Still loading auth state
  if (authData === undefined) {
    return <>{children(null as unknown as User, true)}</>;
  }

  // Not authenticated
  if (authData === null) {
    return null;
  }

  return <>{children(authData, checking)}</>;
};
