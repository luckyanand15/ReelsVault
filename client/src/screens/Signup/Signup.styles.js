import { StyleSheet } from 'react-native';
import theme from '../../constants/theme';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme?.colors?.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: theme?.spacing?.xl,
    paddingTop: theme?.spacing?.lg,
    paddingBottom: theme?.spacing?.xl,
    justifyContent: 'space-between',
  },
  headerContent: {
    marginTop: theme?.spacing?.md,
    marginBottom: theme?.spacing?.xl,
  },
  stepIndicator: {
    fontSize: theme?.typography?.fontSize?.xs,
    fontWeight: theme?.typography?.fontWeight?.semibold,
    color: theme?.colors?.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: theme?.spacing?.xs,
  },
  title: {
    fontSize: theme?.typography?.fontSize?.xxl,
    fontWeight: theme?.typography?.fontWeight?.bold,
    color: theme?.colors?.textPrimary,
    marginBottom: theme?.spacing?.xs,
  },
  subtitle: {
    fontSize: theme?.typography?.fontSize?.md,
    color: theme?.colors?.textMuted,
    lineHeight: 22,
  },
  form: {
    flex: 1,
    gap: theme?.spacing?.lg,
  },
  inputGroup: {
    gap: theme?.spacing?.xs,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: theme?.typography?.fontSize?.sm,
    fontWeight: theme?.typography?.fontWeight?.semibold,
    color: theme?.colors?.textPrimary,
  },
  star: {
    color: '#E53E3E',
    fontWeight: theme?.typography?.fontWeight?.bold,
  },
  input: {
    height: 52,
    borderWidth: 1.5,
    borderColor: theme?.colors?.border,
    borderRadius: theme?.borderRadius?.lg,
    paddingHorizontal: theme?.spacing?.md,
    fontSize: theme?.typography?.fontSize?.md,
    color: theme?.colors?.textPrimary,
    backgroundColor: theme?.colors?.surface,
  },
  inputFocused: {
    borderColor: theme?.colors?.textPrimary,
    backgroundColor: theme?.colors?.background,
  },
  inputError: {
    borderColor: '#E53E3E',
  },
  errorText: {
    fontSize: theme?.typography?.fontSize?.xs,
    color: '#E53E3E',
    marginTop: 2,
  },
  footer: {
    alignItems: 'flex-end',
    paddingVertical: theme?.spacing?.md,
  },
  arrowButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme?.colors?.textPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  arrowButtonDisabled: {
    backgroundColor: theme?.colors?.gray300,
    shadowOpacity: 0,
    elevation: 0,
  },
  arrowIcon: {
    fontSize: 24,
    color: theme?.colors?.background,
    fontWeight: 'bold',
  },
  arrowIconDisabled: {
    color: theme?.colors?.gray500,
  },
});

export default styles;
