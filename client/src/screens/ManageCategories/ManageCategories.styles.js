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
    paddingHorizontal: theme?.spacing?.md,
    paddingTop: theme?.spacing?.md,
    paddingBottom: theme?.spacing?.xl,
  },
  headerSubtitle: {
    fontSize: theme?.typography?.fontSize?.sm,
    color: theme?.colors?.textMuted,
    marginBottom: theme?.spacing?.md,
    paddingHorizontal: theme?.spacing?.xs,
    lineHeight: 20,
  },
  categoryListCard: {
    backgroundColor: theme?.colors?.surface,
    borderRadius: theme?.borderRadius?.lg,
    borderWidth: 1,
    borderColor: theme?.colors?.border,
    overflow: 'hidden',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme?.spacing?.md,
    paddingHorizontal: theme?.spacing?.md,
    backgroundColor: theme?.colors?.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme?.colors?.border,
  },
  categoryRowLast: {
    borderBottomWidth: 0,
  },
  draggingRow: {
    backgroundColor: theme?.colors?.background,
    borderColor: theme?.colors?.gray300,
    borderWidth: 1,
    borderRadius: theme?.borderRadius?.md,
    zIndex: 999,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  rowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme?.spacing?.md,
    flex: 1,
  },
  categoryIcon: {
    fontSize: 20,
    width: 28,
    textAlign: 'center',
  },
  categoryLabel: {
    fontSize: theme?.typography?.fontSize?.md,
    fontWeight: theme?.typography?.fontWeight?.medium,
    color: theme?.colors?.textPrimary,
    flex: 1,
  },
  dragHandleTouch: {
    padding: theme?.spacing?.xs,
    paddingRight: theme?.spacing?.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dragHandleIcon: {
    fontSize: 20,
    color: theme?.colors?.gray500,
    letterSpacing: -1,
    fontWeight: '700',
  },
  dragHandleIconActive: {
    color: theme?.colors?.textPrimary,
  },
});

export default styles;
