import { auth, provider } from '../firebase/firebase';
import { signInWithPopup, signOut, type User } from 'firebase/auth';

export class AuthManager {
  async signInWithGoogle(): Promise<User> {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  }

  async signOut(): Promise<void> {
    await signOut(auth);
  }
}

export const authManager = new AuthManager();
