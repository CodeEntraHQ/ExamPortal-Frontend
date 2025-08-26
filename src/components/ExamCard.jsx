const ExamCard = ({ exam, onClick, children }) => (
  <div
    className="relative w-full p-6 transition-all duration-200 bg-white border border-gray-100 cursor-pointer group rounded-xl hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-100/50 hover:-translate-y-1"
    onClick={() => onClick(exam)}
  >
    <div className="absolute top-3 right-3">
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        ${
          exam.active
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}
      >
        {exam.active ? 'Active' : 'Inactive'}
      </span>
    </div>

    <div className="flex flex-col h-full">
      <h3 className="text-lg font-bold text-gray-900 transition-colors group-hover:text-indigo-600">
        {exam.title}
      </h3>

      <div className="flex items-center mt-2 text-sm text-gray-600">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
          {exam.type}
        </span>
      </div>

      <div className="pt-4 mt-auto">
        <p className="mb-3 text-xs text-gray-400">
          Created {new Date(exam.created_at).toLocaleDateString()}
        </p>
        {children}
      </div>
    </div>
  </div>
);

export default ExamCard;
