import { useState, useEffect } from "react";
import { SplashScreen as NativeSplash } from "@capacitor/splash-screen";
import { Capacitor } from "@capacitor/core";

const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      NativeSplash.hide().catch(() => {});
    }
    
    const timer = setTimeout(() => setFadeOut(true), 1500);
    const finishTimer = setTimeout(onFinish, 2000);
    return () => {
      clearTimeout(timer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center gradient-primary transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Islamic geometric pattern SVG */}
      <div className="absolute inset-0 overflow-hidden">
        <svg
          className="absolute inset-0 w-full h-full opacity-10 animate-spin-slow"
          viewBox="0 0 400 400"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g fill="none" stroke="hsl(var(--primary-foreground))" strokeWidth="0.5">
            {[0, 45, 90, 135].map((angle) => (
              <g key={angle} transform={`rotate(${angle} 200 200)`}>
                <polygon points="200,40 240,200 200,360 160,200" />
                <polygon points="200,80 230,200 200,320 170,200" />
              </g>
            ))}
            <circle cx="200" cy="200" r="100" />
            <circle cx="200" cy="200" r="140" />
            <circle cx="200" cy="200" r="60" />
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => (
              <line
                key={angle}
                x1="200"
                y1="200"
                x2={200 + 160 * Math.cos((angle * Math.PI) / 180)}
                y2={200 + 160 * Math.sin((angle * Math.PI) / 180)}
              />
            ))}
          </g>
        </svg>
        <svg
          className="absolute inset-0 w-full h-full opacity-5 animate-spin-reverse"
          viewBox="0 0 400 400"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g fill="none" stroke="hsl(var(--primary-foreground))" strokeWidth="0.3">
            {[22.5, 67.5, 112.5, 157.5].map((angle) => (
              <g key={angle} transform={`rotate(${angle} 200 200)`}>
                <polygon points="200,60 220,200 200,340 180,200" />
              </g>
            ))}
            <circle cx="200" cy="200" r="120" />
            <circle cx="200" cy="200" r="80" />
          </g>
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center animate-fade-up">
        <div className="w-24 h-24 rounded-3xl gradient-gold flex items-center justify-center shadow-2xl mb-6">
          <span className="text-4xl">☪</span>
        </div>
        <h1 className="text-3xl font-bold font-amiri text-primary-foreground mb-2">
          الرسالة
        </h1>
        <p className="text-sm text-primary-foreground/70 font-cairo">
          Al Risala
        </p>
      </div>

      {/* Loading dots */}
      <div className="absolute bottom-20 flex gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-primary-foreground/50 animate-bounce"
            style={{ animationDelay: `${i * 200}ms` }}
          />
        ))}
      </div>
    </div>
  );
};

export default SplashScreen;
