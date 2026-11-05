import { StyleSheet } from 'react-native';
import { fonts } from '../../constants/theme';
import addReelStyles from '../AddReelModal/AddReelModal.styles';

// Same sections as AddReelModal; chips wrap here since several can be
// selected and all of them should be visible.
const styles = StyleSheet.create({
  section: addReelStyles.section,
  label: addReelStyles.label,
  errorText: addReelStyles.errorText,
  chipsScroll: {
    maxHeight: 156,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingTop: 2,
    paddingBottom: 4, // Room for the selected chips' 3px shadow
  },
  hintText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
  },
});

export default styles;
