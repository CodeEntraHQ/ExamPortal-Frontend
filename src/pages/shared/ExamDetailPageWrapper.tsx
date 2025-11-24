/**
 * Exam Detail Page Wrapper
 * Wraps ExamDetailPage component to work with routing
 */

import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ExamDetailPage } from '../../features/exams/components/ExamDetailPage';
import { useAuth } from '../../features/auth/providers/AuthProvider';

export function ExamDetailPageWrapper() {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const examName = location.state?.examName || 'Exam';
  const entityId = location.state?.entityId || '';
  const entityName = location.state?.entityName || '';
  const editMode = location.state?.editMode || false;

  if (!examId) {
    navigate(-1);
    return null;
  }

  // Determine back navigation based on user role
  const getBackHandlers = () => {
    const rolePrefix = {
      STUDENT: '/student',
      ADMIN: '/admin',
      SUPERADMIN: '/superadmin',
      REPRESENTATIVE: '/representative',
    }[user?.role || 'STUDENT'];

    return {
      onBackToEntity: () => {
        if (entityId) {
          if (user?.role === 'ADMIN') {
            navigate('/admin/entity');
          } else if (user?.role === 'SUPERADMIN') {
            navigate(`/superadmin/entities/${entityId}`);
          }
        } else {
          navigate(`${rolePrefix}/dashboard`);
        }
      },
      onBackToEntities: () => {
        if (user?.role === 'ADMIN') {
          navigate('/admin/entity');
        } else if (user?.role === 'SUPERADMIN') {
          navigate('/superadmin/entities');
        } else {
          navigate(`${rolePrefix}/dashboard`);
        }
      },
      onBackToDashboard: () => {
        navigate(`${rolePrefix}/dashboard`);
      },
    };
  };

  const handlers = getBackHandlers();

  return (
    <ExamDetailPage
      examId={examId}
      examName={examName}
      entityId={entityId}
      entityName={entityName}
      editMode={editMode}
      {...handlers}
    />
  );
}

