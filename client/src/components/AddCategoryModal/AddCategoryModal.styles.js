import { StyleSheet, Dimensions, Platform } from 'react-native';
import theme from '../../constants/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

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
    paddingBottom: Platform.OS === 'ios' ? theme?.spacing?.xl : theme?.spacing?.md,
    marginTop: Platform.OS === 'ios' ? 50 : 36,
    maxHeight: SCREEN_HEIGHT - 60,
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme?.spacing?.sm,
  },
  title: {
    fontSize: theme?.typography?.fontSize?.lg,
    fontWeight: theme?.typography?.fontWeight?.bold,
    color: theme?.colors?.textPrimary,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme?.colors?.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: theme?.typography?.fontSize?.md,
    fontWeight: theme?.typography?.fontWeight?.bold,
    color: theme?.colors?.textSecondary,
  },
  formContainer: {
    paddingBottom: theme?.spacing?.sm,
  },
  label: {
    fontSize: theme?.typography?.fontSize?.sm,
    fontWeight: theme?.typography?.fontWeight?.semibold,
    color: theme?.colors?.textSecondary,
    marginBottom: theme?.spacing?.xs,
    marginTop: theme?.spacing?.xs,
  },
  iconScrollWrapper: {
    maxHeight: 312, // Shows up to 6 lines of icons when keyboard is closed
    marginVertical: theme?.spacing?.xs,
    borderWidth: 1,
    borderColor: theme?.colors?.gray200,
    borderRadius: theme?.borderRadius?.lg,
    padding: 6,
    backgroundColor: theme?.colors?.surface,
    position: 'relative',
  },
  iconScrollWrapperKeyboard: {
    maxHeight: 156, // Shows up to 3 lines of icons when keyboard is open
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  iconOption: {
    width: 44,
    height: 44,
    borderRadius: theme?.borderRadius?.md,
    backgroundColor: theme?.colors?.card,
    borderWidth: 1.5,
    borderColor: theme?.colors?.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedIconOption: {
    borderColor: theme?.colors?.textPrimary,
    backgroundColor: theme?.colors?.gray100,
    transform: [{ scale: 1.05 }],
  },
  iconEmoji: {
    fontSize: 22,
  },
  customScrollTrack: {
    position: 'absolute',
    right: 4,
    top: 6,
    bottom: 6,
    width: 4,
    backgroundColor: '#E5E5E5',
    borderRadius: 2,
    overflow: 'hidden',
  },
  customScrollThumb: {
    width: 4,
    backgroundColor: '#000000',
    borderRadius: 2,
  },
  input: {
    height: 48,
    backgroundColor: theme?.colors?.surface,
    borderWidth: 1,
    borderColor: theme?.colors?.border,
    borderRadius: theme?.borderRadius?.md,
    paddingHorizontal: theme?.spacing?.md,
    fontSize: theme?.typography?.fontSize?.md,
    color: theme?.colors?.textPrimary,
    marginTop: theme?.spacing?.xs,
    marginBottom: theme?.spacing?.md,
  },
  submitButton: {
    height: 50,
    backgroundColor: theme?.colors?.textPrimary,
    borderRadius: theme?.borderRadius?.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme?.spacing?.xs,
  },
  disabledSubmitButton: {
    backgroundColor: theme?.colors?.gray300,
  },
  submitButtonText: {
    fontSize: theme?.typography?.fontSize?.md,
    fontWeight: theme?.typography?.fontWeight?.bold,
    color: theme?.colors?.background,
  },
});

export default styles;
