import { apiClient, ApiClient } from './apiClient';
import { AverageScorePerClass } from '../types/models';
import { LollipopError } from './errors';

export class AverageScoreApi {
  constructor(private client: ApiClient = apiClient) {}

  async fetch(userId: string): Promise<AverageScorePerClass[]> {
    const results = await this.client.get<AverageScorePerClass>('average_score/get_average_score.php', {
      student_id: userId,
    });
    if (!results.length) {
      throw LollipopError.noDataFound();
    }
    return results;
  }
}

export const averageScoreApi = new AverageScoreApi();
