import { authenticatedFetch, getApiUrl } from './index';

// Interface based on backend model
export interface BackendExam {
  id: string;
  title: string;
  type: 'MCQ' | 'ONE_WORD' | 'DESCRIPTIVE' | 'HYBRID';
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

export const getExamById = async (id: string): Promise<{status: string; responseCode: string; payload: BackendExam}> => {
  const response = await authenticatedFetch(getApiUrl(`/exams/${id}`), {
    method: 'GET',
  });
  return response.json();
};

export const examApi = {
  getExams,
  getExamById
};