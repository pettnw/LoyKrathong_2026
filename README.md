# 🪷 ลอยกระทงออนไลน์

> **Loy Krathong Online** — pick a krathong, write a wish, and set it adrift on a moonlit river shared with everyone else.

เว็บลอยกระทงออนไลน์ที่เปิดมาแล้วเจอ **ฉากแม่น้ำยามค่ำคืนเต็มจอ** พร้อมกระทงของคนอื่นลอยอยู่ก่อน ไม่ใช่หน้าฟอร์มเปล่าๆ — เลือกกระทง เขียนคำอธิษฐาน แล้วปล่อยให้ลูกของคุณลอยไปรวมกับทุกคน

ฉากทั้งหมดวาดด้วย SVG และ CSS ล้วน ไม่มีไฟล์รูปภาพประกอบ

![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-087ea4?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-7-47a248?logo=mongodb&logoColor=white)

## เกี่ยวกับโปรเจกต์

วันลอยกระทงเป็นเทศกาลที่คนอธิษฐานแล้วปล่อยกระทงลงน้ำ โปรเจกต์นี้ย่อบรรยากาศนั้นมาไว้บนเว็บ — ท้องฟ้าสีน้ำเงิน-ม่วง ดวงจันทร์เต็มดวง โคมลอย และผิวน้ำที่สะท้อนแสงเทียน

การเดินเรื่องมี 3 ช่วงแบบทางเดียว: **หน้าแรก (ฉากน้ำ)** → **ฟอร์ม** → **ฉากลอยกระทง** ไม่มีปุ่มย้อนกลับ ตั้งใจให้เหมือนปล่อยกระทงลงน้ำแล้วปล่อยให้มันลอยไป

## สิ่งที่เห็นบนจอ

- **กระทง 6 แบบ** วาดด้วย SVG: ใบตองบัวชมพู · บัวขาว · ดาวเรือง · กล้วยไม้ม่วง · ขนมปังสีทอง · โคมแสงทอง — ทุกแบบมีธูป 3 ดอก เทียน และเปลวไฟกะพริบ
- **ป้ายชื่อใต้กระทง** แสดงตลอดเวลาเป็น 2 บรรทัด อ่านชื่อเต็มได้ถึง 20 ตัวอักษร ปรับขนาดฟอนต์ตามความยาวชื่อ
- **การ์ดคำอธิษฐาน** ขึ้นตอน hover / โฟกัส / แตะ แสดงชื่อเต็ม ชนิดกระทง และคำอธิษฐานถึง 30 ตัวอักษร
- **กระทง 10 อันต่อจอ** (หน้าแรก = 10 อันของคนอื่น / หลังลอย = กระทงของคุณ + 9 อัน) จัด 4 ระดับความลึกแบบ 2/3/2/3 — ยิ่งใกล้ยิ่งใหญ่ ชัดขึ้น และลอยเร็วขึ้น
- ลอยเป็นวงโค้งในเลนของตัวเอง โยกขึ้นลง เอียงตัว และมีวงน้ำกระเพื่อม ป้ายชื่อของลูกข้างๆ จึงไม่ทับกัน
- เมื่อมีกระทงใหม่จนเกิน 10 อัน ลูกเก่าสุดจะค่อยๆ ลอยออกนอกจอ
- รองรับ `prefers-reduced-motion` และใช้ฟอนต์ไทย **Mali** + **Noto Sans Thai** ผ่าน `next/font`

## วิธีการทำงาน

- `components/loy-krathong-app.tsx` เก็บ state `home | form | scene` เป็น state machine เล็กๆ ฟอร์มตรวจข้อมูลก่อนยิง `POST` แล้วเข้าฉากทันที
- `lib/use-krathong-feed.ts` ดึงฟีดทุก **15 วินาที** แล้ว merge ของใหม่เข้าช่องว่างโดยไม่สลับตำแหน่งของลูกที่ลอยอยู่
- API **ไม่ส่ง `id` หรือ `createdAt`** ออกมา — เบราว์เซอร์สร้าง id ชั่วคราวจากชื่อ + คำอธิษฐาน + ชนิดกระทง ผ่าน `krathongClientId()` ใช้ทั้งติดตามกระทงข้ามการ poll และเป็น seed ของแอนิเมชัน
- ข้อความผ่านการ sanitize ฝั่ง server (ตัดแท็ก HTML และอักขระควบคุม) ก่อนเก็บ และ render เป็นข้อความธรรมดาโดย React
- `components/river-stage.tsx` ใช้ร่วมกันทั้งหน้าแรกและฉาก รวมฟีดกับกระทงของผู้ใช้ไว้ในฉากเดียว

