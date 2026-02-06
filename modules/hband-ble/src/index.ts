import { requireNativeModule, EventEmitter } from 'expo-modules-core';

const HbandBleModule = requireNativeModule('HbandBle');

export const HbandBle = HbandBleModule;

const emitter = new EventEmitter(HbandBleModule);

export type DeviceFoundEvent = { mac: string; name: string; rssi: number };
export type ConnectionStateEvent = { code: number; success: boolean };
export type NotifyStateEvent = { state: number; success: boolean };

export function addDeviceFoundListener(listener: (event: DeviceFoundEvent) => void) {
  return emitter.addListener('onDeviceFound', listener);
}

export function addScanStoppedListener(listener: () => void) {
  return emitter.addListener('onScanStopped', listener);
}

export function addConnectionStateListener(listener: (event: ConnectionStateEvent) => void) {
  return emitter.addListener('onConnectionState', listener);
}

export function addNotifyStateListener(listener: (event: NotifyStateEvent) => void) {
  return emitter.addListener('onNotifyState', listener);
}

export default HbandBle;
