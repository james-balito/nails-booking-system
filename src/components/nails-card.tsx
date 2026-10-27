interface NailsCardProps {
  title: string;
  description: string;
  img: string;
  category: string;
}

export default function NailsCard({
  title,
  img,
  description,
  category,
}: NailsCardProps) {
  return (
    <div
      // 👇 Added "nails-card opacity-0" for GSAP targeting
      className="nails-card flex flex-col rounded-2xl overflow-hidden border-2 border-white/10 hover:border-[#FF007F]/50 group transition-all duration-300 cursor-pointer h-full bg-[#0A0A0A] animate-in fade-in slide-in-from-bottom-4"
    >
      {/* Image Container */}
      <div className="overflow-hidden relative w-full">
        <img
          src={img}
          alt={category}
          className="w-full h-48 sm:h-56 md:h-64 lg:h-72 object-cover block group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Content Container */}
      <div className="p-5 sm:p-6 md:p-7 lg:p-8 flex flex-col flex-graow">
        {/* Category */}
        <span className="text-white/60 font-bold text-xs sm:text-sm uppercase tracking-wider mb-2">
          {category}
        </span>

        {/* Title */}
        <h1 className="cormorant-garamond-header text-white text-xl sm:text-2xl md:text-2xl lg:text-3xl mb-3 group-hover:text-[#FF007F] transition-colors duration-200 line-clamp-1">
          {title}
        </h1>

        {/* Description */}
        <span className="text-white/60 font-thin text-xs sm:text-sm tracking-wider border-b-[0.5px] border-white/20 pb-5 mb-5 line-clamp-2">
          {description}
        </span>

        {/* Footer (Details & Button) */}
        <div className="flex justify-between items-center mt-auto gap-2">
          <span className="text-white/60 font-bold text-xs sm:text-sm">
            Details
          </span>

          <button className="flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 md:px-8 py-2 sm:py-3 bg-[#FF007F] text-white text-xs sm:text-sm font-bold uppercase tracking-wider sm:tracking-widest rounded-full transition-all duration-300 hover:bg-[#ff1a8c] hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(255,0,127,0.5)] whitespace-nowrap">
            Book Look
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
