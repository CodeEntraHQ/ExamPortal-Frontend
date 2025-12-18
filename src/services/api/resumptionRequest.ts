/**
 * Resumption Request API service
 * Handles resumption request operations for ongoing exams
 */

import { authenticatedFetch, getApiUrl } from './core';

export interface ResumptionRequest {
  id: string;
  enrollment_id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requested_at: string;
  approved_at?: string;
  rejected_at?: string;
  rejection_reason?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface RequestResumptionResponse {
  payload: {
    request_id: string;
    status: string;
    requested_at: string;
  };
}

export interface GetResumptionRequestResponse {
  payload: {
    has_request: boolean;
    request_id?: string;
    status?: string;
    requested_at?: string;
    approved_at?: string;
    rejected_at?: string;
    rejection_reason?: string;
  };
}

export interface GetPendingResumptionRequestsResponse {
  payload: {
    requests: ResumptionRequest[];
  };
}

export interface ApproveResumptionResponse {
  payload: {
    request_id: string;
    status: string;
    approved_at: string;
    enrollment_id: string;
  };
}

export interface RejectResumptionResponse {
  payload: {
    request_id: string;
    status: string;
    rejected_at: string;
    rejection_reason?: string;
    enrollment_id: string;
  };
}

/**
 * Request resumption for an ongoing exam
 */
export async function requestResumption(enrollmentId: string): Promise<RequestResumptionResponse> {
  const res = await authenticatedFetch(getApiUrl('/v1/resumption-requests/request'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ enrollment_id: enrollmentId }),
  });
  return res.json();
}

/**
 * Get resumption request status for an enrollment
 */
export async function getResumptionRequest(enrollmentId: string): Promise<GetResumptionRequestResponse> {
  const res = await authenticatedFetch(getApiUrl(`/v1/resumption-requests/${enrollmentId}`));
  return res.json();
}

/**
 * Get all pending resumption requests for an exam (admin only)
 */
export async function getPendingResumptionRequests(examId: string): Promise<GetPendingResumptionRequestsResponse> {
  const res = await authenticatedFetch(getApiUrl(`/v1/resumption-requests/exam/${examId}/pending`));
  return res.json();
}

/**
 * Approve a resumption request (admin only)
 */
export async function approveResumption(requestId: string): Promise<ApproveResumptionResponse> {
  const res = await authenticatedFetch(getApiUrl('/v1/resumption-requests/approve'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ request_id: requestId }),
  });
  return res.json();
}

/**
 * Reject a resumption request (admin only)
 */
export async function rejectResumption(requestId: string, rejectionReason?: string): Promise<RejectResumptionResponse> {
  const res = await authenticatedFetch(getApiUrl('/v1/resumption-requests/reject'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      request_id: requestId,
      rejection_reason: rejectionReason,
    }),
  });
  return res.json();
}

/**
 * Invalidate an approved resumption request (student only)
 * Called when student exits the exam, requiring a new request for next resumption
 */
export async function invalidateResumptionRequest(enrollmentId: string): Promise<{ payload: { message: string } }> {
  const res = await authenticatedFetch(getApiUrl('/v1/resumption-requests/invalidate'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ enrollment_id: enrollmentId }),
  });
  return res.json();
}

