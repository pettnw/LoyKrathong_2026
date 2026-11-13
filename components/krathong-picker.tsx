"use client";

import {
  KRATHONG_OPTIONS,
  MAX_NAME_LENGTH,
  MAX_WISH_LENGTH,
  validateName,
  validateWish,
  type KrathongTypeId,
} from "@/lib/krathong-data";
import { KrathongSvg } from "@/components/krathong-svg";

type KrathongPickerProps = {
  name: string;
  onNameChange: (name: string) => void;
  wish: string;
  onWishChange: (wish: string) => void;
  selectedType: KrathongTypeId | null;
  onSelectType: (type: KrathongTypeId) => void;
  onSubmit: () => void;
  error: string | null;
  isSubmitting?: boolean;
};

function counterToneFor(length: number, max: number): string {
  if (length >= max) return "text-rose-300";
  if (length >= max - 5) return "text-amber-300";
  return "text-slate-400";
}

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

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m3.5 8.5 3 3 6-7" />
    </svg>
  );
}

export function KrathongPicker({
  name,
  onNameChange,
  wish,
  onWishChange,
  selectedType,
  onSelectType,
  onSubmit,
  error,
  isSubmitting = false,
}: KrathongPickerProps) {
  const nameIsValid = validateName(name).ok;
  const wishIsValid = validateWish(wish).ok;
  const canSubmit =
    nameIsValid && wishIsValid && selectedType !== null && !isSubmitting;
  const nameTone = counterToneFor(name.length, MAX_NAME_LENGTH);
  const wishTone = counterToneFor(wish.length, MAX_WISH_LENGTH);

  return (
    <section className="relative z-10 mx-auto flex min-h-dvh w-full max-w-3xl flex-col items-center px-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-10 sm:pt-16">
      <header className="fade-in-up text-center">
        <p className="inline-flex items-center gap-2 rounded-full border border-amber-200/20 bg-amber-200/10 px-3 py-1 text-[11px] font-medium tracking-wide text-amber-100/90 sm:text-xs">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-300 shadow-[0_0_8px_2px_rgba(252,211,77,0.6)]" />
          เทศกาลลอยกระทง · คืนวันเพ็ญเดือนสิบสอง
        </p>
        <h1 className="font-heading mt-4 bg-gradient-to-b from-amber-50 via-amber-200 to-amber-400 bg-clip-text text-5xl font-bold leading-tight text-transparent drop-shadow-[0_0_28px_rgba(251,191,36,0.25)] sm:text-6xl">
          ลอยกระทง
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-300/90 sm:text-base">
          เขียนคำอธิษฐาน เลือกกระทงที่ชอบ
          แล้วปล่อยให้มันลอยไปกับสายน้ำยามค่ำคืน
        </p>
      </header>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
        className="fade-in-up mt-8 w-full rounded-3xl border border-white/10 bg-white/[0.045] p-4 shadow-[0_24px_80px_-32px_rgba(0,0,0,0.9)] backdrop-blur-xl sm:p-6"
      >
        <div>
          <div className="flex items-baseline justify-between gap-3">
            <label
              htmlFor="floater-name"
              className="text-sm font-medium text-amber-100/90"
            >
              ชื่อผู้ลอยกระทง
            </label>
            <span className={`text-xs tabular-nums ${nameTone}`}>
              {name.length}/{MAX_NAME_LENGTH}
            </span>
          </div>
          <input
            id="floater-name"
            type="text"
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
            maxLength={MAX_NAME_LENGTH}
            autoComplete="name"
            enterKeyHint="done"
            placeholder="เช่น คุณมะลิ"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "loy-form-error" : undefined}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-[#070b1e]/70 px-4 py-3 text-base text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-amber-300/60 focus:ring-2 focus:ring-amber-300/25"
          />
        </div>

        <div className="mt-5">
          <div className="flex items-baseline justify-between gap-3">
            <label
              htmlFor="floater-wish"
              className="text-sm font-medium text-amber-100/90"
            >
              คำอธิษฐาน
            </label>
            <span className={`text-xs tabular-nums ${wishTone}`}>
              {wish.length}/{MAX_WISH_LENGTH}
            </span>
          </div>
          <input
            id="floater-wish"
            type="text"
            value={wish}
            onChange={(event) => onWishChange(event.target.value)}
            maxLength={MAX_WISH_LENGTH}
            autoComplete="off"
            enterKeyHint="done"
            placeholder="เช่น ขอให้ครอบครัวมีความสุข"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "loy-form-error" : undefined}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-[#070b1e]/70 px-4 py-3 text-base text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-amber-300/60 focus:ring-2 focus:ring-amber-300/25"
          />
        </div>

        <fieldset className="mt-6">
          <legend className="text-sm font-medium text-amber-100/90">
            เลือกกระทง 1 แบบ
          </legend>
          <div
            role="group"
            aria-label="ตัวเลือกกระทง"
            className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3"
          >
            {KRATHONG_OPTIONS.map((option) => {
              const isSelected = selectedType === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => onSelectType(option.id)}
                  aria-pressed={isSelected}
                  className={`group relative overflow-hidden rounded-2xl border p-2 text-left transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/70 ${
                    isSelected
                      ? "border-amber-300/80 bg-amber-300/10 shadow-[0_0_28px_-4px_rgba(251,191,36,0.45)]"
                      : "border-white/10 bg-white/[0.03] hover:-translate-y-0.5 hover:border-amber-200/35 hover:bg-white/[0.07]"
                  }`}
                >
                  <span
                    className={`absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full border transition ${
                      isSelected
                        ? "border-amber-200 bg-amber-300 text-[#3a2404]"
                        : "border-white/20 bg-[#070b1e]/60 text-transparent"
                    }`}
                  >
                    <CheckIcon className="h-3.5 w-3.5" />
                  </span>

                  <span className="flex aspect-[4/3] items-center justify-center rounded-xl bg-gradient-to-b from-[#141a44]/70 to-[#070b1e]/80 p-1">
                    <KrathongSvg
                      type={option.id}
                      className="h-full w-full transition duration-300 group-hover:scale-105"
                    />
                  </span>

                  <span className="mt-2 block text-center text-xs font-medium leading-snug text-slate-100 sm:text-sm">
                    {option.name}
                  </span>
                  <span className="mt-0.5 hidden text-center text-[10px] leading-snug text-slate-400 sm:block">
                    {option.description}
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>

        {error ? (
          <p
            id="loy-form-error"
            role="alert"
            className="mt-4 rounded-xl border border-rose-300/25 bg-rose-400/10 px-3 py-2 text-xs text-rose-200"
          >
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={!canSubmit}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 px-6 py-3.5 text-base font-semibold text-[#2b1a03] shadow-[0_16px_36px_-16px_rgba(251,191,36,0.85)] transition hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
        >
          <LotusIcon className="h-5 w-5" />
          {isSubmitting ? "กำลังปล่อยกระทง..." : "ลอยกระทง"}
        </button>

        <p className="mt-3 text-center text-xs text-slate-400">
          {canSubmit
            ? "กระทงจะลอยไปพร้อมคำอธิษฐานของคุณ"
            : "กรอกชื่อ เขียนคำอธิษฐาน และเลือกกระทงเพื่อเริ่มต้น"}
        </p>
      </form>

      <p className="mt-6 text-center text-[11px] text-slate-400/80">
        ลอยกระทงออนไลน์ · ขอให้ทุกคำอธิษฐานเป็นจริง
      </p>
    </section>
  );
}
