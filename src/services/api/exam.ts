/**
 * Exam API service
 * Handles all exam-related operations
 */

import { authenticatedFetch, getApiUrl } from './core';

export interface BackendExam {
  id: string;
  title: string;
  type?: string;
  active?: boolean;
  created_at?: string;
  duration_seconds: number;
  metadata?: any;
  entity_id: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  total_marks?: number;
  passing_marks?: number;
  status?: string;
  has_admission_form?: boolean;
  results_visible?: boolean;
}

export interface BackendQuestion {
  id: string;
  exam_id?: string;
  question_text: string;
  type: 'MCQ' | 'MULTIPLE_CORRECT' | 'ONE_WORD' | 'SUBJECTIVE';
  options?: string[];
  correct_answer?: string | string[];
  marks?: number;
  negative_marks?: number;
  metadata?: any;
  created_at?: string;
  updated_at?: string;
}

export interface CreateQuestionPayload {
  exam_id: string;
  question_text: string;
  type: 'MCQ' | 'MULTIPLE_CORRECT' | 'ONE_WORD' | 'SUBJECTIVE';
  options?: string[];
  correct_answer?: string | string[];
  marks?: number;
  negative_marks?: number;
  metadata?: any;
}

export interface UpdateQuestionPayload {
  question_id: string;
  question_text?: string;
  type?: 'MCQ' | 'MULTIPLE_CORRECT' | 'ONE_WORD' | 'SUBJECTIVE';
  options?: string[];
  correct_answer?: string | string[];
  marks?: number;
  negative_marks?: number;
  metadata?: any;
}

export interface CreateExamPayload {
  title: string;
  type: 'QUIZ' | 'MCQ' | 'ONE_WORD' | 'DESCRIPTIVE' | 'HYBRID' | 'OTHER';
  duration_seconds: number;
  metadata?: {
    totalMarks?: number;
    passingMarks?: number;
    instructions?: string[];
    isMultipleCorrect?: boolean;
    [key: string]: any;
  };
  results_visible?: boolean;
  entity_id?: string;
}

export interface UpdateExamPayload {
  title?: string;
  type?: 'QUIZ' | 'MCQ' | 'ONE_WORD' | 'DESCRIPTIVE' | 'HYBRID' | 'OTHER' | 'EXAM' | string;
  duration_seconds?: number;
  active?: boolean;
  results_visible?: boolean;
  metadata?: {
    totalMarks?: number;
    passingMarks?: number;
    instructions?: string | string[];
    isMultipleCorrect?: boolean;
    [key: string]: any;
  };
}

