import { StyleSheet } from 'react-native';
import { fonts } from '../../constants/theme';

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 28,
    paddingTop: 12,
  },
  footer: {
    paddingHorizontal: 28,
    paddingBottom: 40,
    gap: 28,
  },
  copy: {
    gap: 14,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 34,
    lineHeight: 38,
    letterSpacing: -1,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
  },
  buttonContainer: {
    gap: 14,
  },
});

export default styles;
