interface NailsCardProps {
  key: number;
  category: string;
  title: string;
  description: string;
  img: string;
}

export default function NailsCard({
  key,
  title,
  img,
  description,
  category,
}: NailsCardProps) {
  return (
    <div>
      <div
        key={key}
        className="flex flex-col rounded-2xl overflow-hidden border-2 border-white/10 hover:border-2 hover:border-[#FF007F]/50 group transition-all duration-300 cursor-pointer"
      >
        <img
          src={img}
          alt={category}
          className="w-full h-64 object-cover block group-hover:scale-105 transition-all duration-300"
        />

        <div className="p-8">
          <span className="text-white/60 flex items-center font-bold text-sm leading-tight">
            {category}
          </span>

          <h1 className="cormorant-garamond-header text-white text-2xl md:text-xl lg:text-2xl py-2 group-hover:text-[#FF007F] transition-all duration-200">
            {title}
          </h1>

          <span className="text-white/60 flex items-center font-thin text-sm tracking-wider border-b-[0.5px] border-white/20 pb-5">
            {description}
          </span>

          <div className={`flex justify-between items-center pt-5`}>
            <span className={`text-white/60 flex items-center font-bold text-sm`}>Details</span>

            <button
              className={`flex items-center gap-2 px-8 py-3.5 bg-[#FF007F] text-white text-sm font-bold uppercase tracking-widest rounded-full transition-all duration-300 hover:bg-[#ff1a8c] hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(255,0,127,0.5)] cursor-pointer`}
            >
              Book Look{" "}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="10 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                className="lucide lucide-move-right preview-icon -mr-2"
              >
                <path d="M18 8L22 12L18 16" />
                <path d="M2 12H22" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
