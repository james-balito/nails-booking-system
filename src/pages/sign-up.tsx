import { useState } from "react";
import { Link } from "react-router-dom";
import supabase from "../config/supabaseClient";

export default function SignUp() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false); // 👈 Track if email was sent

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    // We use signInWithOtp to send the Magic Link
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true, // Creates the user in the database if they don't exist
        emailRedirectTo: window.location.origin, // 👈 Redirects back to your app
        data: {
          full_name: fullName, // Saves to your profiles table via the trigger!
        },
      },
    });

    if (error) {
      setMessage(`❌ ${error.message}`);
    } else {
      setIsEmailSent(true); // Switch the UI to the "Check Email" screen
    }
    setLoading(false);
  };

  // If the email was sent, show this screen instead of the form
  if (isEmailSent) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center px-6">
        <div className="w-full max-w-md bg-[#1A1A1A] border border-white/10 p-8 rounded-2xl shadow-2xl text-center">
          <div className="text-5xl mb-4">📩</div>
          <h1 className="playfair-display-header text-3xl font-bold mb-2">Check your email</h1>
          <p className="text-gray-400 text-sm mb-6">
            We sent a magic link to <strong>{email}</strong>. Click the link in the email to instantly sign in and verify your account.
          </p>
          <button 
            onClick={() => setIsEmailSent(false)}
            className="text-[#FF007F] text-sm hover:underline"
          >
            Didn't get it? Try again.
          </button>
        </div>
      </div>
    );
  }

  // The standard form
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-[#1A1A1A] border border-white/10 p-8 rounded-2xl shadow-2xl">
        <h1 className="playfair-display-header text-3xl font-bold text-center mb-2">
          Create an Account
        </h1>
        <p className="text-gray-400 text-center text-sm mb-8">
          Sign up to book your next set at Glossx.claw
        </p>

        {message && (
          <div className="p-3 mb-4 rounded-lg text-sm font-semibold text-center bg-red-500/20 text-red-400">
            {message}
          </div>
        )}

        <form onSubmit={handleSignUp} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-semibold text-gray-400">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="Jane Doe"
              className="w-full mt-1 p-3 bg-black border border-white/10 rounded-lg focus:outline-none focus:border-[#FF007F] text-white transition-colors"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-400">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full mt-1 p-3 bg-black border border-white/10 rounded-lg focus:outline-none focus:border-[#FF007F] text-white transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full bg-[#FF007F] text-white font-bold uppercase tracking-wider py-3 rounded-lg hover:bg-[#FF007F]/80 transition-all duration-200 disabled:opacity-50"
          >
            {loading ? "Sending Link..." : "Sign Up with Magic Link"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link to="/login" className="text-[#FF007F] hover:underline">
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}