import { StyleSheet } from 'react-native';
import theme from '../../constants/theme';

const styles = StyleSheet.create({
  container: {
    paddingVertical: theme?.spacing?.sm,
    backgroundColor: theme?.colors?.background,
  },
  scrollContent: {
    paddingHorizontal: theme?.spacing?.md,
    gap: theme?.spacing?.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme?.spacing?.md,
    paddingVertical: theme?.spacing?.xs + 2,
    borderRadius: theme?.borderRadius?.round,
    backgroundColor: theme?.colors?.gray100,
    borderWidth: 1,
    borderColor: theme?.colors?.gray200,
    marginRight: theme?.spacing?.xs,
  },
  activeChip: {
    backgroundColor: theme?.colors?.textPrimary,
    borderColor: theme?.colors?.textPrimary,
  },
  chipIcon: {
    marginRight: theme?.spacing?.xs,
    fontSize: theme?.typography?.fontSize?.sm,
  },
  chipText: {
    fontSize: theme?.typography?.fontSize?.sm,
    fontWeight: theme?.typography?.fontWeight?.medium,
    color: theme?.colors?.textSecondary,
  },
  activeChipText: {
    color: theme?.colors?.white,
    fontWeight: theme?.typography?.fontWeight?.semibold,
  },
});

export default styles;
