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
    letterSpacing: 0.5,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default styles;
