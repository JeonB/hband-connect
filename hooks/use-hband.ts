/**
 * useHBand – HBand BLE init, scan, connect, confirm pwd, sync person, disconnect.
 * Subscribes to native events and updates connection context.
 * Use on Android only; on other platforms methods no-op and connection stays disconnected.
 */

import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { hbandService } from '@/services/hband.service';
import { useHbandConnection } from '@/contexts/hband-connection-context';
import type { PersonInfoInput } from '@/lib/types/hband.types';

const isAndroid = Platform.OS === 'android';

export function useHBand() {
  const { setStatus, setDevice, setError } = useHbandConnection();
  const subscriptions = useRef<Array<{ remove: () => void }>>([]);

  useEffect(() => {
    if (!isAndroid) return;

    const sub1 = hbandService.onDeviceFound((device) => {
      setDevice(device);
    });
    const sub2 = hbandService.onScanStopped(() => {});
    const sub3 = hbandService.onConnectionState((_code, success) => {
      if (success) setStatus('connected');
      else setError('Connection failed');
    });
    const sub4 = hbandService.onNotifyState((_state, success) => {
      if (success) setStatus('connected');
    });

    subscriptions.current = [sub1, sub2, sub3, sub4];
    return () => {
      subscriptions.current.forEach((s) => s.remove());
      subscriptions.current = [];
    };
  }, [setStatus, setDevice, setError]);

  const init = async () => {
    if (!isAndroid) return;
    setError(null);
    try {
      await hbandService.init();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Init failed');
      throw e;
    }
  };

  const startScan = async () => {
    if (!isAndroid) return;
    setError(null);
    setStatus('scanning');
    try {
      await hbandService.startScan();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Scan failed');
      setStatus('disconnected');
      throw e;
    }
  };

  const stopScan = async () => {
    if (!isAndroid) return;
    try {
      await hbandService.stopScan();
      setStatus('disconnected');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Stop scan failed');
    }
  };

  const connect = async (mac: string) => {
    if (!isAndroid) return;
    setError(null);
    setStatus('connecting');
    try {
      await hbandService.connect(mac);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Connect failed');
      setStatus('disconnected');
      throw e;
    }
  };

  const confirmPwd = async (pwd: string, is24h: boolean) => {
    if (!isAndroid) return;
    setError(null);
    try {
      await hbandService.confirmDevicePwd(pwd, is24h);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Confirm password failed');
      throw e;
    }
  };

  const syncPersonInfo = async (info: PersonInfoInput) => {
    if (!isAndroid) return;
    setError(null);
    try {
      await hbandService.syncPersonInfo(info);
      setStatus('ready');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sync person info failed');
      throw e;
    }
  };

  const disconnect = async () => {
    if (!isAndroid) return;
    setError(null);
    try {
      await hbandService.disconnect();
      setStatus('disconnected');
      setDevice(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Disconnect failed');
    }
  };

  const readSportStep = () => (isAndroid ? hbandService.readSportStep() : Promise.resolve({ step: 0, dis: 0, kcal: 0 }));
  const readBattery = () =>
    isAndroid
      ? hbandService.readBattery()
      : Promise.resolve({ batteryLevel: 0, batteryPercent: 0, isLowBattery: false, isPercent: false });

  return {
    init,
    startScan,
    stopScan,
    connect,
    confirmPwd,
    syncPersonInfo,
    disconnect,
    readSportStep,
    readBattery,
    isSupported: isAndroid,
  };
}
