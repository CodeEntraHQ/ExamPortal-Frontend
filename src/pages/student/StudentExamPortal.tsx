/**
 * Student Exam Portal Page
 * Lists available exams for students
 */

import { ExamPortal } from '../../features/exams/components/ExamPortal';
import { useNavigate } from 'react-router-dom';

export function StudentExamPortal() {
  const navigate = useNavigate();

  // ExamPortal doesn't have onStartExam/onViewResults props, so we'll need to check
  // For now, just render it - navigation will be handled internally if needed
  return <ExamPortal />;
}

