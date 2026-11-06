import React from 'react';
import { View, Text } from 'react-native';
import IconButton from '../IconButton/IconButton';
import BrandMark from '../BrandMark/BrandMark';
import { useTheme } from '../../context/ThemeContext';
import styles from './ScreenHeader.styles';

// Top bar for inner screens: round back button, then the screen title
// (Settings) or, without one, the wordmark (Login). Long titles use a
// smaller titleSize (Manage Categories: 20).
export default function ScreenHeader({ onBack, title, titleSize = 22 }) {
  const { colors } = useTheme();

  return (
    <View style={styles?.row}>
      <IconButton icon="arrowLeft" onPress={onBack} accessibilityLabel="Back" />
      {title ? (
        <Text
          style={[styles?.title, { color: colors?.fg, fontSize: titleSize }]}
          accessibilityRole="header"
          numberOfLines={1}
        >
          {title}
        </Text>
      ) : (
        <BrandMark showBadge={false} />
      )}
    </View>
  );
}
