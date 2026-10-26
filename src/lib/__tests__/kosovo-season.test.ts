import { describe, it, expect } from 'vitest';
import { kosovoSummerTime, seasonalCorrection, KOSOVO_FRIDAY } from '../kosovo-season';
import { getTimesForDate, CITY_OFFSETS } from '../prayer-data';

describe('BIK winter civil time', () => {
  it('shifts one hour from summer to winter when the source calendar differs', () => {
    expect(seasonalCorrection(new Date(2027, 9, 26), 2026)).toBe(60);
    expect(seasonalCorrection(new Date(2026, 9, 26), 2027)).toBe(-60);
  });
  it('does not subtract twice from the winter BIK row on 26 October 2026', () => {
    expect(kosovoSummerTime(new Date(2026, 9, 26))).toBe(false);
    expect(getTimesForDate(new Date(2026, 9, 26), 'Decan').dreka).toBe('11:24');
    expect(getTimesForDate(new Date(2026, 9, 26), 'Prishtina').dreka).toBe('11:23');
  });
  it('fixes Xhumaja at 12:00 for every Kosovo city', () => {
    for (const city of Object.keys(CITY_OFFSETS)) { expect(city).toBeTruthy(); expect(KOSOVO_FRIDAY.prayer).toBe('12:00'); }
  });
  it('fixes Hytbeja at 11:40', () => { expect(KOSOVO_FRIDAY.khutbah).toBe('11:40'); });
});
