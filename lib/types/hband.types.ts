/**
 * HBand 관련 타입 – 앱 전역에서 BLE/기기·데이터 타입은 이 파일만 사용 (aligned with Veepoo SDK API).
 */

export type ConnectionStatus =
  | 'disconnected'
  | 'scanning'
  | 'connecting'
  | 'connected'
  | 'ready';

export interface DeviceInfo {
  mac: string;
  name: string;
  rssi?: number;
}

export interface SportData {
  step: number;
  dis: number;
  kcal: number;
}

export interface BatteryData {
  batteryLevel: number;
  batteryPercent: number;
  isLowBattery: boolean;
  isPercent: boolean;
}

export interface PersonInfoInput {
  sex: 0 | 1; // 0 = man, 1 = woman
  height: number;
  weight: number;
  age: number;
  stepAim: number;
  sleepAim: number;
}
