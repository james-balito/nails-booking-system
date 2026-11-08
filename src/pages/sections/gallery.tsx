import { useState, useEffect, useRef, useMemo } from "react";
import gsap from "gsap";
import NailsCard from "../../components/nails-card";
import { nailsImages as images } from "../../assets/nails";

// 1. Define the interface for the selected nail
interface NailData {
  id: number;
  img: string;
  title: string;
  description: string;
  shape: string;
  colors: string[];
  designs: string[];
}

export default function Gallery() {
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [visibleCount, setVisibleCount] = useState(12);
  
  // 2. State for the Modal
  const [selectedNail, setSelectedNail] = useState<NailData | null>(null);

  const gridRef = useRef<HTMLDivElement>(null);

  const allShapes = useMemo(
    () => Array.from(new Set(images.map((img) => img.shape))),
    []
  );
  
  const allColors = useMemo(
    () => Array.from(new Set(images.flatMap((img) => img.colors))),
    []
  );
  
  const allDesigns = useMemo(
    () => Array.from(new Set(images.flatMap((img) => img.designs))),
    []
  );

  const filteredImages = images.filter((image) => {
    if (selectedFilters.length === 0) return true;
    return selectedFilters.every((filterValue) => {
      if (image.shape === filterValue) return true;
      if (image.colors.includes(filterValue)) return true;
      if (image.designs.includes(filterValue)) return true;
      return false;
    });
  });

  const visibleImages = filteredImages.slice(0, visibleCount);

  const toggleFilter = (value: string) => {
    setSelectedFilters(
      (prev) =>
        prev.includes(value)
          ? prev.filter((item) => item !== value)
          : [...prev, value]
    );
    setVisibleCount(12);
  };

  // GSAP Animation
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!gridRef.current) return;
      const cardsToAnimate = gridRef.current.querySelectorAll(".nails-card.opacity-0");

      if (cardsToAnimate.length > 0) {
        gsap.to(cardsToAnimate, {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.6,
          ease: "power3.out",
          stagger: 0.1,
          onComplete: () =>
            cardsToAnimate.forEach((card) => card.classList.remove("opacity-0")),
        });
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [visibleCount, selectedFilters]);

  return (
    <div className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-10 xl:px-16 max-w-[1600px] mx-auto relative">
      
      {/* 3. Render the Modal if a nail is selected */}
      {selectedNail && (
        <div 
          role = "dialog"
          aria-modal="true"
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedNail(null)}
          />
          
          {/* Modal Content */}
          <div className="relative w-full max-w-4xl bg-[#0A0A0A] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in-95 duration-200">
            
            {/* Close Button */}
            <button 
              onClick={() => setSelectedNail(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-gray-400 hover:text-white rounded-full backdrop-blur-md transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
            </button>

            {/* Left Side: Image */}
            <div className="w-full md:w-1/2 aspect-[3/4] md:aspect-auto bg-[#1A1A1A]">
              <img 
                src={selectedNail.img} 
                alt={selectedNail.title} 
                className="w-full h-full object-cover"
              />
            </div>

            {/* Right Side: Details */}
            <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col">
              <span className="text-[#FF007F] text-xs font-bold uppercase tracking-widest mb-2">Design Details</span>
              <h2 className="cormorant-garamond-header text-3xl sm:text-4xl font-bold text-white mb-4">
                {selectedNail.title}
              </h2>
              <p className="text-gray-400 text-sm sm:text-base leading-relaxed mb-8">
                {selectedNail.description}
              </p>

              {/* Tags Breakdown */}
              <div className="space-y-4 mb-8">
                <div>
                  <span className="block text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Shape</span>
                  <span className="inline-block px-3 py-1 bg-white/5 border border-white/10 rounded-md text-sm text-white">
                    {selectedNail.shape}
                  </span>
                </div>
                <div>
                  <span className="block text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Colors</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedNail.colors.map((color, i) => (
                      <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-md text-sm text-white">
                        {color}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="block text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Designs</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedNail.designs.map((design, i) => (
                      <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-md text-sm text-white">
                        {design}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button className="mt-auto w-full bg-[#FF007F] text-white font-bold uppercase tracking-wider py-4 rounded-xl hover:bg-[#ff1a8c] transition-all duration-300 shadow-[0_0_20px_rgba(255,0,127,0.3)]">
                Book This Look
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col items-center mb-12">
        <span className="px-2 text-[#FF007F] flex items-center uppercase font-bold text-xs sm:text-sm lg:text-base">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles preview-icon mr-2">
            <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" />
          </svg>
          Nail Designs Gallery
        </span>
        <h1 className="cormorant-garamond-header text-white font-medium text-2xl sm:text-3xl md:text-4xl lg:text-5xl py-4 text-center">
          The Glossx.Claw Collections
        </h1>
        <p className="leading-tight inter-subcaption text-[#F9FAFB]/60 text-sm sm:text-base text-center max-w-2xl">
          Explore our latest handcrafted custom sets. Click any look to inspect
          the design specs or book it directly for your next appointment.
        </p>
      </div>

      {/* Filter UI Area */}
      <div className="w-full bg-transparent border border-white/10 p-6 sm:p-8 rounded-3xl mb-12 shadow-2xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h3 className="text-white font-bold text-lg">Filter Designs</h3>
            <p className={`${selectedFilters.length > 0 ? "hidden" : "block"} text-[#F9FAFB]/60 text-sm`}>
              Use filter to easily find your perfect look
            </p>
            {selectedFilters.length > 0 && (
              <p className="text-xs text-gray-400 mt-1">
                Showing {filteredImages.length} results for selected filters
              </p>
            )}
          </div>
          {selectedFilters.length > 0 && (
            <button
              onClick={() => setSelectedFilters([])}
              className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
            >
              Clear All Filters
            </button>
          )}
        </div>

        {/* Active Filter Badges */}
        {selectedFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {selectedFilters.map((filter) => (
              <span
                key={filter}
                className="flex items-center gap-1 bg-[#FF007F]/20 text-[#FF007F] px-3 py-1 rounded-full text-xs font-bold uppercase"
              >
                {filter}
                <button onClick={() => toggleFilter(filter)} className="hover:text-white ml-1">×</button>
              </span>
            ))}
          </div>
        )}

        {/* Dropdowns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SearchableDropdown title="Shapes" options={allShapes} selected={selectedFilters} onToggle={toggleFilter} />
          <SearchableDropdown title="Colors" options={allColors} selected={selectedFilters} onToggle={toggleFilter} />
          <SearchableDropdown title="Designs" options={allDesigns} selected={selectedFilters} onToggle={toggleFilter} />
        </div>
      </div>

      {/* Gallery Grid */}
      <div ref={gridRef} className="nails-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
        {visibleImages.map((image) => (
          <NailsCard
            key={image.id}
            img={image.img}
            title={image.title}
            description={image.description}
            shape={image.shape}
            colors={image.colors}
            designs={image.designs}
            onClick={() => setSelectedNail(image)} // Triggers the modal
          />
        ))}
      </div>

      {/* No Results State */}
      {filteredImages.length === 0 && (
        <div className="text-center py-20">
          <h3 className="text-white text-2xl font-bold mb-2">No designs found</h3>
          <p className="text-gray-400">Try clearing some filters to see more results.</p>
        </div>
      )}

      {/* Load More */}
      {visibleCount < filteredImages.length && (
        <div className="flex justify-center mt-10">
          <button
            onClick={() => setVisibleCount(visibleCount + 8)}
            className="px-8 py-3.5 bg-[#FF007F] text-white text-sm font-bold uppercase tracking-widest rounded-full hover:bg-[#ff1a8c] transition-all"
          >
            Load More Looks
          </button>
        </div>
      )}
    </div>
  );
}

// Searchable Dropdown Component
function SearchableDropdown({
  title,
  options,
  selected,
  onToggle,
}: {
  title: string;
  options: string[];
  selected: string[];
  onToggle: (val: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedInThisDropdown = selected.filter((item) => options.includes(item));

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-[#FF007F] text-xs font-bold uppercase tracking-widest mb-2">
        {title}
      </label>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-black/50 border border-white/10 text-white text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-[#FF007F] transition-colors"
      >
        <span className="truncate pr-2">
          {selectedInThisDropdown.length > 0
            ? selectedInThisDropdown.join(", ")
            : `Select ${title}...`}
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-[#1A1A1A] border border-white/10 rounded-lg shadow-2xl overflow-hidden">
          <div className="p-2 border-b border-white/10">
            <input
              type="text"
              placeholder={`Search ${title}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FF007F]"
            />
          </div>

          <div className="max-h-60 overflow-y-auto p-2 flex flex-col gap-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <label key={option} className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selected.includes(option)}
                    onChange={() => onToggle(option)}
                    className="accent-[#FF007F] w-4 h-4"
                  />
                  <span className="text-sm text-gray-300">{option}</span>
                </label>
              ))
            ) : (
              <div className="text-center text-gray-500 text-sm py-4">No options found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}