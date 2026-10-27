import type React from "react";

interface SocMedCardProps {
  buttonIcon: React.ReactNode;
  contactIcon: React.ReactNode;
  name: string;
  description: string;
  label: string;
  username?: string;
  buttonText: string;
  colorButton: string;
  borderColor: string;
  link: string;
}

export default function SocMedCard({
  username,
  buttonIcon,
  contactIcon,
  name,
  description,
  label,
  colorButton,
  borderColor,
  buttonText,
  link,
}: SocMedCardProps) {
  return (
    <div
      // 👇 Fixed: Removed invalid dynamic classes, added responsive padding
      className="bg-gray-400/10 p-6 sm:p-8 lg:p-10 rounded-2xl border border-white/20 transition-all duration-200 cursor-pointer flex flex-col h-full group"
      style={{
        // Use inline styles for hover border if you want it dynamic
        // Otherwise, Tailwind hover:border-[#FF007F] works fine if the color is static
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = borderColor)}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)")}
    >
      <div className="flex justify-between items-start mb-2">
        {/* Icon */}
        <span
          className="rounded-3xl p-3 flex items-center justify-center shrink-0"
          style={{
            backgroundColor: `${colorButton}20`,
            color: colorButton,
            boxShadow: `0 0 20px 10px ${borderColor}35`,
          }}
        >
          {contactIcon}
        </span>

        {/* Label */}
        <span
          className="uppercase inter-subcaption font-bold h-7 px-4 border bg-black rounded-full text-[10px] sm:text-xs leading-none flex items-center justify-center whitespace-nowrap"
          style={{
            color: colorButton,
            borderColor: `${borderColor}66`,
          }}
        >
          {label}
        </span>
      </div>

      {/* Name */}
      <h3 className="text-xl sm:text-2xl playfair-display-header font-semibold text-white leading-tight py-2">
        {name}
      </h3>

      {/* Username */}
      {username && (
        <span
          className="rounded-full text-xs sm:text-sm leading-tight font-bold"
          style={{ color: colorButton }}
        >
          {username}
        </span>
      )}

      {/* Description */}
      <p className="text-xs sm:text-sm text-gray-400/80 leading-relaxed pt-2">
        {description}
      </p>

      {/* Button (mt-auto pushes it to the bottom) */}
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full mt-auto pt-6"
      >
        <span
          className="uppercase flex items-center justify-center font-bold px-4 py-3 sm:px-6 sm:py-4 bg-black border border-white/20 rounded-2xl text-white text-xs sm:text-sm leading-none transition-all duration-300 hover:bg-[#FF007F] hover:border-[#FF007F] hover:text-white"
        >
          {buttonText}
          <span className="ml-2 sm:ml-3">{buttonIcon}</span>
        </span>
      </a>
    </div>
  );
}