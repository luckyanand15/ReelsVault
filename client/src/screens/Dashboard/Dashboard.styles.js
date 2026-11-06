import { StyleSheet } from 'react-native';
import { fonts } from '../../constants/theme';

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  reelsContainer: {
    flex: 1,
    alignSelf: 'stretch',
  },

  // Search + grid/list toggle
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  searchBox: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 48,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 2,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 0,
    fontFamily: fonts.body,
    fontSize: 15,
  },
  viewToggle: {
    flexDirection: 'row',
    gap: 4,
    padding: 3,
    borderRadius: 16,
    borderWidth: 2,
  },
  viewToggleButton: {
    width: 44,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Reels list
  reelsList: {
    paddingHorizontal: 20,
    paddingTop: 6,
  },
  reelsGrid: {
    rowGap: 20,
  },
  reelsRows: {
    rowGap: 14,
  },
  gridRow: {
    columnGap: 12,
    alignItems: 'flex-start',
  },
  emptyList: {
    flexGrow: 1,
  },
  listHeader: {
    paddingBottom: 2,
    gap: 8,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionTitle: {
    flexShrink: 1,
    fontFamily: fonts.display,
    fontSize: 16,
    letterSpacing: -0.2,
  },
  sectionCount: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
  },
  searchHint: {
    fontFamily: fonts.body,
    fontSize: 13,
  },
  listFooter: {
    paddingVertical: 16,
  },
  loader: {
    marginTop: 40,
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

  // + button and its menu
  fabBackdrop: {
    ...StyleSheet.absoluteFill,
  },
  fabContainer: {
    position: 'absolute',
    right: 20,
  },
  fabOpen: {
    transform: [{ rotate: '45deg' }],
  },
  fabButton: {
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuContainer: {
    position: 'absolute',
    right: 20,
    alignItems: 'flex-end',
    gap: 14,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    height: 56,
    paddingLeft: 10,
    paddingRight: 22,
    borderRadius: 28,
    borderWidth: 2,
  },
  menuItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemText: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
  },
  pressedPush: {
    transform: [{ translateX: 2 }, { translateY: 2 }],
  },
});

export default styles;
