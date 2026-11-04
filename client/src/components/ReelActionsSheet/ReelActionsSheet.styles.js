import { StyleSheet, Platform } from 'react-native';
import theme from '../../constants/theme';

const DESTRUCTIVE = '#DC2626';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backdropTouch: {
    flex: 1,
  },
  drawerContainer: {
    backgroundColor: theme?.colors?.background,
    borderTopLeftRadius: theme?.borderRadius?.xl,
    borderTopRightRadius: theme?.borderRadius?.xl,
    paddingHorizontal: theme?.spacing?.lg,
    paddingBottom:
      Platform.OS === 'ios' ? theme?.spacing?.xl : theme?.spacing?.md,
    borderTopWidth: 1,
    borderColor: theme?.colors?.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingVertical: theme?.spacing?.sm,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme?.colors?.gray300,
  },
  reelTitle: {
    fontSize: theme?.typography?.fontSize?.md,
    fontWeight: theme?.typography?.fontWeight?.bold,
    color: theme?.colors?.textPrimary,
    marginBottom: theme?.spacing?.sm,
  },

  // Menu
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme?.spacing?.md,
    borderTopWidth: 1,
    borderTopColor: theme?.colors?.border,
  },
  optionIcon: {
    fontSize: 18,
    width: 32,
  },
  optionText: {
    fontSize: theme?.typography?.fontSize?.md,
    fontWeight: theme?.typography?.fontWeight?.semibold,
    color: theme?.colors?.textPrimary,
  },
  destructiveText: {
    color: DESTRUCTIVE,
  },

  // Confirm / category picker
  message: {
    fontSize: theme?.typography?.fontSize?.sm,
    color: theme?.colors?.textSecondary,
    lineHeight: 20,
    marginBottom: theme?.spacing?.md,
  },
  categoryList: {
    maxHeight: 260,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme?.spacing?.sm + 2,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: theme?.borderRadius?.sm,
    borderWidth: 1.5,
    borderColor: theme?.colors?.gray400,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme?.spacing?.md,
  },
  checkboxOn: {
    backgroundColor: theme?.colors?.textPrimary,
    borderColor: theme?.colors?.textPrimary,
  },
  checkMark: {
    color: theme?.colors?.background,
    fontSize: 14,
    fontWeight: theme?.typography?.fontWeight?.bold,
  },
  checkIcon: {
    fontSize: 18,
    marginRight: theme?.spacing?.sm,
  },
  checkLabel: {
    flex: 1,
    fontSize: theme?.typography?.fontSize?.md,
    color: theme?.colors?.textPrimary,
  },
  checkLabelBold: {
    fontWeight: theme?.typography?.fontWeight?.semibold,
  },
  hint: {
    fontSize: theme?.typography?.fontSize?.xs,
    color: DESTRUCTIVE,
    marginTop: theme?.spacing?.xs,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: theme?.spacing?.sm,
    marginTop: theme?.spacing?.md,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: theme?.borderRadius?.md,
    borderWidth: 1,
    borderColor: theme?.colors?.border,
    backgroundColor: theme?.colors?.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: theme?.typography?.fontSize?.md,
    fontWeight: theme?.typography?.fontWeight?.semibold,
    color: theme?.colors?.textPrimary,
  },
  deleteButton: {
    flex: 1,
    height: 48,
    borderRadius: theme?.borderRadius?.md,
    backgroundColor: DESTRUCTIVE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonDisabled: {
    opacity: 0.4,
  },
  deleteButtonText: {
    fontSize: theme?.typography?.fontSize?.md,
    fontWeight: theme?.typography?.fontWeight?.bold,
    color: theme?.colors?.background,
  },
  error: {
    fontSize: theme?.typography?.fontSize?.sm,
    color: DESTRUCTIVE,
    marginTop: theme?.spacing?.sm,
  },
});

export default styles;
