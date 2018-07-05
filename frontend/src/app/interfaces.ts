export interface AddRequestResponseType {
  success: boolean;
  error: string;
  request_id: number;
}

export interface AnswerResponseType {
  success: boolean;
  error: string;
  answer: string;
}

export interface BossResponseType {
  success: boolean;
  error: string;
  boss: number;
}

export interface ConditionResponseType {
  success: boolean;
  error: string;
  condition: string;
}

export interface MenuItem {
  name: string;
  short_name: string;
  sub_menu: string[][];
}

export interface MySurveyType {
  id_survey: number;
}

export interface MySurveysResponseType {
  success: boolean;
  error: string;
  surveys: MySurveyType[];
}

export interface LogResponseType {
  success: boolean;
  error: string;
  user: UserType;
  token: string;
}

export interface QuestionsResponseType {
  success: boolean;
  error: string;
  questions: QuestionsType[];
  survey: SurveyType;
  step: any;
}

export interface PercentualAnswerResponseType {
  success: boolean;
  error: string;
  percentual: number;
}

export interface PercentualAnswerType {
  answer: string;
  percentual: number;
}

export interface QuestionsType {
  id: number;
  question: string;
  answer: string;
  type: string;
  step: number;
  condition_answer: boolean;
  id_survey: number;
  answer_compile: string;
  condition_confirmed: boolean;
  percentual_answers: PercentualAnswerType[];
  current_user: string;
  answer_of_user: string;
}

export interface RegisterResponseType {
  success: boolean;
  error: string;
}

export interface RequestsResponseType {
  success: boolean;
  error: string;
  requests: RequestType[];
}

export interface RequestType {
  id: number;
  id_user: number;
  state: number;
  reason: string;
  justification_file: string;
  start_date: Date;
  end_date: Date;
}

export interface SuccessResponseType {
  success: boolean;
  error: string;
}

export interface SurveyCreationResponseType {
  success: boolean;
  error: string;
  survey: number;
}

export interface SurveyType {
  id: number;
  name: string;
  id_user: number;
}

export interface SurveyAdminResponseType {
  success: boolean;
  error: string;
  surveys: SurveyAdminType[];
}

export interface SurveyAdminType {
  id: number;
  name: string;
  id_user: number;
  step: number;
  questions: QuestionsType[];
  ArrayStep: number[];
  users: UserType[];
}

export interface SurveysResponseType {
  success: boolean;
  error: string;
  surveys: SurveyType[];
}

export interface SupervisionsResponseType {
  success: boolean;
  error: string;
  supervisions: SupervisionType[];
}

export interface SupervisionType {
  id_user: number;
  id_boss: number;
}

export interface UserResponseType {
  success: boolean;
  error: string;
  user: UserType;
}

export interface UsersResponseType {
  success: boolean;
  error: string;
  users: UserType[];
}

export interface UsersSubmittedResponseType {
  success: boolean;
  error: string;
  users: UsersSubmittedType[];
}

export interface UsersSubmittedType {
  id_user: number;
}

export interface UserType {
  id: number;
  name: string;
  surname: string;
  email: string;
}

export interface TableUserType {
  position: number;
  name: string;
  surname: string;
  email: string;
}

export interface VersionResponseType {
  success: boolean;
  error: string;
  version: string;
}
