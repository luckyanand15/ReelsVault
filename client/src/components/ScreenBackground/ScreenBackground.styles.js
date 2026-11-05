import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },
  dots: {
    ...StyleSheet.absoluteFill,
  },
  circle: {
    position: 'absolute',
    top: -80,
    right: -70,
    width: 230,
    height: 230,
    borderRadius: 115,
    opacity: 0.22,
  },
  circleSmall: {
    position: 'absolute',
    top: -80,
    right: -70,
    width: 210,
    height: 210,
    borderRadius: 105,
    opacity: 0.22,
  },
  sparkleLarge: {
    position: 'absolute',
    top: 330,
    left: 22,
    transform: [{ rotate: '-12deg' }],
  },
  sparkleSmall: {
    position: 'absolute',
    top: 110,
    right: 26,
    transform: [{ rotate: '14deg' }],
  },
  sparkleAuth: {
    position: 'absolute',
    top: 250,
    right: 34,
    transform: [{ rotate: '12deg' }],
  },
});

export default styles;
