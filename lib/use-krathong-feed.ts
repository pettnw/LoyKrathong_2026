"use client";

import { useEffect, useRef, useState } from "react";
import type { WaterKrathongData } from "@/components/water-krathong";
import { isKrathongTypeId, krathongClientId } from "@/lib/krathong-data";

const POLL_INTERVAL_MS = 15_000;
const EXIT_DURATION_MS = 2_600;

/**
 * จำนวนกระทงของคนอื่นสูงสุดต่อหน้าจอ
 * หน้าแรกใช้ 10 (เห็นแต่ของคนอื่น) / หน้าฉากใช้ 9 (+ กระทงของผู้ใช้ = 10)
 */
export const MAX_OTHERS_PER_SCREEN = 10;

/*
 * แต่ละแถวคือระดับความลึก: ยิ่งใกล้ยิ่งใหญ่ ชัดขึ้น และลอยเร็วขึ้น
 * ความกว้างอิงทั้ง vw และ vh เพื่อไม่ให้กระทงใหญ่เกินไปบนจอแนวนอนที่เตี้ย
 */
const ROW_STYLES = [
  { top: 54, width: "clamp(26px, min(7vw, 8.5vh), 42px)", opacity: 0.58 },
  { top: 62.5, width: "clamp(32px, min(8.4vw, 10vh), 54px)", opacity: 0.7 },
  { top: 71, width: "clamp(38px, min(9.8vw, 11.5vh), 66px)", opacity: 0.84 },
  { top: 78, width: "clamp(44px, min(11.2vw, 13vh), 78px)", opacity: 0.95 },
];

/** ตำแหน่งแนวนอนของแต่ละแถว — เหลื่อมกันเพื่อไม่ให้ดูเป็นตาราง */
const ROW_COLUMNS = [
  [21, 79],
  [12, 45, 78],
  [26, 68],
  [14, 50, 86],
];

export type FeedSlot = {
  left: number;
  top: number;
  width: string;
  opacity: number;
  row: number;
};

export const SLOT_LAYOUT: FeedSlot[] = ROW_COLUMNS.flatMap((columns, row) => {
  const style = ROW_STYLES[row];
  if (!style) return [];

  return columns.map((left) => ({
    left,
    top: style.top,
    width: style.width,
    opacity: style.opacity,
    row,
  }));
});

export type FeedEntry = {
  item: WaterKrathongData;
  slot: number;
  exiting: boolean;
};

function parseFeed(data: unknown, limit: number): WaterKrathongData[] {
  if (!Array.isArray(data)) return [];

  const items: WaterKrathongData[] = [];
  const seen = new Set<string>();
  // กันกรณีคนละคนกรอกชื่อ+คำอธิษฐาน+ชนิดกระทงเหมือนกันเป๊ะ
  const occurrences = new Map<string, number>();

  for (const entry of data) {
    if (typeof entry !== "object" || entry === null) continue;

    const record = entry as Record<string, unknown>;
    if (typeof record.name !== "string") continue;
    if (!isKrathongTypeId(record.krathongType)) continue;

    const baseId = krathongClientId(
      record.name,
      typeof record.wish === "string" ? record.wish : "",
      record.krathongType,
    );
    const duplicateIndex = occurrences.get(baseId) ?? 0;
    occurrences.set(baseId, duplicateIndex + 1);
    const id = duplicateIndex === 0 ? baseId : `${baseId}-${duplicateIndex}`;
    if (seen.has(id)) continue;

    seen.add(id);
    items.push({
      id,
      name: record.name,
      wish: typeof record.wish === "string" ? record.wish : "",
      krathongType: record.krathongType,
    });
  }

  return items.slice(0, limit);
}

/**
 * รวมกระทงใหม่เข้ากับรายการเดิมโดยไม่สลับตำแหน่ง
 * ถ้าคนอื่นครบ maxOthers อันแล้ว ให้อันเก่าสุดถูกทำเครื่องหมาย exiting
 */
