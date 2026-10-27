import SocMedCard from "../../socmed-card";

export default function Contact() {
  const contacts = [
    {
      id: 1,
      name: "Instagram",
      username: "@glossx.claw",
      description:
        "Daily set reveals and 24/7 direct messaging for quick look quotes.",
      label: "Direct Bookings",
      contactIcon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 sm:w-10 sm:h-10">
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
      label: "Content & Tutorials",
      contactIcon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 sm:w-10 sm:h-10">
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
    <div className="py-16 sm:py-20 lg:py-24">
      <div className="flex flex-col items-center px-4 sm:px-6">
        <span className="px-2 text-[#FF007F] flex items-center uppercase font-bold text-xs sm:text-sm lg:text-base pb-4">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="mr-2"
          >
            <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          Our Socials
        </span>
        
        <h1 className="playfair-display-header text-white font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-center">
          Connect <span className="text-[#FF007F] font-thin italic">with Me</span>
        </h1>
        
        <p className="text-sm sm:text-base lg:text-lg text-gray-400/80 leading-relaxed text-center max-w-2xl mx-auto py-4">
          No emails, no forms, no back-and-forth fuss. Connect with us instantly
          on our socials or slide into our DMs for quick inquiries, inspo, and
          custom bookings.
        </p>
      </div>

      {/* Grid Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 pt-6 max-w-5xl mx-auto px-4 sm:px-6">
        
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

      </div>
    </div>
  );
}