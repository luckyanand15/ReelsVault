import React from 'react';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

// Interface line icons (DESIGN.md: 2.4-3.2 stroke, round caps). Category icons
// are emoji and don't belong here. A string is a single path; an array lists
// shapes, where `filled` paints a shape solid in the icon colour and
// `stroke: 'none'` drops its outline.
const SOLID = { filled: true, stroke: 'none' };

const ICONS = {
  arrowLeft: 'M19 12H5M11 5l-7 7 7 7',
  arrowRight: 'M5 12h14M13 5l7 7-7 7',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  chevronRight: 'M9 5l7 7-7 7',
  close: 'M6 6l12 12M18 6L6 18',
  folder: 'M3 7h6l2 3h10v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z',
  grid: [
    { type: 'rect', x: 3.5, y: 3.5, width: 7, height: 7, rx: 2, ...SOLID },
    { type: 'rect', x: 13.5, y: 3.5, width: 7, height: 7, rx: 2, ...SOLID },
    { type: 'rect', x: 3.5, y: 13.5, width: 7, height: 7, rx: 2, ...SOLID },
    { type: 'rect', x: 13.5, y: 13.5, width: 7, height: 7, rx: 2, ...SOLID },
  ],
  list: 'M4 6h16M4 12h16M4 18h16',
  moon: [{ type: 'path', d: 'M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5a8.5 8.5 0 1 0 10.7 10.7z', ...SOLID }],
  more: [
    { type: 'circle', cx: 12, cy: 5, r: 2, ...SOLID },
    { type: 'circle', cx: 12, cy: 12, r: 2, ...SOLID },
    { type: 'circle', cx: 12, cy: 19, r: 2, ...SOLID },
  ],
  play: [{ type: 'path', d: 'M7 4.5 L19.5 12 L7 19.5 Z', filled: true }],
  search: [
    { type: 'circle', cx: 11, cy: 11, r: 7 },
    { type: 'path', d: 'M20 20l-3.5-3.5' },
  ],
  sun: [
    { type: 'circle', cx: 12, cy: 12, r: 4.2, filled: true },
    { type: 'path', d: 'M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5.3 5.3l1.7 1.7M17 17l1.7 1.7M5.3 18.7L7 17M17 7l1.7-1.7' },
  ],
  trash: 'M4 7h16M9.5 7V4.5h5V7M6.5 7l1 12.5a1 1 0 0 0 1 .9h7a1 1 0 0 0 1-.9l1-12.5',
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
