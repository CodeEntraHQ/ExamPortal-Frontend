import { Link } from 'react-router-dom'
import CollegeIcon from './CollegeIcon.jsx'
import profileDefault from '../assets/profile-default.svg'

export default function Header() {
  return (
    <header className="grid items-center h-16 grid-cols-3 px-8 border-b shadow-lg bg-white/80 backdrop-blur-sm border-indigo-50 shadow-indigo-100/20">
      <div className="flex items-center gap-2 group">
        <Link to="/" className="transition-transform duration-300 ease-out group-hover:scale-110">
          <CollegeIcon />
        </Link>
      </div>
      <div className="flex justify-center">
        <Link to="/" className="text-xl font-bold text-transparent transition-all duration-300 ease-in-out bg-gradient-to-r from-primary to-indigo-600 bg-clip-text hover:from-indigo-600 hover:to-primary">
          ExamEntra
        </Link>
      </div>
      <div className="flex justify-end">
        <Link to="/login" 
          className="flex items-center justify-center w-10 h-10 transition-all duration-300 ease-in-out rounded-full hover:bg-indigo-50 group">
          <img src={profileDefault} alt="Profile" 
            className="w-8 h-8 transition-all duration-300 ease-out group-hover:scale-110 group-hover:rotate-6" />
        </Link>
      </div>
    </header>
  )
}