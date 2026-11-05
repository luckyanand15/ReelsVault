import { StyleSheet } from 'react-native';
import { fonts } from '../../constants/theme';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  backdropTouch: {
    ...StyleSheet.absoluteFill,
  },
  dialogWrap: {
    width: '100%',
    maxWidth: 340,
  },
  dialogContainer: {
    borderRadius: 24,
    borderWidth: 2,
    padding: 24,
    gap: 10,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 20,
    letterSpacing: -0.4,
  },
  message: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  button: {
    height: 48,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  confirmWrap: {
    flex: 1,
  },
  buttonText: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
  },
  pressedPush: {
    transform: [{ translateX: 2 }, { translateY: 2 }],
  },
  pressedFade: {
    opacity: 0.7,
  },
});

export default styles;
