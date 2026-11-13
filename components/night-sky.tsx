import type { CSSProperties } from "react";
import { roundTo } from "@/lib/round";

type NightSkyProps = {
  variant?: "landing" | "scene";
};

function seeded(seed: number): number {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43_758.5453;
  return value - Math.floor(value);
}

const STARS = Array.from({ length: 96 }, (_, index) => ({
  left: roundTo(seeded(index + 1) * 100),
  top: roundTo(seeded(index + 101) * 100),
  size: roundTo(1 + seeded(index + 201) * 1.9),
  opacity: roundTo(0.3 + seeded(index + 301) * 0.7),
  duration: roundTo(2.6 + seeded(index + 401) * 4.4),
  delay: roundTo(seeded(index + 501) * 5),
}));

const LANTERNS = Array.from({ length: 8 }, (_, index) => ({
  left: roundTo(4 + seeded(index + 11) * 90),
  bottom: roundTo(4 + seeded(index + 21) * 26),
  size: roundTo(7 + seeded(index + 31) * 8),
  duration: roundTo(20 + seeded(index + 41) * 16),
  delay: roundTo(seeded(index + 51) * 30),
  sway: roundTo(-12 + seeded(index + 61) * 24),
}));

export function NightSky({ variant = "landing" }: NightSkyProps) {
  const isScene = variant === "scene";
  const maxStarTop = isScene ? 54 : 68;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {/* แสงเรืองจากขอบฟ้า */}
      <div className="absolute inset-x-0 bottom-0 h-2/5 bg-[radial-gradient(ellipse_at_50%_100%,rgba(84,112,255,0.16),transparent_68%)]" />

      {/* ดาว */}
      {STARS.map((star, index) => (
        <span
          key={index}
          className="star absolute rounded-full bg-white"
          style={
            {
              left: `${star.left}%`,
              top: `${roundTo((star.top / 100) * maxStarTop)}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
              boxShadow:
                star.size > 2.2
                  ? "0 0 8px 2px rgba(226,232,255,0.55)"
                  : "0 0 4px 1px rgba(226,232,255,0.28)",
              "--twinkle-duration": `${star.duration}s`,
              "--twinkle-delay": `${star.delay}s`,
            } as CSSProperties
          }
        />
      ))}

      {/* พระจันทร์เต็มดวง */}
      <div
        className={`absolute z-0 ${
          isScene
            ? "right-[9%] top-[7%] sm:right-[11%] sm:top-[8%]"
            : "right-[8%] top-[6%] sm:right-[12%] sm:top-[8%]"
        }`}
      >
        <div className="moon-halo absolute -inset-10 rounded-full bg-[radial-gradient(circle,rgba(255,247,204,0.34),rgba(253,230,138,0.12)_45%,transparent_72%)] blur-2xl" />
        <div
          className={`relative rounded-full bg-[radial-gradient(circle_at_34%_28%,#fffef6,#fdf3c4_42%,#f6dd8d_68%,#e8bb55_100%)] shadow-[0_0_50px_18px_rgba(253,230,138,0.28)] ${
            isScene ? "h-16 w-16 sm:h-24 sm:w-24" : "h-20 w-20 sm:h-28 sm:w-28"
          }`}
        >
          <span className="absolute left-[24%] top-[30%] h-[14%] w-[14%] rounded-full bg-amber-200/45" />
          <span className="absolute left-[55%] top-[52%] h-[20%] w-[20%] rounded-full bg-amber-200/35" />
          <span className="absolute left-[38%] top-[66%] h-[10%] w-[10%] rounded-full bg-amber-200/40" />
          <span className="absolute left-[62%] top-[20%] h-[8%] w-[8%] rounded-full bg-amber-100/50" />
        </div>
      </div>

      {/* โคมลอย */}
      {LANTERNS.map((lantern, index) => (
        <span
          key={index}
          className="sky-lantern"
          style={
            {
              left: `${lantern.left}%`,
              bottom: `${lantern.bottom}%`,
              "--lantern-size": `${lantern.size}px`,
              "--lantern-duration": `${lantern.duration}s`,
              "--lantern-delay": `-${lantern.delay}s`,
              "--lantern-sway": `${lantern.sway}px`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
