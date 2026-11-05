import { StyleSheet } from 'react-native';

// Card positions are in the design's 390px-wide frame (cards' top edge at y=100)
export const COLLAGE_WIDTH = 390;
export const COLLAGE_HEIGHT = 340;

export const cardLayouts = {
  left: { left: 30, top: 50, width: 142, height: 252, radius: 22, rotate: '-9deg' },
  right: { left: 218, top: 68, width: 142, height: 252, radius: 22, rotate: '9deg' },
  center: { left: 117, top: 12, width: 158, height: 280, radius: 24, rotate: '2deg' },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stage: {
    width: COLLAGE_WIDTH,
    height: COLLAGE_HEIGHT,
  },
  cardSlot: {
    position: 'absolute',
  },
  card: {
    borderWidth: 2,
    overflow: 'hidden',
  },
});

export default styles;