export interface GetExamsResponse {
  payload: {
    exams: BackendExam[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface GetQuestionsResponse {
  payload: {
    questions: BackendQuestion[];
    total: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}

export interface GetExamResponse {
  payload: BackendExam;
}

export interface ExamStatistics {
  totalExams: number;
  activeExams: number;
  totalStudentsInvited: number;
  averageCompletion: number;
}

export interface GetExamStatisticsResponse {
  payload: ExamStatistics;
}

export interface ExamDetailStatistics {
  totalAttempts: number;
  totalStudentsInvited: number;
  completionRate: number;
}

export interface GetExamDetailStatisticsResponse {
  payload: ExamDetailStatistics;
}

export interface LeaderboardEntry {
  userId: string;
  email: string;
  name: string;
  correctAnswers: number;
  score: number;
  passed: boolean;
  completedAt: string;
}

export interface GetExamLeaderboardResponse {
  payload: {
    leaderboard: LeaderboardEntry[];
  };
}

export interface ExamTypeDistributionItem {
  name: string;
  value: number;
  percentage: number;
  color?: string;
}

export interface GetExamTypeDistributionResponse {
  payload: {
    distribution: ExamTypeDistributionItem[];
    total: number;
  };
}

export interface ScoreDistributionItem {
  name: string;
  value: number;
  percentage: number;
}

export interface GetScoreDistributionResponse {
  payload: {
    distribution: ScoreDistributionItem[];
  };
}

export interface ExamPerformanceItem {
  examName: string;
  avgScore: number;
  exams: number;
  students: number;
}

export interface GetExamPerformanceResponse {
  payload: {
    performance: ExamPerformanceItem[];
  };
}

export interface ExamScoreDistributionItem {
  range: string;
  count: number;
  percentage: number;
}

export interface GetExamScoreDistributionResponse {
  payload: {
    distribution: ExamScoreDistributionItem[];
    summary?: {
      highestScore: number;
      lowestScore: number;
      averageScore: number;
      passRate: number;
      totalAttempts: number;
    };
  };
}

export interface StudentEnrollment {
  id: string;
  exam_id: string;
  user_id: string;
  status: string;
  enrollment_created_at?: string;
  exam: {
    id: string;
    title: string;
    type: string;
    active: boolean;
    created_at: string;
    duration_seconds: number;
    metadata: any;
    entity_id: string;
    results_visible?: boolean;
  };
  result: {
    id: string;
    score: number;
    metadata: any;
    created_at: string;
  } | null;
}

export interface ExamEnrollment {
  id: string;
  user_id: string;
  email: string | null;
  name: string | null;
  roll_number: string | null;
  status: string;
  enrolled_at?: string;
  score?: number | null;
  metadata?: any;
}

export interface GetExamEnrollmentsResponse {
  payload: {
    exam_id: string;
    enrollments: ExamEnrollment[];
  };
}

export interface DeleteExamEnrollmentResponse {
  payload: {
    enrollment_id: string;
  };
}

/**
 * Get exams with pagination
 */
export async function getExams(
  page: number = 1,
  limit: number = 10,
  entityId?: string
): Promise<GetExamsResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (entityId) {
    params.append('entity_id', entityId);
  }

  const response = await authenticatedFetch(getApiUrl(`/v1/exams?${params.toString()}`), {
    method: 'GET',
  });

  return response.json();
}

/**
 * Get exam by ID
 */
export async function getExamById(examId: string): Promise<GetExamResponse> {
  const response = await authenticatedFetch(getApiUrl(`/v1/exams/${examId}`), {
    method: 'GET',
  });

  return response.json();
}

/**
 * Get questions for an exam
 */
export async function getQuestions(
  examId: string,
  page: number = 1,
  limit: number = 10
): Promise<GetQuestionsResponse> {
  const params = new URLSearchParams({
    exam_id: examId,
    page: page.toString(),
    limit: limit.toString(),
  });

  const response = await authenticatedFetch(getApiUrl(`/v1/exams/question?${params.toString()}`), {
    method: 'GET',
  });

  return response.json();
}

/**
 * Create a question
 */
export async function createQuestion(payload: CreateQuestionPayload): Promise<{ payload: BackendQuestion }> {
  const response = await authenticatedFetch(getApiUrl('/v1/exams/question'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return response.json();
}

/**
 * Update a question
 */
export async function updateQuestion(payload: UpdateQuestionPayload): Promise<{ payload: BackendQuestion }> {
  const { question_id, ...updateData } = payload;
  const response = await authenticatedFetch(getApiUrl(`/v1/exams/question/${question_id}`), {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData),
  });

  return response.json();
}

/**
 * Delete a question
 */
export async function deleteQuestion(questionId: string): Promise<void> {
  const response = await authenticatedFetch(getApiUrl(`/v1/exams/question/${questionId}`), {
    method: 'DELETE',
  });

  await response.json();
}

/**
 * Start an exam
 */
export async function startExam(examId: string): Promise<{ payload: { started_at: string } }> {
  const response = await authenticatedFetch(getApiUrl('/v1/submissions/start'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      exam_id: examId,
    }),
  });

  return response.json();
}

/**
 * Save an answer
 */
export async function saveAnswer(examId: string, questionId: string, answer: string): Promise<void> {
  const response = await authenticatedFetch(getApiUrl('/v1/submissions/answer'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      exam_id: examId,
      question_id: questionId,
      answer,
    }),
  });

