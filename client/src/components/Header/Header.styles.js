import { StyleSheet } from 'react-native';
import theme from '../../constants/theme';

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme?.spacing?.md,
    backgroundColor: theme?.colors?.background,
    borderBottomWidth: 1,
    borderBottomColor: theme?.colors?.border,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: theme?.typography?.fontSize?.xl,
    fontWeight: theme?.typography?.fontWeight?.bold,
    color: theme?.colors?.textPrimary,
    letterSpacing: theme?.latterSpacing?.sm,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuButton: {
    padding: theme?.spacing?.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIconContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 3,
    width: 24,
    height: 24,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme?.colors?.textPrimary,
  },
  leftButton: {
    paddingRight: theme?.spacing?.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIconText: {
    fontSize: 22,
    fontWeight: '600',
    color: theme?.colors?.textPrimary,
  },
});

export default styles;
