import { useCallback } from 'react';
import { StatusBar } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';

// App.js sets a dark-on-white status bar for the not-yet-redesigned screens.
// Redesigned screens override it while focused (stack screens stay mounted
// underneath, so this is tied to focus rather than mount).
export default function useThemedStatusBar() {
  const { colors, isDark } = useTheme();

  useFocusEffect(
    useCallback(() => {
      const entry = StatusBar.pushStackEntry({
        barStyle: isDark ? 'light-content' : 'dark-content',
        backgroundColor: colors?.bg,
      });
      return () => StatusBar.popStackEntry(entry);
    }, [isDark, colors?.bg]),
  );
}
