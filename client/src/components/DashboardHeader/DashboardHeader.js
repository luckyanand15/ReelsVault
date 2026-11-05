import React from 'react';
import { View } from 'react-native';
import BrandMark from '../BrandMark/BrandMark';
import IconButton from '../IconButton/IconButton';
import { useTheme } from '../../context/ThemeContext';
import styles from './DashboardHeader.styles';

// Logo + wordmark + "Your reel stash", then the theme toggle (sun in dark
// mode, moon in light) and the settings (⋮) button.
export default function DashboardHeader({ onSettingsPress }) {
  const { colors, isDark, toggleTheme } = useTheme();

  return (
    <View style={styles?.row}>
      <BrandMark size={21} tagline="Your reel stash" />
      <View style={styles?.actions}>
        <IconButton
          icon={isDark ? 'sun' : 'moon'}
          iconColor={isDark ? colors?.yellow : colors?.fg}
          iconStrokeWidth={2.4}
          onPress={toggleTheme}
          accessibilityLabel={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
        />
        <IconButton
          icon="more"
          iconSize={20}
          onPress={onSettingsPress}
          accessibilityLabel="Settings"
        />
      </View>
    </View>
  );
}
