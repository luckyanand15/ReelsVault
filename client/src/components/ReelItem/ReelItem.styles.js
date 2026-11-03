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
});

export default styles;
