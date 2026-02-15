import { ActivityIndicator, Pressable, Text } from 'react-native';

type Props = {
  onInit: () => void;
  onStartScan: () => void;
  loading: boolean;
};

export function ConnectDisconnected({ onInit, onStartScan, loading }: Props) {
  return (
    <>
      <Pressable
        className="bg-gray-300 py-3.5 rounded-lg items-center"
        onPress={onInit}
        disabled={loading}
        accessibilityRole="button"
        accessibilityLabel="SDK 초기화">
        <Text>SDK 초기화</Text>
      </Pressable>
      <Pressable
        className="bg-gray-300 py-3.5 rounded-lg items-center"
        onPress={onStartScan}
        disabled={loading}
        accessibilityRole="button"
        accessibilityLabel="스캔 시작">
        {loading ? <ActivityIndicator /> : <Text>스캔 시작</Text>}
      </Pressable>
    </>
  );
}
