import React from 'react';
import { Pressable } from 'react-native';
import Icon from '../Icon/Icon';
import { useTheme } from '../../context/ThemeContext';
import styles from './IconButton.styles';

// Round icon button: line border, fg icon. 46px with surf fill by default;
// sheets use the 44px close button with bg fill (it sits on a surf sheet).
// Icon-only, so a label is required.
export default function IconButton({
  icon,
  onPress,
  accessibilityLabel,
  size = 46,
  fill = 'surf',
  iconSize = 22,
  iconStrokeWidth,
  style,
}) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={4}
      style={({ pressed }) => [
        styles?.button,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors?.[fill],
          borderColor: colors?.line,
        },
        pressed && styles?.pressed,
        style,
      ]}
    >
      <Icon
        name={icon}
        size={iconSize}
        color={colors?.fg}
        strokeWidth={iconStrokeWidth}
      />
    </Pressable>
  );
}
