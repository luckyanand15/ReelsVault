import React from 'react';
import { View, Text, Pressable } from 'react-native';
import HardShadow from '../HardShadow/HardShadow';
import { useTheme } from '../../context/ThemeContext';
import styles from './PrimaryButton.styles';

// primary: accent fill, Ink text, pink hard shadow. Pressing pushes the button
// onto its shadow (opacity would let the pink show through the lime).
// secondary: transparent with an outline.
export default function PrimaryButton({
  title,
  onPress,
  variant = 'primary',
  style,
  accessibilityLabel,
}) {
  const { colors } = useTheme();
  const isSecondary = variant === 'secondary';

  const button = (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      style={({ pressed }) => [
        styles?.button,
        {
          borderColor: colors?.outline,
          backgroundColor: isSecondary ? 'transparent' : colors?.accent,
        },
        pressed && (isSecondary ? styles?.pressedFade : styles?.pressedPush),
      ]}
    >
      <Text
        style={[
          styles?.label,
          { color: isSecondary ? colors?.fg : colors?.ink },
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );

  if (isSecondary) {
    return <View style={style}>{button}</View>;
  }

  return (
    <HardShadow color={colors?.pink} offset={4} borderRadius={18} style={style}>
      {button}
    </HardShadow>
  );
}
