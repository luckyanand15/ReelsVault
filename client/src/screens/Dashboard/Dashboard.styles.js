import { StyleSheet } from 'react-native';
import theme from '../../constants/theme';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme?.colors?.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme?.spacing?.md,
  },
  card: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme?.spacing?.xl,
    borderRadius: theme?.borderRadius?.xl,
    backgroundColor: theme?.colors?.surface,
    borderWidth: 1,
    borderColor: theme?.colors?.border,
    width: '90%',
  },
  icon: {
    fontSize: 56,
    marginBottom: theme?.spacing?.md,
  },
  title: {
    fontSize: theme?.typography?.fontSize?.xxl,
    fontWeight: theme?.typography?.fontWeight?.bold,
    color: theme?.colors?.textPrimary,
    marginBottom: theme?.spacing?.xs,
  },
  subtitle: {
    fontSize: theme?.typography?.fontSize?.sm,
    color: theme?.colors?.textMuted,
    textAlign: 'center',
  },
});

export default styles;

