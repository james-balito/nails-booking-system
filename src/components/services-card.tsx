import type React from "react";

interface CardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  tagline: string;
  onClick?: () => void;
}

export default function ServiceCard({
  icon,
  title,
  description,
  tagline,
  onClick,
}: CardProps) {
  return (
    <div 
      onClick={onClick}
      className="group flex flex-col h-full bg-black p-6 sm:p-8 lg:p-10 rounded-2xl border border-white/20 hover:border-[#FF007F]/50 transition-colors duration-300 cursor-pointer"
    >
      {/* Icon Container */}
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#FF007F]/20 text-[#FF007F] flex items-center justify-center mb-4 sm:mb-5 shrink-0">
        {icon}
      </div>

      {/* Title */}
      <h3 className="text-xl sm:text-2xl font-serif font-bold text-white mb-2">
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm text-gray-400/80 leading-relaxed font-medium">
        {description}
      </p>

      {/* Tagline (mt-auto pushes this and the button to the bottom) */}
      <span className="text-xs text-gray-400/80 leading-relaxed font-medium mt-auto pt-4 block">
        {tagline}
      </span>

      {/* Footer / Button */}
      <div className="flex justify-end mt-4 sm:mt-6 border-t border-white/20">
        <button className="flex items-center text-base sm:text-lg text-[#FF007F] font-bold pt-4 cursor-pointer hover:text-white transition-colors duration-200">
          Book
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="ml-1 transition-transform duration-300 group-hover:translate-x-1"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>
    </div>
  );
}