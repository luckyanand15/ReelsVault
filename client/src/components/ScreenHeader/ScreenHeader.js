import React from 'react';
import { View, Text } from 'react-native';
import IconButton from '../IconButton/IconButton';
import BrandMark from '../BrandMark/BrandMark';
import { useTheme } from '../../context/ThemeContext';
import styles from './ScreenHeader.styles';

// Top bar for inner screens: round back button, then the screen title
// (Settings) or, without one, the wordmark (Login).
export default function ScreenHeader({ onBack, title }) {
  const { colors } = useTheme();

  return (
    <View style={styles?.row}>
      <IconButton icon="arrowLeft" onPress={onBack} accessibilityLabel="Back" />
      {title ? (
        <Text
          style={[styles?.title, { color: colors?.fg }]}
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
