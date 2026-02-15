/**
 * 라이프로그 도메인 타입 – 일별 저장 단위 및 조회 범위.
 * 기기 원시 데이터 타입은 hband.types.ts에서 import.
 */

import type { BatteryData, SportData } from './hband.types';

/** 일별 라이프로그 한 건. 확장 시 sleep?, heartRate? 등 선택적 필드 추가 */
export interface LifelogRecord {
  /** ISO date string (YYYY-MM-DD) */
  date: string;
  /** 기기 식별 (다중 기기 시 구분) */
  deviceId?: string;
  sport?: SportData;
  battery?: BatteryData;
  /** 저장 시각 (ISO string), 동기화 시간 기록용 */
  syncedAt?: string;
}
