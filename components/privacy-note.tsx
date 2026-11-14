"use client";

import { useEffect, useId, useRef, useState } from "react";

const PRIVACY_POINTS = [
  "เก็บข้อมูล: ชื่อที่กรอก (ไม่เกิน 20 ตัวอักษร) คำอธิษฐาน (ไม่เกิน 30 ตัวอักษร) ชนิดกระทง และเวลาที่ลอย — เก็บไว้ในฐานข้อมูลของเว็บนี้",
  "เปิดเผยต่อสาธารณะ: ชื่อและคำอธิษฐานจะแสดงบนหน้าเว็บให้ทุกคนที่เข้ามาเห็น (คำอธิษฐานขึ้นเมื่อ hover หรือแตะกระทง) จึงไม่ควรใส่ข้อมูลติดต่อหรือเรื่องที่เป็นความลับ",
  "ไม่เก็บ: ไม่มีระบบสมัครสมาชิก ไม่เก็บอีเมลหรือเบอร์โทร และไม่ใช้คุกกี้เพื่อการติดตามหรือโฆษณา",
  "IP address: ใช้ชั่วคราวในหน่วยความจำเพื่อจำกัดการลอย 5 ครั้ง/นาที และหายไปเมื่อรีสตาร์ตเซิร์ฟเวอร์",
  "การลบข้อมูล: ยังไม่มีปุ่มลบในเว็บ หากต้องการให้ลบข้อมูล ติดต่อผู้ดูแลเว็บนี้",
];

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function PrivacyNote() {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      closeRef.current?.focus();
    } else if (wasOpen.current) {
      wasOpen.current = false;
      triggerRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }

      if (event.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;

      const nodes = panel.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (nodes.length === 0) return;

      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || !panel.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <>
      <span aria-hidden="true" className="text-slate-500/70">
        ·
      </span>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="rounded-sm px-0.5 text-[11px] text-slate-400/80 underline decoration-dotted decoration-slate-500/50 underline-offset-2 transition hover:text-amber-200 hover:decoration-amber-200/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/70"
      >
        ความเป็นส่วนตัว
      </button>

      {open ? (
        <div
          role="presentation"
          onClick={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
          className="fixed inset-0 z-[60] flex items-end justify-center bg-[#02040c]/70 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-10 backdrop-blur-sm sm:items-center sm:pb-10"
        >
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="fade-in-up relative w-full max-w-sm rounded-2xl border border-white/10 bg-[#081028]/95 p-5 text-left shadow-[0_30px_80px_-30px_rgba(0,0,0,0.95)]"
          >
            <div className="flex items-start justify-between gap-3">
              <h2
                id={titleId}
                className="font-heading text-base font-semibold text-amber-100"
              >
                ความเป็นส่วนตัว
              </h2>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setOpen(false)}
                aria-label="ปิดหน้าต่างความเป็นส่วนตัว"
                className="-mr-1 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-white/5 hover:text-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/70"
              >
                <svg
                  viewBox="0 0 16 16"
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="m4 4 8 8M12 4l-8 8" />
                </svg>
              </button>
            </div>

            <ul className="mt-3 max-h-[60vh] space-y-2.5 overflow-y-auto pr-1 text-xs leading-relaxed text-slate-300">
              {PRIVACY_POINTS.map((point) => (
                <li key={point} className="flex gap-2">
                  <span
                    aria-hidden="true"
                    className="mt-[0.45em] h-1 w-1 shrink-0 rounded-full bg-amber-300/70"
                  />
                  <span>{point}</span>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/5 pt-3">
              <span className="text-[10px] text-slate-500">
                อัปเดตล่าสุด: พฤศจิกายน 2026
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-medium text-slate-200 transition hover:border-amber-200/35 hover:text-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/70"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
