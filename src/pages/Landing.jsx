import { useNavigate } from 'react-router-dom'

export default function Landing() {
  const navigate = useNavigate()
  
  return (
    <section className="relative h-[calc(100vh-8rem)] bg-gradient-to-br from-blue-100 via-indigo-50 to-sky-100 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[10px]">
          {/* Floating orbs */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-300/40 rounded-full blur-2xl animate-float1"></div>
          <div className="absolute top-3/4 left-1/3 w-96 h-96 bg-indigo-400/40 rounded-full blur-2xl animate-float2"></div>
          <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-primary/30 rounded-full blur-2xl animate-float3"></div>
        </div>
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-100/40 via-transparent to-transparent"></div>
      
      {/* Content Container */}
      <div className="relative z-10 flex items-center h-full">
        <div className="max-w-2xl px-8 ml-16">
          <h1 className="mb-6 text-5xl font-extrabold leading-tight text-transparent bg-gradient-to-r from-primary to-indigo-600 bg-clip-text">
            Welcome to Your College Exam Portal
          </h1>
          <p className="mb-8 text-lg text-slate-600">
            A secure and modern platform for conducting exams and quizzes online. 
            Simple, reliable, and designed to keep the focus on learning.
          </p>
          <div className="flex gap-4">
            <button 
              onClick={() => navigate('/login')}
              className="px-8 py-3 text-lg font-semibold text-white bg-primary 
                border-2 border-primary/20
                shadow-[4px_4px_0px_0px] shadow-indigo-600
                transition-all duration-200 
                hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px] hover:shadow-indigo-600
                active:translate-x-[4px] active:translate-y-[4px] active:shadow-none">
              Login
            </button>
            <button 
              onClick={() => navigate('/register')}
              className="px-8 py-3 text-lg font-semibold text-primary bg-white
                border-2 border-primary
                shadow-[4px_4px_0px_0px] shadow-primary
                transition-all duration-200
                hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px]
                active:translate-x-[4px] active:translate-y-[4px] active:shadow-none">
              Register
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
