export type KrathongTypeId = 1 | 2 | 3 | 4 | 5 | 6;

export const MAX_NAME_LENGTH = 20;
export const MAX_WISH_LENGTH = 30;

export type KrathongOption = {
  id: KrathongTypeId;
  name: string;
  shortName: string;
  description: string;
};

export const KRATHONG_OPTIONS: readonly KrathongOption[] = [
  {
    id: 1,
    name: "กระทงใบตองดอกบัวชมพู",
    shortName: "บัวชมพู",
    description: "ใบตองสด ประดับบัวชมพูหอมอ่อน",
  },
  {
    id: 2,
    name: "กระทงดอกบัวขาว",
    shortName: "บัวขาว",
    description: "บัวขาวบริสุทธิ์ สื่อถึงใจที่สงบ",
  },
  {
    id: 3,
    name: "กระทงดอกดาวเรือง",
    shortName: "ดาวเรือง",
    description: "ดาวเรืองสีทอง สดใส โชคดี",
  },
  {
    id: 4,
    name: "กระทงดอกกล้วยไม้ม่วง",
    shortName: "กล้วยไม้ม่วง",
    description: "กล้วยไม้ม่วงงาม สง่างามและละเมียดละไม",
  },
  {
    id: 5,
    name: "กระทงขนมปัง (สีทอง)",
    shortName: "ขนมปัง",
    description: "ขนมปังสีทองกรอบนอกนุ่มใน เป็นทานแก่ปลา",
  },
  {
    id: 6,
    name: "กระทงโคมแสงทอง",
    shortName: "โคมแสงทอง",
    description: "โคมทองเรืองรอง นำทางสู่สิ่งดีๆ",
  },
] as const;

export const KRATHONG_OPTIONS_BY_ID: Readonly<Record<KrathongTypeId, KrathongOption>> =
  KRATHONG_OPTIONS.reduce(
    (acc, option) => {
      acc[option.id] = option;
      return acc;
    },
    {} as Record<KrathongTypeId, KrathongOption>,
  );

export function isKrathongTypeId(value: unknown): value is KrathongTypeId {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 6
  );
}

/**
 * สร้าง id ชั่วคราวฝั่งเบราว์เซอร์จากข้อมูลที่โชว์บนจออยู่แล้ว
 * ใช้แทน _id ของ MongoDB ที่ API ตัดออกเพื่อความเป็นส่วนตัว
 * ค่าเดิมจะได้ id เดิมเสมอ จึงใช้ติดตามกระทงข้ามการ poll และเป็น seed ของแอนิเมชันได้
 */
export function krathongClientId(
  name: string,
  wish: string,
  type: KrathongTypeId,
): string {
  const seed = `${name}\u0000${wish}\u0000${type}`;
  let hash = 2166136261; // FNV-1a

  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return `k${(hash >>> 0).toString(36)}`;
}

/** ตัดช่องว่างหัวท้ายและยุบช่องว่างซ้ำให้เหลือช่องเดียว */
export function normalizeText(raw: string): string {
  return raw.replace(/\s+/g, " ").trim();
}

/**
 * ทำความสะอาดข้อความ: ตัดแท็ก HTML, อักขระควบคุม, อักขระซ่อน และอักขระที่ใช้หลอกตา
 * ข้อความที่ได้จะถูกนำไปแสดงเป็นข้อความธรรมดา (React escape ให้อยู่แล้ว)
 */
export function sanitizeText(raw: string): string {
  return normalizeText(
    raw
      .replace(/<[^>]*>/g, " ")
      .replace(/[<>&]/g, "")
      .replace(/[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u202a-\u202e\u2066-\u2069]/g, ""),
  );
}

export type NameValidation =
  | { ok: true; name: string }
  | { ok: false; message: string };

export function validateName(raw: string): NameValidation {
  const name = sanitizeText(raw);

  if (name.length === 0) {
    return { ok: false, message: "กรุณากรอกชื่อของคุณก่อนลอยกระทง" };
  }

  if (Array.from(name).length > MAX_NAME_LENGTH) {
    return { ok: false, message: `ชื่อต้องไม่เกิน ${MAX_NAME_LENGTH} ตัวอักษร` };
  }

  return { ok: true, name };
}

export type WishValidation =
  | { ok: true; wish: string }
  | { ok: false; message: string };

export function validateWish(raw: string): WishValidation {
  const wish = sanitizeText(raw);

  if (wish.length === 0) {
    return { ok: false, message: "กรุณาเขียนคำอธิษฐานก่อนลอยกระทง" };
  }

  if (Array.from(wish).length > MAX_WISH_LENGTH) {
    return {
      ok: false,
      message: `คำอธิษฐานต้องไม่เกิน ${MAX_WISH_LENGTH} ตัวอักษร`,
    };
  }

  return { ok: true, wish };
}
