"use client";

import type { CSSProperties, ReactNode } from "react";
import { NightSky } from "@/components/night-sky";
import {
  WaterKrathong,
  type WaterKrathongData,
} from "@/components/water-krathong";
import { roundTo } from "@/lib/round";
import { SLOT_LAYOUT, type FeedEntry } from "@/lib/use-krathong-feed";

const WAVE_PATH =
  "M0 30 Q50 12 100 30 T200 30 T300 30 T400 30 T500 30 T600 30 T700 30 T800 30 T900 30 T1000 30 T1100 30 T1200 30";

function seeded(seed: number): number {
  const value = Math.sin(seed * 53.719 + 11.31) * 24_791.317;
  return value - Math.floor(value);
}

const WATER_PARTICLES = Array.from({ length: 26 }, (_, index) => ({
  left: roundTo(seeded(index + 7) * 100),
  top: roundTo(6 + seeded(index + 17) * 90),
  size: roundTo(1 + seeded(index + 27) * 2.2),
  duration: roundTo(2.2 + seeded(index + 37) * 3.6),
  delay: roundTo(seeded(index + 47) * 4),
}));

type RiverStageProps = {
  entries: FeedEntry[];
  activeId: string | null;
  pinnedId: string | null;
  onActivate: (id: string) => void;
  onDeactivate: (id: string) => void;
  onTogglePin: (id: string) => void;
  onClearInteraction: () => void;
  /** กระทงของผู้ใช้ — หน้าแรกไม่ส่งเพื่อให้เห็นแต่กระทงของคนอื่น */
  own?: WaterKrathongData | null;
  children?: ReactNode;
};

export function RiverStage({
  entries,
  activeId,
  pinnedId,
  onActivate,
  onDeactivate,
  onTogglePin,
  onClearInteraction,
  own = null,
  children,
}: RiverStageProps) {
  return (
    <main
      className="fixed inset-0 z-40 overflow-hidden bg-[linear-gradient(to_bottom,#050818_0%,#0d1436_42%,#1a2452_52%,#0b1533_100%)] text-slate-100"
      onClick={(event) => {
        if (!(event.target as HTMLElement).closest("button")) {
          onClearInteraction();
        }
      }}
    >
      <NightSky variant="scene" />

      {/* แสงเรืองบริเวณขอบฟ้า */}
      <div className="pointer-events-none absolute inset-x-0 top-[40%] h-40 bg-[radial-gradient(ellipse_at_50%_100%,rgba(255,236,170,0.2),transparent_70%)]" />

      {/* แม่น้ำ */}
      <div className="absolute inset-x-0 bottom-0 h-[50%] overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#1c2c5e_0%,#101c42_40%,#070c21_100%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-100/60 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-amber-100/10 to-transparent" />

        {/* แสงจันทร์สะท้อนบนผิวน้ำ */}
        <div className="reflection-shimmer absolute right-[5%] top-0 h-full w-[24%] bg-[linear-gradient(to_bottom,rgba(255,247,214,0.5),rgba(255,247,214,0.12)_42%,transparent_88%)] blur-[6px] sm:right-[8%] sm:w-[20%]" />
        <div className="reflection-shimmer absolute right-[13%] top-0 h-[72%] w-[8%] bg-[linear-gradient(to_bottom,rgba(255,252,235,0.5),transparent)] blur-[3px] sm:right-[15%] sm:w-[6%]" />

        {/* คลื่นเบาๆ */}
        {[
          { top: "16%", duration: 26, opacity: 0.5 },
          { top: "40%", duration: 34, opacity: 0.36 },
          { top: "66%", duration: 44, opacity: 0.24 },
        ].map((wave) => (
          <div
            key={wave.top}
            className="wave-track h-10 sm:h-14"
            style={
              {
                top: wave.top,
                opacity: wave.opacity,
                "--wave-duration": `${wave.duration}s`,
              } as CSSProperties
            }
          >
            {[0, 1].map((copy) => (
              <svg
                key={copy}
                viewBox="0 0 1200 60"
                preserveAspectRatio="none"
                className="h-full w-1/2"
                aria-hidden="true"
              >
                <path
                  d={WAVE_PATH}
                  fill="none"
                  stroke="rgba(190,214,255,0.55)"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
            ))}
          </div>
        ))}

        {/* ประกายแสงบนผิวน้ำ */}
        {WATER_PARTICLES.map((particle, index) => (
          <span
            key={index}
            className="water-particle absolute rounded-full bg-amber-100"
            style={
              {
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                boxShadow: "0 0 6px 2px rgba(255,240,190,0.35)",
                "--particle-duration": `${particle.duration}s`,
                "--particle-delay": `${particle.delay}s`,
              } as CSSProperties
            }
          />
        ))}
      </div>

      {/* กระทงของผู้ร่วมเทศกาลคนอื่น */}
      {entries.map((entry) => {
        const slot = SLOT_LAYOUT[entry.slot];
        const isActive = activeId === entry.item.id;

        return (
          <WaterKrathong
            key={entry.item.id}
            item={entry.item}
            left={slot.left}
            top={slot.top}
            width={slot.width}
            opacity={slot.opacity}
            row={slot.row}
            zIndex={
              10 +
              slot.row * 10 +
              (isActive ? 100 : 0) +
              (entry.exiting ? 200 : 0)
            }
            active={isActive}
            pinned={pinnedId === entry.item.id}
            exiting={entry.exiting}
            exitDirection={slot.left < 50 ? -1 : 1}
            onActivate={() => onActivate(entry.item.id)}
            onDeactivate={() => onDeactivate(entry.item.id)}
            onToggle={() => onTogglePin(entry.item.id)}
          />
        );
      })}

      {/* กระทงของผู้ใช้ — อยู่แถวหน้าสุดกลางจอ */}
      {own ? (
        <WaterKrathong
          item={own}
          left={50}
          top="min(82%, calc(100% - 88px))"
          width="clamp(76px, min(22vw, 19vh), 132px)"
          opacity={1}
          row={3}
          zIndex={70 + (activeId === own.id ? 100 : 0)}
          active={activeId === own.id}
          pinned={pinnedId === own.id}
          onActivate={() => onActivate(own.id)}
          onDeactivate={() => onDeactivate(own.id)}
          onToggle={() => onTogglePin(own.id)}
        />
      ) : null}

      {children}
    </main>
  );
}
