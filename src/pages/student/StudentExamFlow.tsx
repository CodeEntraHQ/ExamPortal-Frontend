/**
 * Student Exam Flow Wrapper
 * Wraps ComprehensiveExamFlow to work with routing
 */

import { useParams, useNavigate } from 'react-router-dom';
import { ComprehensiveExamFlow } from '../../features/exams/components/student/ComprehensiveExamFlow';

export function StudentExamFlow() {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();

  if (!examId) {
    navigate('/student/dashboard');
    return null;
  }

  return (
    <ComprehensiveExamFlow
      examId={examId}
      onComplete={() => navigate('/student/dashboard')}
      onCancel={() => navigate('/student/dashboard')}
    />
  );
}

