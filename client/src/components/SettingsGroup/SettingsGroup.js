import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Icon from '../Icon/Icon';
import { useTheme } from '../../context/ThemeContext';
import styles from './SettingsGroup.styles';

// Uppercase eyebrow + outlined card. Rows are separated by
// 2px dividers, added here so rows don't need to know their position.
export default function SettingsGroup({ label, children }) {
  const { colors } = useTheme();
  const rows = React.Children.toArray(children).filter(Boolean);

  return (
    <View style={styles?.group}>
      {!!label && (
        <Text style={[styles?.eyebrow, { color: colors?.mut }]}>{label}</Text>
      )}
      <View
        style={[
          styles?.card,
          { backgroundColor: colors?.surf, borderColor: colors?.outline },
        ]}
      >
        {rows.map((row, index) => (
          <React.Fragment key={row.key ?? index}>
            {index > 0 && (
              <View style={[styles?.divider, { backgroundColor: colors?.line }]} />
            )}
            {row}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

// One tappable row: coloured icon tile, title, optional subtitle, chevron.
// Icons on bright tiles are Ink unless iconColor says otherwise.
export function SettingsRow({
  icon,
  tileColor,
  iconColor,
  title,
  titleColor,
  subtitle,
  wrapSubtitle = false,
  showChevron = true,
  onPress,
}) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={subtitle?.trim() ? `${title}, ${subtitle}` : title}
      style={({ pressed }) => [styles?.row, pressed && styles?.pressed]}
    >
      <View style={[styles?.tile, { backgroundColor: tileColor }]}>
        <Icon
          name={icon}
          size={22}
          strokeWidth={2.4}
          color={iconColor ?? colors?.ink}
        />
      </View>
      <View style={styles?.textContainer}>
        <Text style={[styles?.title, { color: titleColor ?? colors?.fg }]}>
          {title}
        </Text>
        {!!subtitle && (
          <Text
            style={[styles?.subtitle, { color: colors?.mut }]}
            numberOfLines={wrapSubtitle ? 0 : 1}
            ellipsizeMode="tail"
          >
            {subtitle}
          </Text>
        )}
      </View>
      {showChevron && <Icon name="chevronRight" size={20} color={colors?.mut} />}
    </Pressable>
  );
}
