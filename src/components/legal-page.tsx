import React, { useEffect } from "react";

interface LegalPageProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

export default function LegalPage({
  title,
  lastUpdated,
  children,
  isOpen,
  onClose,
}: LegalPageProps) {
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

  return (
    // Backdrop overlay
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm transition-opacity"
      onClick={onClose} // Click outside to close
    >
      {/* Chat Modal Container */}
      <div 
        className="relative w-full max-w-4xl h-[80vh] flex flex-col bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()} // Prevent close when clicking inside
      >
        
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 bg-[#111111] border-b border-white/10 shrink-0">
          <div>
            <h2 className="text-white font-bold text-lg">{title}</h2>
            <p className="text-[#FF007F] text-xs font-semibold tracking-wider uppercase mt-1">
              Last Updated: {lastUpdated}
            </p>
          </div>
          
          {/* Close Button */}
          <button 
            onClick={onClose}
            className=" cursor-pointer p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-x preview-icon"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        {/* Scrollable Chat Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm md:text-base leading-relaxed text-gray-300 
          [&>h2]:text-md [&>h2]:text-white [&>h2]:font-bold [&>h2]:mt-6 [&>h2]:mb-2 
          [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-2 [&>strong]:text-white
          [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full">
          {children}
        </div>

        {/* Chat Footer (Optional, but makes it look more like an app) */}
        <div className="p-4 bg-[#111111] border-t border-white/10 shrink-0 flex justify-end">
          <button 
            onClick={onClose}
            className="cursor-pointer px-6 py-2 bg-[#FF007F] hover:bg-[#FF007F]/80 text-white text-sm font-bold rounded-lg transition-colors"
          >
            I Understand
          </button>
        </div>

      </div>
    </div>
  );
}