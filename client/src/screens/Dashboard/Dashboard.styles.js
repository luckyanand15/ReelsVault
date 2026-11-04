import { StyleSheet } from 'react-native';
import theme from '../../constants/theme';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme?.colors?.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme?.spacing?.md,
  },
  card: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme?.spacing?.xl,
    borderRadius: theme?.borderRadius?.xl,
    backgroundColor: theme?.colors?.surface,
    borderWidth: 1,
    borderColor: theme?.colors?.border,
    width: '90%',
  },
  icon: {
    fontSize: 56,
    marginBottom: theme?.spacing?.md,
  },
  title: {
    fontSize: theme?.typography?.fontSize?.xxl,
    fontWeight: theme?.typography?.fontWeight?.bold,
    color: theme?.colors?.textPrimary,
    marginBottom: theme?.spacing?.xs,
  },
  subtitle: {
    fontSize: theme?.typography?.fontSize?.sm,
    color: theme?.colors?.textMuted,
    textAlign: 'center',
  },
  reelsContainer: {
    flex: 1,
    alignSelf: 'stretch',
  },
  reelsList: {
    gap: theme?.spacing?.sm,
    paddingBottom: 100, // keeps the last reel clear of the FAB
  },
  gridRow: {
    gap: theme?.spacing?.sm,
  },
  listFooter: {
    paddingVertical: theme?.spacing?.md,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // List / Grid toggle
  viewToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme?.spacing?.sm,
    paddingHorizontal: theme?.spacing?.md,
    paddingTop: theme?.spacing?.sm,
  },

  // Search box (shares the row with the view toggle)
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 34,
    paddingHorizontal: theme?.spacing?.sm,
    borderRadius: theme?.borderRadius?.md,
    backgroundColor: theme?.colors?.gray100,
    borderWidth: 1,
    borderColor: theme?.colors?.border,
  },
  searchIcon: {
    fontSize: theme?.typography?.fontSize?.md,
    color: theme?.colors?.textMuted,
    marginRight: theme?.spacing?.xs,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 0,
    fontSize: theme?.typography?.fontSize?.sm,
    color: theme?.colors?.textPrimary,
  },
  searchClear: {
    fontSize: theme?.typography?.fontSize?.sm,
    color: theme?.colors?.textMuted,
    paddingLeft: theme?.spacing?.xs,
  },
  searchHint: {
    fontSize: theme?.typography?.fontSize?.xs,
    color: theme?.colors?.textMuted,
    marginBottom: theme?.spacing?.xs,
  },
  viewToggle: {
    flexDirection: 'row',
    padding: 2,
    borderRadius: theme?.borderRadius?.md,
    backgroundColor: theme?.colors?.gray100,
    borderWidth: 1,
    borderColor: theme?.colors?.border,
  },
  viewToggleButton: {
    width: 34,
    height: 28,
    borderRadius: theme?.borderRadius?.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewToggleButtonActive: {
    backgroundColor: theme?.colors?.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  listIcon: {
    width: 14,
    height: 12,
    justifyContent: 'space-between',
  },
  listIconBar: {
    height: 2,
    borderRadius: 1,
    backgroundColor: theme?.colors?.textMuted,
  },
  gridIcon: {
    width: 12,
    height: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignContent: 'space-between',
  },
  gridIconCell: {
    width: 5,
    height: 5,
    borderRadius: 1,
    backgroundColor: theme?.colors?.textMuted,
  },
  viewIconActive: {
    backgroundColor: theme?.colors?.textPrimary,
  },

  // FAB Backdrop
  fabBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    zIndex: 90,
    elevation: 90,
  },

  // FAB Container & Button
  fabContainer: {
    position: 'absolute',
    bottom: theme?.spacing?.xl,
    right: theme?.spacing?.lg,
    alignItems: 'flex-end',
    zIndex: 100,
    elevation: 100,
  },
  fabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme?.colors?.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  fabButtonActive: {
    backgroundColor: theme?.colors?.gray800,
    transform: [{ rotate: '45deg' }],
  },
  fabIconText: {
    color: theme?.colors?.background,
    fontSize: 28,
    fontWeight: '300',
    marginTop: -2,
  },

  // Options Menu Popup
  menuContainer: {
    marginBottom: theme?.spacing?.md,
    gap: theme?.spacing?.sm,
    alignItems: 'flex-end',
    paddingRight: theme?.spacing?.xs,
  },
  menuItem: {
    paddingVertical: theme?.spacing?.xs,
    paddingHorizontal: theme?.spacing?.sm,
    backgroundColor: 'transparent',
    borderWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
  },
  menuItemDisabled: {
    opacity: 0.5,
  },
  menuItemText: {
    fontSize: theme?.typography?.fontSize?.md,
    fontWeight: theme?.typography?.fontWeight?.bold,
    color: theme?.colors?.textPrimary,
  },
  menuItemTextDisabled: {
    color: theme?.colors?.textMuted,
    fontWeight: theme?.typography?.fontWeight?.medium,
  },
});

export default styles;
