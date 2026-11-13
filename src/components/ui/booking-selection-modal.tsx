import { useEffect } from "react";

interface BookingSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChooseGallery: () => void;
  onChooseCustom: () => void;
}

export default function BookingSelectionModal({
  isOpen,
  onClose,
  onChooseGallery,
  onChooseCustom,
}: BookingSelectionModalProps) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-[#0A0A0A] border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-bold text-white playfair-display-header">How would you like to book?</h2>
            <p className="text-gray-400 text-sm mt-1">Choose an existing design or create something custom.</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/5 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
          </button>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
          
          {/* Option 1: Gallery */}
          <button 
            onClick={onChooseGallery}
            className="group flex flex-col items-center justify-center p-8 bg-[#1A1A1A] border border-white/10 rounded-2xl hover:border-[#FF007F]/50 hover:bg-[#FF007F]/5 transition-all text-center gap-4"
          >
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-[#FF007F] group-hover:bg-[#FF007F]/20 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg mb-1">Choose a Design</h3>
              <p className="text-xs text-gray-400">Browse our curated collection of nail sets and book directly.</p>
            </div>
          </button>

          {/* Option 2: Custom */}
          <button 
            onClick={onChooseCustom}
            className="group flex flex-col items-center justify-center p-8 bg-[#1A1A1A] border border-white/10 rounded-2xl hover:border-[#FF007F]/50 hover:bg-[#FF007F]/5 transition-all text-center gap-4"
          >
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-[#FF007F] group-hover:bg-[#FF007F]/20 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg mb-1">Custom Inspo Set</h3>
              <p className="text-xs text-gray-400">Have a Pinterest board? Upload it and we'll bring it to life.</p>
            </div>
          </button>

        </div>
      </div>
    </div>
  );
}3