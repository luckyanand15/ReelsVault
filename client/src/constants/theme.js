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

const theme = {
  colors,
  spacing,
  typography,
  borderRadius,
};

export default theme;