  await response.json();
}

/**
 * Submit exam
 */
export async function submitExam(examId: string): Promise<{ payload: { completed_at: string } }> {
  const response = await authenticatedFetch(getApiUrl('/v1/submissions/submit'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      exam_id: examId,
    }),
  });

  return response.json();
}

/**
 * Get submissions for an exam
 */
export async function getSubmissions(examId: string): Promise<{
  payload: {
    enrollment_status: string;
    started_at?: string;
    submissions: Array<{
      question_id: string;
      answer: string;
    }>;
  };
}> {
  const params = new URLSearchParams({
    exam_id: examId,
  });

  const response = await authenticatedFetch(getApiUrl(`/v1/submissions?${params.toString()}`), {
    method: 'GET',
  });

  return response.json();
}

/**
 * Get student enrollments
 */
export async function getStudentEnrollments(): Promise<{ 
  payload: { 
    total: number;
    ongoing: StudentEnrollment[];
    upcoming: StudentEnrollment[];
    completed: StudentEnrollment[];
    all: StudentEnrollment[];
  } 
}> {
  const response = await authenticatedFetch(getApiUrl('/v1/exams/enrollments'), {
    method: 'GET',
  });

  return response.json();
}

export interface RepresentativeEnrollment {
  id: string;
  exam_id: string;
  user_id: string;
  status: string;
  enrollment_created_at: string;
  exam: {
    id: string;
    title: string;
    type: string;
    active: boolean;
    created_at: string;
    duration_seconds: number;
    metadata: any;
    entity_id: string;
  };
}

/**
 * Get representative enrollments (ASSIGNED status only)
 */
export async function getRepresentativeEnrollments(): Promise<{ 
  payload: { 
    enrollments: RepresentativeEnrollment[];
    total: number;
  } 
}> {
  const response = await authenticatedFetch(getApiUrl('/v1/exams/representative/enrollments'), {
    method: 'GET',
  });

  return response.json();
}

export async function getExamEnrollments(
  examId: string
): Promise<GetExamEnrollmentsResponse> {
  const response = await authenticatedFetch(
    getApiUrl(`/v1/exams/${examId}/enrollments`),
    {
      method: "GET",
    }
  );

  return response.json();
}

export async function deleteExamEnrollment(
  examId: string,
  enrollmentId: string
): Promise<DeleteExamEnrollmentResponse> {
  const response = await authenticatedFetch(
    getApiUrl(`/v1/exams/${examId}/enrollments/${enrollmentId}`),
    {
      method: "DELETE",
    }
  );

  return response.json();
}

/**
 * Create an exam
 */
