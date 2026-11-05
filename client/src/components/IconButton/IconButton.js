import React from 'react';
import { Pressable } from 'react-native';
import Icon from '../Icon/Icon';
import { useTheme } from '../../context/ThemeContext';
import styles from './IconButton.styles';

// 46px round button: surf fill, line border, fg icon. Icon-only, so a label is required.
export default function IconButton({ icon, onPress, accessibilityLabel, style }) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={4}
      style={({ pressed }) => [
        styles?.button,
        { backgroundColor: colors?.surf, borderColor: colors?.line },
        pressed && styles?.pressed,
        style,
      ]}
    >
      <Icon name={icon} size={22} color={colors?.fg} />
    </Pressable>
  );
}
