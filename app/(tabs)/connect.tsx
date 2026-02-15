'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  CONNECTION_STATUS_LABELS,
  CONNECTION_STEPS,
  CONNECTION_TOTAL_STEPS,
  getConnectionStepIndex,
} from '@/constants/connection';
import { useHbandConnection } from '@/contexts/hband-connection-context';
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

  if (Platform.OS !== 'android') {
    return (
      <View className="flex-1 justify-center items-center p-6">
        <Text className="text-center text-base">HBand 연동은 Android에서만 사용할 수 있습니다.</Text>
      </View>
    );
  }

  const currentStep = getConnectionStepIndex(status);
  const currentStepInfo = CONNECTION_STEPS[currentStep - 1];

  return (
    <View className="flex-1 p-4 gap-3">
      {error ? <Text className="text-red-500 mb-2">{error}</Text> : null}

      <View className="mb-3 p-3 rounded-xl bg-gray-100 dark:bg-gray-800">
        <Text className="text-xs text-gray-500 dark:text-gray-400 mb-1">현재 상태</Text>
        <Text className="font-semibold text-base">{CONNECTION_STATUS_LABELS[status]}</Text>
      </View>

      <View className="mb-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
        <Text className="font-semibold mb-2">
          연동 단계 ({currentStep}/{CONNECTION_TOTAL_STEPS})
        </Text>
        {CONNECTION_STEPS.map((s) => {
          const isActive = s.step === currentStep;
          return (
            <View
              key={s.step}
              className={`flex-row gap-2 py-1.5 ${isActive ? 'rounded-lg bg-blue-100 dark:bg-blue-900/30 px-2 -mx-1' : ''}`}>
              <Text
                className={`w-6 text-sm ${isActive ? 'font-semibold text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
                {s.step}.
              </Text>
              <View className="flex-1">
                <Text className={`text-sm ${isActive ? 'font-semibold' : ''}`}>{s.title}</Text>
                {isActive && currentStepInfo ? (
                  <Text className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">
                    {currentStepInfo.description}
                  </Text>
                ) : null}
              </View>
            </View>
          );
        })}
      </View>

      {status === 'disconnected' && (
        <>
          <Pressable className="bg-gray-300 py-3.5 rounded-lg items-center" onPress={handleInit} disabled={loading}>
            <Text>SDK 초기화</Text>
          </Pressable>
          <Pressable className="bg-gray-300 py-3.5 rounded-lg items-center" onPress={handleStartScan} disabled={loading}>
            {loading ? <ActivityIndicator /> : <Text>스캔 시작</Text>}
          </Pressable>
        </>
      )}

      {status === 'scanning' && (
        <>
          <Pressable className="bg-gray-300 py-3.5 rounded-lg items-center" onPress={handleStopScan} disabled={loading}>
            <Text>스캔 중지</Text>
          </Pressable>
          <FlatList
            data={devices}
            keyExtractor={(item) => item.mac}
            renderItem={({ item }) => (
              <Pressable
                className="p-3 border-b border-gray-200"
                onPress={() => handleConnect(item.mac)}
                disabled={loading}>
                <Text>{item.name || item.mac}</Text>
                <Text className="text-xs text-gray-500">{item.mac}</Text>
              </Pressable>
            )}
          />
        </>
      )}

      {(status === 'connecting' || status === 'connected') && device && (
        <>
          <Text className="font-semibold mt-2">{device.name || device.mac}</Text>
          <TextInput
            name="device-password"
            className="border p-2.5 rounded-md"
            value={pwd}
            onChangeText={setPwd}
            placeholder="비밀번호 (4자)"
            maxLength={4}
            keyboardType="number-pad"
          />
          <Pressable
            className="flex-row items-center gap-2"
            onPress={() => setIs24h(!is24h)}>
            <Text>24시간 형식</Text>
            <Text>{is24h ? '✓' : ''}</Text>
          </Pressable>
          <Pressable className="bg-gray-300 py-3.5 rounded-lg items-center" onPress={handleConfirmPwd} disabled={loading}>
            {loading ? <ActivityIndicator /> : <Text>비밀번호 확인</Text>}
          </Pressable>
        </>
      )}

      {status === 'connected' && (
        <Pressable className="bg-gray-300 py-3.5 rounded-lg items-center" onPress={handleSyncPerson} disabled={loading}>
          {loading ? <ActivityIndicator /> : <Text>개인정보 동기화</Text>}
        </Pressable>
      )}

      {status === 'ready' && (
        <>
          <Text className="text-green-600 font-semibold">연동 완료</Text>
          <Pressable className="bg-gray-300 py-3.5 rounded-lg items-center" onPress={handleDisconnect} disabled={loading}>
            <Text>연결 해제</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}
