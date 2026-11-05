import React from 'react';
import { View } from 'react-native';
import Svg, { Defs, Pattern, Circle, Rect, Path } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import styles from './ScreenBackground.styles';

const SPARKLE_PATH =
  'M12 1.5 L14.6 9.4 L22.5 12 L14.6 14.6 L12 22.5 L9.4 14.6 L1.5 12 L9.4 9.4 Z';

export function Sparkle({ size, color, style }) {
  return (
    <View pointerEvents="none" style={style}>
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path d={SPARKLE_PATH} fill={color} />
      </Svg>
    </View>
  );
}

// Decorative screen backdrop.
// variant: 'welcome' (dots, big circle, two sparkles), 'auth' (login screens:
// dots, smaller circle, one sparkle), 'calm' (Dashboard: circle only).
// circleColor defaults to pink.
export default function ScreenBackground({ variant = 'welcome', circleColor }) {
  const { colors } = useTheme();
  const showDots = variant !== 'calm';

  return (
    <View
      pointerEvents="none"
      style={styles?.container}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {showDots && (
        <Svg width="100%" height="100%" style={styles?.dots}>
          <Defs>
            <Pattern
              id="screenDots"
              width={22}
              height={22}
              patternUnits="userSpaceOnUse"
            >
              <Circle cx={11} cy={11} r={1.5} fill={colors?.dots} />
            </Pattern>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#screenDots)" />
        </Svg>
      )}

      <View
        style={[
          variant === 'auth' ? styles?.circleSmall : styles?.circle,
          { backgroundColor: circleColor ?? colors?.pink },
        ]}
      />

      {variant === 'welcome' && (
        <>
          <Sparkle size={40} color={colors?.yellow} style={styles?.sparkleLarge} />
          <Sparkle size={26} color={colors?.cyan} style={styles?.sparkleSmall} />
        </>
      )}

      {variant === 'auth' && (
        <Sparkle size={34} color={colors?.yellow} style={styles?.sparkleAuth} />
      )}
    </View>
  );
}
