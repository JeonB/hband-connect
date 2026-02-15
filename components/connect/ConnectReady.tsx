import { Pressable, Text } from 'react-native';

type Props = {
  onDisconnect: () => void;
  loading: boolean;
};

export function ConnectReady({ onDisconnect, loading }: Props) {
  return (
    <>
      <Text className="text-green-600 font-semibold">연동 완료</Text>
      <Pressable
        className="bg-gray-300 py-3.5 rounded-lg items-center"
        onPress={onDisconnect}
        disabled={loading}
        accessibilityRole="button"
        accessibilityLabel="연결 해제">
        <Text>연결 해제</Text>
      </Pressable>
    </>
  );
}
