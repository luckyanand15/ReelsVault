import { StyleSheet } from 'react-native';
import { fonts } from '../../constants/theme';

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  badgeWrap: {
    transform: [{ rotate: '-7deg' }],
  },
  badge: {
    width: 40,
    height: 40,
    borderRadius: 13,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wordmark: {
    fontFamily: fonts.display,
    letterSpacing: -0.4,
  },
});

export default styles;
