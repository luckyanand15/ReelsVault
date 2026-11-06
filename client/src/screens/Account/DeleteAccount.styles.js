import { StyleSheet } from 'react-native';
import { fonts } from '../../constants/theme';

// Frame and heading come from AuthLayout. Shared by the delete account
// intro, "are you sure" and success screens.
const styles = StyleSheet.create({
  actions: {
    gap: 14,
  },
  errorText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    textAlign: 'center',
  },
  countdownText: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  countdownNumber: {
    fontFamily: fonts.bodyBold,
  },
});

export default styles;
