import { useState } from "react";
import { Link } from "react-router-dom";
import supabase from "../config/supabaseClient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleGoogleLogin = async () => {
    setLoading(true);
    setMessage("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`, 
      },
    });
    if (error) {
      setMessage(`❌ ${error.message}`);
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { data: { user }, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(`❌ ${error.message}`);
      setLoading(false);
      return;
    }

    // 👇 Fetch the user's role directly from the database before redirecting
    if (user) {
      const { data: profile } = await supabase
        .from("user_profiles")
        .select(`*, roles ( name )`)
        .eq("id", user.id)
        .single();

      const roleName = profile?.roles?.name || "user";

      // 👇 Hard redirect based on the exact role
      if (roleName === "admin") {
        window.location.href = "/admin"; 
      } else {
        window.location.href = "/dashboard"; 
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-[#1A1A1A] border border-white/10 p-8 rounded-2xl shadow-2xl">
        <h1 className="playfair-display-header text-3xl font-bold text-center mb-2">Welcome Back</h1>
        <p className="text-gray-400 text-center text-sm mb-8">Log in to book your next set at Glossx.claw</p>

        {message && (
          <div className="p-3 mb-4 rounded-lg text-sm font-semibold text-center bg-red-500/20 text-red-400">
            {message}
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white text-black font-semibold py-3 rounded-lg hover:bg-gray-100 transition-all duration-200 disabled:opacity-50 mb-6"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className="h-px bg-white/10 flex-1"></div>
          <span className="text-gray-500 text-xs font-semibold uppercase">Or</span>
          <div className="h-px bg-white/10 flex-1"></div>
        </div>

        <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-semibold text-gray-400">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full mt-1 p-3 bg-black border border-white/10 rounded-lg focus:outline-none focus:border-[#FF007F] text-white transition-colors"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-400">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full mt-1 p-3 bg-black border border-white/10 rounded-lg focus:outline-none focus:border-[#FF007F] text-white transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full bg-[#FF007F] text-white font-bold uppercase tracking-wider py-3 rounded-lg hover:bg-[#FF007F]/80 transition-all duration-200 disabled:opacity-50"
          >
            {loading ? "Logging In..." : "Log In"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          Don't have an account? <Link to="/sign-up" className="text-[#FF007F] hover:underline">Sign Up</Link>
        </div>
      </div>
    </div>
  );
}