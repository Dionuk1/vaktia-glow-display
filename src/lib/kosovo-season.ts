// BIK's published rows use civil time, including DST. Normalize only when
// the source and requested dates have different seasonal offsets.
export function kosovoSummerTime(date: Date): boolean {
  const year = date.getFullYear();
  const march = new Date(year, 2, 31);
  const october = new Date(year, 9, 31);
  const start = 31 - march.getDay();
  const end = 31 - october.getDay();
  const month = date.getMonth();
  return (month > 2 && month < 9) || (month === 2 && date.getDate() >= start) || (month === 9 && date.getDate() < end);
}

export function seasonalCorrection(date: Date, sourceYear = 2026): number {
  const source = new Date(sourceYear, date.getMonth(), date.getDate());
  return (Number(kosovoSummerTime(date)) - Number(kosovoSummerTime(source))) * 60;
}

export const KOSOVO_FRIDAY = { khutbah: "11:40", prayer: "12:00" } as const;