/**
 * 라이프로그 저장소 – 로컬(AsyncStorage) 일별 기록 저장 및 조회.
 * 기기에서 읽기는 hband.service에서만; 여기서는 저장/조회만 담당.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { LifelogRecord } from '@/lib/types/lifelog.types';

const KEY_PREFIX = 'lifelog:';

function keyForDate(date: string): string {
  return `${KEY_PREFIX}${date}`;
}

function parseKey(key: string): string | null {
  if (!key.startsWith(KEY_PREFIX)) return null;
  return key.slice(KEY_PREFIX.length);
}

export const lifelogRepository = {
  /**
   * 일별 기록 저장. 같은 날짜면 덮어씀.
   */
  async save(record: LifelogRecord): Promise<void> {
    const payload = {
      ...record,
      syncedAt: record.syncedAt ?? new Date().toISOString(),
    };
    await AsyncStorage.setItem(keyForDate(record.date), JSON.stringify(payload));
  },

  /**
   * 특정 날짜 기록 조회.
   */
  async getByDate(date: string): Promise<LifelogRecord | null> {
    const raw = await AsyncStorage.getItem(keyForDate(date));
    if (raw == null) return null;
    try {
      return JSON.parse(raw) as LifelogRecord;
    } catch {
      return null;
    }
  },

  /**
   * 날짜 범위 내 기록 조회. from/to 포함, 날짜 오름차순.
   */
  async getByDateRange(from: string, to: string): Promise<LifelogRecord[]> {
    const allKeys = await AsyncStorage.getAllKeys();
    const dates: string[] = [];
    for (const k of allKeys) {
      const date = parseKey(k);
      if (date != null && date >= from && date <= to) dates.push(date);
    }
    dates.sort();
    if (dates.length === 0) return [];
    const keys = dates.map((d) => keyForDate(d));
    const pairs = await AsyncStorage.multiGet(keys);
    const records: LifelogRecord[] = [];
    for (const [, value] of pairs) {
      if (value == null) continue;
      try {
        records.push(JSON.parse(value) as LifelogRecord);
      } catch {
        // skip malformed
      }
    }
    return records;
  },
};
