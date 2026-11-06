import { StyleSheet } from 'react-native';
import { fonts } from '../../constants/theme';

const styles = StyleSheet.create({
  // List row
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 10,
    paddingRight: 14,
    borderRadius: 24,
    borderWidth: 2,
  },
  thumbnail: {
    width: 68,
    height: 88,
    borderRadius: 16,
    borderWidth: 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailImage: {
    ...StyleSheet.absoluteFill,
  },
  fallbackIcon: {
    fontSize: 28,
  },
  textContainer: {
    flex: 1,
    minWidth: 0,
    gap: 8,
  },
  title: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    lineHeight: 19,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 1,
    paddingVertical: 3,
    paddingHorizontal: 9,
    borderRadius: 999,
  },
  pillIcon: {
    fontSize: 12,
  },
  pillText: {
    flexShrink: 1,
    fontFamily: fonts.bodyBold,
    fontSize: 12,
  },
  source: {
    flexShrink: 0,
    fontFamily: fonts.body,
    fontSize: 12,
  },

  // Grid card
  gridContainer: {
    alignSelf: 'flex-start',
  },
  gridThumbnail: {
    width: '100%',
    aspectRatio: 9 / 16,
    borderRadius: 18,
    borderWidth: 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackIconGrid: {
    fontSize: 32,
  },
  badge: {
    position: 'absolute',
    top: 6,
    left: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeIcon: {
    fontSize: 13,
  },
  gridTextContainer: {
    paddingTop: 10,
    paddingHorizontal: 1,
    gap: 3,
  },
  gridTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    lineHeight: 16,
  },
  gridCategory: {
    fontFamily: fonts.body,
    fontSize: 11,
  },
});

export default styles;
