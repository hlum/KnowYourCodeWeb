import { apiClient, ApiClient } from './apiClient';

export class ProjectApi {
  constructor(private client: ApiClient = apiClient) {}

  async uploadProject(userId: string, homeworkId: string, githubUrlString: string): Promise<void> {
    await this.client.patch('project/add_project.php', {
      user_id: userId,
      homework_id: homeworkId,
      github_file_link: githubUrlString,
    });
  }
}

export const projectApi = new ProjectApi();
