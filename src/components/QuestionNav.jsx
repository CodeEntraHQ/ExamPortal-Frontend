export default function QuestionNav({
  questions,
  currentQuestion,
  onQuestionChange,
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {questions.map((q, index) => (
        <button
          key={q.id}
          onClick={() => onQuestionChange(index)}
          className={`w-10 h-10 rounded-lg font-medium transition-all duration-200 
            ${
              currentQuestion === index
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white border-2 border-gray-200 text-gray-600 hover:border-indigo-300 hover:bg-indigo-50'
            }`}
        >
          {index + 1}
        </button>
      ))}
    </div>
  );
}
