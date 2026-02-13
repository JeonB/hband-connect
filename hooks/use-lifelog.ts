/**
 * useLifelog – 동기화(기기 읽기 + 오늘 날짜로 저장) 및 저장소 조회.
 * BLE 접근은 useHBand를 통해만 사용; 본 훅은 저장/조회 플로우만 담당.
 */

import { useCallback } from 'react';
import { useHbandConnection } from '@/contexts/hband-connection-context';
import { useHBand } from '@/hooks/use-hband';
import { lifelogRepository } from '@/lib/repositories/lifelog.repository';
import type { LifelogRecord } from '@/lib/types/lifelog.types';

export function useLifelog() {
  const { device } = useHbandConnection();
  const hband = useHBand();

  const syncAndStoreToday = useCallback(async (): Promise<void> => {
    const today = new Date().toISOString().slice(0, 10);
    const sport = await hband.readSportStep();
    const battery = await hband.readBattery();
    await lifelogRepository.save({
      date: today,
      deviceId: device?.mac,
      sport,
      battery,
    });
  }, [hband, device?.mac]);

  const getByDate = useCallback((date: string): Promise<LifelogRecord | null> => {
    return lifelogRepository.getByDate(date);
  }, []);

  const getByDateRange = useCallback((from: string, to: string): Promise<LifelogRecord[]> => {
    return lifelogRepository.getByDateRange(from, to);
  }, []);

  return { syncAndStoreToday, getByDate, getByDateRange };
}
