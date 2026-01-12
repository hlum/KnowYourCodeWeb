import { useEffect, useState, useRef, type ReactNode } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { useRouteManager } from './useRouteManager';
import { userApi } from '../api/userApi';

interface ProtectedRouteProps {
  children: (user: User, authenticating: boolean) => ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [authData, setAuthData] = useState<User | null | undefined>(undefined);
  const [checking, setChecking] = useState(true);
  const routeManager = useRouteManager();
  const hasSavedUserData = useRef(false);

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

  // Save user data if not exists (only once per session)
  useEffect(() => {
    if (authData && !hasSavedUserData.current) {
      hasSavedUserData.current = true;
      const userData = userApi.createUserDataFromFirebaseUser(authData);
      userApi.saveUserDataIfNotExist(userData).catch((err) => {
        console.error('Failed to save user data:', err);
      });
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
