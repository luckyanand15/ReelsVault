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
  inputSheet: {
    height: 56,
  },
  hintText: {
    fontFamily: fonts.body,
    fontSize: 13,
    marginTop: 4,
  },
  errorText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    marginTop: 4,
  },
  errorTextFloating: {
    position: 'absolute',
    top: '100%',
    left: 0,
    // Wraps before the round arrow (68px + shadow + breathing room) that
    // sits bottom-right on the auth screens using floatingError.
    right: 84,
    // Same 14px as the in-flow error (group gap 10 + marginTop 4).
    marginTop: 14,
  },
});

export default styles;
