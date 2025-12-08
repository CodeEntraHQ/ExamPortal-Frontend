/**
 * Admission Form API service
 * Handles all admission form-related operations
 */

import { authenticatedFetch, getApiUrl } from './core';

export type FieldType = 'TEXT' | 'NUMBER' | 'EMAIL' | 'PHONE' | 'GENDER' | 'DATE' | 'TEXTAREA';

export interface FormField {
  id?: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface AdmissionForm {
  id: string;
  exam_id: string;
  form_structure: FormField[];
  public_token?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAdmissionFormPayload {
  exam_id: string;
  form_structure: FormField[];
}

export interface UpdateAdmissionFormPayload {
  form_structure: FormField[];
}

export interface GetAdmissionFormResponse {
  payload: AdmissionForm;
}

export interface CreateAdmissionFormResponse {
  payload: AdmissionForm;
}

export interface UpdateAdmissionFormResponse {
  payload: AdmissionForm;
}

export interface SubmitAdmissionFormPayload {
  form_responses: Record<string, any>;
}

export interface AdmissionFormSubmission {
  id: string;
  exam_id: string;
  representative_id: string;
  form_responses: Record<string, any>;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_at: string;
}

export interface SubmitAdmissionFormResponse {
  payload: AdmissionFormSubmission;
}

export interface GetAdmissionFormSubmissionsParams {
  entity_id?: string;
  page?: number;
  limit?: number;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface AdmissionFormSubmissionListItem {
  id: string;
  exam_id: string;
  exam_title: string;
  representative_id: string | null;
  representative_name: string;
  representative_email: string;
  form_responses: Record<string, any>;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_at: string;
  updated_at: string;
}

export interface GetAdmissionFormSubmissionsResponse {
  payload: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    submissions: AdmissionFormSubmissionListItem[];
  };
}

/**
 * Get admission form for an exam
 */
export async function getAdmissionForm(examId: string): Promise<GetAdmissionFormResponse> {
  const response = await authenticatedFetch(getApiUrl(`/v1/admission-forms/${examId}`), {
    method: 'GET',
  });

  return response.json();
}

/**
 * Create an admission form
 */
export async function createAdmissionForm(
  payload: CreateAdmissionFormPayload
): Promise<CreateAdmissionFormResponse> {
  // Backend expects exam_id as URL parameter, not in body
  const { exam_id, form_structure } = payload;
  const response = await authenticatedFetch(getApiUrl(`/v1/admission-forms/${exam_id}`), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      form_structure,
    }),
  });

  return response.json();
}

/**
 * Update an admission form
 */
export async function updateAdmissionForm(
  examId: string,
  payload: UpdateAdmissionFormPayload
): Promise<UpdateAdmissionFormResponse> {
  const response = await authenticatedFetch(getApiUrl(`/v1/admission-forms/${examId}`), {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return response.json();
}

/**
 * Submit an admission form
 */
export async function submitAdmissionForm(
  examId: string,
  payload: SubmitAdmissionFormPayload
): Promise<SubmitAdmissionFormResponse> {
  const response = await authenticatedFetch(getApiUrl(`/v1/admission-forms/${examId}/submit`), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return response.json();
}

/**
 * Get admission form submissions
 */
export async function getAdmissionFormSubmissions(
  params?: GetAdmissionFormSubmissionsParams
): Promise<GetAdmissionFormSubmissionsResponse> {
  const queryParams = new URLSearchParams();
  if (params?.entity_id) queryParams.append('entity_id', params.entity_id);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.status) queryParams.append('status', params.status);

  const queryString = queryParams.toString();
  const url = `/v1/admission-forms/submissions${queryString ? `?${queryString}` : ''}`;

  const response = await authenticatedFetch(getApiUrl(url), {
    method: 'GET',
  });

  return response.json();
}

export interface UpdateSubmissionStatusPayload {
  action: 'approve' | 'reject';
  password?: string;
}

export interface UpdateSubmissionStatusResponse {
  payload: {
    id: string;
    status: string;
    user?: {
      id: string;
      email: string;
      name: string | null;
    };
    enrolled?: boolean;
  };
}

/**
 * Update submission status (approve or reject)
 */
export async function updateSubmissionStatus(
  submissionId: string,
  payload: UpdateSubmissionStatusPayload
): Promise<UpdateSubmissionStatusResponse> {
  const response = await authenticatedFetch(
    getApiUrl(`/v1/admission-forms/submissions/${submissionId}/status`),
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );

  return response.json();
}

/**
 * Get public admission form by token (no authentication required)
 */
export async function getPublicAdmissionForm(token: string): Promise<GetAdmissionFormResponse> {
  const response = await fetch(getApiUrl(`/v1/admission-forms/public/${token}`), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch admission form');
  }

  return response.json();
}

/**
 * Submit public admission form by token (no authentication required)
 */
export async function submitPublicAdmissionForm(
  token: string,
  payload: SubmitAdmissionFormPayload
): Promise<SubmitAdmissionFormResponse> {
  const response = await fetch(getApiUrl(`/v1/admission-forms/public/${token}`), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to submit admission form');
  }

  return response.json();
}

/**
 * Get public token for an exam (admin only)
 */
export async function getPublicToken(examId: string): Promise<{ payload: { public_token: string } }> {
  const response = await authenticatedFetch(getApiUrl(`/v1/admission-forms/${examId}/public-token`), {
    method: 'GET',
  });

  return response.json();
}

/**
 * Admission Form API object for convenience
 */
export const admissionFormApi = {
  getAdmissionForm,
  createAdmissionForm,
  updateAdmissionForm,
  submitAdmissionForm,
  getAdmissionFormSubmissions,
  updateSubmissionStatus,
  getPublicAdmissionForm,
  submitPublicAdmissionForm,
  getPublicToken,
};

