import React from 'react';
import { View } from 'react-native';
import IconButton from '../IconButton/IconButton';
import BrandMark from '../BrandMark/BrandMark';
import styles from './AuthHeader.styles';

// Top bar for the login screens: round back button + wordmark
export default function AuthHeader({ onBack }) {
  return (
    <View style={styles?.row}>
      <IconButton icon="arrowLeft" onPress={onBack} accessibilityLabel="Back" />
      <BrandMark showBadge={false} />
    </View>
  );
}
