import { StyleSheet } from 'react-native';
import { fonts } from '../../constants/theme';

// Frame and heading come from AuthLayout.
const styles = StyleSheet.create({
  fields: {
    gap: 22,
  },
  // Label row is 44 tall here (toggle tap target); TextField centres the label
  toggleButton: {
    height: 44,
    paddingHorizontal: 4,
    justifyContent: 'center',
  },
  toggleText: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
  },
});

export default styles;
