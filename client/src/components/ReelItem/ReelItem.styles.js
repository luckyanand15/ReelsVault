import { StyleSheet } from 'react-native';
import theme from '../../constants/theme';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme?.spacing?.md,
    borderRadius: theme?.borderRadius?.lg,
    backgroundColor: theme?.colors?.surface,
    borderWidth: 1,
    borderColor: theme?.colors?.border,
  },
  icon: {
    fontSize: 28,
    marginRight: theme?.spacing?.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: theme?.typography?.fontSize?.md,
    fontWeight: theme?.typography?.fontWeight?.semibold,
    color: theme?.colors?.textPrimary,
  },
  host: {
    fontSize: theme?.typography?.fontSize?.xs,
    color: theme?.colors?.textMuted,
    marginTop: 2,
  },
  arrow: {
    fontSize: theme?.typography?.fontSize?.lg,
    color: theme?.colors?.textMuted,
    marginLeft: theme?.spacing?.sm,
  },
});

export default styles;
