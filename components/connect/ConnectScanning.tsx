import { FlatList, Pressable, Text } from 'react-native';
import type { DeviceInfo } from '@/lib/types/hband.types';

type Props = {
  onStopScan: () => void;
  devices: DeviceInfo[];
  onConnect: (mac: string) => void;
  loading: boolean;
};

export function ConnectScanning({ onStopScan, devices, onConnect, loading }: Props) {
  return (
    <>
      <Pressable
        className="bg-gray-300 py-3.5 rounded-lg items-center"
        onPress={onStopScan}
        disabled={loading}
        accessibilityRole="button"
        accessibilityLabel="스캔 중지">
        <Text>스캔 중지</Text>
      </Pressable>
      <FlatList
        data={devices}
        keyExtractor={(item) => item.mac}
        renderItem={({ item }) => (
          <Pressable
            className="p-3 border-b border-gray-200"
            onPress={() => onConnect(item.mac)}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel={`${item.name || item.mac} 연결`}>
            <Text>{item.name || item.mac}</Text>
            <Text className="text-xs text-gray-500">{item.mac}</Text>
          </Pressable>
        )}
      />
    </>
  );
}
