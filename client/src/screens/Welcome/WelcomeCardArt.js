import React from 'react';
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Pattern,
  Rect,
  Circle,
  Path,
  G,
  Text as SvgText,
} from 'react-native-svg';
import { fixedColors, fonts } from '../../constants/theme';

// Graffiti placeholder art for the Welcome collage (no real reels before sign-in).
// Colours are part of the artwork, so they don't follow the theme.
const { ink: INK, accent: LIME, pink: PINK, cyan: CYAN, yellow: YELLOW } =
  fixedColors;
const WHITE = '#F7F3FF';

// SVG paint-order isn't supported, so the Ink outline is drawn as a separate
// stroked copy underneath the coloured fill.
function GraffitiText({ x, y, rotation, fontSize, fill, children }) {
  const textProps = {
    x,
    y,
    fontSize,
    textAnchor: 'middle',
    fontFamily: fonts.display,
  };

  return (
    <G rotation={rotation} origin={`${x}, ${y}`}>
      <SvgText
        {...textProps}
        fill={INK}
        stroke={INK}
        strokeWidth={6}
        strokeLinejoin="round"
      >
        {children}
      </SvgText>
      <SvgText {...textProps} fill={fill}>
        {children}
      </SvgText>
    </G>
  );
}

export function WowArt() {
  return (
    <Svg
      width="100%"
      height="100%"
      viewBox="0 0 142 252"
      preserveAspectRatio="xMidYMid slice"
    >
      <Defs>
        <LinearGradient id="wowGradient" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={PINK} />
          <Stop offset="1" stopColor="#6A2BFF" />
        </LinearGradient>
        <Pattern id="wowDots" width={10} height={10} patternUnits="userSpaceOnUse">
          <Circle cx={5} cy={5} r={1.8} fill={INK} opacity={0.28} />
        </Pattern>
      </Defs>
      <Rect width={142} height={252} fill="url(#wowGradient)" />
      <Rect width={142} height={252} fill="url(#wowDots)" />
      <Circle cx={108} cy={46} r={28} fill={YELLOW} stroke={INK} strokeWidth={3} />
      <Path
        d="M96 42 q12 -12 24 0"
        fill="none"
        stroke={INK}
        strokeWidth={3.5}
        strokeLinecap="round"
      />
      <Path
        d="M18 70 L28 92 L50 96 L32 110 L36 134"
        fill="none"
        stroke={LIME}
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <GraffitiText x={71} y={146} rotation={-10} fontSize={44} fill={LIME}>
        WOW
      </GraffitiText>
      <Path
        d="M32 156v34M62 160v22M96 150v44"
        stroke={LIME}
        strokeWidth={5}
        strokeLinecap="round"
      />
      <Circle cx={32} cy={194} r={4} fill={LIME} />
      <Circle cx={96} cy={198} r={4} fill={LIME} />
      <Path
        d="M10 214 q10 -14 20 0 t20 0 t20 0 t20 0"
        fill="none"
        stroke={CYAN}
        strokeWidth={5}
        strokeLinecap="round"
      />
      <Path
        d="M112 224 L115 233 L124 236 L115 239 L112 248 L109 239 L100 236 L109 233 Z"
        fill={YELLOW}
        stroke={INK}
        strokeWidth={1.5}
      />
    </Svg>
  );
}

export function PopArt() {
  return (
    <Svg
      width="100%"
      height="100%"
      viewBox="0 0 142 252"
      preserveAspectRatio="xMidYMid slice"
    >
      <Defs>
        <LinearGradient id="popGradient" x1="0" y1="1" x2="1" y2="0">
          <Stop offset="0" stopColor="#2B6BFF" />
          <Stop offset="1" stopColor={CYAN} />
        </LinearGradient>
        <Pattern id="popHatch" width={12} height={12} patternUnits="userSpaceOnUse">
          <Path d="M0 12L12 0" stroke={INK} strokeWidth={1.5} opacity={0.22} />
        </Pattern>
      </Defs>
      <Rect width={142} height={252} fill="url(#popGradient)" />
      <Rect width={142} height={252} fill="url(#popHatch)" />
      <Path
        d="M82 18 L40 104 H70 L56 170 L108 78 H78 Z"
        fill={YELLOW}
        stroke={INK}
        strokeWidth={4}
        strokeLinejoin="round"
      />
      <GraffitiText x={71} y={212} rotation={7} fontSize={40} fill={PINK}>
        POP
      </GraffitiText>
      <Circle cx={22} cy={34} r={11} fill="none" stroke={WHITE} strokeWidth={4} />
      <Path
        d="M112 30 l16 0 M120 22 l0 16"
        stroke={WHITE}
        strokeWidth={4}
        strokeLinecap="round"
      />
      <Path
        d="M14 126 q12 -16 24 0 t24 0"
        fill="none"
        stroke={LIME}
        strokeWidth={5}
        strokeLinecap="round"
      />
      <Path
        d="M108 120v30M126 126v18"
        stroke={WHITE}
        strokeWidth={4}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function LolArt() {
  return (
    <Svg
      width="100%"
      height="100%"
      viewBox="0 0 158 280"
      preserveAspectRatio="xMidYMid slice"
    >
      <Defs>
        <LinearGradient id="lolGradient" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={LIME} />
          <Stop offset="1" stopColor={YELLOW} />
        </LinearGradient>
        <Pattern id="lolDots" width={10} height={10} patternUnits="userSpaceOnUse">
          <Circle cx={5} cy={5} r={1.6} fill={INK} opacity={0.2} />
        </Pattern>
      </Defs>
      <Rect width={158} height={280} fill="url(#lolGradient)" />
      <Rect width={158} height={280} fill="url(#lolDots)" />
      <Circle cx={79} cy={92} r={54} fill={PINK} stroke={INK} strokeWidth={4} />
      <Circle cx={60} cy={80} r={7} fill={INK} />
      <Circle cx={98} cy={80} r={7} fill={INK} />
      <Path
        d="M52 106 q27 34 54 0"
        fill={WHITE}
        stroke={INK}
        strokeWidth={4}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <Path
        d="M30 38 l-6 -10 M128 38 l6 -10 M79 30 v-12"
        stroke={INK}
        strokeWidth={4}
        strokeLinecap="round"
      />
      <GraffitiText x={79} y={206} rotation={-4} fontSize={44} fill={CYAN}>
        LOL
      </GraffitiText>
      <Path
        d="M34 218v34M70 222v22M118 216v40"
        stroke={CYAN}
        strokeWidth={5}
        strokeLinecap="round"
      />
      <Circle cx={34} cy={256} r={4} fill={CYAN} />
      <Circle cx={118} cy={260} r={4} fill={CYAN} />
      <Path
        d="M20 160 c-9 -10 4 -22 10 -12 c6 -10 19 2 10 12 l-10 10 z"
        fill={PINK}
        stroke={INK}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      <Path
        d="M132 150 L135 159 L144 162 L135 165 L132 174 L129 165 L120 162 L129 159 Z"
        fill={INK}
      />
    </Svg>
  );
}
