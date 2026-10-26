import type React from "react";

interface SocMedCardProps {
  key: number;
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
  key,
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
      key={key}
      // 👇 Added 'h-full' to make the card stretch
      className={`bg-gray-400/10 p-10 rounded-2xl border-1 border-white/20 hover:border-[${borderColor}] transition-all duration-200 cursor-pointer flex flex-col h-full`}
    >
      <div className={`flex justify-between`}>
        <span
          className={`rounded-3xl p-3 bg-[${colorButton}] text-[${colorButton}] flex items-center justify-center `}
          style={{
            backgroundColor: `${colorButton}20`,
            boxShadow: `0 0 20px 10px ${borderColor}35`,
          }}
        >
          {contactIcon}
        </span>

        <span
          className={`uppercase inter-subcaption font-bold h-7 px-4 border bg-black border-1 text-[${colorButton}] border-[${borderColor}/20] rounded-full text-xs leading-none flex items-center justify-center`}
          style={{
            color: colorButton,
            borderColor: `${borderColor}66`,
          }}
        >
          {label}
        </span>
      </div>

      <h3 className="text-2xl playfair-display-header font-semibold text-white leading-tighter py-2">
        {name}
      </h3>

      <span
        className={`text-[${colorButton}] rounded-full text-sm leading-tight font-bold`}
      >
        {username}
      </span>

      <p className="text-sm text-gray-400/80 leading-tight pt-2">
        {description}
      </p>

      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        // 👇 Changed 'mt-3' to 'mt-auto pt-6' to push it to the bottom
        className="block w-full mt-auto pt-6 text-lg transition-all duration-200"
      >
        <span
          className={`uppercase flex items-center justify-center font-bold px-6 py-4 bg-black hover:bg-[${colorButton}] border border-white/20 hover:border-[#FF007F] rounded-2xl text-white cursor-pointer hover:text-[#FF007F] text-sm leading-none`}
        >
          {buttonText}
          <span className="ml-3">{buttonIcon}</span>
        </span>
      </a>
    </div>
  );
}
