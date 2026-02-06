/**
 * HBand BLE service – wraps native module and exposes connection + data APIs.
 * Device does not support concurrent BLE operations; call one at a time.
 */

import {
  HbandBle,
  addDeviceFoundListener,
  addScanStoppedListener,
  addConnectionStateListener,
  addNotifyStateListener,
} from 'hband-ble';
import type { DeviceInfo, PersonInfoInput, SportData, BatteryData } from '@/lib/types/hband.types';

const Native = HbandBle;

export const hbandService = {
  async init(): Promise<void> {
    return Native.init();
  },

  async startScan(): Promise<void> {
    return Native.startScan();
  },

  async stopScan(): Promise<void> {
    return Native.stopScan();
  },

  async connect(mac: string): Promise<void> {
    return Native.connect(mac);
  },

  async confirmDevicePwd(pwd: string, is24h: boolean): Promise<void> {
    return Native.confirmDevicePwd(pwd, is24h);
  },

  async syncPersonInfo(info: PersonInfoInput): Promise<void> {
    return Native.syncPersonInfo(
      info.sex,
      info.height,
      info.weight,
      info.age,
      info.stepAim,
      info.sleepAim
    );
  },

  async disconnect(): Promise<void> {
    return Native.disconnect();
  },

  async readSportStep(): Promise<SportData> {
    return Native.readSportStep() as Promise<SportData>;
  },

  async readBattery(): Promise<BatteryData> {
    return Native.readBattery() as Promise<BatteryData>;
  },

  onDeviceFound(cb: (device: DeviceInfo) => void) {
    return addDeviceFoundListener((e) => cb({ mac: e.mac, name: e.name, rssi: e.rssi }));
  },

  onScanStopped(cb: () => void) {
    return addScanStoppedListener(cb);
  },

  onConnectionState(cb: (code: number, success: boolean) => void) {
    return addConnectionStateListener((e) => cb(e.code, e.success));
  },

  onNotifyState(cb: (state: number, success: boolean) => void) {
    return addNotifyStateListener((e) => cb(e.state, e.success));
  },
};
