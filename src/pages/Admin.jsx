import ExamDashboard from '../components/ExamDashboard';

export default function Admin() {
  // Stub handlers
  const handleCreateExam = () => alert('Create Exam (API call)');
  const handleCreateQuestion = () => alert('Create Question (API call)');
  const handleDeleteQuestion = () => alert('Delete Question (API call)');
  const handleInviteStudent = () => alert('Invite Student (API call)');

  return (
    <ExamDashboard
      role="admin"
      title="Exam Dashboard"
      subtitle="Manage your exams and assessments"
      onCreateExam={handleCreateExam}
      onCreateQuestion={handleCreateQuestion}
      onDeleteQuestion={handleDeleteQuestion}
      onInviteStudent={handleInviteStudent}
    />
  );
}
