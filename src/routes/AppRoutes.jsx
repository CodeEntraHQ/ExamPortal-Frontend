import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from '../pages/Landing.jsx'
import Login from '../pages/Login.jsx'
import Register from '../pages/Register.jsx'
import ForgotPassword from '../pages/ForgotPassword.jsx'
import Admin from '../pages/Admin.jsx'
import Student from '../pages/Student.jsx'
import AboutUs from '../pages/AboutUs.jsx'
import ContactUs from '../pages/ContactUs.jsx'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 bg-background">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/student" element={<Student />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/contact-us" element={<ContactUs />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}