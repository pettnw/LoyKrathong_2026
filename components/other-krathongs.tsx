import type { CSSProperties } from "react";
import { KrathongSvg } from "@/components/krathong-svg";
import type { KrathongTypeId } from "@/lib/krathong-data";
import { roundTo } from "@/lib/round";

export type RemoteKrathong = {
  id: string;
  name: string;
  krathongType: KrathongTypeId;
  createdAt: string;
};

type OtherKrathongsProps = {
  items: RemoteKrathong[];
};

function jitter(seed: number): number {
  const value = Math.sin(seed * 91.733 + 17.13) * 12_989.123;
  return value - Math.floor(value);
}

export function OtherKrathongs({ items }: OtherKrathongsProps) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-[30%] top-[44%] z-10 overflow-hidden"
    >
      {items.map((item, index) => {
        const column = index % 10;
        const row = Math.floor(index / 10) % 2;
        const left = roundTo(
          5 + column * 9.6 + (jitter(index + 3) - 0.5) * 4,
        );
        const bottom = roundTo(
          6 + row * 30 + (jitter(index + 13) - 0.5) * 8,
        );
        const driftDuration = 28 + Math.round(jitter(index + 23) * 26);
        const driftDelay = -Math.round(jitter(index + 33) * 20);
        const opacity = roundTo(0.34 + jitter(index + 43) * 0.26);

        return (
          <div
            key={item.id}
            className="absolute -translate-x-1/2"
            style={{
              left: `${left}%`,
              bottom: `${bottom}%`,
              width: "clamp(40px, 7.5vw, 66px)",
              opacity,
            }}
          >
            <div
              className="other-drift"
              style={
                {
                  "--drift-duration": `${driftDuration}s`,
                  "--drift-delay": `${driftDelay}s`,
                } as CSSProperties
              }
            >
              <KrathongSvg
                type={item.krathongType}
                className="h-auto w-full drop-shadow-[0_4px_10px_rgba(0,0,0,0.45)]"
              />
              <p className="mt-0.5 truncate text-center text-[9px] leading-tight text-slate-200/80 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                {item.name}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
