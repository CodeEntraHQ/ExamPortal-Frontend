import { Link } from 'react-router-dom'

export default function Register() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background bg-opacity-80 backdrop-blur">
      <form className="bg-neutral shadow-lg rounded-lg p-8 min-w-[320px] flex flex-col gap-4">
        <h2 className="mb-2 text-2xl font-bold text-primary">Register</h2>
        <input type="text" placeholder="Name" className="px-3 py-2 border rounded" required />
        <input type="email" placeholder="Email" className="px-3 py-2 border rounded" required />
        <input type="password" placeholder="Password" className="px-3 py-2 border rounded" required />
        <select className="px-3 py-2 border rounded" required>
          <option value="">Select Role</option>
          <option value="student">Student</option>
          <option value="admin">Admin</option>
        </select>
        <button className="px-4 py-2 rounded shadow bg-primary text-neutral hover:bg-indigo-600">Register</button>
        <div className="flex justify-between mt-2 text-sm">
          <Link to="/login" className="text-accent hover:underline">Already have an account?</Link>
        </div>
      </form>
    </div>
  )
}