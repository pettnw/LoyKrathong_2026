"use client";

import { RiverStage } from "@/components/river-stage";
import { useKrathongFeed } from "@/lib/use-krathong-feed";

type HomeSceneProps = {
  onStart: () => void;
};

function LotusIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 20c-3.6 0-6.5-2.1-7.8-5.1 2.2-1.2 5-1.3 7.8.2 2.8-1.5 5.6-1.4 7.8-.2C18.5 17.9 15.6 20 12 20Z" />
      <path d="M12 15.1c-1.5-2.1-1.6-4.9-.3-7.3.4-.8 1.1-1.3 1.6-1.8.5.5 1.2 1 1.6 1.8 1.3 2.4 1.2 5.2-.3 7.3" />
      <path d="M6.9 13.3c.3-2.4 1.7-4.4 3.8-5.6M17.1 13.3c-.3-2.4-1.7-4.4-3.8-5.6" />
    </svg>
  );
}

export function HomeScene({ onStart }: HomeSceneProps) {
  const feed = useKrathongFeed();
  const activeCount = feed.entries.filter((entry) => !entry.exiting).length;

  return (
    <RiverStage
      entries={feed.entries}
      activeId={feed.activeId}
      pinnedId={feed.pinnedId}
      onActivate={feed.activate}
      onDeactivate={feed.deactivate}
      onTogglePin={feed.togglePin}
      onClearInteraction={feed.clearInteraction}
    >
      <div className="pointer-events-none absolute inset-x-0 top-[max(1rem,env(safe-area-inset-top))] z-[400] flex flex-col items-center gap-2.5 px-4 text-center">
        <header className="fade-in-up">
          <p className="inline-flex items-center gap-2 rounded-full border border-amber-200/20 bg-amber-200/10 px-3 py-1 text-[10px] font-medium tracking-wide text-amber-100/90 sm:text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-300 shadow-[0_0_8px_2px_rgba(252,211,77,0.6)]" />
            เทศกาลลอยกระทง
          </p>
          <h1 className="font-heading mt-2 bg-gradient-to-b from-amber-50 via-amber-200 to-amber-400 bg-clip-text text-4xl font-bold leading-tight text-transparent drop-shadow-[0_0_28px_rgba(251,191,36,0.25)] sm:text-5xl">
            ลอยกระทง
          </h1>
          <p className="mx-auto mt-1.5 max-w-xs text-[11px] leading-relaxed text-slate-300/85 sm:text-xs">
            กระทงของคนอื่นกำลังลอยอยู่ในสายน้ำ
            แตะที่กระทงเพื่ออ่านคำอธิษฐาน
          </p>
        </header>

        {feed.hasLoaded && activeCount === 0 ? (
          <p className="pointer-events-none rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] text-slate-300/80">
            ยังไม่มีกระทงในน้ำ — มาเป็นคนแรกกัน
          </p>
        ) : null}
      </div>

      {/* <p className="pointer-events-none absolute right-3 top-[max(0.75rem,env(safe-area-inset-top))] z-[400] text-[11px] text-slate-300/80">
        {feed.hasLoaded ? `กระทงในน้ำ ${activeCount} อัน` : "กำลังโหลดกระทง..."}
      </p> */}

      <div className="pointer-events-none absolute inset-x-0 bottom-[max(1.25rem,env(safe-area-inset-bottom))] z-[410] flex justify-center px-4">
        <button
          type="button"
          onClick={onStart}
          className="pointer-events-auto flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 px-7 py-3.5 text-base font-semibold text-[#2b1a03] shadow-[0_18px_40px_-14px_rgba(251,191,36,0.9)] transition hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050818]"
        >
          <LotusIcon className="h-5 w-5" />
          ลอยกระทง
        </button>
      </div>
    </RiverStage>
  );
}
