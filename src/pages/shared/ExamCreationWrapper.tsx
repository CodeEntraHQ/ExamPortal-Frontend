/**
 * Exam Creation Wrapper
 * Wraps EnhancedExamCreationForm to work with routing
 */

import { useNavigate, useLocation } from 'react-router-dom';
import { EnhancedExamCreationForm } from '../../features/exams/components/EnhancedExamCreationForm';
import { useAuth } from '../../features/auth/providers/AuthProvider';

export function ExamCreationWrapper() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const entityId = location.state?.entityId || '';

  const handleSave = (examData: any) => {
    // Exam data is saved by the form component
    // Just navigate back after save
    const rolePrefix = {
      STUDENT: '/student',
      ADMIN: '/admin',
      SUPERADMIN: '/superadmin',
    }[user?.role || 'STUDENT'];

    if (user?.role === 'ADMIN') {
      navigate('/admin/entity');
    } else if (user?.role === 'SUPERADMIN' && entityId) {
      navigate(`/superadmin/entities/${entityId}`);
    } else {
      navigate(`${rolePrefix}/dashboard`);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <EnhancedExamCreationForm
      onSave={handleSave}
      onCancel={handleCancel}
      currentEntity={entityId}
    />
  );
}

