import { StyleSheet } from 'react-native';
import theme from '../../constants/theme';
import addReelStyles from '../AddReelModal/AddReelModal.styles';

// Same drawer and chips as AddReelModal; chips wrap here since several can
// be selected and all of them should be visible.
const styles = StyleSheet.create({
  ...addReelStyles,
  chipsScroll: {
    maxHeight: 156,
    marginBottom: theme?.spacing?.sm,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme?.spacing?.sm,
    paddingVertical: theme?.spacing?.xs,
  },
  hintText: {
    fontSize: theme?.typography?.fontSize?.xs,
    color: '#D32F2F',
    marginBottom: theme?.spacing?.sm,
  },
});

export default styles;
