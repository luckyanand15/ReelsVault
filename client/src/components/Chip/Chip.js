import React from 'react';
import { Text, Pressable } from 'react-native';
import HardShadow from '../HardShadow/HardShadow';
import Icon from '../Icon/Icon';
import { useTheme } from '../../context/ThemeContext';
import styles from './Chip.styles';

// Category chip.
// look 'sheet' (Add/Edit Reel): the "sticker" look. Unselected bg fill;
// selected accent fill, outline border, pink hard shadow.
// look 'dashboard': calmer. Unselected surf fill; selected accent fill with no
// border or shadow.
// variant 'new' is the dashed "+ New Category" chip.
export default function Chip({
  label,
  icon,
  selected = false,
  variant = 'category',
  look = 'sheet',
  onPress,
  onLayout,
  disabled = false,
}) {
  const { colors } = useTheme();
  const isNew = variant === 'new';
  const isDashboard = look === 'dashboard';

  const fillStyle = isNew
    ? [styles?.chipNew, { borderColor: colors?.mut }]
    : selected
      ? {
          backgroundColor: colors?.accent,
          borderColor: isDashboard ? colors?.accent : colors?.outline,
        }
      : {
          backgroundColor: isDashboard ? colors?.surf : colors?.bg,
          borderColor: colors?.line,
        };

  const chip = (
    <Pressable
      onPress={onPress}
      onLayout={onLayout}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected, disabled }}
      style={({ pressed }) => [
        styles?.chip,
        fillStyle,
        pressed &&
          (selected && !isDashboard ? styles?.pressedPush : styles?.pressedFade),
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

  if (!selected || isDashboard) {
    return chip;
  }

  return (
    <HardShadow color={colors?.pink} offset={3} borderRadius={22}>
      {chip}
    </HardShadow>
  );
}
