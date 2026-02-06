'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

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
      <View style={styles.centered}>
        <Text style={styles.unsupported}>HBand 연동은 Android에서만 사용할 수 있습니다.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Text style={styles.status}>상태: {status}</Text>

      {status === 'disconnected' && (
        <>
          <Pressable style={styles.button} onPress={handleInit} disabled={loading}>
            <Text>SDK 초기화</Text>
          </Pressable>
          <Pressable style={styles.button} onPress={handleStartScan} disabled={loading}>
            {loading ? <ActivityIndicator /> : <Text>스캔 시작</Text>}
          </Pressable>
        </>
      )}

      {status === 'scanning' && (
        <>
          <Pressable style={styles.button} onPress={handleStopScan} disabled={loading}>
            <Text>스캔 중지</Text>
          </Pressable>
          <FlatList
            data={devices}
            keyExtractor={(item) => item.mac}
            renderItem={({ item }) => (
              <Pressable
                style={styles.deviceItem}
                onPress={() => handleConnect(item.mac)}
                disabled={loading}>
                <Text>{item.name || item.mac}</Text>
                <Text style={styles.mac}>{item.mac}</Text>
              </Pressable>
            )}
          />
        </>
      )}

      {(status === 'connecting' || status === 'connected') && device && (
        <>
          <Text style={styles.deviceName}>{device.name || device.mac}</Text>
          <TextInput
            style={styles.input}
            value={pwd}
            onChangeText={setPwd}
            placeholder="비밀번호 (4자)"
            maxLength={4}
            keyboardType="number-pad"
          />
          <Pressable
            style={styles.checkbox}
            onPress={() => setIs24h(!is24h)}>
            <Text>24시간 형식</Text>
            <Text>{is24h ? '✓' : ''}</Text>
          </Pressable>
          <Pressable style={styles.button} onPress={handleConfirmPwd} disabled={loading}>
            {loading ? <ActivityIndicator /> : <Text>비밀번호 확인</Text>}
          </Pressable>
        </>
      )}

      {status === 'connected' && (
        <Pressable style={styles.button} onPress={handleSyncPerson} disabled={loading}>
          {loading ? <ActivityIndicator /> : <Text>개인정보 동기화</Text>}
        </Pressable>
      )}

      {status === 'ready' && (
        <>
          <Text style={styles.ready}>연동 완료</Text>
          <Pressable style={styles.button} onPress={handleDisconnect} disabled={loading}>
            <Text>연결 해제</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  unsupported: { textAlign: 'center', fontSize: 16 },
  error: { color: 'red', marginBottom: 8 },
  status: { fontWeight: '600', marginBottom: 8 },
  button: {
    backgroundColor: '#ddd',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  deviceItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  mac: { fontSize: 12, color: '#666' },
  deviceName: { fontWeight: '600', marginTop: 8 },
  input: { borderWidth: 1, padding: 10, borderRadius: 6 },
  checkbox: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ready: { color: 'green', fontWeight: '600' },
});
