import { apiClient, ApiClient } from './apiClient';
import { ResultData } from '../types/models';
import { LollipopError } from './errors';

export class ResultApi {
  constructor(private client: ApiClient = apiClient) {}

  async fetchResults(userId: string): Promise<ResultData[]> {
    return this.client.get<ResultData>('result/get_result.php', {
      user_id: userId,
    });
  }

  async fetchResult(userId: string, homeworkId: string): Promise<ResultData> {
    const result = await this.client.getOne<ResultData>('result/get_result_userID_homeworkID.php', {
      user_id: userId,
      homework_id: homeworkId,
    });
    if (!result) {
      throw LollipopError.noDataFound();
    }
    return result;
  }
}

export const resultApi = new ResultApi();
