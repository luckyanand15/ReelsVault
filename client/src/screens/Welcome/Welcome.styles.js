import { StyleSheet } from 'react-native';
import theme from '../../constants/theme';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme?.colors?.background,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: theme?.spacing?.xl,
    paddingVertical: theme?.spacing?.xxl,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme?.spacing?.xxl,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: theme?.borderRadius?.xl,
    backgroundColor: theme?.colors?.surface,
    borderWidth: 1,
    borderColor: theme?.colors?.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme?.spacing?.xl,
    // Soft shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  logoEmoji: {
    fontSize: 48,
  },
  title: {
    fontSize: theme?.typography?.fontSize?.xxl,
    fontWeight: theme?.typography?.fontWeight?.bold,
    color: theme?.colors?.textPrimary,
    textAlign: 'center',
    marginBottom: theme?.spacing?.sm,
  },
  subtitle: {
    fontSize: theme?.typography?.fontSize?.md,
    color: theme?.colors?.textMuted,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: theme?.spacing?.md,
  },
  buttonContainer: {
    width: '100%',
    gap: theme?.spacing?.md,
    marginBottom: theme?.spacing?.md,
  },
  button: {
    height: 56,
    borderRadius: theme?.borderRadius?.lg,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  signUpButton: {
    backgroundColor: theme?.colors?.textPrimary, // Black background
  },
  signUpButtonText: {
    color: theme?.colors?.background, // White text
    fontSize: theme?.typography?.fontSize?.md,
    fontWeight: theme?.typography?.fontWeight?.semibold,
  },
  loginButton: {
    backgroundColor: theme?.colors?.background,
    borderWidth: 1.5,
    borderColor: theme?.colors?.textPrimary, // Outlined styling
  },
  loginButtonText: {
    color: theme?.colors?.textPrimary,
    fontSize: theme?.typography?.fontSize?.md,
    fontWeight: theme?.typography?.fontWeight?.semibold,
  },
});

export default styles;
