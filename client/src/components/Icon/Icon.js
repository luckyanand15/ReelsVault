import React from 'react';
import Svg, { Path } from 'react-native-svg';

// Interface line icons (DESIGN.md: 2.4-3.2 stroke, round caps). Category icons
// are emoji and don't belong here.
const PATHS = {
  arrowLeft: 'M19 12H5M11 5l-7 7 7 7',
  arrowRight: 'M5 12h14M13 5l7 7-7 7',
};

export default function Icon({ name, size = 22, color, strokeWidth = 2.6 }) {
  const d = PATHS[name];
  if (!d) {
    return null;
  }

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d={d} />
    </Svg>
  );
}