function mergeEntries(
  current: FeedEntry[],
  incoming: WaterKrathongData[],
  maxOthers: number,
): { entries: FeedEntry[]; exitingIds: string[] } {
  const known = new Set(current.map((entry) => entry.item.id));
  const fresh = incoming
    .filter((item) => !known.has(item.id))
    .slice(0, maxOthers);

  if (fresh.length === 0) return { entries: current, exitingIds: [] };

  const active = current.filter((entry) => !entry.exiting);
  const overflow = Math.max(0, active.length + fresh.length - maxOthers);
  const exitingIds = active.slice(0, overflow).map((entry) => entry.item.id);
  const exitingSet = new Set(exitingIds);

  let entries = current.map((entry) =>
    exitingSet.has(entry.item.id) ? { ...entry, exiting: true } : entry,
  );

  const taken = new Set(
    entries.filter((entry) => !entry.exiting).map((entry) => entry.slot),
  );

  for (const item of fresh) {
    const slot = SLOT_LAYOUT.findIndex((_, index) => !taken.has(index));
    if (slot === -1) break;

    taken.add(slot);
    entries = [...entries, { item, slot, exiting: false }];
  }

  return { entries, exitingIds };
}

type UseKrathongFeedOptions = {
  /** ไม่ต้องแสดงกระทงนี้ในฟีด (ใช้กับกระทงของผู้ใช้เองในหน้าฉาก) */
  excludeId?: string | null;
  /** จำนวนกระทงของคนอื่นสูงสุดที่แสดงบนจอ (default 10) */
  maxOthers?: number;
};

export function useKrathongFeed({
  excludeId = null,
  maxOthers = MAX_OTHERS_PER_SCREEN,
}: UseKrathongFeedOptions = {}) {
  const [entries, setEntries] = useState<FeedEntry[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [pinnedId, setPinnedId] = useState<string | null>(null);
  const excludeIdRef = useRef(excludeId);
  const maxOthersRef = useRef(maxOthers);
  const entriesRef = useRef<FeedEntry[]>([]);

  const activeId = hoveredId ?? pinnedId;

  useEffect(() => {
    excludeIdRef.current = excludeId;
  }, [excludeId]);

  useEffect(() => {
    maxOthersRef.current = maxOthers;
  }, [maxOthers]);

  useEffect(() => {
    if (!excludeId) return;

    setEntries((prev) => {
      if (!prev.some((entry) => entry.item.id === excludeId)) return prev;

      const next = prev.filter((entry) => entry.item.id !== excludeId);
      entriesRef.current = next;
      return next;
    });
  }, [excludeId]);

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
      const limit = maxOthersRef.current;

      try {
        const response = await fetch("/LoyKrathong/api/krathong", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) return;

        const data: unknown = await response.json();
        if (cancelled) return;

        const feed = parseFeed(data, limit).filter(
          (item) => item.id !== excludeIdRef.current && !seen.has(item.id),
        );
        for (const item of feed) seen.add(item.id);

        const incoming =
          entriesRef.current.length === 0
            ? feed.slice(0, limit).reverse()
            : feed;

        const result = mergeEntries(entriesRef.current, incoming, limit);
        entriesRef.current = result.entries;
        setEntries(result.entries);

        for (const id of result.exitingIds) scheduleRemoval(id);
      } catch {
        // ฐานข้อมูลไม่พร้อมก็ไม่เป็นไร — กระทงของผู้ใช้ยังลอยได้
      } finally {
        if (!cancelled) setHasLoaded(true);
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

  const activate = (id: string) => setHoveredId(id);

  const deactivate = (id: string) =>
    setHoveredId((prev) => (prev === id ? null : prev));

  const togglePin = (id: string) =>
    setPinnedId((prev) => (prev === id ? null : id));

  const clearInteraction = () => {
    setPinnedId(null);
    setHoveredId(null);
  };

  return {
    entries,
    hasLoaded,
    activeId,
    hoveredId,
    pinnedId,
    activate,
    deactivate,
    togglePin,
    clearInteraction,
  };
}
