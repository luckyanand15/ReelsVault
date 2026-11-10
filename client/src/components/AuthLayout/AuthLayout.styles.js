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
    paddingTop: 50,
    paddingBottom: 40,
    justifyContent: 'space-between',
    // Minimum space between the form and the arrow once the keyboard
    // squeezes the screen.
    gap: 24,
  },
  form: {
    gap: 26,
  },
  footer: {
    alignItems: 'flex-end',
  },
  heading: {
    gap: 12,
  },
  step: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    letterSpacing: 1.56, // 0.12em
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 34,
    lineHeight: 38,
    letterSpacing: -1,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 22,
  },
});

export default styles;
