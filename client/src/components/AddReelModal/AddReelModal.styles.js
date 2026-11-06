import { StyleSheet } from 'react-native';
import { fonts } from '../../constants/theme';

// Sheet frame lives in BottomSheet; these are the Add Reel sections.
// EditReelModal reuses the label, suggestion and error styles.
const styles = StyleSheet.create({
  section: {
    gap: 10,
  },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
  },
  // Chips run edge to edge of the sheet (its side padding is 24)
  chipsScroll: {
    marginHorizontal: -24,
  },
  chipsContent: {
    gap: 10,
    paddingHorizontal: 24,
    paddingTop: 2,
    paddingBottom: 4, // Room for the selected chip's 3px shadow
  },
  // Tappable title suggestion under the Title input.
  suggestion: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  suggestionLabel: {
    fontFamily: fonts.body,
    fontSize: 12,
    marginBottom: 2,
  },
  suggestionText: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
  },
  findingTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  findingTitleText: {
    fontFamily: fonts.body,
    fontSize: 13,
  },
  errorText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
  },
});

export default styles;
