import { useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { useRouteManager } from './useRouteManager';

interface GuestRouteProps {
  children: (authenticating: boolean) => ReactNode;
}

export const GuestRoute = ({ children }: GuestRouteProps) => {
  const [authData, setAuthData] = useState<User | null | undefined>(undefined);
  const routeManager = useRouteManager();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthData(user);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (authData) {
      routeManager.toHome();
    }
  }, [authData]);

  return <>{children(authData === undefined)}</>;
};
