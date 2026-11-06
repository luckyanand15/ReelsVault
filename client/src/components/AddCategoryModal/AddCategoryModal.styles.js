import { StyleSheet } from 'react-native';
import { fonts } from '../../constants/theme';

export const ICON_COLUMNS = 6;
export const ICON_GAP = 8;
// Room for the selected tile's 3px shadow on the right and bottom
export const SHADOW_ROOM = 3;

const styles = StyleSheet.create({
  section: {
    gap: 10,
  },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
  },
  iconBox: {
    height: 252,
    borderRadius: 22,
    borderWidth: 2,
    padding: 12,
    position: 'relative',
  },
  iconBoxKeyboard: {
    height: 136, // About two rows while the keyboard is open
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ICON_GAP,
    paddingRight: SHADOW_ROOM,
    paddingBottom: SHADOW_ROOM,
  },
  iconTile: {
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: 24,
  },
  pressedFade: {
    opacity: 0.7,
  },
  customScrollTrack: {
    position: 'absolute',
    right: 4,
    top: 14,
    bottom: 14,
    width: 3,
    borderRadius: 2,
    overflow: 'hidden',
  },
  customScrollThumb: {
    width: 3,
    borderRadius: 2,
  },
});

export default styles;
