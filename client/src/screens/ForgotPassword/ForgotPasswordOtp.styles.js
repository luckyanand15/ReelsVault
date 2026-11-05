import { StyleSheet } from 'react-native';
import { fonts } from '../../constants/theme';

// Own styles now (it used to share the signup code step's, which still has
// the old look). Frame and heading come from AuthLayout.
const styles = StyleSheet.create({
  emailHighlight: {
    fontFamily: fonts.bodyBold,
  },
  form: {
    gap: 14,
  },
  otpContainer: {
    flexDirection: 'row',
    gap: 8,
    // Room for the boxes' 3px shadow
    paddingRight: 3,
    paddingBottom: 3,
  },
  otpSlot: {
    flex: 1,
  },
  otpBox: {
    height: 58,
    borderRadius: 14,
    borderWidth: 2,
    padding: 0,
    textAlign: 'center',
    fontFamily: fonts.bodyBold,
    fontSize: 22,
  },
  errorText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
  },
  resendButton: {
    alignSelf: 'flex-start',
    minHeight: 44,
    justifyContent: 'center',
  },
  resendText: {
    fontFamily: fonts.body,
    fontSize: 14,
  },
  // Pink underline on iOS; Android draws it in the text colour.
  resendLink: {
    fontFamily: fonts.bodyBold,
    textDecorationLine: 'underline',
  },
});

export default styles;
