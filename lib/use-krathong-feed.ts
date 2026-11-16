"use client";

import { useEffect, useRef, useState } from "react";
import type { WaterKrathongData } from "@/components/water-krathong";
import { isKrathongTypeId } from "@/lib/krathong-data";

const POLL_INTERVAL_MS = 15_000;
const EXIT_DURATION_MS = 2_600;
const MAX_OTHERS = 19;

const COLUMNS = [10, 30, 50, 70, 90];

const ROW_STYLES = [
  { top: 54, width: "clamp(28px, 7vw, 42px)", opacity: 0.58 },
  { top: 62, width: "clamp(34px, 8.2vw, 52px)", opacity: 0.7 },
  { top: 70, width: "clamp(40px, 9.6vw, 62px)", opacity: 0.84 },
  { top: 77, width: "clamp(46px, 11vw, 72px)", opacity: 0.95 },
];

export type FeedSlot = {
  left: number;
  top: number;
  width: string;
  opacity: number;
  row: number;
};

export const SLOT_LAYOUT: FeedSlot[] = [
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

export type FeedEntry = {
  item: WaterKrathongData;
  slot: number;
  exiting: boolean;
};

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
  current: FeedEntry[],
  incoming: WaterKrathongData[],
): { entries: FeedEntry[]; exitingIds: string[] } {
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
};

export function useKrathongFeed({ excludeId = null }: UseKrathongFeedOptions = {}) {
  const [entries, setEntries] = useState<FeedEntry[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [pinnedId, setPinnedId] = useState<string | null>(null);
  const excludeIdRef = useRef(excludeId);
  const entriesRef = useRef<FeedEntry[]>([]);

  const activeId = hoveredId ?? pinnedId;

  useEffect(() => {
    excludeIdRef.current = excludeId;
  }, [excludeId]);

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

      try {
        const response = await fetch("/api/krathong", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) return;

        const data: unknown = await response.json();
        if (cancelled) return;

        const feed = parseFeed(data).filter(
          (item) => item.id !== excludeIdRef.current && !seen.has(item.id),
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
