import { Link } from "react-router-dom";

export default function Login() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-[#1A1A1A] border border-white/10 p-8 rounded-2xl shadow-2xl">
        <h1 className="playfair-display-header text-3xl font-bold text-center mb-2">
          Welcome Back
        </h1>
        <p className="text-gray-400 text-center text-sm mb-8">
          Log in to book your next set at Glossx.claw
        </p>

        {/* Placeholder Form */}
        <form className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-semibold text-gray-400">Email</label>
            <input 
              type="email" 
              placeholder="you@example.com"
              className="w-full mt-1 p-3 bg-black border border-white/10 rounded-lg focus:outline-none focus:border-[#FF007F] text-white transition-colors"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-400">Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              className="w-full mt-1 p-3 bg-black border border-white/10 rounded-lg focus:outline-none focus:border-[#FF007F] text-white transition-colors"
            />
          </div>
          <button 
            type="button"
            className="mt-4 w-full bg-[#FF007F] text-white font-bold uppercase tracking-wider py-3 rounded-lg hover:bg-[#FF007F]/80 transition-all duration-200"
          >
            Sign In
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          Don't have an account?{" "}
          <Link to="/sign-up" className="text-[#FF007F] hover:underline">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}