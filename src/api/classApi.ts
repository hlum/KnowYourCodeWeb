import { apiClient, ApiClient } from './apiClient';
import { Class } from '../types/models';
import { LollipopError } from './errors';

export class ClassApi {
  constructor(private client: ApiClient = apiClient) {}

  async addOptionalClass(classCode: string, userId: string): Promise<void> {
    await this.client.post('class/enroll.php', {
      student_id: userId,
      class_code: classCode,
    });
  }

  async fetchByClassCode(classCode: string): Promise<Class | null> {
    return this.client.getOne<Class>('class/get_class.php', {
      class_code: classCode,
    });
  }

  async fetchAll(studentId: string): Promise<Class[]> {
    const results = await this.client.get<Class>('class/get_class.php', {
      student_id: studentId,
    });
    if (!results.length) {
      throw LollipopError.noDataFound();
    }
    return results;
  }

  async fetchById(id: string): Promise<Class> {
    const result = await this.client.getOne<Class>('class/get_class.php', {
      id,
    });
    if (!result) {
      throw LollipopError.noDataFound();
    }
    return result;
  }
}

export const classApi = new ClassApi();
