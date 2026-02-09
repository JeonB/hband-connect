'use client';

import { useCallback } from 'react';
import { ActivityIndicator, Platform, Pressable, Text, View } from 'react-native';
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
      <View className="flex-1 justify-center items-center p-6">
        <Text className="text-center text-base">데이터 조회는 Android에서만 사용할 수 있습니다.</Text>
      </View>
    );
  }

  if (status !== 'ready') {
    return (
      <View className="flex-1 justify-center items-center p-6">
        <Text className="text-center my-2">기기를 먼저 연동해 주세요.</Text>
        <Pressable className="bg-gray-300 py-3.5 px-6 rounded-lg items-center" onPress={() => router.push('/connect')}>
          <Text>연동 탭으로 이동</Text>
        </Pressable>
      </View>
    );
  }

  const sport: SportData | null = data?.sport ?? null;
  const battery: BatteryData | null = data?.battery ?? null;

  return (
    <View className="flex-1 p-4 gap-4">
      {(isLoading || isFetching) && (
        <View className="my-2">
          <ActivityIndicator />
        </View>
      )}
      {isError && <Text className="text-red-500 mb-2">{error?.message ?? '조회 실패'}</Text>}

      {sport != null && (
        <View className="p-4 bg-gray-100 rounded-xl">
          <Text className="text-sm font-semibold mb-2">현재 걸음</Text>
          <Text className="text-2xl font-bold">{sport.step} 걸음</Text>
          <Text className="text-sm text-gray-600 mt-1">거리: {sport.dis.toFixed(2)} km</Text>
          <Text className="text-sm text-gray-600 mt-1">칼로리: {sport.kcal.toFixed(0)} kcal</Text>
        </View>
      )}

      {battery != null && (
        <View className="p-4 bg-gray-100 rounded-xl">
          <Text className="text-sm font-semibold mb-2">배터리</Text>
          <Text className="text-2xl font-bold">
            {battery.isPercent ? `${battery.batteryPercent}%` : `레벨 ${battery.batteryLevel}`}
          </Text>
          {battery.isLowBattery && <Text className="text-red-500 mt-1">배터리 부족</Text>}
        </View>
      )}

      {!data && !isLoading && (
        <Text className="text-center my-2">동기화 버튼을 눌러 데이터를 불러오세요.</Text>
      )}

      <Pressable
        className="bg-gray-300 py-3.5 rounded-lg items-center mt-2"
        onPress={handleSync}
        disabled={isFetching}>
        <Text>{isFetching ? '동기화 중…' : '동기화'}</Text>
      </Pressable>
    </View>
  );
}
