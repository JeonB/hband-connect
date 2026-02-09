# Tailwind CSS 스타일링 규칙 (NativeWind)

## 적용 범위

- **모든 화면(스크린) UI**는 Tailwind CSS로 스타일링한다.
- 새로 작성·수정하는 화면 컴포넌트는 `StyleSheet` 대신 Tailwind 유틸리티 클래스를 사용한다.

## React Native에서의 사용 (NativeWind)

- 이 프로젝트는 **NativeWind v4** + **Tailwind CSS v3**를 사용한다.
- React Native 코어 컴포넌트(`View`, `Text`, `TouchableOpacity`, `ScrollView`, `FlatList` 등)에는 **`className`** prop으로 Tailwind 클래스를 전달한다.
- `global.css`에 `@tailwind base;` `@tailwind components;` `@tailwind utilities;`가 포함되어 있으며, `app/_layout.tsx`에서 import된다.

## 규칙 요약

1. **레이아웃·간격·색상·타이포**는 Tailwind 유틸리티로 작성한다.
2. **인라인 `style` / `StyleSheet.create`**는 Tailwind로 대체 가능한 경우 사용하지 않는다.
3. **디자인 토큰**(색, 간격, 둥글기)은 `tailwind.config.js` 또는 `global.css`로 일원화한다.
4. **반응형**이 필요하면 `sm:`, `md:` 등 Tailwind 브레이크포인트를 사용한다.
5. **ScrollView / FlatList**의 콘텐츠 영역은 `contentContainerClassName`을 사용한다.

## 예시 (NativeWind className)

```tsx
// 비권장: StyleSheet
<View style={styles.container}>
  <Text style={styles.title}>제목</Text>
</View>

// 권장: className으로 Tailwind 클래스
<View className="flex-1 p-4 bg-white">
  <Text className="text-lg font-semibold text-gray-900">제목</Text>
</View>

// ScrollView
<ScrollView className="flex-1 bg-white" contentContainerClassName="p-4 pt-12">
  ...
</ScrollView>
```

## 예외

- BLE/네이티브 연동 등 **기존 라이브러리가 요구하는 style prop**은 유지한다.
- **애니메이션** 등 동적 스타일이 필요한 경우만 `style`을 보완적으로 사용한다.
- `ActivityIndicator` 등 `className`을 지원하지 않는 컴포넌트는 wrapper `View`에 `className`을 적용하거나 `style`을 사용한다.
