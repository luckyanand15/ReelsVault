import { StyleSheet } from 'react-native';
import { fonts } from '../../constants/theme';

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  title: {
    flexShrink: 1,
    fontFamily: fonts.display,
    fontSize: 22,
    letterSpacing: -0.4,
  },
});

export default styles;
