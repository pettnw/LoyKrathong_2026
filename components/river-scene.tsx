"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { NightSky } from "@/components/night-sky";
import {
  WaterKrathong,
  type WaterKrathongData,
} from "@/components/water-krathong";
import { isKrathongTypeId, type KrathongTypeId } from "@/lib/krathong-data";
import { roundTo } from "@/lib/round";

type RiverSceneProps = {
  name: string;
  wish: string;
  type: KrathongTypeId;
  ownKrathongId: string | null;
};

const POLL_INTERVAL_MS = 15_000;
const EXIT_DURATION_MS = 2_600;
const MAX_OTHERS = 19;

const WAVE_PATH =
  "M0 30 Q50 12 100 30 T200 30 T300 30 T400 30 T500 30 T600 30 T700 30 T800 30 T900 30 T1000 30 T1100 30 T1200 30";

const COLUMNS = [10, 30, 50, 70, 90];

const ROW_STYLES = [
  { top: 54, width: "clamp(28px, 7vw, 42px)", opacity: 0.58 },
  { top: 62, width: "clamp(34px, 8.2vw, 52px)", opacity: 0.7 },
  { top: 70, width: "clamp(40px, 9.6vw, 62px)", opacity: 0.84 },
  { top: 77, width: "clamp(46px, 11vw, 72px)", opacity: 0.95 },
];

type Slot = {
  left: number;
  top: number;
  width: string;
  opacity: number;
  row: number;
};

const SLOT_LAYOUT: Slot[] = [
  ...ROW_STYLES.slice(0, 3).flatMap((rowStyle, row) =>
    COLUMNS.map((left) => ({
      left,
      top: rowStyle.top,
      width: rowStyle.width,
      opacity: rowStyle.opacity,
      row,
    })),
  ),
  ...[8, 28, 72, 92].map((left) => ({
    left,
    top: ROW_STYLES[3].top,
    width: ROW_STYLES[3].width,
    opacity: ROW_STYLES[3].opacity,
    row: 3,
  })),
];

type WaterEntry = {
  item: WaterKrathongData;
  slot: number;
  exiting: boolean;
};

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

function parseFeed(data: unknown): WaterKrathongData[] {
  if (!Array.isArray(data)) return [];

  const items: WaterKrathongData[] = [];
  const seen = new Set<string>();

  for (const entry of data) {
    if (typeof entry !== "object" || entry === null) continue;

    const record = entry as Record<string, unknown>;
    if (typeof record.id !== "string" || typeof record.name !== "string") {
      continue;
    }
    if (!isKrathongTypeId(record.krathongType)) continue;
    if (seen.has(record.id)) continue;

    seen.add(record.id);
    items.push({
      id: record.id,
      name: record.name,
      wish: typeof record.wish === "string" ? record.wish : "",
      krathongType: record.krathongType,
      createdAt:
        typeof record.createdAt === "string" ? record.createdAt : "",
    });
  }

  return items.slice(0, 20);
}

/**
 * รวมกระทงใหม่เข้ากับรายการเดิมโดยไม่สลับตำแหน่ง
 * ถ้าคนอื่นครบ 19 อันแล้ว ให้อันเก่าสุดถูกทำเครื่องหมาย exiting
 */
function mergeEntries(
  current: WaterEntry[],
  incoming: WaterKrathongData[],
): { entries: WaterEntry[]; exitingIds: string[] } {
  const known = new Set(current.map((entry) => entry.item.id));
  const fresh = incoming
    .filter((item) => !known.has(item.id))
    .slice(0, MAX_OTHERS);

  if (fresh.length === 0) return { entries: current, exitingIds: [] };

  const active = current.filter((entry) => !entry.exiting);
  const overflow = Math.max(0, active.length + fresh.length - MAX_OTHERS);
  const exitingIds = active.slice(0, overflow).map((entry) => entry.item.id);
  const exitingSet = new Set(exitingIds);

  let entries = current.map((entry) =>
    exitingSet.has(entry.item.id) ? { ...entry, exiting: true } : entry,
  );

  const taken = new Set(
    entries.filter((entry) => !entry.exiting).map((entry) => entry.slot),
  );

  for (const item of fresh) {
    const slot = SLOT_LAYOUT.findIndex(
      (_, index) => !taken.has(index),
    );
    if (slot === -1) break;

    taken.add(slot);
    entries = [...entries, { item, slot, exiting: false }];
  }

  return { entries, exitingIds };
}

