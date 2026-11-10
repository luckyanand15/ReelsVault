import React from 'react';
import Svg, { Path, Rect, Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

// Brand logos for the platform a reel came from, in the platforms' own
// colours (unlike Icon, which is single-colour interface icons). `source` is
// an id from reelSourceId; unknown ids render nothing.
function Instagram({ size }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Defs>
        <RadialGradient id="igGradient" cx="30%" cy="107%" r="150%">
          <Stop offset="0" stopColor="#FDF497" />
          <Stop offset="0.05" stopColor="#FDF497" />
          <Stop offset="0.45" stopColor="#FD5949" />
          <Stop offset="0.6" stopColor="#D6249F" />
          <Stop offset="0.9" stopColor="#285AEB" />
        </RadialGradient>
      </Defs>
      <Rect x="0" y="0" width="24" height="24" rx="6.5" fill="url(#igGradient)" />
      <Rect
        x="5"
        y="5"
        width="14"
        height="14"
        rx="4.2"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="1.9"
      />
      <Circle cx="12" cy="12" r="3.3" fill="none" stroke="#FFFFFF" strokeWidth="1.9" />
      <Circle cx="16.3" cy="7.7" r="1.05" fill="#FFFFFF" />
    </Svg>
  );
}

function YouTube({ size }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x="0.5" y="4" width="23" height="16" rx="4.5" fill="#FF0000" />
      <Path d="M9.6 8.4 L16 12 L9.6 15.6 Z" fill="#FFFFFF" />
    </Svg>
  );
}

function TikTok({ size }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x="0" y="0" width="24" height="24" rx="6" fill="#000000" />
      <Path
        d="M13.4 5v9.3a2.6 2.6 0 1 1-2.6-2.6M13.4 5c.3 2 1.7 3.4 3.8 3.6"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function Facebook({ size }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="12" cy="12" r="12" fill="#1877F2" />
      <Path
        d="M13.3 24v-8.4h2.8l.4-3.3h-3.2v-2.1c0-.9.3-1.6 1.6-1.6h1.7V5.7a22 22 0 0 0-2.5-.1c-2.5 0-4.2 1.5-4.2 4.3v2.4H7.1v3.3h2.8V24z"
        fill="#FFFFFF"
      />
    </Svg>
  );
}

const LOGOS = { instagram: Instagram, youtube: YouTube, tiktok: TikTok, facebook: Facebook };

export default function SourceIcon({ source, size = 16 }) {
  const Logo = LOGOS[source];
  return Logo ? <Logo size={size} /> : null;
}
