import { Platform } from 'react-native';

/** HBand BLE 연동은 Android에서만 지원. iOS/웹에서는 연동·데이터 조회 비활성화. */
export const isHbandSupported = Platform.OS === 'android';
