"use client";

import type { CSSProperties } from "react";
import { KrathongSvg } from "@/components/krathong-svg";
import type { KrathongTypeId } from "@/lib/krathong-data";
import { roundTo } from "@/lib/round";

export type WaterKrathongData = {
  id: string;
  name: string;
  wish: string;
  krathongType: KrathongTypeId;
  createdAt: string;
  isOwn?: boolean;
};

type WaterKrathongProps = {
  item: WaterKrathongData;
  left: number;
  top: number;
  width: string;
  opacity: number;
  zIndex: number;
  row: number;
  active: boolean;
  pinned: boolean;
  exiting?: boolean;
  exitDirection?: 1 | -1;
  onActivate: () => void;
  onDeactivate: () => void;
  onToggle: () => void;
};

function seeded(seed: string): number {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) % 100_000;
  }
  const value = Math.sin(hash * 12.9898 + 78.233) * 43_758.5453;
  return value - Math.floor(value);
}

export function WaterKrathong({
  item,
  left,
  top,
  width,
  opacity,
  zIndex,
  row,
  active,
  pinned,
  exiting = false,
  exitDirection = 1,
  onActivate,
  onDeactivate,
  onToggle,
}: WaterKrathongProps) {
  const driftDuration = 30 + Math.round(seeded(`${item.id}:drift`) * 22);
  const driftDelay = -Math.round(seeded(`${item.id}:delay`) * 20);
  const bobDuration = roundTo(4.2 + seeded(`${item.id}:bob`) * 2.6);
  const bobDelay = -Math.round(seeded(`${item.id}:bob-delay`) * 6);
  const rippleDelay = -Math.round(seeded(`${item.id}:ripple`) * 5.6);
  const cardBelow = row === 0;
  const cardAlign =
    left < 22
      ? "left-0"
      : left > 78
        ? "right-0"
        : "left-1/2 -translate-x-1/2";

  return (
    <button
      type="button"
      onClick={onToggle}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") onActivate();
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse") onDeactivate();
      }}
      onFocus={onActivate}
      onBlur={onDeactivate}
      aria-label={`กระทงของ ${item.name}${
        item.wish ? ` คำอธิษฐาน ${item.wish}` : ""
      }`}
      aria-pressed={pinned}
      className="absolute -translate-x-1/2 -translate-y-1/2 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-amber-200/80 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
      style={
        {
          left: `${left}%`,
          top: `${top}%`,
          width,
          opacity,
          zIndex,
          filter: active
            ? "drop-shadow(0 0 16px rgba(251,191,36,0.5))"
            : undefined,
          "--drift-duration": `${driftDuration}s`,
          "--drift-delay": `${driftDelay}s`,
          "--bob-duration": `${bobDuration}s`,
          "--bob-delay": `${bobDelay}s`,
          "--exit-dir": exitDirection,
        } as CSSProperties
      }
    >
      <span className={exiting ? "water-exit block" : "water-enter block"}>
        <span className="water-drift block">
          <span className="water-bob block">
            <span className="relative block">
              {/* วงน้ำกระเพื่อมรอบกระทง */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-[74%] aspect-square w-[88%] -translate-x-1/2 -translate-y-1/2"
              >
                <span
                  className="water-ripple absolute inset-0 rounded-full border border-amber-100/30"
                  style={
                    {
                      "--ripple-delay": `${rippleDelay}s`,
                    } as CSSProperties
                  }
                />
                <span
                  className="water-ripple absolute inset-0 rounded-full border border-amber-100/20"
                  style={
                    {
                      "--ripple-delay": `${rippleDelay - 2.8}s`,
                    } as CSSProperties
                  }
                />
              </span>

              <span
                className={`block origin-bottom transition-transform duration-300 ease-out ${
                  active ? "scale-110" : "scale-100"
                }`}
              >
                <KrathongSvg
                  type={item.krathongType}
                  className="h-auto w-full drop-shadow-[0_6px_16px_rgba(0,0,0,0.5)]"
                />
              </span>
            </span>

            <span
              className={`mt-0.5 block max-w-full truncate text-center text-[10px] leading-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)] sm:text-[11px] ${
                item.isOwn
                  ? "font-medium text-amber-200"
                  : "text-slate-200/85"
              }`}
            >
              {item.name}
            </span>
          </span>
        </span>
      </span>

      {/* การ์ดคำอธิษฐาน — ขึ้นตอน hover/โฟกัส/แตะ */}
      {active && !exiting ? (
        <span
          className={`pointer-events-none absolute z-30 block w-40 sm:w-44 ${
            cardBelow ? "top-full mt-1" : "bottom-full mb-1"
          } ${cardAlign}`}
        >
          <span className="wish-card block rounded-xl border border-amber-200/25 bg-[#06101f]/95 px-2.5 py-2 text-center shadow-[0_16px_40px_-16px_rgba(0,0,0,0.95)] backdrop-blur-sm">
            <span className="block text-[11px] leading-snug text-amber-50">
              {item.wish ? `“${item.wish}”` : "ไม่ได้เขียนคำอธิษฐาน"}
            </span>
          </span>
        </span>
      ) : null}
    </button>
  );
}
