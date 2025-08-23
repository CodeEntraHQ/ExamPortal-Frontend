import { Link } from 'react-router-dom'

export default function Login() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background bg-opacity-80 backdrop-blur">
      <form className="bg-neutral shadow-lg rounded-lg p-8 min-w-[320px] flex flex-col gap-4">
        <h2 className="mb-2 text-2xl font-bold text-primary">Login</h2>
        <input type="email" placeholder="Email" className="px-3 py-2 border rounded" required />
        <input type="password" placeholder="Password" className="px-3 py-2 border rounded" required />
        <button className="px-4 py-2 rounded shadow bg-primary text-neutral hover:bg-indigo-600">Login</button>
        <div className="flex justify-between mt-2 text-sm">
          <Link to="/register" className="text-accent hover:underline">Register a new account</Link>
          <Link to="/forgot-password" className="text-error hover:underline">Forgot password?</Link>
        </div>
      </form>
    </div>
  )
}