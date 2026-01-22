// API Response types
export interface APIResponse<T> {
  status: string;
  error_type?: ErrorType;
  message: string;
  data?: T[];
}

export type ErrorType =
  | 'validation_error'
  | 'auth_error'
  | 'forbidden_error'
  | 'not_found_error'
  | 'server_error'
  | 'unsupported_file_type'
  | 'unsupported_repo_url';

// Class entity
export interface Class {
  id: string;
  teacher_id: string;
  name: string;
  admission_year: number;
  major_code: string;
  class_code?: string | null;
  teacher_name: string;
}

// Homework state enum
export type HomeworkState =
  | 'notAssigned'
  | 'generatingQuestions'
  | 'questionGenerated'
  | 'completed'
  | 'failed';

// Homework with status
export interface HomeworkWithStatus {
  id: string;
  title: string;
  description?: string | null;
  due_date?: string | null;
  class_id: string;
  github_file_link?: string | null;
  submission_state: HomeworkState;
  created_at: string;
}

// User data
export interface UserData {
  id: string;
  email: string;
  name: string;
  fcm_token?: string | null;
  photo_url?: string | null;
  student_code?: string | null;
  major_code?: string | null;
  admission_year?: number | null;
}

// Question with choices
export interface QuestionWithChoices {
  question_id: string;
  job_id: string;
  project_id: string;
  homework_id: string;
  user_id: string;
  question_text: string;
  created_at: string;
  choices: Choice[];
}

export interface Choice {
  choice_id: string;
  choice_text: string;
}

// Answer
export interface Answer {
  id: string;
  question_id: string;
  user_id: string;
  selected_choice_id?: string | null;
}

// Post Answer Response
export interface PostAnswerResponse {
  correct_choice_id: string | null;
}

// Result data
export interface ResultData {
  id: string;
  user_id: string;
  homework_id: string;
  total_questions: number;
  correct_answers: number;
  score: number;
  evaluated_at: string;
}

// Average score per class
export interface AverageScorePerClass {
  id?: string;
  class_name: string;
  average_score: number;
  finished_homework_count: number;
  total_homework_count: number;
}
