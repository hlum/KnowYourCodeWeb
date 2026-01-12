import { apiClient, ApiClient } from './apiClient';
import { Answer } from '../types/models';
import { LollipopError } from './errors';

export interface PostAnswerParams {
  questionId: string;
  homeworkId: string;
  userId: string;
  selectedChoiceId?: string | null;
  totalQuestions: number;
}

export class AnswerApi {
  constructor(private client: ApiClient = apiClient) {}

  async postAnswer(params: PostAnswerParams): Promise<void> {
    await this.client.post('answer/add_answer.php', {
      question_id: params.questionId,
      homework_id: params.homeworkId,
      user_id: params.userId,
      selected_choice_id: params.selectedChoiceId ?? null,
      total_questions: String(params.totalQuestions),
    });
  }

  async fetchAnswers(homeworkId: string, userId: string): Promise<Answer[]> {
    const results = await this.client.get<Answer>('answer/get_answers_with_homeworkID.php', {
      homework_id: homeworkId,
      user_id: userId,
    });
    if (!results.length) {
      throw LollipopError.noDataFound();
    }
    return results;
  }
}

export const answerApi = new AnswerApi();
