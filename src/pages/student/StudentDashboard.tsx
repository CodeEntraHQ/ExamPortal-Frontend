/**
 * Student Dashboard Page
 * Main dashboard for student users
 */

import { EnhancedStudentDashboard } from '../../features/dashboard/components/EnhancedStudentDashboard';
import { useNavigate } from 'react-router-dom';

export function StudentDashboard() {
  const navigate = useNavigate();

  return (
    <EnhancedStudentDashboard
      onStartExam={(examId: string) => {
        navigate(`/student/exam/${examId}`);
      }}
      onViewResults={(examId: string) => {
        navigate(`/student/results/${examId}`);
      }}
    />
  );
}

