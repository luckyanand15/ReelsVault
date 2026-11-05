import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import HardShadow from '../HardShadow/HardShadow';
import { useTheme } from '../../context/ThemeContext';
import styles from './BrandMark.styles';

// Logo badge + "ReelsVault" wordmark. Wordmark is 18 on Welcome/inner screens,
// 21 on the Dashboard header. Inner screens (Login) show the wordmark only.
export default function BrandMark({ size = 18, showBadge = true }) {
  const { colors } = useTheme();

  return (
    <View style={styles?.row} accessible accessibilityLabel="ReelsVault">
      {showBadge && (
        <HardShadow
          color={colors?.pink}
          offset={3}
          borderRadius={13}
          style={styles?.badgeWrap}
        >
          <View
            style={[
              styles?.badge,
              { backgroundColor: colors?.accent, borderColor: colors?.outline },
            ]}
          >
            <Svg width={18} height={18} viewBox="0 0 24 24">
              <Path
                d="M7 4.5 L19.5 12 L7 19.5 Z"
                fill={colors?.ink}
                stroke={colors?.ink}
                strokeWidth={2}
                strokeLinejoin="round"
              />
            </Svg>
          </View>
        </HardShadow>
      )}

      <Text style={[styles?.wordmark, { fontSize: size, color: colors?.fg }]}>
        Reels<Text style={{ color: colors?.pinkText }}>Vault</Text>
      </Text>
    </View>
  );
}
