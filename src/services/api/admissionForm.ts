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
 * Admission Form API object for convenience
 */
export const admissionFormApi = {
  getAdmissionForm,
  createAdmissionForm,
  updateAdmissionForm,
};

