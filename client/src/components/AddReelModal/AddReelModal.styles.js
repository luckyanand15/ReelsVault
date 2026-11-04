import { StyleSheet } from 'react-native';
import theme from '../../constants/theme';
import categoryModalStyles from '../AddCategoryModal/AddCategoryModal.styles';

// Same drawer look as AddCategoryModal, plus the category chips row.
const styles = StyleSheet.create({
  ...categoryModalStyles,
  chipsContent: {
    gap: theme?.spacing?.sm,
    paddingVertical: theme?.spacing?.xs,
    marginBottom: theme?.spacing?.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme?.spacing?.md,
    paddingVertical: theme?.spacing?.xs + 2,
    borderRadius: theme?.borderRadius?.round,
    backgroundColor: theme?.colors?.gray100,
    borderWidth: 1,
    borderColor: theme?.colors?.gray200,
  },
  activeChip: {
    backgroundColor: theme?.colors?.textPrimary,
    borderColor: theme?.colors?.textPrimary,
  },
  newChip: {
    backgroundColor: theme?.colors?.background,
    borderStyle: 'dashed',
    borderColor: theme?.colors?.gray400,
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
  errorText: {
    fontSize: theme?.typography?.fontSize?.sm,
    color: '#D32F2F',
    marginTop: -theme?.spacing?.sm,
    marginBottom: theme?.spacing?.sm,
  },
});

export default styles;