## เทคโนโลยี

| ส่วน | เลือกใช้ |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack, `basePath: /LoyKrathong`) |
| UI | React 19 + TypeScript |
| Styling | Tailwind CSS v4 + CSS keyframes และ custom properties |
| แอนิเมชัน | `water-drift`, `water-bob`, `water-ripple`, `water-enter`, `water-exit` |
| ข้อมูล | MongoDB (official Node driver) |
| ฟอนต์ | `next/font` — Mali และ Noto Sans Thai |

## โครงสร้างโปรเจกต์

```txt
app/
├─ page.tsx                หน้าแรก
├─ layout.tsx              ฟอนต์ไทย, metadata, lang="th"
├─ globals.css             theme, keyframes, prefers-reduced-motion
└─ api/krathong/route.ts   GET/POST + validation + rate limit

components/
├─ loy-krathong-app.tsx    state 3 หน้า + ยิง POST
├─ home-scene.tsx          หน้าแรก: ฉากน้ำ + ปุ่มลอยกระทง
├─ river-scene.tsx         ฉากหลังลอย (กระทงคุณ + ฟีดคนอื่น)
├─ river-stage.tsx         ฉากน้ำที่ใช้ร่วมกัน
├─ water-krathong.tsx      กระทง 1 อัน + ป้ายชื่อ + การ์ดคำอธิษฐาน
├─ krathong-picker.tsx     ฟอร์ม + grid เลือกกระทง
├─ krathong-svg.tsx        SVG กระทง 6 แบบ + เปลวเทียน
├─ night-sky.tsx           ดาว พระจันทร์ โคมลอย
└─ privacy-note.tsx        dialog ความเป็นส่วนตัว

lib/
├─ krathong-data.ts        type, validation, sanitize, krathongClientId
├─ use-krathong-feed.ts    poll + ผัง 10 ช่อง + merge/exiting
├─ mongodb.ts              cached MongoClient
├─ rate-limit.ts           จำกัด 5 ครั้ง/นาที/IP
├─ use-prefers-reduced-motion.ts
└─ round.ts                ปัดเศษค่า inline style ให้ SSR ตรง client
```

## API ย่อ

> พาธจริงมี prefix `/LoyKrathong` จาก `basePath` เช่น `GET /LoyKrathong/api/krathong`

**`GET /api/krathong`** → กระทง 10 อันล่าสุด (ใหม่ → เก่า) เฉพาะข้อมูลที่โชว์บนจอ:

```json
[
  {
    "name": "คุณมะลิ",
    "wish": "ขอให้ครอบครัวมีความสุข",
    "krathongType": 1
  }
]
```

ไม่มี `id` หรือ `createdAt` — เวลายังเก็บในฐานข้อมูลเพื่อใช้เรียงลำดับ แต่ไม่ส่งออกมา ถ้าฐานข้อมูลไม่พร้อมจะคืน `[]` พร้อม HTTP 200

**`POST /api/krathong`** → ส่ง `{ "name": "คุณมะลิ", "wish": "ขอให้ครอบครัวมีความสุข", "krathongType": 1 }`

| Status | ความหมาย |
| --- | --- |
| `201` | บันทึกสำเร็จ คืน `{ "ok": true }` |
| `400` | ชื่อ/คำอธิษฐานว่างหรือยาวเกิน, ชนิดกระทงไม่ใช่ 1–6 |
| `429` | ลอยถี่เกิน 5 ครั้ง/นาที/IP |
| `503` | ฐานข้อมูลไม่พร้อม — กระทงยังลอยได้แต่ไม่ถูกบันทึก |

## ความเป็นส่วนตัว

- ชื่อและคำอธิษฐานเป็น **ข้อมูลสาธารณะ** ที่ทุกคนเห็นได้ จึงไม่ควรใส่ข้อมูลติดต่อหรือเรื่องลับ
- ไม่มีระบบสมาชิก ไม่เก็บอีเมล/เบอร์โทร ไม่ใช้คุกกี้ติดตาม
- IP ใช้ชั่วคราวในหน่วยความจำเพื่อจำกัดจำนวนครั้ง และหายไปเมื่อรีสตาร์ตเซิร์ฟเวอร์
- ไม่มีปุ่มลบข้อมูลในเว็บ — ติดต่อผู้ดูแลหากต้องการให้ลบ

---

สร้างด้วยความตั้งใจให้เหมือนได้ยืนอยู่ริมน้ำในคืนวันลอยกระทง 🌕
