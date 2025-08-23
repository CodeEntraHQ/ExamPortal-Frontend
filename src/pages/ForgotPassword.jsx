import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background bg-opacity-80 backdrop-blur">
      <form className="bg-neutral shadow-lg rounded-lg p-8 min-w-[320px] flex flex-col gap-4">
        <h2 className="mb-2 text-2xl font-bold text-primary">
          Forgot Password
        </h2>
        <input
          type="email"
          placeholder="Email"
          className="px-3 py-2 border rounded"
          required
        />
        <button className="px-4 py-2 rounded shadow bg-accent text-neutral hover:bg-amber-600">
          Send Reset Link
        </button>
        <div className="flex justify-between mt-2 text-sm">
          <Link to="/login" className="text-primary hover:underline">
            Back to Login
          </Link>
        </div>
      </form>
    </div>
  );
}
