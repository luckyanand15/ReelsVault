import { StyleSheet, Dimensions, Platform } from 'react-native';
import { fonts } from '../../constants/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_RADIUS = 32;
const BAR_HEIGHT = 6;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdropTouch: {
    flex: 1,
  },
  sheetWrap: {
    marginTop: Platform.OS === 'ios' ? 50 : 36,
    maxHeight: SCREEN_HEIGHT - 60,
  },
  bar: {
    position: 'absolute',
    top: -BAR_HEIGHT,
    left: 0,
    right: 0,
    height: SHEET_RADIUS * 2,
    borderTopLeftRadius: SHEET_RADIUS,
    borderTopRightRadius: SHEET_RADIUS,
  },
  sheet: {
    borderTopLeftRadius: SHEET_RADIUS,
    borderTopRightRadius: SHEET_RADIUS,
    borderWidth: 2,
    borderBottomWidth: 0,
    paddingTop: 12,
    paddingHorizontal: 24,
    gap: 22,
  },
  dragHandle: {
    alignSelf: 'center',
    width: 48,
    height: 5,
    borderRadius: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    flexShrink: 1,
    fontFamily: fonts.display,
    fontSize: 22,
    letterSpacing: -0.4,
  },
});

export default styles;
