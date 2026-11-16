"use client";

import type { CSSProperties } from "react";
import { KrathongSvg } from "@/components/krathong-svg";
import {
  KRATHONG_OPTIONS_BY_ID,
  type KrathongTypeId,
} from "@/lib/krathong-data";
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
  const travelBase = [8, 12, 16, 19][row] ?? 16;
  // ระยะขยับไม่ให้หลุดขอบจอ — กระทงใกล้ขอบจะลอยแคบลง
  const edgeSpace = Math.max(4, Math.min(left - 6, 94 - left));
  const driftDistance = roundTo(
    Math.min(travelBase, edgeSpace) *
      (seeded(`${item.id}:direction`) < 0.5 ? -1 : 1),
  );
  const driftDuration = roundTo(
    ([56, 50, 44, 37][row] ?? 44) + seeded(`${item.id}:drift`) * 8,
  );
  const driftDelay = -roundTo(seeded(`${item.id}:delay`) * driftDuration);
  const bobDuration = roundTo(7 + seeded(`${item.id}:bob`) * 4);
  const bobDelay = -roundTo(seeded(`${item.id}:bob-delay`) * bobDuration);
  const rockAngle = roundTo(1.4 + seeded(`${item.id}:rock`) * 1.4);
  const rippleDelay = -roundTo(seeded(`${item.id}:ripple`) * 5.6);

  // ป้ายชื่อ: ชื่อยาวสุด 20 ตัวอักษรต้องอ่านได้ครบใน 2 บรรทัด
  const nameLength = Array.from(item.name).length;
  const labelBaseSize = [9, 9.5, 10.5, 11.5][row] ?? 10.5;
  const labelScale =
    nameLength <= 8
      ? 1
      : nameLength <= 14
        ? 0.92
        : nameLength <= 17
          ? 0.84
          : 0.78;
  const labelFontSize = roundTo(labelBaseSize * labelScale, 2);
  // ป้ายกว้างไม่เกินระยะห่างคอลัมน์ (20vw) เพื่อไม่ทับป้ายข้างๆ
  const labelWidthClass =
    ["w-[min(7rem,16vw)]", "w-[min(8rem,18vw)]"][row] ??
    "w-[min(9rem,20vw)]";
  const typeLabel = KRATHONG_OPTIONS_BY_ID[item.krathongType]?.shortName ?? "";

  const cardBelow = row === 0;
  const cardAlign =
    left < 32
      ? "left-0"
      : left > 68
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
          "--drift-distance": `${driftDistance}vw`,
          "--drift-duration": `${driftDuration}s`,
          "--drift-delay": `${driftDelay}s`,
          "--bob-duration": `${bobDuration}s`,
          "--bob-delay": `${bobDelay}s`,
          "--rock-angle": `${rockAngle}deg`,
          "--exit-dir": exitDirection,
        } as CSSProperties
      }
    >
      <span className={exiting ? "water-exit block" : "water-enter block"}>
        <span className="water-drift block">
          <span className="water-bob block">
            <span className="relative block">
              {/* แสงสะท้อนอุ่นๆ บนผิวน้ำใต้กระทง */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-[78%] h-[22%] w-[76%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(255,236,170,0.28),transparent_70%)] blur-[5px]"
              />

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
                      "--ripple-delay": `${rippleDelay - 3.6}s`,
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
              title={item.name}
              style={{ fontSize: `${labelFontSize}px` }}
              className={`relative left-1/2 mt-1 ${labelWidthClass} -translate-x-1/2 rounded-full border px-1 py-0.5 text-center leading-tight line-clamp-2 [overflow-wrap:anywhere] backdrop-blur-[2px] ${
                item.isOwn
                  ? "border-amber-300/40 bg-amber-400/15 font-medium text-amber-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.9)]"
                  : "border-white/10 bg-[#050b18]/55 text-slate-200/90 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.9)]"
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
          className={`pointer-events-none absolute z-30 block w-44 max-w-[calc(100vw-1.5rem)] sm:w-48 ${
            cardBelow ? "top-full mt-1.5" : "bottom-full mb-1.5"
          } ${cardAlign}`}
        >
          <span className="wish-card block rounded-xl border border-amber-200/25 bg-[#06101f]/95 px-3 py-2 text-left shadow-[0_16px_40px_-16px_rgba(0,0,0,0.95)] backdrop-blur-sm">
            <span className="flex items-start justify-between gap-2">
              <span className="min-w-0 text-[11px] font-medium leading-snug text-amber-100 [overflow-wrap:anywhere]">
                {item.name}
              </span>
              {typeLabel ? (
                <span className="mt-px shrink-0 rounded-full border border-amber-200/25 bg-amber-200/10 px-1.5 py-px text-[9px] leading-relaxed text-amber-200/80">
                  {typeLabel}
                </span>
              ) : null}
            </span>
            <span className="mt-1 block border-t border-white/10 pt-1 text-[11.5px] leading-relaxed text-pretty text-amber-50/95 [overflow-wrap:anywhere]">
              {item.wish ? `“${item.wish}”` : "ไม่ได้เขียนคำอธิษฐาน"}
            </span>
          </span>
        </span>
      ) : null}
    </button>
  );
}
