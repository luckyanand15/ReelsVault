import { StyleSheet } from 'react-native';
import { fonts } from '../../constants/theme';

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 56,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  form: {
    gap: 16,
  },
  headerContent: {
    gap: 12,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 34,
    lineHeight: 38,
    letterSpacing: -1,
  },
  emailPill: {
    alignSelf: 'flex-start',
    maxWidth: '100%',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 2,
  },
  emailPillText: {
    fontFamily: fonts.body,
    fontSize: 14,
  },
  inputGroup: {
    gap: 10,
  },
  // Label row is 44 tall here (toggle tap target); TextField centres the label
  toggleButton: {
    // height: 44,
    paddingHorizontal: 4,
    justifyContent: 'center',
  },
  toggleText: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    height: 44,
    justifyContent: 'center',
  },
  forgotPasswordText: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
  },
  forgotPasswordUnderline: {
    height: 2,
    marginTop: 3,
    borderRadius: 1,
  },
  footer: {
    alignItems: 'flex-end',
  },
});

export default styles;
