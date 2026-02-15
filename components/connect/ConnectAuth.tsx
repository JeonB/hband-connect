import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import type { DeviceInfo } from '@/lib/types/hband.types';

type Props = {
  device: DeviceInfo;
  pwd: string;
  onPwdChange: (value: string) => void;
  is24h: boolean;
  on24hToggle: () => void;
  onConfirmPwd: () => void;
  onSyncPerson?: () => void;
  showSyncPerson: boolean;
  loading: boolean;
};

export function ConnectAuth({
  device,
  pwd,
  onPwdChange,
  is24h,
  on24hToggle,
  onConfirmPwd,
  onSyncPerson,
  showSyncPerson,
  loading,
}: Props) {
  return (
    <>
      <Text className="font-semibold mt-2">{device.name || device.mac}</Text>
      <TextInput
        className="border p-2.5 rounded-md"
        value={pwd}
        onChangeText={onPwdChange}
        placeholder="비밀번호 (4자)"
        maxLength={4}
        keyboardType="number-pad"
        accessibilityLabel="비밀번호 4자리"
      />
      <Pressable
        className="flex-row items-center gap-2"
        onPress={on24hToggle}
        accessibilityRole="checkbox"
        accessibilityLabel="24시간 형식"
        accessibilityState={{ checked: is24h }}>
        <Text>24시간 형식</Text>
        <Text>{is24h ? '✓' : ''}</Text>
      </Pressable>
      <Pressable
        className="bg-gray-300 py-3.5 rounded-lg items-center"
        onPress={onConfirmPwd}
        disabled={loading}
        accessibilityRole="button"
        accessibilityLabel="비밀번호 확인">
        {loading ? <ActivityIndicator /> : <Text>비밀번호 확인</Text>}
      </Pressable>
      {showSyncPerson && onSyncPerson && (
        <Pressable
          className="bg-gray-300 py-3.5 rounded-lg items-center"
          onPress={onSyncPerson}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel="개인정보 동기화">
          {loading ? <ActivityIndicator /> : <Text>개인정보 동기화</Text>}
        </Pressable>
      )}
    </>
  );
}
