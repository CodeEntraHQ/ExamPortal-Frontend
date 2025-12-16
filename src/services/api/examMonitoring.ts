import { authenticatedFetch, getApiUrl } from './core';

export interface UpdateMonitoringPayload {
  enrollment_id: string;
  tab_switch_count?: number;
  fullscreen_exit_count?: number;
  voice_detection_count?: number;
  snapshot_media_id?: string;
  snapshot_type?: 'regular_interval' | 'multiple_face_detection' | 'no_face_detection' | 'exam_start';
}

export interface MonitoringResponse {
  payload: {
    id: string;
    enrollment_id: string;
    tab_switch_count: number;
    fullscreen_exit_count: number;
    voice_detection_count: number;
    metadata: {
      snapshots: {
        regular_interval: string[];
        multiple_face_detection: string[];
        no_face_detection: string[];
        exam_start: string | null;
      };
    };
    created_at?: string;
    updated_at?: string;
  };
}

export async function updateMonitoring(payload: UpdateMonitoringPayload): Promise<MonitoringResponse> {
  const res = await authenticatedFetch(getApiUrl('/v1/exam-monitorings'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return res.json();
}

export async function getMonitoringByEnrollment(enrollmentId: string): Promise<MonitoringResponse> {
  const res = await authenticatedFetch(getApiUrl(`/v1/exam-monitorings/${enrollmentId}`), {
    method: 'GET',
  });

  return res.json();
}

// Backward compatibility alias - maps old API to new API
export async function createMonitoring(payload: {
  enrollment_id: string;
  switch_tab_count?: number;
  fullscreen_exit_count?: number;
  exam_start_media_id?: string | null;
  metadata?: any;
}): Promise<MonitoringResponse> {
  // Map old field names to new field names
  const newPayload: UpdateMonitoringPayload = {
    enrollment_id: payload.enrollment_id,
    tab_switch_count: payload.switch_tab_count,
    fullscreen_exit_count: payload.fullscreen_exit_count,
  };

  // If exam_start_media_id is provided, add it as exam_start snapshot
  if (payload.exam_start_media_id) {
    newPayload.snapshot_media_id = payload.exam_start_media_id;
    newPayload.snapshot_type = 'exam_start';
  }

  return updateMonitoring(newPayload);
}

export interface ExamMonitoringData {
  enrollment_id: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    roll_number: string | null;
  } | null;
  enrollment_status: string;
  enrollment_created_at: string;
  monitoring: {
    id?: string;
    tab_switch_count: number;
    fullscreen_exit_count: number;
      voice_detection_count: number;
    metadata: {
      snapshots: {
        regular_interval: string[];
        multiple_face_detection: string[];
        no_face_detection: string[];
        exam_start: string | null;
      };
    };
    created_at?: string;
    updated_at?: string;
  };
}

export interface ExamMonitoringResponse {
  payload: {
    exam_id: string;
    enrollments: ExamMonitoringData[];
    total_enrollments: number;
    total_with_monitoring: number;
  };
}

export async function getMonitoringByExam(examId: string): Promise<ExamMonitoringResponse> {
  const res = await authenticatedFetch(getApiUrl(`/v1/exam-monitorings/exam/${examId}`), {
    method: 'GET',
  });

  return res.json();
}
