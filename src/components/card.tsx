import type React from "react";

interface CardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export default function Card({ icon, title, description }: CardProps) {
  return (
    <div className="bg-[#1A1A1A] p-15 rounded-2xl border-1 border-white/20 text-center hover:border-[#FF007F]/50 transition-colors shadow- cursor-pointer">
      <div className="w-11 h-11 rounded-full bg-[#FF007F]/20 text-[#FF007F] flex items-center justify-center mx-auto mb-3">
        {icon}
      </div>
      <h3 className="text-2xl font-serif font-bold text-white">
        {title}
      </h3>
      <p className="text-sm text-gray-400/80 leading-tight font-medium mt-1">
        {description}
      </p>
    </div>
  );
}
