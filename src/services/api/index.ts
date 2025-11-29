/**
 * Main API service exports
 * Central export point for all API services
 */

// Core utilities
export { authenticatedFetch, getApiUrl, getToken, setToken, removeToken } from './core';

// Auth API
export { login, logout, forgotPassword, resetPassword, resendOTP, authAPI } from './auth';
export type { LoginResponse } from './auth';

// Exam API
export {
  getExams,
  getExamById,
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  startExam,
  saveAnswer,
  submitExam,
  getSubmissions,
  getStudentEnrollments,
  examApi,
} from './exam';
export type {
  BackendExam,
  BackendQuestion,
  CreateQuestionPayload,
  UpdateQuestionPayload,
  GetExamsResponse,
  GetQuestionsResponse,
  GetExamResponse,
  StudentEnrollment,
} from './exam';

// Entity API
export { getEntities, createEntity, updateEntity } from './entity';
export type {
  ApiEntity as Entity,
  CreateEntityPayload,
  UpdateEntityPayload,
  GetEntitiesResponse,
} from './entity';

// User API
export { updateUserProfile, changePassword, getUsers, inviteUser, createUser, deregisterUser, activateUser, registerUser } from './user';
export type { UserProfile, ApiUser, GetUsersResponse, InviteUserPayload, InviteUserResponse, CreateUserPayload, CreateUserResponse } from './user';

// Two Factor Auth API
export { twoFactorAPI } from './twoFactorAuth';