export async function createExam(payload: CreateExamPayload): Promise<{ payload: BackendExam }> {
  const response = await authenticatedFetch(getApiUrl('/v1/exams'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return response.json();
}

/**
 * Update an exam
 */
export async function updateExam(examId: string, payload: UpdateExamPayload): Promise<{ payload: BackendExam }> {
  const response = await authenticatedFetch(getApiUrl(`/v1/exams/${examId}`), {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return response.json();
}

/**
 * Get exam statistics
 */
export async function getExamStatistics(entityId?: string): Promise<GetExamStatisticsResponse> {
  const params = new URLSearchParams();
  if (entityId) {
    params.append('entity_id', entityId);
  }

  const url = `/v1/exams/statistics${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await authenticatedFetch(getApiUrl(url), {
    method: 'GET',
  });

  return response.json();
}

/**
 * Get exam detail statistics
 */
export async function getExamDetailStatistics(examId: string): Promise<GetExamDetailStatisticsResponse> {
  const response = await authenticatedFetch(getApiUrl(`/v1/exams/${examId}/statistics`), {
    method: 'GET',
  });

  return response.json();
}

/**
 * Get exam leaderboard
 */
export async function getExamLeaderboard(examId: string): Promise<GetExamLeaderboardResponse> {
  const response = await authenticatedFetch(getApiUrl(`/v1/exams/${examId}/leaderboard`), {
    method: 'GET',
  });

  return response.json();
}

/**
 * Invite students to an exam
 */
export interface InviteStudentsPayload {
  examId: string;
  entityId: string;
  emails: string[];
}

export interface InviteStudentResult {
  email: string;
  success: boolean;
  reason: string;
}

export async function inviteStudents(payload: InviteStudentsPayload): Promise<{
  payload?: {
    results?: InviteStudentResult[];
    totalInvited?: number;
    totalFailed?: number;
  };
}> {
  const requestBody = {
    entity_id: payload.entityId,
    student_emails: payload.emails,
  };

  console.log('📧 [inviteStudents] Request Details:', {
    url: getApiUrl(`/v1/exams/${payload.examId}/invite`),
    method: 'POST',
    requestBody: requestBody,
    examId: payload.examId,
    entityId: payload.entityId,
    emails: payload.emails,
    emailCount: payload.emails?.length || 0,
  });

  const response = await authenticatedFetch(getApiUrl(`/v1/exams/${payload.examId}/invite`), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  const responseData = await response.json();
  console.log('✅ [inviteStudents] Response:', responseData);
  return responseData;
}

export interface InviteRepresentativesPayload {
  examId: string;
  user_ids: string[];
}

export async function inviteRepresentatives(payload: InviteRepresentativesPayload): Promise<{
  payload?: {
    enrollments?: Array<{
      id: string;
      exam_id: string;
      user_id: string;
      status: string;
      created_at: string;
    }>;
    enrolledCount?: number;
    totalEmails?: number;
  };
}> {
  const requestBody = {
    user_ids: payload.user_ids,
  };

  const response = await authenticatedFetch(getApiUrl(`/v1/exams/${payload.examId}/invite-representatives`), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  const responseData = await response.json();
  return responseData;
}

/**
 * Get exam type distribution
 */
export async function getExamTypeDistribution(): Promise<GetExamTypeDistributionResponse> {
  const response = await authenticatedFetch(getApiUrl('/v1/exams/type-distribution'), {
    method: 'GET',
  });

  return response.json();
}

/**
 * Get score distribution
 */
export async function getScoreDistribution(entityId?: string): Promise<GetScoreDistributionResponse> {
  const params = new URLSearchParams();
  if (entityId) {
    params.append('entity_id', entityId);
  }

  const url = `/v1/exams/score-distribution${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await authenticatedFetch(getApiUrl(url), {
    method: 'GET',
  });

  return response.json();
}

/**
 * Get exam performance (exam-wise average scores)
 */
export async function getExamPerformance(entityId?: string): Promise<GetExamPerformanceResponse> {
  const params = new URLSearchParams();
  if (entityId) {
    params.append('entity_id', entityId);
  }

  const url = `/v1/exams/performance${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await authenticatedFetch(getApiUrl(url), {
    method: 'GET',
  });

  return response.json();
}

/**
 * Get score distribution for a specific exam
 */
export async function getExamScoreDistribution(examId: string): Promise<GetExamScoreDistributionResponse> {
  const response = await authenticatedFetch(getApiUrl(`/v1/exams/${examId}/score-distribution`), {
    method: 'GET',
  });

  return response.json();
}


/**
 * Exam API object for convenience
 */
export const examApi = {
  getRepresentativeEnrollments,
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
  getExamEnrollments,
  deleteExamEnrollment,
  createExam,
  updateExam,
  inviteStudents,
  inviteRepresentatives,
  getExamStatistics,
  getExamDetailStatistics,
  getExamLeaderboard,
  getExamTypeDistribution,
  getScoreDistribution,
  getExamPerformance,
  getExamScoreDistribution,
};

