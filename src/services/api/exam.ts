import { authenticatedFetch, getApiUrl } from './index';

// Interface based on backend model
export interface BackendExam {
  id: string;
  title: string;
  type: 'EXAM' | 'QUIZ';
  active: boolean;
  created_at: string;
  duration_seconds: number;
  metadata?: any;
  user_id?: string;
  entity_id: string;
}

export interface ExamResponse {
  status: string;
  responseCode: string;
  payload: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    exams: BackendExam[];
  };
}

export const getExams = async (page = 1, limit = 10, entityId?: string): Promise<ExamResponse> => {
  let url = `/exams?page=${page}&limit=${limit}`;
  if (entityId) {
    url += `&entity_id=${entityId}`;
  }
  
  const response = await authenticatedFetch(getApiUrl(url), {
    method: 'GET',
  });
  return response.json();
};

export interface CreateExamPayload {
  title: string;
  type: 'EXAM' | 'QUIZ';
  duration_seconds: number;
  metadata?: {
    totalMarks: number;
    passingMarks: number;
    instructions: string[];
  };
  entity_id?: string;
}

export const createExam = async (payload: CreateExamPayload): Promise<{status: string; responseCode: string; payload: BackendExam}> => {
  console.log('Creating exam with payload:', payload);
  const response = await authenticatedFetch(getApiUrl('/exams'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  return response.json();
};

export interface UpdateExamPayload {
  title?: string;
  type?: 'EXAM' | 'QUIZ';
  duration_seconds?: number;
  metadata?: {
    totalMarks?: number;
    passingMarks?: number;
    instructions?: string[];
    description?: string;
    startDate?: string;
    endDate?: string;
  };
  active?: boolean;
}

export const updateExam = async (examId: string, payload: UpdateExamPayload): Promise<{status: string; responseCode: string; payload: BackendExam}> => {
  console.log('Updating exam with payload:', payload);
  // Clean the examId by removing any potential suffix like ":1" or other colon-separated values
  const cleanedExamId = examId.split(':')[0].trim();
  console.log('Updating exam with cleaned ID:', cleanedExamId);
  const response = await authenticatedFetch(getApiUrl(`/exams/${cleanedExamId}`), {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  return response.json();
};

// Backend Question interface based on backend model
export interface BackendQuestion {
  id: string;
  question_text: string;
  type: 'MCQ' | 'OTHER';
  metadata?: any;
  created_at: string;
}

export interface QuestionsResponse {
  status: string;
  responseCode: string;
  payload: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    questions: BackendQuestion[];
  };
}

export interface CreateQuestionPayload {
  exam_id: string;
  question_text: string;
  type: 'MCQ' | 'OTHER';
  metadata?: any;
}

export interface UpdateQuestionPayload {
  question_text?: string;
  type?: 'MCQ' | 'OTHER';
  metadata?: any;
}

export const getQuestions = async (examId: string, page = 1, limit = 10): Promise<QuestionsResponse> => {
  // Clean the examId by removing any potential suffix like ":1"
  // Backend validation requires limit to be between 1 and 10
  const validLimit = Math.min(Math.max(limit, 1), 10);
  const cleanedExamId = examId.split(':')[0].trim();
  const url = `/exams/question?exam_id=${cleanedExamId}&page=${page}&limit=${validLimit}`;
  
  const response = await authenticatedFetch(getApiUrl(url), {
    method: 'GET',
  });
  return response.json();
};

export const createQuestion = async (payload: CreateQuestionPayload): Promise<{status: string; responseCode: string; payload: {id: string}}> => {
  console.log('Creating question with payload:', payload);
  const response = await authenticatedFetch(getApiUrl('/exams/question'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  return response.json();
};

export const updateQuestion = async (questionId: string, payload: UpdateQuestionPayload): Promise<{status: string; responseCode: string; payload: BackendQuestion}> => {
  console.log('Updating question with payload:', payload);
  // Clean the questionId by removing any potential suffix
  const cleanedQuestionId = questionId.split(':')[0].trim();
  const response = await authenticatedFetch(getApiUrl(`/exams/question/${cleanedQuestionId}`), {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  return response.json();
};

export const deleteQuestion = async (questionId: string): Promise<{status: string; responseCode: string; payload: {id: string}}> => {
  console.log('Deleting question with ID:', questionId);
  // Clean the questionId by removing any potential suffix
  const cleanedQuestionId = questionId.split(':')[0].trim();
  const response = await authenticatedFetch(getApiUrl(`/exams/question/${cleanedQuestionId}`), {
    method: 'DELETE',
  });
  return response.json();
};

export const inviteStudents = async (payload: { examId: string; entityId?: string; emails: string[] }) => {
  console.log('Inviting students with payload:', payload);
  // Backend expects snake_case keys: exam_id and entity_id
  const cleanedExamId = (payload.examId || '').split(':')[0].trim();
  const body = {
    exam_id: cleanedExamId,
    student_emails: payload.emails,
  };

  const response = await authenticatedFetch(getApiUrl('/exams/invite'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return response.json();
};

export interface EnrollmentStatus {
  UPCOMING: 'UPCOMING';
  ONGOING: 'ONGOING';
  COMPLETED: 'COMPLETED';
}

export interface StudentEnrollment {
  id: string;
  exam_id: string;
  user_id: string;
  status: 'UPCOMING' | 'ONGOING' | 'COMPLETED';
  enrollment_created_at: string;
  exam: BackendExam;
  result: {
    id: string;
    score: number;
    metadata: any;
    created_at: string;
  } | null;
}

export interface StudentEnrollmentsResponse {
  status: string;
  responseCode: string;
  payload: {
    total: number;
    ongoing: StudentEnrollment[];
    upcoming: StudentEnrollment[];
    completed: StudentEnrollment[];
    all: StudentEnrollment[];
  };
}

export const getStudentEnrollments = async (): Promise<StudentEnrollmentsResponse> => {
  const response = await authenticatedFetch(getApiUrl('/exams/enrollments'), {
    method: 'GET',
  });
  return response.json();
};

export const getExamById = async (examId: string): Promise<{status: string; responseCode: string; payload: BackendExam}> => {
  const cleanedExamId = examId.split(':')[0].trim();
  const response = await authenticatedFetch(getApiUrl(`/exams/${cleanedExamId}`), {
    method: 'GET',
  });
  return response.json();
};

export const examApi = {
  getExams,
  getExamById,
  createExam,
  updateExam,
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  inviteStudents,
  getStudentEnrollments,
};