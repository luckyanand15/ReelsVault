import { StyleSheet } from 'react-native';
import { fonts } from '../../constants/theme';

const styles = StyleSheet.create({
  group: {
    gap: 10,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 20,
  },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
  },
  input: {
    height: 58,
    borderRadius: 18,
    borderWidth: 2,
    paddingHorizontal: 18,
    fontFamily: fonts.body,
    fontSize: 16,
  },
  errorText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    marginTop: 4,
  },
});

export default styles;
