import { StyleSheet } from 'react-native';
import theme from '../../constants/theme';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme?.spacing?.md,
    borderRadius: theme?.borderRadius?.lg,
    backgroundColor: theme?.colors?.surface,
    borderWidth: 1,
    borderColor: theme?.colors?.border,
  },
  // Portrait box (reels are 9:16); the category icon sits in the same box
  // when there is no thumbnail, so rows stay aligned.
  thumbnail: {
    width: 54,
    height: 72,
    borderRadius: theme?.borderRadius?.md,
    backgroundColor: theme?.colors?.gray200,
    marginRight: theme?.spacing?.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  icon: {
    fontSize: 28,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: theme?.typography?.fontSize?.md,
    fontWeight: theme?.typography?.fontWeight?.semibold,
    color: theme?.colors?.textPrimary,
  },
  host: {
    fontSize: theme?.typography?.fontSize?.xs,
    color: theme?.colors?.textMuted,
    marginTop: 2,
  },
  arrow: {
    fontSize: theme?.typography?.fontSize?.lg,
    color: theme?.colors?.textMuted,
    marginLeft: theme?.spacing?.sm,
  },

  // Grid tile: width comes from the parent (3 per row).
  gridContainer: {
    borderRadius: theme?.borderRadius?.lg,
    backgroundColor: theme?.colors?.surface,
    borderWidth: 1,
    borderColor: theme?.colors?.border,
    overflow: 'hidden',
  },
  gridThumbnail: {
    width: '100%',
    aspectRatio: 9 / 16,
    backgroundColor: theme?.colors?.gray200,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  gridTextContainer: {
    paddingHorizontal: theme?.spacing?.sm,
    paddingVertical: theme?.spacing?.xs + 2,
  },
  gridTitle: {
    fontSize: theme?.typography?.fontSize?.sm,
    fontWeight: theme?.typography?.fontWeight?.semibold,
    color: theme?.colors?.textPrimary,
  },
});

export default styles;
