'use client';

import { useCallback } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

import { useHbandConnection } from '@/contexts/hband-connection-context';
import { useHBand } from '@/hooks/use-hband';
import type { BatteryData, SportData } from '@/lib/types/hband.types';

const QUERY_KEY = ['hband-data'] as const;

async function fetchHbandData(hband: ReturnType<typeof useHBand>) {
  if (!hband.isSupported) return { sport: null, battery: null };
  const sport = await hband.readSportStep();
  const battery = await hband.readBattery();
  return { sport, battery };
}

export default function DataScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { status } = useHbandConnection();
  const hband = useHBand();

  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => fetchHbandData(hband),
    enabled: status === 'ready' && hband.isSupported,
    staleTime: 60 * 1000,
  });

  const handleSync = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEY });
  }, [queryClient]);

  if (Platform.OS !== 'android') {
    return (
      <View style={styles.centered}>
        <Text style={styles.unsupported}>데이터 조회는 Android에서만 사용할 수 있습니다.</Text>
      </View>
    );
  }

  if (status !== 'ready') {
    return (
      <View style={styles.centered}>
        <Text style={styles.message}>기기를 먼저 연동해 주세요.</Text>
        <Pressable style={styles.button} onPress={() => router.push('/connect')}>
          <Text>연동 탭으로 이동</Text>
        </Pressable>
      </View>
    );
  }

  const sport: SportData | null = data?.sport ?? null;
  const battery: BatteryData | null = data?.battery ?? null;

  return (
    <View style={styles.container}>
      {(isLoading || isFetching) && <ActivityIndicator style={styles.loader} />}
      {isError && <Text style={styles.error}>{error?.message ?? '조회 실패'}</Text>}

      {sport != null && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>현재 걸음</Text>
          <Text style={styles.value}>{sport.step} 걸음</Text>
          <Text style={styles.sub}>거리: {sport.dis.toFixed(2)} km</Text>
          <Text style={styles.sub}>칼로리: {sport.kcal.toFixed(0)} kcal</Text>
        </View>
      )}

      {battery != null && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>배터리</Text>
          <Text style={styles.value}>
            {battery.isPercent ? `${battery.batteryPercent}%` : `레벨 ${battery.batteryLevel}`}
          </Text>
          {battery.isLowBattery && <Text style={styles.lowBattery}>배터리 부족</Text>}
        </View>
      )}

      {!data && !isLoading && (
        <Text style={styles.message}>동기화 버튼을 눌러 데이터를 불러오세요.</Text>
      )}

      <Pressable
        style={styles.button}
        onPress={handleSync}
        disabled={isFetching}>
        <Text>{isFetching ? '동기화 중…' : '동기화'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  unsupported: { textAlign: 'center', fontSize: 16 },
  message: { textAlign: 'center', marginVertical: 8 },
  loader: { marginVertical: 8 },
  error: { color: 'red', marginBottom: 8 },
  card: { padding: 16, backgroundColor: '#f5f5f5', borderRadius: 12 },
  cardTitle: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  value: { fontSize: 24, fontWeight: '700' },
  sub: { fontSize: 14, color: '#666', marginTop: 4 },
  lowBattery: { color: 'red', marginTop: 4 },
  button: {
    backgroundColor: '#ddd',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
});
