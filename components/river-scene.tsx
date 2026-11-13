"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { KrathongSvg } from "@/components/krathong-svg";
import { NightSky } from "@/components/night-sky";
import {
  OtherKrathongs,
  type RemoteKrathong,
} from "@/components/other-krathongs";
import { isKrathongTypeId, type KrathongTypeId } from "@/lib/krathong-data";
import { roundTo } from "@/lib/round";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

type RiverSceneProps = {
  name: string;
  wish: string;
  type: KrathongTypeId;
  ownKrathongId: string | null;
  onRestart: () => void;
};

const JOURNEY_DURATION_MS = 18_000;
const REDUCED_JOURNEY_DURATION_MS = 4_000;
const POLL_INTERVAL_MS = 15_000;

const WAVE_PATH =
  "M0 30 Q50 12 100 30 T200 30 T300 30 T400 30 T500 30 T600 30 T700 30 T800 30 T900 30 T1000 30 T1100 30 T1200 30";

function seeded(seed: number): number {
  const value = Math.sin(seed * 53.719 + 11.31) * 24_791.317;
  return value - Math.floor(value);
}

function parseKrathongList(data: unknown): RemoteKrathong[] {
  if (!Array.isArray(data)) return [];

  const items: RemoteKrathong[] = [];

  for (const entry of data) {
    if (typeof entry !== "object" || entry === null) continue;

    const record = entry as Record<string, unknown>;
    if (typeof record.id !== "string" || typeof record.name !== "string") {
      continue;
    }
    if (!isKrathongTypeId(record.krathongType)) continue;

    items.push({
      id: record.id,
      name: record.name,
      krathongType: record.krathongType,
      createdAt:
        typeof record.createdAt === "string" ? record.createdAt : "",
    });
  }

  return items.slice(0, 20);
}

const WATER_PARTICLES = Array.from({ length: 26 }, (_, index) => ({
  left: roundTo(seeded(index + 7) * 100),
  top: roundTo(6 + seeded(index + 17) * 90),
  size: roundTo(1 + seeded(index + 27) * 2.2),
  duration: roundTo(2.2 + seeded(index + 37) * 3.6),
  delay: roundTo(seeded(index + 47) * 4),
}));

export function RiverScene({
  name,
  wish,
  type,
  ownKrathongId,
  onRestart,
}: RiverSceneProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [finished, setFinished] = useState(false);
  const [others, setOthers] = useState<RemoteKrathong[]>([]);

  const journeyDuration = prefersReducedMotion
    ? REDUCED_JOURNEY_DURATION_MS
    : JOURNEY_DURATION_MS;

  useEffect(() => {
    const timeout = window.setTimeout(
      () => setFinished(true),
      journeyDuration + 800,
    );
    return () => window.clearTimeout(timeout);
  }, [journeyDuration]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    let controller: AbortController | null = null;

    const load = async () => {
      controller?.abort();
      controller = new AbortController();

      try {
        const response = await fetch("/api/krathong", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) return;

        const data: unknown = await response.json();
        const items = parseKrathongList(data).filter(
          (item) => item.id !== ownKrathongId,
        );

        if (!cancelled) setOthers(items);
      } catch {
        // ฐานข้อมูลไม่พร้อมก็ไม่เป็นไร — กระทงของผู้ใช้ยังลอยได้
      }
    };

    void load();
    const interval = window.setInterval(() => void load(), POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      controller?.abort();
      window.clearInterval(interval);
    };
  }, [ownKrathongId]);

  return (
    <main className="fixed inset-0 z-40 overflow-hidden bg-[linear-gradient(to_bottom,#050818_0%,#0d1436_42%,#1a2452_52%,#0b1533_100%)] text-slate-100">
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

      {/* กระทงของผู้ร่วมเทศกาลคนอื่นๆ */}
      <OtherKrathongs items={others} />

      {/* ข้อความอวยพรตอนเริ่ม */}
      <div className="blessing pointer-events-none absolute left-1/2 top-[max(1rem,env(safe-area-inset-top))] z-30 w-[min(92%,32rem)]">
        <div className="rounded-2xl border border-amber-200/20 bg-[#080d24]/70 px-4 py-3 text-center shadow-[0_18px_45px_-24px_rgba(0,0,0,0.9)] backdrop-blur-md">
          <p className="text-sm leading-relaxed text-amber-50/95 sm:text-base">
            “{wish}”
          </p>
          <p className="mt-1 text-[11px] text-amber-200/75 sm:text-xs">
            — {name} —
          </p>
        </div>
      </div>

      {/* กระทงของผู้ใช้ */}
      {!finished ? (
        <div
          className="krathong-journey absolute bottom-[4%] left-1/2 z-20 w-[clamp(128px,36vw,196px)]"
          style={
            {
              "--journey-duration": `${journeyDuration}ms`,
            } as CSSProperties
          }
        >
          <div className="krathong-sway">
            <div className="krathong-bob">
              <div className="krathong-tilt">
                <div className="relative">
                  <div className="krathong-aura pointer-events-none absolute -inset-7 rounded-full bg-[radial-gradient(circle,rgba(251,191,36,0.38),transparent_68%)] blur-lg" />
                  <KrathongSvg
                    type={type}
                    className="relative h-auto w-full drop-shadow-[0_12px_28px_rgba(0,0,0,0.55)]"
                  />
                  <div className="relative mt-1 text-center">
                    <span className="inline-block max-w-full truncate rounded-full border border-amber-200/30 bg-[#070b1e]/80 px-2.5 py-0.5 text-[10px] font-medium text-amber-50 shadow-sm backdrop-blur-sm sm:text-xs">
                      {name}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* ฉากจบ */}
      {finished ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="scene-finished-title"
          className="absolute inset-0 z-30 flex items-center justify-center bg-[#050818]/45 px-4 backdrop-blur-sm"
        >
          <div className="w-full max-w-sm rounded-3xl border border-amber-200/20 bg-[#0a1028]/85 px-6 py-7 text-center shadow-[0_30px_90px_-30px_rgba(0,0,0,0.95)]">
            <KrathongSvg type={type} className="mx-auto h-24 w-24" />
            <h2
              id="scene-finished-title"
              className="font-heading mt-2 text-2xl font-semibold text-amber-100"
            >
              กระทงของคุณลอยไปแล้ว
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              ขอให้คำอธิษฐานของคุณลอยไปกับสายน้ำ
              และสิ่งดีๆ กลับมาหาคุณในเร็ววัน
            </p>
            <p className="mt-1 text-xs text-amber-200/70">— {name} —</p>
            <button
              type="button"
              autoFocus
              onClick={onRestart}
              className="mt-5 w-full rounded-2xl bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 px-6 py-3 text-base font-semibold text-[#2b1a03] shadow-[0_16px_36px_-16px_rgba(251,191,36,0.85)] transition hover:brightness-110 active:scale-[0.99]"
            >
              ลอยอีกครั้ง
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}
