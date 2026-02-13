'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { useLifelog } from '@/hooks/use-lifelog';
import type { LifelogRecord } from '@/lib/types/lifelog.types';

const LIFELOG_RANGE_KEY = 'lifelog-range';
const DAYS_WEEK = 7;

function getDateRange(days: number): { from: string; to: string } {
  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - days + 1);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

function StepBar({ record, maxStep }: { record: LifelogRecord; maxStep: number }) {
  const step = record.sport?.step ?? 0;
  const widthPercent = maxStep > 0 ? (step / maxStep) * 100 : 0;
  return (
    <View className="flex-row items-center gap-2 py-2 border-b border-gray-200">
      <Text className="text-sm text-gray-600 w-24" numberOfLines={1}>
        {record.date}
      </Text>
      <View className="flex-1 h-6 bg-gray-100 rounded overflow-hidden">
        <View
          className="h-full bg-green-500 rounded"
          style={{ width: `${widthPercent}%` }}
        />
      </View>
      <Text className="text-sm font-medium w-14 text-right">{step.toLocaleString()}</Text>
    </View>
  );
}

export default function HistoryScreen() {
  const { getByDateRange } = useLifelog();
  const { from, to } = useMemo(() => getDateRange(DAYS_WEEK), []);

  const { data: records = [], isLoading, isError, error } = useQuery({
    queryKey: [LIFELOG_RANGE_KEY, from, to],
    queryFn: () => getByDateRange(from, to),
  });

  const maxStep = useMemo(() => {
    return Math.max(1, ...records.map((r) => r.sport?.step ?? 0));
  }, [records]);

  return (
    <View className="flex-1 p-4">
      <Text className="text-lg font-semibold mb-2">최근 {DAYS_WEEK}일 걸음</Text>
      {isLoading && (
        <View className="py-8 items-center">
          <ActivityIndicator />
        </View>
      )}
      {isError && (
        <Text className="text-red-500 mb-2">{error?.message ?? '조회 실패'}</Text>
      )}
      {!isLoading && records.length === 0 && (
        <Text className="text-gray-500 py-4">저장된 기록이 없습니다. 데이터 탭에서 동기화해 주세요.</Text>
      )}
      {!isLoading && records.length > 0 && (
        <View className="bg-white rounded-xl p-3">
          {records.map((record) => (
            <StepBar key={record.date} record={record} maxStep={maxStep} />
          ))}
        </View>
      )}
    </View>
  );
}
