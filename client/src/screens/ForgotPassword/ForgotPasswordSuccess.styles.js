import { StyleSheet } from 'react-native';
import { fonts } from '../../constants/theme';

// Frame and heading come from AuthLayout.
const styles = StyleSheet.create({
  actions: {
    gap: 14,
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
