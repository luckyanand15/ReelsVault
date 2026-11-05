import React from 'react';
import { Pressable, ActivityIndicator } from 'react-native';
import HardShadow from '../HardShadow/HardShadow';
import Icon from '../Icon/Icon';
import { useTheme } from '../../context/ThemeContext';
import styles from './RoundArrowButton.styles';

// 68px "next" button for the login steps. `active` only changes the look:
// the button stays pressable so the screen can explain what's missing.
// icon: 'arrowRight' (next step) or 'check' (a final save, e.g. Edit Name).
export default function RoundArrowButton({
  onPress,
  active,
  loading = false,
  icon = 'arrowRight',
  accessibilityLabel,
}) {
  const { colors } = useTheme();
  const lit = active || loading;

  const button = (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ busy: loading }}
      style={({ pressed }) => [
        styles?.button,
        lit
          ? { backgroundColor: colors?.accent, borderColor: colors?.outline }
          : { backgroundColor: colors?.surf, borderColor: colors?.line },
        pressed && (lit ? styles?.pressedPush : styles?.pressedFade),
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors?.ink} />
      ) : (
        <Icon
          name={icon}
          size={28}
          strokeWidth={3}
          color={lit ? colors?.ink : colors?.mut}
        />
      )}
    </Pressable>
  );

  if (!lit) {
    return button;
  }

  return (
    <HardShadow color={colors?.pink} offset={4} borderRadius={34}>
      {button}
    </HardShadow>
  );
}
