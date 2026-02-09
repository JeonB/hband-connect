import { Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
  className?: string;
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  className,
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  const typeClassName =
    type === 'default'
      ? 'text-base leading-6'
      : type === 'title'
        ? 'text-[32px] font-bold leading-8'
        : type === 'defaultSemiBold'
          ? 'text-base leading-6 font-semibold'
          : type === 'subtitle'
            ? 'text-xl font-bold'
            : type === 'link'
              ? 'text-base leading-[30px] text-[#0a7ea4]'
              : '';

  return (
    <Text
      className={`${typeClassName} ${className || ''}`}
      style={[type !== 'link' ? { color } : undefined, style]}
      {...rest}
    />
  );
}
