import React from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import HardShadow from '../HardShadow/HardShadow';
import { useTheme } from '../../context/ThemeContext';
import styles from './PrimaryButton.styles';

// primary: accent fill, Ink text, pink hard shadow. Pressing pushes the button
// onto its shadow (opacity would let the pink show through the lime).
// secondary: transparent with an outline.
// inactive: the "not ready yet" look only. The button stays pressable so the
// screen can explain what's missing.
export default function PrimaryButton({
  title,
  onPress,
  variant = 'primary',
  inactive = false,
  loading = false,
  height = 56,
  style,
  accessibilityLabel,
}) {
  const { colors } = useTheme();
  const isSecondary = variant === 'secondary';
  const isFlat = isSecondary || (inactive && !loading);

  const fill = isSecondary
    ? 'transparent'
    : isFlat
      ? colors?.bg
      : colors?.accent;
  const textColor = isSecondary
    ? colors?.fg
    : isFlat
      ? colors?.mut
      : colors?.ink;

  const button = (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ busy: loading }}
      style={({ pressed }) => [
        styles?.button,
        {
          height,
          borderColor: inactive && !loading ? colors?.line : colors?.outline,
          backgroundColor: fill,
        },
        pressed && (isFlat ? styles?.pressedFade : styles?.pressedPush),
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors?.ink} />
      ) : (
        <Text style={[styles?.label, { color: textColor }]}>{title}</Text>
      )}
    </Pressable>
  );

  if (isFlat) {
    return <View style={style}>{button}</View>;
  }

  return (
    <HardShadow color={colors?.pink} offset={4} borderRadius={18} style={style}>
      {button}
    </HardShadow>
  );
}
