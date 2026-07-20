import { StyleSheet } from 'react-native';
import theme from '../../constants/theme';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme?.colors?.background,
  },
  container: {
    flex: 1,
    backgroundColor: theme?.colors?.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme?.spacing?.md,
    paddingTop: theme?.spacing?.lg,
  },
  section: {
    marginBottom: theme?.spacing?.xl,
  },
  sectionTitle: {
    fontSize: theme?.typography?.fontSize?.xs,
    fontWeight: theme?.typography?.fontWeight?.semibold,
    color: theme?.colors?.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: theme?.spacing?.sm,
    paddingLeft: theme?.spacing?.xs,
  },
  sectionCard: {
    backgroundColor: theme?.colors?.surface,
    borderRadius: theme?.borderRadius?.lg,
    borderWidth: 1,
    borderColor: theme?.colors?.border,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme?.spacing?.md,
    paddingHorizontal: theme?.spacing?.md,
    backgroundColor: theme?.colors?.surface,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme?.spacing?.md,
    flex: 1,
  },
  itemIconContainer: {
    width: 36,
    height: 36,
    borderRadius: theme?.borderRadius?.md,
    backgroundColor: theme?.colors?.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemIconEmoji: {
    fontSize: 18,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: theme?.typography?.fontSize?.md,
    fontWeight: theme?.typography?.fontWeight?.medium,
    color: theme?.colors?.textPrimary,
  },
  itemSubtitle: {
    fontSize: theme?.typography?.fontSize?.xs,
    color: theme?.colors?.textMuted,
    marginTop: 2,
  },
  chevron: {
    fontSize: 22,
    fontWeight: '400',
    color: theme?.colors?.textMuted,
    marginLeft: theme?.spacing?.xs,
  },
});

export default styles;
