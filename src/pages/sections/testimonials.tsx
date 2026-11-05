import { testimonials } from "../../data/testimonials";

export default function TestimonialsSection() {
  return (
    <section className="py-20 sm:py-28 bg-[#0A0A0A] relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#FF007F]/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16">
          <div className="max-w-2xl">
            <span className="text-[#FF007F] flex items-center uppercase font-bold text-xs sm:text-sm tracking-widest mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              Client Reviews
            </span>
            <h2 className="playfair-display-header text-3xl sm:text-4xl md:text-5xl font-bold text-white">
              Trusted by the <span className="text-[#FF007F] italic font-thin">Best</span>
            </h2>
          </div>
          
          {/* Rating Summary Box */}
          <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-6 py-4 rounded-2xl shrink-0">
            <div className="text-4xl font-black text-white">5.0</div>
            <div>
              <div className="flex gap-1 text-[#FF007F] mb-1">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
              <p className="text-xs text-gray-400 font-medium">Based on 150+ reviews</p>
            </div>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.slice(0, 6).map((review, index) => {
            // Add a slight stagger visual effect for desktop
            const isStaggered = index === 1 || index === 4;
            
            return (
              <div 
                key={review.id} 
                className={`bg-[#1A1A1A]/80 backdrop-blur-sm p-8 rounded-3xl border border-white/5 hover:border-[#FF007F]/40 hover:bg-[#1A1A1A] transition-all duration-500 group flex flex-col
                  ${isStaggered ? 'lg:translate-y-8' : ''}
                `}
              >
                {/* Quote Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="text-[#FF007F]/20 mb-6 group-hover:text-[#FF007F]/40 transition-colors">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>

                {/* Quote Text */}
                <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-8 flex-grow">
                  "{review.quote}"
                </p>

                {/* Author Info */}
                <div className="flex items-center gap-4 mt-auto">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF007F]/30 to-[#FF007F]/5 border border-[#FF007F]/20 text-[#FF007F] flex items-center justify-center font-bold text-lg shrink-0">
                    {review.avatar}
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm sm:text-base">{review.name}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      {/* Tiny verified checkmark */}
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-[#FF007F]">
                        <path d="M20 6 9 17l-5-5"/>
                      </svg>
                      <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">{review.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="mt-16 lg:mt-24 text-center">
          <p className="text-gray-400 text-sm mb-4">Ready to experience the GlossX standard?</p>
          <a 
            href="#contact" 
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent border-2 border-[#FF007F]/50 text-white font-bold uppercase tracking-wider rounded-full hover:bg-[#FF007F] hover:border-[#FF007F] transition-all duration-300 group"
          >
            Book Your First Set
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform">
              <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
            </svg>
          </a>
        </div>

      </div>
    </section>
  );
}