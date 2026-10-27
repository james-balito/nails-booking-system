import type React from "react";

interface CardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export default function Card({ icon, title, description }: CardProps) {
  return (
    <div className="bg-[#1A1A1A] p-6 sm:p-8 lg:p-10 rounded-2xl border border-white/20 text-center hover:border-[#FF007F]/50 transition-colors duration-300 cursor-pointer flex flex-col items-center h-full">
      
      {/* Icon */}
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#FF007F]/20 text-[#FF007F] flex items-center justify-center mb-4 shrink-0">
        {icon}
      </div>

      {/* Title */}
      <h3 className="text-xl sm:text-2xl font-serif font-bold text-white mb-1">
        {title}
      </h3>

      {/* Description */}
      <p className="text-xs sm:text-sm text-gray-400/80 leading-relaxed font-medium">
        {description}
      </p>

    </div>
  );
}