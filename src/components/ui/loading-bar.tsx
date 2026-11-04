import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function LoadingBar() {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "loading" | "finishing">("idle");
  const location = useLocation();

  useEffect(() => {
    // 1. Instantly show the bar at a tiny width, so it doesn't slide from 0
    setStatus("loading");
    setProgress(10);

    // 2. Smoothly trickle up to 85% while the page is loading
    const trickle = setTimeout(() => setProgress(40), 100);
    const trickle2 = setTimeout(() => setProgress(65), 300);
    const trickle3 = setTimeout(() => setProgress(85), 600);

    // 3. Finish and fade out
    const finish = setTimeout(() => {
      setProgress(100);
      setStatus("finishing");

      // Wait for the CSS transition to hit 100%, then fade out
      const fadeOut = setTimeout(() => {
        setStatus("idle");
        setProgress(0);
      }, 300); 
      
      return () => clearTimeout(fadeOut);
    }, 800);

    return () => {
      clearTimeout(trickle);
      clearTimeout(trickle2);
      clearTimeout(trickle3);
      clearTimeout(finish);
    };
  }, [location.pathname]);

  if (status === "idle") return null;

  return (
    <div className="fixed top-0 left-0 w-full z-[99999] h-1 md:h-1.5 pointer-events-none">
      <div
        className={`h-full bg-[#FF007F] shadow-[0_0_12px_rgba(255,0,127,0.9)] 
          /* 👇 The magic is in these transitions */
          transition-all ease-out
          ${status === "finishing" ? "opacity-0 duration-300" : "opacity-100 duration-500"}
        `}
        style={{ 
          width: `${progress}%`,
          // Smoothly slide the width, but only while loading
          transitionProperty: "width, opacity",
          transitionDuration: status === "finishing" ? "300ms" : "400ms",
        }}
      />
    </div>
  );
}