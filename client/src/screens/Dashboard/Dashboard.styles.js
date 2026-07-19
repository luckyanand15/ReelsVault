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
  text: {
    fontSize: theme?.typography?.fontSize?.xl,
    fontWeight: theme?.typography?.fontWeight?.bold,
    color: theme?.colors?.textPrimary,
  },
});

export default styles;
