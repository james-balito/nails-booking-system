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
}: CardProps) {
  return (
    <div className="bg-black p-10 rounded-2xl border-1 border-white/20 hover:border-[#FF007F]/50 transition-colors cursor-pointer">
      <div className="w-11 h-11 rounded-full bg-[#FF007F]/20 text-[#FF007F] flex items-center justify-center mb-3">
        {icon}
      </div>
      <h3 className="text-2xl font-serif font-bold text-white">{title}</h3>
      <p className="text-sm text-gray-400/80 leading-tight font-medium mt-1">
        {description}
      </p>

      <span className="text-xs text-gray-400/80 leading-tight font-medium mt-1 ">
        {tagline}
      </span>

      <div className ={"flex justify-end mt-3 border-t-1 border-white/20 text-lg text-[#FF007F] hover:text-white transition-all duration-200"} >
        <button className ={`flex items-center font-bold pt-4 cursor-pointer`}>
          Book{" "}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1"
            stroke-linecap="round"
            stroke-linejoin="round"
            className="lucide lucide-chevron-right preview-icon"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
