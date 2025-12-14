import { authenticatedFetch, getApiUrl } from './core';

export interface CreateMonitoringPayload {
  enrollment_id: string;
  switch_tab_count?: number;
  fullscreen_exit_count?: number;
  exam_start_media_id?: string | null;
  metadata?: any;
}

export async function createMonitoring(payload: CreateMonitoringPayload) {
  const res = await authenticatedFetch(getApiUrl('/v1/exam-monitorings'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return res.json();
}

export async function getMonitoringByEnrollment(enrollmentId: string) {
  const res = await authenticatedFetch(getApiUrl(`/v1/exam-monitorings/${enrollmentId}`), {
    method: 'GET',
  });

  return res.json();
}
