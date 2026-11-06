import React from 'react';
import { View } from 'react-native';
import styles from './HardShadow.styles';

// Android's elevation can't draw a blur-free offset shadow, so the shadow is a
// coloured copy of the shape drawn behind the content. Give the child the same
// borderRadius as passed here. Transforms on `style` rotate both together.
export default function HardShadow({
  children,
  color,
  offset = 4,
  borderRadius = 0,
  style,
}) {
  return (
    <View style={[styles?.container, style]}>
      <View
        pointerEvents="none"
        style={[
          styles?.shadow,
          {
            backgroundColor: color,
            borderRadius,
            transform: [{ translateX: offset }, { translateY: offset }],
          },
        ]}
      />
      {children}
    </View>
  );
}
