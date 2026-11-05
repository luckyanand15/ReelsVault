import { StyleSheet } from 'react-native';
import { fonts } from '../../constants/theme';

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 40,
    gap: 22,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 2,
  },
  errorText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  helperText: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
  },
  categoryListCard: {
    borderRadius: 24,
    borderWidth: 2,
  },
  // Every row keeps a 2px border so lighting it up while dragging doesn't
  // shift the layout; at rest only the bottom one shows, as the divider.
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingLeft: 6,
    paddingRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 0,
  },
  draggingRow: {
    borderRadius: 20,
    zIndex: 999,
  },
  dragHandleTouch: {
    width: 40,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconTile: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryIcon: {
    fontSize: 24,
  },
  categoryLabel: {
    flex: 1,
    minWidth: 0,
    fontFamily: fonts.bodyBold,
    fontSize: 17,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCard: {
    paddingVertical: 36,
    paddingHorizontal: 24,
    borderRadius: 24,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontFamily: fonts.display,
    fontSize: 18,
    textAlign: 'center',
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});

export default styles;
