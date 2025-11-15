/**
 * SuperAdmin Dashboard Page
 * Main dashboard for superadmin users
 */

import { Dashboard } from '../../features/dashboard/components/Dashboard';
import { useNavigate } from 'react-router-dom';

export function SuperAdminDashboard() {
  const navigate = useNavigate();

  return (
    <Dashboard
      onNavigateToAdministration={() => navigate('/superadmin/entities')}
      onViewExamDetails={(examId: string, examName: string) => {
        navigate(`/superadmin/exam/${examId}`, { state: { examName } });
      }}
      onStartExam={(examId: string) => {
        // SuperAdmin doesn't take exams, but handle gracefully
        console.log('SuperAdmin cannot take exams');
      }}
      onViewResults={(examId: string) => {
        // SuperAdmin doesn't view student results from dashboard
        console.log('SuperAdmin results view');
      }}
    />
  );
}

