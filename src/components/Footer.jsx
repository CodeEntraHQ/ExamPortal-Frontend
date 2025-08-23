import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="flex items-center justify-between px-8 h-16 bg-white/80 backdrop-blur-sm border-t border-indigo-50 shadow-lg shadow-indigo-100/10">
      <span className="text-sm font-medium bg-gradient-to-r from-slate-600 to-slate-500 bg-clip-text text-transparent">
        &copy; {new Date().getFullYear()} ExamEntra. All rights reserved.
      </span>
      <nav className="flex gap-6">
        <Link
          to="/about-us"
          className="text-primary relative group transition-colors duration-300 hover:text-indigo-700"
        >
          <span className="relative z-10">About Us</span>
          <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-indigo-200 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
        </Link>
        <Link
          to="/contact-us"
          className="text-primary relative group transition-colors duration-300 hover:text-indigo-700"
        >
          <span className="relative z-10">Contact Us</span>
          <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-indigo-200 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
        </Link>
      </nav>
    </footer>
  );
}
