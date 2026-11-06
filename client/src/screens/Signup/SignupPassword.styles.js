import { StyleSheet } from 'react-native';
import { fonts } from '../../constants/theme';

// Frame and heading come from AuthLayout.
const styles = StyleSheet.create({
  fields: {
    gap: 22,
  },
  // Same height as the label row (20) so the label sits where it does on
  // the First Name screen; hitSlop on the button keeps a 44px tap target.
  toggleButton: {
    height: 20,
    paddingHorizontal: 4,
    justifyContent: 'center',
  },
  toggleText: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
  },
});

export default styles;
