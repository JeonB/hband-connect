'use client';

import { useCallback } from 'react';
import { ActivityIndicator, Platform, Pressable, Text, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

import { useHbandConnection } from '@/contexts/hband-connection-context';
import { useHBand } from '@/hooks/use-hband';
import { useLifelog } from '@/hooks/use-lifelog';
import type { BatteryData, SportData } from '@/lib/types/hband.types';

const QUERY_KEY = ['hband-data'] as const;
const LIFELOG_RANGE_KEY = 'lifelog-range';
const DEFAULT_STEP_AIM = 8000;

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
  const { syncAndStoreToday } = useLifelog();

  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => fetchHbandData(hband),
    enabled: status === 'ready' && hband.isSupported,
    staleTime: 60 * 1000,
  });

  const syncMutation = useMutation({
    mutationFn: syncAndStoreToday,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [LIFELOG_RANGE_KEY] });
    },
  });

  const handleSync = useCallback(() => {
    syncMutation.mutate();
  }, [syncMutation]);

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
  const stepAim = DEFAULT_STEP_AIM;
  const stepProgressPercent =
    sport != null && stepAim > 0 ? Math.min(100, (sport.step / stepAim) * 100) : 0;

  return (
    <View className="flex-1 p-4 gap-4">
      {(isLoading || isFetching || syncMutation.isPending) && (
        <View className="my-2">
          <ActivityIndicator />
        </View>
      )}
      {isError && <Text className="text-red-500 mb-2">{error?.message ?? '조회 실패'}</Text>}
      {syncMutation.isError && (
        <Text className="text-red-500 mb-2">
          {syncMutation.error instanceof Error ? syncMutation.error.message : '저장 실패'}
        </Text>
      )}

      {sport != null && (
        <View className="p-4 bg-gray-100 rounded-xl">
          <Text className="text-sm font-semibold mb-2">오늘 걸음</Text>
          <Text className="text-2xl font-bold">{sport.step.toLocaleString()} 걸음</Text>
          <View className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
            <View
              className="h-full bg-green-500 rounded-full"
              style={{ width: `${stepProgressPercent}%` }}
            />
          </View>
          <Text className="text-sm text-gray-600 mt-1">
            목표 {stepAim.toLocaleString()}걸음 중 {stepProgressPercent.toFixed(0)}%
          </Text>
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
        disabled={isFetching || syncMutation.isPending}>
        <Text>{isFetching || syncMutation.isPending ? '동기화 중…' : '동기화'}</Text>
      </Pressable>
    </View>
  );
}
