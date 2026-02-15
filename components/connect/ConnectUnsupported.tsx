import { Text, View } from 'react-native';

export function ConnectUnsupported() {
  return (
    <View className="flex-1 justify-center items-center p-6">
      <Text className="text-center text-base">HBand 연동은 Android에서만 사용할 수 있습니다.</Text>
    </View>
  );
}
