import { Link, useNavigate } from "react-router-dom";

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-[70vh] flex flex-col items-center justify-center px-4 sm:px-6">
      <div className="max-w-md w-full text-center">
        
        {/* Error Icon with Brand Glow */}
        <div className="relative mb-6 flex justify-center">
          <div className="absolute inset-0 bg-[#FF007F]/20 blur-3xl rounded-full w-32 h-32 mx-auto"></div>
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="40" 
              height="40" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="text-red-500"
            >
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
              <path d="M12 9v4"/>
              <path d="M12 17h.01"/>
            </svg>
          </div>
        </div>

        {/* Error Text */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 text-white">
          Access Denied
        </h1>
        <p className="text-sm sm:text-base text-gray-400 mb-8 px-2 sm:px-0">
          You don't have the required permissions to view this page. This area is restricted to Administrators.
        </p>

        {/* Action Buttons (Matched 404 Layout) */}
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="w-full cursor-pointer flex items-center justify-center bg-transparent text-gray-300 font-bold py-3 sm:py-3.5 rounded-xl border border-white/10 text-sm sm:text-base hover:bg-white/5 hover:text-white transition-colors"
          >
            Go Back
          </button>
          <Link
            to="/dashboard"
            className="w-full flex items-center justify-center bg-[#FF007F] text-white font-bold py-3 sm:py-3.5 rounded-xl text-sm sm:text-base hover:bg-[#FF007F]/80 transition-colors shadow-[0_0_15px_rgba(255,0,127,0.3)]"
          >
            My Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}