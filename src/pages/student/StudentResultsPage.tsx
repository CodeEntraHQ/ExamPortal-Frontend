/**
 * Student Results Page Wrapper
 * Wraps StudentExamResults to work with routing
 */

import { useParams, useNavigate } from 'react-router-dom';
import { StudentExamResults } from '../../features/exams/components/student/StudentExamResults';

export function StudentResultsPage() {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();

  if (!examId) {
    navigate('/student/dashboard');
    return null;
  }

  return (
    <StudentExamResults
      examId={examId}
      onBack={() => navigate('/student/dashboard')}
    />
  );
}

