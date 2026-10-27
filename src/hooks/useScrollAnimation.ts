import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function useScrollAnimation() {
  useEffect(() => {
    // requestAnimationFrame ensures the browser has painted the DOM before GSAP runs
    const rafId = requestAnimationFrame(() => {
      // Target the parent grid containers
      const grids = gsap.utils.toArray<HTMLElement>(
        ".services-grid, .socmed-grid, .nails-grid"
      );

      grids.forEach((grid) => {
        // Find the cards inside this specific grid
        const cards = grid.querySelectorAll(".service-card, .socmed-card, .nails-card");

        if (cards.length === 0) return;

        // Animate the cards
        gsap.fromTo(
          cards,
          { 
            y: 50, 
            opacity: 0, 
            scale: 0.95 
          },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.15, // Stagger effect
            scrollTrigger: {
              trigger: grid, // Trigger when the GRID enters view
              start: "top 85%", 
              toggleActions: "play none none none", // Play once, never reverse
            },
          }
        );
      });
    });

    // Cleanup: Cancel animation frame and kill scroll triggers when unmounting
    return () => {
      cancelAnimationFrame(rafId);
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);
}