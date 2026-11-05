import React from 'react';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

// Interface line icons (DESIGN.md: 2.4-3.2 stroke, round caps). Category icons
// are emoji and don't belong here. A string is a single path; an array lists
// shapes, where `filled` paints a shape solid in the icon colour.
const ICONS = {
  arrowLeft: 'M19 12H5M11 5l-7 7 7 7',
  arrowRight: 'M5 12h14M13 5l7 7-7 7',
  chevronRight: 'M9 5l7 7-7 7',
  close: 'M6 6l12 12M18 6L6 18',
  menu: 'M4 7h16M4 12h16M4 17h16',
  pencil: 'M4 20l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19z',
  plus: 'M12 4v16M4 12h16',
  user: [
    { type: 'circle', cx: 12, cy: 8, r: 4 },
    { type: 'path', d: 'M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7' },
  ],
  mail: [
    { type: 'rect', x: 3, y: 5, width: 18, height: 14, rx: 3 },
    { type: 'path', d: 'M4 7l8 6 8-6' },
  ],
  lock: [
    { type: 'rect', x: 4.5, y: 10.5, width: 15, height: 10, rx: 3 },
    { type: 'path', d: 'M8 10.5V8a4 4 0 0 1 8 0v2.5' },
  ],
  tag: [
    { type: 'path', d: 'M3.5 12.5V4.5h8l9 9-8 8z' },
    { type: 'circle', cx: 8, cy: 9, r: 1.2, filled: true },
  ],
  logout: 'M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4M15 8l4 4-4 4M19 12H9',
};

function Shape({ type, filled, color, ...shapeProps }) {
  const fill = filled ? color : 'none';
  if (type === 'circle') {
    return <Circle {...shapeProps} fill={fill} />;
  }
  if (type === 'rect') {
    return <Rect {...shapeProps} fill={fill} />;
  }
  return <Path {...shapeProps} fill={fill} />;
}

export default function Icon({ name, size = 22, color, strokeWidth = 2.6 }) {
  const icon = ICONS[name];
  if (!icon) {
    return null;
  }
  const shapes = typeof icon === 'string' ? [{ type: 'path', d: icon }] : icon;

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
      {shapes.map((shape, index) => (
        <Shape key={index} {...shape} color={color} />
      ))}
    </Svg>
  );
}
