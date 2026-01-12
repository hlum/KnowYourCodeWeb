import { apiClient, ApiClient } from "./apiClient";
import { QuestionWithChoices } from "../types/models";

export class QuestionsApi {
	constructor(private client: ApiClient = apiClient) {}

	async fetchAll(homeworkId: string, userId: string): Promise<QuestionWithChoices[]> {
		return this.client.get<QuestionWithChoices>("questions_choices/get_questions_choices.php", {
			homework_id: homeworkId,
			user_id: userId,
		});
	}
}

export const questionsApi = new QuestionsApi();
