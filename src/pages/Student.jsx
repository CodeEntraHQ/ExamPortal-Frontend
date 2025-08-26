import ExamDashboard from '../components/ExamDashboard';

export default function Student() {
  const handleSubmitExam = () => alert('Submit Exam (API call)');

  return (
    <ExamDashboard
      role="student"
      title="My Exams"
      subtitle="View and take your assigned exams"
      onSubmitExam={handleSubmitExam}
    />
  );
}
