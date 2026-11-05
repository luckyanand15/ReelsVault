import React from 'react';
import { Text, Pressable } from 'react-native';
import HardShadow from '../HardShadow/HardShadow';
import Icon from '../Icon/Icon';
import { useTheme } from '../../context/ThemeContext';
import styles from './Chip.styles';

// Category chip in the bottom-sheet "sticker" look (Dashboard chips differ).
// Selected: accent fill, outline border, pink hard shadow. variant 'new' is the
// dashed "+ New Category" chip.
export default function Chip({
  label,
  icon,
  selected = false,
  variant = 'category',
  onPress,
  disabled = false,
}) {
  const { colors } = useTheme();
  const isNew = variant === 'new';

  const chip = (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected, disabled }}
      style={({ pressed }) => [
        styles?.chip,
        isNew
          ? [styles?.chipNew, { borderColor: colors?.mut }]
          : selected
            ? { backgroundColor: colors?.accent, borderColor: colors?.outline }
            : { backgroundColor: colors?.bg, borderColor: colors?.line },
        pressed && (selected ? styles?.pressedPush : styles?.pressedFade),
      ]}
    >
      {isNew ? (
        <Icon name="plus" size={16} strokeWidth={3} color={colors?.fg} />
      ) : (
        !!icon && <Text style={styles?.icon}>{icon}</Text>
      )}
      <Text
        style={[styles?.label, { color: selected ? colors?.ink : colors?.fg }]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );

  if (!selected) {
    return chip;
  }

  return (
    <HardShadow color={colors?.pink} offset={3} borderRadius={22}>
      {chip}
    </HardShadow>
  );
}
