import { apiClient, ApiClient } from './apiClient';
import { UserData } from '../types/models';
import { LollipopError } from './errors';

// Extract student info from email (e.g., "24cm0138@jec.ac.jp")
function extractStudentInfo(email: string): { studentCode: string; majorCode: string; admissionYear: number } {
  const atIndex = email.indexOf('@');
  if (atIndex === -1) {
    return { studentCode: '99zz', majorCode: 'zz', admissionYear: 99 };
  }

  const localPart = email.substring(0, atIndex); // e.g., "24cm0138"

  // Must have at least 4 characters to include year + class
  if (localPart.length < 4) {
    return { studentCode: '99zz', majorCode: 'zz', admissionYear: 99 };
  }

  // admissionYear = first 2 chars
  const yearPart = localPart.substring(0, 2); // "24"
  const admissionYear = parseInt(yearPart, 10);
  if (isNaN(admissionYear)) {
    return { studentCode: '99zz', majorCode: 'zz', admissionYear: 99 };
  }

  // Extract major code: next letters after the year (e.g., "cm")
  const afterYear = localPart.substring(2);
  const letterMatch = afterYear.match(/^[a-zA-Z]+/);
  const majorCode = letterMatch ? letterMatch[0] : '';

  // Major code must be exactly 2 letters
  if (majorCode.length !== 2) {
    return { studentCode: '99zz', majorCode: 'zz', admissionYear: 99 };
  }

  return { studentCode: localPart, majorCode, admissionYear };
}

export class UserApi {
  constructor(private client: ApiClient = apiClient) {}

  async saveUserData(userData: UserData): Promise<void> {
    await this.client.post('user/register.php', userData);
  }

  async saveUserDataIfNotExist(userData: UserData): Promise<void> {
    try {
      // Check if user already exists
      await this.fetchUserData(userData.id);
      // User exists, do nothing
    } catch (e) {
      // User doesn't exist, save
      await this.saveUserData(userData);
    }
  }

  async fetchUserData(userId: string): Promise<UserData> {
    const result = await this.client.getOne<UserData>('user/get_user.php', {
      id: userId,
    });
    if (!result) {
      throw LollipopError.noDataFound();
    }
    return result;
  }

  async updateFcmToken(userId: string, fcmToken: string): Promise<void> {
    await this.client.post('user/update_fcm_token.php', {
      user_id: userId,
      fcm_token: fcmToken,
    });
  }

  // Create UserData from Firebase User
  createUserDataFromFirebaseUser(user: { uid: string; email: string | null; displayName: string | null; providerData: Array<{ providerId: string; photoURL: string | null }> }): UserData {
    const email = user.email || '';
    const name = user.displayName || email;
    
    // Get photoURL from Google provider
    const googleProvider = user.providerData.find((provider) => provider.providerId === 'google.com');
    const photoURL = googleProvider?.photoURL ?? null;
    
    const { studentCode, majorCode, admissionYear } = extractStudentInfo(email);

    return {
      id: user.uid,
      email,
      name,
      fcm_token: null,
      photo_url: photoURL,
      student_code: studentCode,
      major_code: majorCode,
      admission_year: admissionYear,
    };
  }
}

export const userApi = new UserApi();
