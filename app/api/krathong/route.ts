import { NextResponse } from "next/server";
import {
  isKrathongTypeId,
  validateName,
  validateWish,
} from "@/lib/krathong-data";
import { getKrathongCollection } from "@/lib/mongodb";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const MAX_BODY_NAME_LENGTH = 200;
const MAX_BODY_WISH_LENGTH = 200;

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
} as const;

function badRequest(message: string) {
  return NextResponse.json(
    { error: message },
    { status: 400, headers: NO_STORE_HEADERS },
  );
}

export async function GET(request: Request) {
  // อ่าน request เพื่อให้ route นี้ทำงานที่ request time ไม่ถูก prerender ตอน build
  void new URL(request.url);

  const collection = await getKrathongCollection();

  if (!collection) {
    return NextResponse.json([], { headers: NO_STORE_HEADERS });
  }

  try {
    const documents = await collection
      .find(
        {},
        {
          // ส่งเฉพาะข้อมูลที่โชว์บนจอ — ไม่เปิดเผย _id / createdAt
          projection: { name: 1, wish: 1, krathongType: 1 },
        },
      )
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    const items = documents.map((document) => ({
      name: document.name,
      wish: document.wish ?? "",
      krathongType: document.krathongType,
    }));

    return NextResponse.json(items, { headers: NO_STORE_HEADERS });
  } catch {
    // ฐานข้อมูลล่มระหว่างทาง — คืนรายการว่าง เพื่อให้ UI ยังลอยกระทงของตัวเองได้
    return NextResponse.json([], { headers: NO_STORE_HEADERS });
  }
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit(ip);

  if (!rateLimit.ok) {
    return NextResponse.json(
      {
        error: "ลอยกระทงบ่อยเกินไป กรุณารอสักครู่แล้วลองอีกครั้ง",
      },
      {
        status: 429,
        headers: {
          ...NO_STORE_HEADERS,
          "Retry-After": String(rateLimit.retryAfterSeconds),
        },
      },
    );
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return badRequest("ข้อมูลที่ส่งมาไม่ถูกต้อง");
  }

  if (typeof payload !== "object" || payload === null) {
    return badRequest("ข้อมูลที่ส่งมาไม่ถูกต้อง");
  }

  const body = payload as Record<string, unknown>;
  const rawName = typeof body.name === "string" ? body.name : "";

  if (rawName.length > MAX_BODY_NAME_LENGTH) {
    return badRequest("ชื่อยาวเกินกำหนด");
  }

  const nameValidation = validateName(rawName);
  if (!nameValidation.ok) {
    return badRequest(nameValidation.message);
  }

  const rawWish = typeof body.wish === "string" ? body.wish : "";

  if (rawWish.length > MAX_BODY_WISH_LENGTH) {
    return badRequest("คำอธิษฐานยาวเกินกำหนด");
  }

  const wishValidation = validateWish(rawWish);
  if (!wishValidation.ok) {
    return badRequest(wishValidation.message);
  }

  const krathongType = body.krathongType;

  if (!isKrathongTypeId(krathongType)) {
    return badRequest("กรุณาเลือกกระทง 1 ใน 6 แบบ");
  }

  const collection = await getKrathongCollection();

  if (!collection) {
    return NextResponse.json(
      {
        error:
          "ยังเชื่อมต่อฐานข้อมูลไม่ได้ แต่กระทงของคุณลอยได้ตามปกติ (ไม่ได้บันทึกไว้ให้คนอื่นเห็น)",
      },
      { status: 503, headers: NO_STORE_HEADERS },
    );
  }

  try {
    const document = {
      name: nameValidation.name,
      wish: wishValidation.wish,
      krathongType,
      createdAt: new Date(),
    };

    await collection.insertOne(document);

    // ไม่ต้องคืน id/createdAt — หน้าเว็บสร้าง id ชั่วคราวเองจากข้อมูลที่โชว์อยู่แล้ว
    return NextResponse.json(
      { ok: true },
      { status: 201, headers: NO_STORE_HEADERS },
    );
  } catch {
    return NextResponse.json(
      {
        error:
          "บันทึกกระทงลงฐานข้อมูลไม่สำเร็จ แต่กระทงของคุณยังลอยได้ตามปกติ",
      },
      { status: 503, headers: NO_STORE_HEADERS },
    );
  }
}
