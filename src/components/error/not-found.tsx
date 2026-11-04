import { Link, useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-[70vh] flex flex-col items-center justify-center px-4 sm:px-6">
      <div className="max-w-md w-full text-center">
        
        {/* 404 Graphic */}
        <div className="relative mb-6 flex justify-center">
          <div className="absolute inset-0 bg-[#FF007F]/20 blur-3xl rounded-full w-32 h-32 mx-auto"></div>
          
          <h1 className="relative text-8xl sm:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 tracking-tighter drop-shadow-2xl playfair-display-header">
            404
          </h1>
        </div>

        {/* Error Text */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 text-white">
          Page Not Found
        </h2>
        <p className="text-sm sm:text-base text-gray-400 mb-8 px-2 sm:px-0">
          Oops! The page you are looking for doesn't exist, has been moved, or is temporarily unavailable. 
        </p>

        {/* Action Buttons (Matched Unauthorized Layout) */}
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="w-full cursor-pointer flex items-center justify-center bg-transparent text-gray-300 font-bold py-3 sm:py-3.5 rounded-xl border border-white/10 text-sm sm:text-base hover:bg-white/5 hover:text-white transition-colors"
          >
            Go Back
          </button>
          <Link
            to="/"
            className="w-full flex items-center justify-center bg-[#FF007F] text-white font-bold py-3 sm:py-3.5 rounded-xl text-sm sm:text-base hover:bg-[#FF007F]/80 transition-colors shadow-[0_0_15px_rgba(255,0,127,0.3)]"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}