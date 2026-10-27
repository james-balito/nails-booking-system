import { useEffect, useRef } from "react";
import gsap from "gsap";
import Card from "../../card";

export default function Home() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);

  const cards = [
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-sparkles preview-icon"
        >
          <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" />
          <path d="M20 2v4" />
          <path d="M22 4h-4" />
          <circle cx="4" cy="20" r="2" />
        </svg>
      ),
      title: "100+",
      description: "Bespoke Nail Sets Designed",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-clock-3 preview-icon"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6h4" />
        </svg>
      ),
      title: "< 60 Seconds",
      description: "Seamless Online Booking",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-sparkles preview-icon"
        >
          <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" />
          <path d="M20 2v4" />
          <path d="M22 4h-4" />
          <circle cx="4" cy="20" r="2" />
        </svg>
      ),
      title: "100% Non-Toxic",
      description: "Damage-Free Gel Nails",
    },
  ];

  useEffect(() => {
    const tl = gsap.timeline({
      defaults: { ease: "power4.out", duration: 1.2 },
    });

    tl.fromTo(titleRef.current, { y: 50, opacity: 0 }, { y: 0, opacity: 1 })
      .fromTo(
        subRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1 },
        "-=0.8",
      )
      .fromTo(
        buttonsRef.current,
        { y: 30, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1 },
        "-=0.8",
      );
  }, []);

  return (
    <div className="relative overflow-hidden min-h-screen bg-[#0A0A0A] flex flex-col justify-center items-center border-y border-white/20 py-16 sm:py-20">
      <div className="absolute top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-[#FF007F]/40 rounded-full blur-[500px] sm:blur-[250px] pointer-events-none z-0"></div>

      <div className="relative z-10 flex flex-col items-center w-full px-4 sm:px-6 max-w-5xl mx-auto">
        <h1
          ref={titleRef}
          className="cormorant-garamond-header text-[#F9FAFB] font-semibold text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-8xl text-center pb-6 sm:pb-12 leading-[0.90] sm:leading-[0.9]"
        >
          Flawless Nails,{" "}
          <span className="text-[#FF007F] font-thin italic shadow-sm block">
            Zero Hassle
          </span>
        </h1>

        <p
          ref={subRef}
          className="poppins-caption text-[#F9FAFB]/70 text-sm sm:text-base md:text-lg lg:text-xl text-center max-w-2xl"
        >
          Slay every detail. Luxurious care and custom art for your signature
          set.
        </p>

        <div
          ref={buttonsRef}
          className="flex flex-col sm:flex-row w-full sm:w-auto items-center justify-center gap-4 sm:gap-5 mt-10 sm:mt-14"
        >
          <button
            type="button"
            className="w-full sm:w-auto flex justify-center px-6 py-4 sm:px-9 sm:py-5 items-center uppercase bg-[#FF007F] inter-subcaption text-white/90 tracking-wider font-bold rounded-3xl shadow-[0_0_30px_rgba(255,0,127,0.4)] hover:shadow-[0_0_50px_rgba(255,0,127,0.8)] hover:-translate-y-1 transition-all duration-200 cursor-pointer group"
          >
            <span className="mr-2">Book Now</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white translate-y-[-1px] group-hover:translate-x-1 transition-all duration-200"
            >
              <path d="M18 8L22 12L18 16" />
              <path d="M2 12H22" />
            </svg>
          </button>

          <a
            href="#gallery"
            className="w-full sm:w-auto flex justify-center px-6 py-4 sm:px-8 sm:py-4 items-center uppercase bg-gray-400/10 border border-white/20 text-white/90 montserrat-subcaption font-semibold rounded-3xl hover:bg-gray-400/20 transition-all duration-200 cursor-pointer group"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[#FF007F] translate-y-[-1px] group-hover:rotate-12 transition-all duration-300"
            >
              <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" />
              <path d="M20 2v4" />
              <path d="M22 4h-4" />
              <circle cx="4" cy="20" r="2" />
            </svg>
            <span className="ml-2">Explore Designs</span>
          </a>
        </div>

        {/* Added services-grid class here */}
        <div className="services-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 mt-16 md:mt-24 w-full">
          {cards.map((card, index) => (
            <Card
              key={index}
              icon={card.icon}
              title={card.title}
              description={card.description}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
