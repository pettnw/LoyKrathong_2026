/** ปัดเศษค่านิยมที่ใช้ใน inline style เพื่อให้ SSR กับ client ตรงกัน */
export function roundTo(value: number, digits = 3): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
