import { StyleSheet } from 'react-native';
import { fonts } from '../../constants/theme';

const styles = StyleSheet.create({
  chip: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    borderRadius: 22,
    borderWidth: 2,
  },
  chipNew: {
    gap: 6,
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
  },
  icon: {
    fontSize: 15,
  },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
  },
  pressedPush: {
    transform: [{ translateX: 2 }, { translateY: 2 }],
  },
  pressedFade: {
    opacity: 0.7,
  },
});

export default styles;
