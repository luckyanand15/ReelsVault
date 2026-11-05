import { StyleSheet } from 'react-native';
import { fonts } from '../../constants/theme';

// Sheet frame lives in BottomSheet; these are the menu and delete steps.
const styles = StyleSheet.create({
  // Menu
  options: {
    gap: 10,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    height: 56,
    paddingHorizontal: 18,
    borderRadius: 18,
    borderWidth: 2,
  },
  optionText: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
  },

  // Confirm / categories
  message: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
  },
  categoryList: {
    maxHeight: 220,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 48,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIcon: {
    fontSize: 18,
  },
  checkLabel: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 16,
  },
  checkLabelBold: {
    fontFamily: fonts.bodyBold,
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: 13,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  button: {
    height: 52,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  flex: {
    flex: 1,
  },
  buttonText: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
  },
  error: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
  },
  pressedPush: {
    transform: [{ translateX: 2 }, { translateY: 2 }],
  },
  pressedFade: {
    opacity: 0.7,
  },
});

export default styles;
