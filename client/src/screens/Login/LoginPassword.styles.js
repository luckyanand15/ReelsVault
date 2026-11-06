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
  belowFieldRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  // Takes the space left of the link and wraps there. marginTop lines its
  // first line up with the link text (centred in the 44 tall button).
  errorText: {
    flex: 1,
    marginTop: 11,
    marginRight: 16,
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    lineHeight: 17,
  },
  forgotPasswordButton: {
    marginLeft: 'auto',
    flexShrink: 0,
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
