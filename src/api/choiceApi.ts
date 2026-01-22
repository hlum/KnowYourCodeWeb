import { apiClient, ApiClient } from "./apiClient";
import { Choice } from "../types/models";

export class ChoiceApi {
	constructor(private client: ApiClient = apiClient) {}

	async fetchCorrectChoice(questionId: string, homeworkId: string): Promise<Choice> {
		const data = await this.client.get<Choice>("choices/get_correct_choice.php", {
			question_id: questionId,
			homework_id: homeworkId,
		});
		return data[0];
	}
}

export const choiceApi = new ChoiceApi();
