const QuestionCard = ({ question }) => (
  <div className="p-8 bg-white rounded-xl">
    <div className="space-y-6">
      {/* Question header */}
      <div className="flex items-start justify-between">
        <h3 className="flex-1 text-xl font-semibold text-gray-900">
          {question.question_text}
        </h3>
        <span className="px-4 py-2 ml-4 font-semibold text-indigo-700 rounded-lg bg-indigo-50">
          {question.type}
        </span>
      </div>

      {/* Options */}
      {question.type === 'MCQ' && (
        <div className="space-y-3">
          {question.metadata.options.map((opt, idx) => (
            <div
              key={idx}
              className="flex items-center p-4 transition-colors border-2 border-gray-100 rounded-lg cursor-pointer hover:border-indigo-100 hover:bg-indigo-50/30"
            >
              <span className="flex items-center justify-center w-8 h-8 mr-4 font-medium text-gray-700 bg-gray-100 rounded-full">
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="text-gray-700">{opt}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

export default QuestionCard;
