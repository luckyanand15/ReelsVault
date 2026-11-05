import { StyleSheet } from 'react-native';
import { fonts } from '../../constants/theme';

const styles = StyleSheet.create({
  group: {
    gap: 12,
  },
  eyebrow: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    letterSpacing: 1.56, // 0.12em
    textTransform: 'uppercase',
  },
  card: {
    borderRadius: 24,
    borderWidth: 2,
    overflow: 'hidden',
  },
  divider: {
    height: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  pressed: {
    opacity: 0.7,
  },
  tile: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  title: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 14,
  },
});

export default styles;
