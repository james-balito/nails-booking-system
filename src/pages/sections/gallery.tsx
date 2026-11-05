import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import NailsCard from "../../components/nails-card";
import { nailsImages as images } from "../../assets/nails";

export default function Gallery() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [visibleCount, setVisibleCount] = useState(12); // 👈 Increased initial count to fit 4-column rows

  // Create a ref to target the specific grid container
  const gridRef = useRef<HTMLDivElement>(null);

  const categories = ["All", ...new Set(images.map((image) => image.category))];

  const filteredImages =
    activeFilter === "All"
      ? images
      : images.filter((image) => image.category === activeFilter);

  const visibleImages = filteredImages.slice(0, visibleCount);

  const handleFilterChange = (category: string) => {
    setActiveFilter(category);
    setVisibleCount(12); // Reset to 12 when filter changes
  };

  // The Fix: This ensures animations work on Load More AND Filter changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!gridRef.current) return;

      const cardsToAnimate = gridRef.current.querySelectorAll(
        ".nails-card.opacity-0"
      );

      if (cardsToAnimate.length > 0) {
        gsap.to(cardsToAnimate, {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.6,
          ease: "power3.out",
          stagger: 0.1,
          onComplete: () => {
            cardsToAnimate.forEach((card) =>
              card.classList.remove("opacity-0")
            );
          },
        });
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [visibleCount, activeFilter]);

  return (
    <div className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-10 xl:px-16 max-w-[1600px] mx-auto">
      <div className="flex flex-col items-center">
        {/* Top Label */}
        <span className="px-2 text-[#FF007F] flex items-center uppercase font-bold text-xs sm:text-sm lg:text-base">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-sparkles preview-icon mr-2"
          >
            <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" />
            <path d="M20 2v4" />
            <path d="M22 4h-4" />
            <circle cx="4" cy="20" r="2" />
          </svg>
          Nail Designs Gallery
        </span>

        {/* Header */}
        <h1 className="cormorant-garamond-header text-white font-medium text-2xl sm:text-3xl md:text-4xl lg:text-5xl py-4 text-center">
          The Glossx.Claw Collections
        </h1>
        <p className="leading-tight inter-subcaption text-[#F9FAFB]/60 text-sm sm:text-base text-center max-w-2xl">
          Explore our latest handcrafted custom sets. Click any look to inspect
          the design specs or book it directly for your next appointment.
        </p>

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center items-center py-8 sm:py-10 gap-2 sm:gap-3">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleFilterChange(category)}
              className={`px-4 py-1.5 sm:px-6 sm:py-2 border rounded-full transition-all duration-300 cursor-pointer ${
                activeFilter === category
                  ? "bg-[#FF007F] border-[#FF007F] text-white shadow-[0_0_35px_rgba(255,0,127,0.5)]"
                  : "border-white/20 bg-[#F9FAFB]/10 text-[#F9FAFB]/70 hover:bg-[#F9FAFB]/20"
              }`}
            >
              <span className="leading-tight font-bold text-xs sm:text-sm">
                {category === "All" ? "All Sets" : category}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 👇 Gallery Grid Updated to 4 Columns */}
      <div
        ref={gridRef}
        className="nails-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8"
      >
        {visibleImages.map((image) => (
          <NailsCard
            key={image.id}
            img={image.img}
            title={image.title}
            description={image.description}
            category={image.category}
          />
        ))}
      </div>

      {/* Load More / Show All Buttons */}
      {visibleCount < filteredImages.length && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10 xl:mt-16 mb-10">
          <button
            onClick={() => setVisibleCount(visibleCount + 8)} // 👈 Increased load more to 8 to fill 2 rows of 4
            className="group flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-3.5 bg-[#FF007F] text-white text-xs sm:text-sm font-bold uppercase tracking-widest rounded-full transition-all duration-300 hover:bg-[#ff1a8c] hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(255,0,127,0.5)] cursor-pointer"
          >
            Load More Looks
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="group-hover:translate-y-0.5 transition-transform duration-300"
            >
              <path d="M12 5v14M19 12l-7 7-7-7" />
            </svg>
          </button>

          <button
            onClick={() => setVisibleCount(filteredImages.length)}
            className="w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-3.5 bg-transparent border border-white/20 text-[#F9FAFB]/70 hover:text-white hover:border-white/50 text-xs sm:text-sm font-semibold uppercase tracking-widest rounded-full transition-all duration-300 cursor-pointer"
          >
            Show All
          </button>
        </div>
      )}

      {/* Custom Design Request Banner */}
      <div className="p-6 sm:p-8 lg:p-10 mt-10 rounded-3xl lg:rounded-[2rem] border border-white/20 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 lg:gap-0 bg-white/5">
        <div className="max-w-2xl">
          <span className="text-[#FF007F] flex items-center uppercase font-bold text-xs sm:text-sm lg:text-base mb-1">
            Custom Design Request
          </span>

          <h1 className="playfair-display-header text-white text-lg sm:text-xl md:text-2xl lg:text-3xl py-2">
            Have a Pinterest board or photo reference?
          </h1>
          <p className="text-white/60 font-thin text-xs sm:text-sm md:text-base">
            Upload your design idea in our booking portal for an exact quote.
          </p>
        </div>

        <div className="w-full lg:w-auto shrink-0">
          <button className="w-full lg:w-auto flex items-center justify-center gap-2 px-6 py-3 sm:px-8 sm:py-3.5 bg-[#FF007F] text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-full transition-all duration-300 shadow-[0_0_25px_rgba(255,0,127,0.5)] hover:bg-[#ff1a8c] hover:shadow-[0_0_40px_rgba(255,0,127,0.5)] cursor-pointer">
            Book Custom Inspo Set
          </button>
        </div>
      </div>
    </div>
  );
}