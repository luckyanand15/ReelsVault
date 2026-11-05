import { StyleSheet } from 'react-native';
import { fonts } from '../../constants/theme';

// Frame and heading come from AuthLayout, the code boxes from OtpCodeField.
const styles = StyleSheet.create({
  emailHighlight: {
    fontFamily: fonts.bodyBold,
  },
});

export default styles;
