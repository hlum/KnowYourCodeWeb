import { apiClient, ApiClient } from './apiClient';
import { UserData } from '../types/models';
import { LollipopError } from './errors';

export class UserApi {
  constructor(private client: ApiClient = apiClient) {}

  async saveUserData(userData: UserData): Promise<void> {
    await this.client.post('user/register.php', userData);
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
}

export const userApi = new UserApi();
