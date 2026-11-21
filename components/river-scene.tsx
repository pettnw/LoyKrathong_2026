"use client";

import { RiverStage } from "@/components/river-stage";
import type { WaterKrathongData } from "@/components/water-krathong";
import type { KrathongTypeId } from "@/lib/krathong-data";
import {
  MAX_OTHERS_PER_SCREEN,
  useKrathongFeed,
} from "@/lib/use-krathong-feed";

type RiverSceneProps = {
  name: string;
  wish: string;
  type: KrathongTypeId;
  ownKrathongId: string | null;
};

export function RiverScene({
  name,
  wish,
  type,
  ownKrathongId,
}: RiverSceneProps) {
  const feed = useKrathongFeed({
    excludeId: ownKrathongId,
    maxOthers: MAX_OTHERS_PER_SCREEN - 1,
  });
  // ใช้โดยตัวนับ "กระทงในน้ำ N อัน" ที่คอมเมนต์พักไว้ชั่วคราว
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const activeCount = feed.entries.filter((entry) => !entry.exiting).length;

  const own: WaterKrathongData = {
    id: "own",
    name,
    wish,
    krathongType: type,
    isOwn: true,
  };

  return (
    <RiverStage
      entries={feed.entries}
      activeId={feed.activeId}
      pinnedId={feed.pinnedId}
      onActivate={feed.activate}
      onDeactivate={feed.deactivate}
      onTogglePin={feed.togglePin}
      onClearInteraction={feed.clearInteraction}
      own={own}
    >
      {/* <p className="pointer-events-none absolute right-3 top-[max(0.75rem,env(safe-area-inset-top))] z-[400] text-[11px] text-slate-300/80">
        กระทงในน้ำ {activeCount + 1} อัน
      </p> */}

      <p className="pointer-events-none absolute left-3 right-24 top-[max(0.75rem,env(safe-area-inset-top))] z-[400] text-left text-[11px] leading-relaxed text-slate-300/75">
        เอาเมาส์ไปชี้หรือแตะที่กระทงเพื่อดูคำอธิษฐาน
      </p>
    </RiverStage>
  );
}
