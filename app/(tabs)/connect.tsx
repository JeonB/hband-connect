'use client';

import { useCallback, useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import {
  ConnectAuth,
  ConnectDisconnected,
  ConnectReady,
  ConnectScanning,
  ConnectUnsupported,
} from '@/components/connect';
import { useHbandConnection } from '@/contexts/hband-connection-context';
import { isHbandSupported } from '@/constants/platform';
import { useHBand } from '@/hooks/use-hband';
import { hbandService } from '@/services/hband.service';
import type { DeviceInfo } from '@/lib/types/hband.types';

const DEFAULT_PWD = '0000';
const DEFAULT_PERSON = { sex: 0 as const, height: 170, weight: 70, age: 30, stepAim: 8000, sleepAim: 480 };

export default function ConnectScreen() {
  const { status, device, error, setDevice } = useHbandConnection();
  const hband = useHBand();
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [pwd, setPwd] = useState(DEFAULT_PWD);
  const [is24h, setIs24h] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!hband.isSupported) return;
    const sub = hbandService.onDeviceFound((d) => {
      setDevices((prev) => {
        const i = prev.findIndex((x) => x.mac === d.mac);
        if (i >= 0) return prev.map((x, idx) => (idx === i ? d : x));
        return [...prev, d];
      });
    });
    return () => sub.remove();
  }, [hband.isSupported]);

  const handleInit = useCallback(async () => {
    setLoading(true);
    try {
      await hband.init();
    } finally {
      setLoading(false);
    }
  }, [hband]);

  const handleStartScan = useCallback(async () => {
    setDevices([]);
    setLoading(true);
    try {
      await hband.startScan();
    } catch {
      // error set in context
    } finally {
      setLoading(false);
    }
  }, [hband]);

  const handleStopScan = useCallback(async () => {
    setLoading(true);
    try {
      await hband.stopScan();
    } finally {
      setLoading(false);
    }
  }, [hband]);

  const handleConnect = useCallback(
    async (mac: string) => {
      setDevice({ mac, name: devices.find((d) => d.mac === mac)?.name ?? mac, rssi: undefined });
      setLoading(true);
      try {
        await hband.connect(mac);
      } catch {
        setDevice(null);
      } finally {
        setLoading(false);
      }
    },
    [hband, devices, setDevice]
  );

  const handleConfirmPwd = useCallback(async () => {
    if (!device) return;
    setLoading(true);
    try {
      await hband.confirmPwd(pwd, is24h);
    } finally {
      setLoading(false);
    }
  }, [hband, device, pwd, is24h]);

  const handleSyncPerson = useCallback(async () => {
    setLoading(true);
    try {
      await hband.syncPersonInfo(DEFAULT_PERSON);
    } finally {
      setLoading(false);
    }
  }, [hband]);

  const handleDisconnect = useCallback(async () => {
    setLoading(true);
    try {
      await hband.disconnect();
      setDevices([]);
    } finally {
      setLoading(false);
    }
  }, [hband]);

  if (!isHbandSupported) {
    return <ConnectUnsupported />;
  }

  return (
    <View className="flex-1 p-4 gap-3">
      {error ? <Text className="text-red-500 mb-2">{error}</Text> : null}
      <Text className="font-semibold mb-2">상태: {status}</Text>

      {status === 'disconnected' && (
        <ConnectDisconnected onInit={handleInit} onStartScan={handleStartScan} loading={loading} />
      )}

      {status === 'scanning' && (
        <ConnectScanning
          onStopScan={handleStopScan}
          devices={devices}
          onConnect={handleConnect}
          loading={loading}
        />
      )}

      {(status === 'connecting' || status === 'connected') && device && (
        <ConnectAuth
          device={device}
          pwd={pwd}
          onPwdChange={setPwd}
          is24h={is24h}
          on24hToggle={() => setIs24h((v) => !v)}
          onConfirmPwd={handleConfirmPwd}
          onSyncPerson={status === 'connected' ? handleSyncPerson : undefined}
          showSyncPerson={status === 'connected'}
          loading={loading}
        />
      )}

      {status === 'ready' && <ConnectReady onDisconnect={handleDisconnect} loading={loading} />}
    </View>
  );
}
