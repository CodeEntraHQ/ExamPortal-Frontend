import { useEffect, useState } from 'react';
import ExamCard from './ExamCard';
import CommonButton from './CommonButton';
import QuestionCard from './QuestionCard';
import { fetchExams, fetchQuestions } from '../services/mockApi';

const ExamDashboard = ({
  role,
  title,
  subtitle,
  onCreateExam,
  onCreateQuestion,
  onDeleteQuestion,
  onInviteStudent,
  onSubmitExam,
}) => {
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchExams({ role }).then((res) => {
      setExams(res.payload.exams);
      setLoading(false);
    });
  }, [role]);

  const handleExamClick = (exam) => {
    setSelectedExam(exam);
    setLoading(true);
    setCurrentQuestion(0); // Reset to first question
    fetchQuestions({ examId: exam.id }).then((res) => {
      setQuestions(res.payload.questions);
      setLoading(false);
    });
  };

  return (
    <div className="h-full bg-gray-50">
      {!selectedExam ? (
        <div className="h-full px-6 py-4">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-transparent bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text">
              {title}
            </h2>
            <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-[calc(100%-theme(space.24))] text-gray-500">
              Loading exams...
            </div>
          ) : (
            <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {exams.map((exam) => (
                <ExamCard key={exam.id} exam={exam} onClick={handleExamClick} />
              ))}

              {/* Create Exam Card - Only shown for admin */}
              {onCreateExam && (
                <div
                  onClick={onCreateExam}
                  className="flex flex-col items-center justify-center p-6 transition-all duration-200 border border-gray-300 border-dashed cursor-pointer group rounded-xl hover:border-indigo-300 hover:bg-indigo-50"
                >
                  <div className="flex items-center justify-center w-12 h-12 mb-2 transition-colors duration-200 border-2 border-gray-300 rounded-full group-hover:border-indigo-400">
                    <svg
                      className="w-6 h-6 text-gray-400 group-hover:text-indigo-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-600 group-hover:text-indigo-600">
                    Create New Exam
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Exam Detail View */
        <div className="flex flex-col h-full">
          {/* Top Bar */}
          <div className="px-6 py-3 bg-white border-b shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedExam(null)}
                  className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                </button>
                <h2 className="text-lg font-bold text-gray-900">
                  {selectedExam.title}
                </h2>
              </div>
              {(onCreateQuestion || onInviteStudent) && (
                <div className="flex gap-2">
                  {onInviteStudent && (
                    <CommonButton
                      color="primary"
                      className="py-1.5 text-sm"
                      onClick={onInviteStudent}
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                        />
                      </svg>
                      Invite Student
                    </CommonButton>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex gap-4 px-4 py-3 h-[calc(100%-theme(space.16))]">
            {/* Question Panel */}
            <div className="flex flex-col flex-1 h-full min-h-0 bg-white border rounded-lg shadow-sm">
              <div className="flex-1 p-4 overflow-auto">
                {questions[currentQuestion] && (
                  <QuestionCard
                    question={questions[currentQuestion]}
                    number={currentQuestion + 1}
                  />
                )}
              </div>
              <div className="flex justify-between p-3 border-t rounded-b-lg bg-gray-50">
                <CommonButton
                  color="gray"
                  className="py-1.5 text-sm"
                  onClick={() =>
                    setCurrentQuestion((prev) => Math.max(0, prev - 1))
                  }
                  disabled={currentQuestion === 0}
                >
                  ← Previous
                </CommonButton>
                {onDeleteQuestion && (
                  <CommonButton
                    color="red"
                    className="py-1.5 text-sm"
                    onClick={() =>
                      onDeleteQuestion(questions[currentQuestion]?.id)
                    }
                  >
                    Delete Question
                  </CommonButton>
                )}
                <CommonButton
                  color="gray"
                  className="py-1.5 text-sm"
                  onClick={() =>
                    setCurrentQuestion((prev) =>
                      Math.min(questions.length - 1, prev + 1),
                    )
                  }
                  disabled={currentQuestion === questions.length - 1}
                >
                  Next →
                </CommonButton>
              </div>
            </div>

            {/* Question Navigation */}
            <div className="flex flex-col w-64 h-full min-h-0 bg-white border rounded-lg shadow-sm">
              <div className="p-3 border-b">
                <h3 className="text-sm font-semibold">Questions</h3>
              </div>
              <div className="flex-1 p-3 overflow-auto">
                <div className="grid grid-cols-4 gap-2">
                  {questions.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentQuestion(idx)}
                      className={`w-8 h-8 rounded-md font-medium transition-all duration-200 text-sm
                          ${
                            currentQuestion === idx
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'bg-white border border-gray-200 text-gray-600 hover:border-indigo-300 hover:bg-indigo-50'
                          }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-3 border-t bg-gray-50">
                {role === 'admin' ? (
                  <CommonButton
                    color="green"
                    className="justify-center w-full py-1.5 text-sm"
                    onClick={onCreateQuestion}
                  >
                    Add Question
                  </CommonButton>
                ) : (
                  <CommonButton
                    color="primary"
                    className="justify-center w-full py-1.5 text-sm"
                    onClick={onSubmitExam}
                  >
                    Submit Exam
                  </CommonButton>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamDashboard;
