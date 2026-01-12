import { apiClient, ApiClient } from './apiClient';
import { HomeworkWithStatus } from '../types/models';

export class HomeworkApi {
  constructor(private client: ApiClient = apiClient) {}

  async fetchHomeworks(studentId: string): Promise<HomeworkWithStatus[]> {
    return this.client.get<HomeworkWithStatus>('homework/get_homework_with_status.php', {
      student_id: studentId,
    });
  }

  async fetchHomeworksFromClass(classId: string, studentId: string): Promise<HomeworkWithStatus[]> {
    return this.client.get<HomeworkWithStatus>('homework/get_homework_with_status.php', {
      class_id: classId,
      student_id: studentId,
    });
  }

  async fetchHomework(id: string, studentId: string): Promise<HomeworkWithStatus | null> {
    const results = await this.client.get<HomeworkWithStatus>('homework/get_homework_with_status.php', {
      id,
      student_id: studentId,
    });
    return results[0] || null;
  }

  async retryQuestionGeneration(homeworkId: string, studentId: string): Promise<void> {
    await this.client.patch('job/retry_job.php', {
      homework_id: homeworkId,
      user_id: studentId,
    });
  }

  async cancelHomeworkSubmission(homeworkId: string, studentId: string): Promise<void> {
    await this.client.delete('homework/delete_submitted_homework.php', {
      user_id: studentId,
      homework_id: homeworkId,
    });
  }
}

export const homeworkApi = new HomeworkApi();
