import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../../config/supabaseClient"; // Adjust path if needed

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LogoutModal({ isOpen, onClose }: LogoutModalProps) {
  const navigate = useNavigate();

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onClose();
    navigate("/");
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div 
        className="relative w-full max-w-sm bg-[#1A1A1A] border border-white/10 rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Icon */}
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-red-500"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" x2="9" y1="12" y2="12" />
          </svg>
        </div>

        {/* Text */}
        <h2 className="text-xl font-bold text-white text-center mb-2">
          Log Out
        </h2>
        <p className="text-gray-400 text-sm text-center mb-8">
          Are you sure you want to log out? You will need to sign in again to access your dashboard.
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 text-white font-bold py-3 rounded-xl hover:bg-red-600 transition-colors"
          >
            Yes, Log Out
          </button>
          <button
            onClick={onClose}
            className="w-full bg-transparent text-white font-bold py-3 rounded-xl border border-white/20 hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}