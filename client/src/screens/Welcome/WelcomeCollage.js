import React, { useState } from 'react';
import { View } from 'react-native';
import HardShadow from '../../components/HardShadow/HardShadow';
import { useTheme } from '../../context/ThemeContext';
import { WowArt, PopArt, LolArt } from './WelcomeCardArt';
import styles, {
  COLLAGE_WIDTH,
  COLLAGE_HEIGHT,
  cardLayouts,
} from './WelcomeCollage.styles';

// Fanned collage of three tilted cards, laid out in the design's 390px frame and
// scaled down to fit whatever space is left above the copy on smaller screens.
export default function WelcomeCollage() {
  const { colors } = useTheme();
  const [scale, setScale] = useState(null);

  const handleLayout = event => {
    const { width, height } = event?.nativeEvent?.layout ?? {};
    if (!width || !height) {
      return;
    }
    setScale(Math.min(width / COLLAGE_WIDTH, height / COLLAGE_HEIGHT, 1));
  };

  // Render order is back to front: the centre card sits on top
  const cards = [
    { key: 'wow', Art: WowArt, layout: cardLayouts.left, shadow: colors?.pink },
    { key: 'pop', Art: PopArt, layout: cardLayouts.right, shadow: colors?.cyan },
    { key: 'lol', Art: LolArt, layout: cardLayouts.center, shadow: colors?.accent },
  ];

  return (
    <View
      style={styles?.container}
      onLayout={handleLayout}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {scale !== null && (
        <View style={[styles?.stage, { transform: [{ scale }] }]}>
          {cards.map(({ key, Art, layout, shadow }) => (
            <HardShadow
              key={key}
              color={shadow}
              offset={6}
              borderRadius={layout.radius}
              style={[
                styles?.cardSlot,
                {
                  left: layout.left,
                  top: layout.top,
                  transform: [{ rotate: layout.rotate }],
                },
              ]}
            >
              <View
                style={[
                  styles?.card,
                  {
                    width: layout.width,
                    height: layout.height,
                    borderRadius: layout.radius,
                    borderColor: colors?.outline,
                  },
                ]}
              >
                <Art />
              </View>
            </HardShadow>
          ))}
        </View>
      )}
    </View>
  );
}
