import { StyleSheet } from 'react-native';
import { fonts } from '../../constants/theme';

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: 18,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 17,
  },
  pressedPush: {
    transform: [{ translateX: 2 }, { translateY: 2 }],
  },
  pressedFade: {
    opacity: 0.7,
  },
});

export default styles;
