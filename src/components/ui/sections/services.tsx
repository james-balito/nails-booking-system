import ServiceCard from "../../services-card";

export default function Services() {
  const services = [
    {
      name: "Nail Art Designs",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          className="lucide lucide-gem preview-icon"
        >
          <path d="M10.5 3 8 9l4 13 4-13-2.5-6" />
          <path d="M17 3a2 2 0 0 1 1.6.8l3 4a2 2 0 0 1 .013 2.382l-7.99 10.986a2 2 0 0 1-3.247 0l-7.99-10.986A2 2 0 0 1 2.4 7.8l2.998-3.997A2 2 0 0 1 7 3z" />
          <path d="M2 9h20" />
        </svg>
      ),
      description:
        "From minimal chrome to complex 3D structures. We translate your Pinterest boards and wildest ideas into wearable art.",
      tagline: "Build your signature look.",
    },
    {
      name: "Nail Removal",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          className="lucide lucide-brush-cleaning preview-icon"
        >
          <path d="m16 22-1-4" />
          <path d="M19 14a1 1 0 0 0 1-1v-1a2 2 0 0 0-2-2h-3a1 1 0 0 1-1-1V4a2 2 0 0 0-4 0v5a1 1 0 0 1-1 1H6a2 2 0 0 0-2 2v1a1 1 0 0 0 1 1" />
          <path d="M19 14H5l-1.973 6.767A1 1 0 0 0 4 22h16a1 1 0 0 0 .973-1.233z" />
          <path d="m8 22 1-4" />
        </svg>
      ),
      description:
        "Whether it's gel, acrylic, or extensions, we use professional techniques to remove your set without damaging your natural nail bed.",
      tagline: "Prioritize your nail health.",
    },
  ];
  return (
    <div className={`bg-[#1A1A1A] px-95 py-25 border-y-2 border-white/10`}>
      <div className="flex flex-col items-center">
        <span className="px-2 text-[#FF007F] flex items-center uppercase font-bold text-sm lg:text-lg">
          {" "}
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
          Services
        </span>
        <h1 className="cormorant-garamond-header text-white font-medium text-2xl md:text-3xl lg:text-5xl py-4">
          Our Expertise
        </h1>

        <p className="leading-tight inter-subcaption text-[#F9FAFB]/60 text-sm md:text-base lg:text-sm text-center">
          We believe in quality over quantity. Two signature services, executed
          to absolute perfection.
        </p>
      </div>

      <div
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5 mt-10`}
      >
        {services.map((service) => (
          <ServiceCard
            icon={service.icon}
            title={service.name}
            description={service.description}
            tagline={service.tagline}
          />
        ))}
      </div>
    </div>
  );
}