export function RiverScene({
  name,
  wish,
  type,
  ownKrathongId,
}: RiverSceneProps) {
  const [entries, setEntries] = useState<WaterEntry[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [pinnedId, setPinnedId] = useState<string | null>(null);
  const ownIdRef = useRef(ownKrathongId);
  const entriesRef = useRef<WaterEntry[]>([]);

  const activeId = hoveredId ?? pinnedId;

  useEffect(() => {
    ownIdRef.current = ownKrathongId;
  }, [ownKrathongId]);

  useEffect(() => {
    let cancelled = false;
    let controller: AbortController | null = null;
    const timers: number[] = [];
    const seen = new Set<string>();

    const scheduleRemoval = (id: string) => {
      const timer = window.setTimeout(() => {
        const next = entriesRef.current.filter(
          (entry) => entry.item.id !== id,
        );
        entriesRef.current = next;
        setEntries(next);
      }, EXIT_DURATION_MS);
      timers.push(timer);
    };

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
        if (cancelled) return;

        const feed = parseFeed(data).filter(
          (item) => item.id !== ownIdRef.current && !seen.has(item.id),
        );
        for (const item of feed) seen.add(item.id);

        const incoming =
          entriesRef.current.length === 0
            ? feed.slice(0, MAX_OTHERS).reverse()
            : feed;

        const result = mergeEntries(entriesRef.current, incoming);
        entriesRef.current = result.entries;
        setEntries(result.entries);

        for (const id of result.exitingIds) scheduleRemoval(id);
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
      for (const timer of timers) window.clearTimeout(timer);
    };
  }, []);

  const own: WaterKrathongData = {
    id: "own",
    name,
    wish,
    krathongType: type,
    createdAt: "",
    isOwn: true,
  };

  return (
    <main
      className="fixed inset-0 z-40 overflow-hidden bg-[linear-gradient(to_bottom,#050818_0%,#0d1436_42%,#1a2452_52%,#0b1533_100%)] text-slate-100"
      onClick={(event) => {
        if (!(event.target as HTMLElement).closest("button")) {
          setPinnedId(null);
          setHoveredId(null);
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
            onActivate={() => setHoveredId(entry.item.id)}
            onDeactivate={() =>
              setHoveredId((prev) =>
                prev === entry.item.id ? null : prev,
              )
            }
            onToggle={() =>
              setPinnedId((prev) =>
                prev === entry.item.id ? null : entry.item.id,
              )
            }
          />
        );
      })}

      {/* กระทงของผู้ใช้ — อยู่แถวหน้าสุดกลางจอ */}
      <WaterKrathong
        item={own}
        left={50}
        top={85}
        width="clamp(84px, 22vw, 140px)"
        opacity={1}
        row={3}
        zIndex={70 + (activeId === "own" ? 100 : 0)}
        active={activeId === "own"}
        pinned={pinnedId === "own"}
        onActivate={() => setHoveredId("own")}
        onDeactivate={() =>
          setHoveredId((prev) => (prev === "own" ? null : prev))
        }
        onToggle={() =>
          setPinnedId((prev) => (prev === "own" ? null : "own"))
        }
      />

      <p className="pointer-events-none absolute right-3 top-[max(0.75rem,env(safe-area-inset-top))] z-50 text-[11px] text-slate-300/80">
        กระทงในน้ำ {entries.filter((entry) => !entry.exiting).length + 1} อัน
      </p>

      <p className="pointer-events-none absolute left-3 right-24 top-[max(0.75rem,env(safe-area-inset-top))] z-50 text-left text-[11px] leading-relaxed text-slate-300/75">
        เอาเมาส์ไปชี้หรือแตะที่กระทงเพื่อดูคำอธิษฐาน
      </p>
    </main>
  );
}
