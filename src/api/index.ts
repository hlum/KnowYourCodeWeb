// API Client
export { ApiClient, apiClient } from "./apiClient";

// API Modules
export { ClassApi, classApi } from "./classApi";
export { HomeworkApi, homeworkApi } from "./homeworkApi";
export { UserApi, userApi } from "./userApi";
export { QuestionsApi, questionsApi } from "./questionsApi";
export { AnswerApi, answerApi, type PostAnswerParams } from "./answerApi";
export { ResultApi, resultApi } from "./resultApi";
export { AverageScoreApi, averageScoreApi } from "./averageScoreApi";
export { ProjectApi, projectApi } from "./projectApi";

// Errors
export { LollipopError } from "./errors";

// Types (re-export for convenience)
export type { APIResponse, ErrorType, Class, HomeworkState, HomeworkWithStatus, UserData, QuestionWithChoices, Choice, Answer, ResultData, AverageScorePerClass } from "../types/models";
