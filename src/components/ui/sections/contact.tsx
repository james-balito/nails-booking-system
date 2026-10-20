import SocMedCard from "../../socmed-card";

export default function Contact() {
  const contacts = [
    {
      id: 1,
      name: "Instagram",
      username: "@glossx.claw",
      description:
        "Daily set reveals and 24/7 direct messaging for quick look quotes.",
      label: "Direct Message",
      contactIcon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
      ),
      buttonIcon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-external-link"><path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></svg>
      ),
      buttonText: "Slide into DM's",
      colorButton: "#FF007F",
      borderColor: "#FF007F",
      link: "https://www.instagram.com/glossx.claw/",
    },
    {
      id: 2,
      name: "Tiktok",
      username: "@glossx.claw.ph",
      description:
        "Step into the GlossX Claw studio. Watch satisfying nail transformations, dive into gel sculpting tutorials, and catch the raw, behind-the-scenes clips of your next favorite set.",
      label: "viral inspo",
      contactIcon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
        </svg>
      ),
      buttonIcon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-external-link"><path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></svg>
      ),
      buttonText: "Watch Content",
      colorButton: "#FF007F",
      borderColor: "#FF007F",
      link: "https://www.tiktok.com/@glossx.claw.ph",
    },
  ];

  return (
    <div className="py-25">
      <div className="flex flex-col items-center">
        <span className="px-2 text-[#FF007F] flex items-center uppercase font-bold text-sm lg:text-base pb-4">
         <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-map-pin preview-icon mr-2"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>
          Social & Pin Location
        </span>
        <h1 className="playfair-display-header text-white font-bold text-2xl md:text-3xl lg:text-5xl">
          Connect <span className="text-[#FF007F] font-thin italic">& Visit</span>
        </h1>
        <p className="text-md md:text-lg xl:text-base text-gray-400/80 leading-tight text-center max-w-2xl mx-auto py-4">
          No emails, no forms, no back-and-forth fuss. Connect with us instantly
          on our socials or slide into our DMs for quick inquiries, inspo, and
          custom bookings.
        </p>
      </div>

      {/* Grid Container */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 max-w-5xl mx-auto px-6">
        
        {/* 1. MAPPED SOCIAL CARDS */}
        {contacts.map((contact) => (
          <SocMedCard
            key={contact.id}
            name={contact.name}
            description={contact.description}
            label={contact.label}
            username={contact.username}
            buttonIcon={contact.buttonIcon}
            buttonText={contact.buttonText}
            colorButton={contact.colorButton}
            borderColor={contact.borderColor}
            contactIcon={contact.contactIcon}
            link={contact.link}
          />
        ))}

        {/* 2. PIN LOCATION CONTAINER with OSM Iframe */}
        <div className="bg-[#111111] p-6 rounded-3xl border border-white/10 flex flex-col shadow-xl">
          
          {/* Header Row */}
          <div className="flex items-center justify-between mb-4">
            <span className="px-3 py-1 rounded-full border border-[#FF007F]/40 bg-[#FF007F]/10 text-[#FF007F] text-xs font-bold tracking-wider uppercase">
              Pin Location View
            </span>
            <span className="text-gray-400 text-sm flex items-center gap-1 font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>
              Bacoor, Cavite, PH
            </span>
          </div>

          {/* OpenStreetMap Iframe Frame */}
          <div className="relative w-full h-44 rounded-2xl mb-6 overflow-hidden border border-white/10 bg-[#1A1A1A]">
            <iframe
              width="100%"
              height="100%"
              src="https://www.openstreetmap.org/export/embed.html?bbox=-73.9990%2C40.7200%2C-73.9930%2C40.7240&amp;layer=mapnik&amp;marker=40.7222%2C-73.9964"
              style={{ 
                border: 0,
                filter: "grayscale(1) invert(1) contrast(1.2) brightness(0.8)" // CSS trick to make OSM dark mode
              }}
              title="Studio Location Map"
            ></iframe>
            
            {/* Studio Pill Overlay */}
            <div className="absolute top-[65%] left-1/2 -translate-x-1/2 z-10 pointer-events-none px-4 py-1.5 rounded-full bg-black/90 backdrop-blur-sm border border-white/10 text-white text-xs font-semibold shadow-lg whitespace-nowrap">
              Maison de Claws Studio
            </div>
          </div>

          {/* Address Details */}
          <div className="mb-6">
            <h3 className="text-white font-bold text-sm md:text-base mb-1">
              Blk 7, Lot 29, Camel
            </h3>
            <p className="text-gray-400 text-xs md:text-sm leading-relaxed">
              Near sundays Nontoxic Nail Studio Soho • Subway: Prince St (N, R, W) or Spring St (C, E)
            </p>
          </div>

          {/* Pink Action Button */}
          <a
            href="https://maps.google.com/?q=70+A+Spring+St+2nd+Floor+New+York+NY+10012"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto group flex items-center justify-center gap-2 w-full py-3.5 bg-[#FF007F] rounded-xl text-white text-sm font-bold uppercase tracking-wider transition-all duration-300 hover:bg-[#FF007F]/80 hover:scale-[1.02]"
          >
            Open Maps & Directions
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-200 group-hover:translate-x-1">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        </div>

      </div>
    </div>
  );
}