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
