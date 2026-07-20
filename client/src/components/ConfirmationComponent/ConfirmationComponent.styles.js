import { StyleSheet } from 'react-native';
import theme from '../../constants/theme';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme?.spacing?.lg,
  },
  backdropTouch: {
    ...StyleSheet.absoluteFillObject,
  },
  dialogContainer: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: theme?.colors?.background,
    borderRadius: theme?.borderRadius?.xl,
    padding: theme?.spacing?.lg,
    borderWidth: 1,
    borderColor: theme?.colors?.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  title: {
    fontSize: theme?.typography?.fontSize?.lg,
    fontWeight: theme?.typography?.fontWeight?.bold,
    color: theme?.colors?.textPrimary,
    marginBottom: theme?.spacing?.xs,
  },
  message: {
    fontSize: theme?.typography?.fontSize?.sm,
    color: theme?.colors?.textSecondary,
    lineHeight: 20,
    marginTop: theme?.spacing?.xs,
    marginBottom: theme?.spacing?.md,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme?.spacing?.sm,
    marginTop: theme?.spacing?.xs,
  },
  cancelButton: {
    flex: 1,
    height: 44,
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
  confirmButton: {
    flex: 1,
    height: 44,
    borderRadius: theme?.borderRadius?.md,
    backgroundColor: theme?.colors?.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonDestructive: {
    backgroundColor: '#DC2626', // Vibrant red for destructive action
  },
  confirmButtonText: {
    fontSize: theme?.typography?.fontSize?.md,
    fontWeight: theme?.typography?.fontWeight?.bold,
    color: theme?.colors?.background,
  },
});

export default styles;
