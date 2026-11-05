import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  button: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressedPush: {
    transform: [{ translateX: 2 }, { translateY: 2 }],
  },
  pressedFade: {
    opacity: 0.7,
  },
});

export default styles;
