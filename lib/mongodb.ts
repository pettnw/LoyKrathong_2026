import { MongoClient, type Collection, type Db } from "mongodb";

export type KrathongDocument = {
  name: string;
  /** คำอธิษฐาน — optional เพื่อรองรับเอกสารเก่าที่บันทึกไว้ก่อนมีฟิลด์นี้ */
  wish?: string;
  krathongType: number;
  createdAt: Date;
};

type MongoState = {
  client: MongoClient;
  db: Db;
};

const globalForMongo = globalThis as typeof globalThis & {
  __loyKrathongMongo?: Promise<MongoState>;
};

const indexPromises = new WeakMap<Db, Promise<unknown>>();

/**
 * ดึงชื่อฐานข้อมูลจาก URI ถ้ามี (เช่น .../loykratong?retryWrites=true)
 * ถ้าไม่ระบุจะใช้ "loykratong" เป็นค่าเริ่มต้น
 */
function extractDatabaseName(uri: string): string {
  try {
    const withoutQuery = uri.split("?")[0] ?? uri;
    const withoutScheme = withoutQuery.replace(/^mongodb(\+srv)?:\/\//, "");
    const slashIndex = withoutScheme.indexOf("/");

    if (slashIndex !== -1) {
      const name = decodeURIComponent(withoutScheme.slice(slashIndex + 1))
        .split("/")[0]
        ?.trim();
      if (name) return name;
    }
  } catch {
    // ใช้ค่าเริ่มต้นถ้า parse ไม่ได้
  }

  return "loykratong";
}

async function connect(): Promise<MongoState> {
  const uri = process.env.MONGODB_URI?.trim();

  if (!uri) {
    throw new Error("MONGODB_URI is not configured");
  }

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 3_000,
    connectTimeoutMS: 5_000,
    maxPoolSize: 5,
  });

  await client.connect();

  return {
    client,
    db: client.db(extractDatabaseName(uri)),
  };
}

export function isMongoConfigured(): boolean {
  return Boolean(process.env.MONGODB_URI?.trim());
}

async function getMongoState(): Promise<MongoState | null> {
  if (!isMongoConfigured()) return null;

  if (!globalForMongo.__loyKrathongMongo) {
    globalForMongo.__loyKrathongMongo = connect().catch((error: unknown) => {
      // ล้าง cache เพื่อให้ request ถัดไปลองเชื่อมต่อใหม่ได้
      globalForMongo.__loyKrathongMongo = undefined;
      throw error;
    });
  }

  try {
    return await globalForMongo.__loyKrathongMongo;
  } catch {
    return null;
  }
}

/**
 * คืน collection สำหรับกระทง หรือ null ถ้าฐานข้อมูลยังไม่พร้อม
 * มี cached connection ผ่าน globalThis เพื่อไม่ให้ Next.js dev สร้าง connection ซ้ำ
 */
export async function getKrathongCollection(): Promise<
  Collection<KrathongDocument> | null
> {
  const state = await getMongoState();
  if (!state) return null;

  const collection = state.db.collection<KrathongDocument>("krathongs");

  if (!indexPromises.has(state.db)) {
    const indexPromise = collection
      .createIndex({ createdAt: -1 })
      .catch(() => undefined);
    indexPromises.set(state.db, indexPromise);
  }

  // สร้าง index แบบเบื้องหลัง ไม่ให้คำขอแรกต้องรอนาน
  void indexPromises.get(state.db);

  return collection;
}
