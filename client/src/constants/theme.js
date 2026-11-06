export const colors = {
  // Base Colors
  black: '#000000',
  white: '#FFFFFF',

  // Brand / Theme Colors
  primary: '#FFFFFF',
  secondary: '#000000',

  // Gray Scale
  gray900: '#121212',
  gray800: '#1E1E1E',
  gray700: '#2A2A2A',
  gray600: '#404040',
  gray500: '#737373',
  gray400: '#A3A3A3',
  gray300: '#D4D4D4',
  gray200: '#E5E5E5',
  gray100: '#F5F5F5',
  gray50: '#FAFAFA',

  // Minimal Theme Roles
  background: '#FFFFFF',
  surface: '#FAFAFA',
  card: '#FFFFFF',
  textPrimary: '#000000',
  textSecondary: '#404040',
  textMuted: '#737373',
  border: '#E5E5E5',
  accent: '#000000',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 9999,
};

export const latterSpacing = {
  xs: 0.25,
  sm: 0.5,
  md: 1,
  lg: 1.5,
  xl: 2,
}

// Redesign (see client/DESIGN.md): themed tokens, swapped by ThemeContext
export const palettes = {
  dark: {
    bg: '#130F22',
    dots: '#2B2250',
    surf: '#221B3D',
    line: '#4B3C85',
    fg: '#F7F3FF',
    mut: '#B9B0D6',
    outline: '#F7F3FF',
    scrim: 'rgba(19,15,34,0.86)',
    pinkText: '#FF4D8D',
  },
  light: {
    bg: '#F6F2FF',
    dots: '#DCD2F4',
    surf: '#FFFFFF',
    line: '#B9AEE0',
    fg: '#14102A',
    mut: '#554A7A',
    outline: '#14102A',
    scrim: 'rgba(246,242,255,0.88)',
    pinkText: '#D81B64',
  },
};

// Same in both themes. Text on any bright fill is always ink.
export const fixedColors = {
  accent: '#C8F53C',
  pink: '#FF4D8D',
  cyan: '#3DDCFF',
  yellow: '#FFD43B',
  ink: '#14102A',
};

// One file per weight; pick the weight by family name, not fontWeight
export const fonts = {
  displaySemiBold: 'Unbounded-SemiBold',
  display: 'Unbounded-ExtraBold',
  body: 'DMSans-Medium',
  bodyBold: 'DMSans-Bold',
};

const theme = {
  colors,
  spacing,
  typography,
  borderRadius,
  palettes,
  fixedColors,
  fonts,
};

export default theme;
