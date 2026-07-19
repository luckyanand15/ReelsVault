import React, { useState, useRef } from 'react';
import { Text, View, PanResponder, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/Header/Header';
import Categories, {
  DEFAULT_CATEGORIES,
} from '../../components/Categories/Categories';
import styles from './Dashboard.styles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = 60;

export default function Dashboard() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const selectedCategoryRef = useRef(selectedCategory);
  selectedCategoryRef.current = selectedCategory;

  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const isSwipingRef = useRef(false);

  const changeCategoryWithAnimation = (direction, newCategory) => {
    isSwipingRef.current = true;
    const exitX =
      direction === 'left' ? -SCREEN_WIDTH * 0.8 : SCREEN_WIDTH * 0.8;
    const entryX =
      direction === 'left' ? SCREEN_WIDTH * 0.8 : -SCREEN_WIDTH * 0.8;

    Animated.parallel([
      Animated.timing(translateX, {
        toValue: exitX,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0.2,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setSelectedCategory(newCategory);
      translateX.setValue(entryX);
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        isSwipingRef.current = false;
      });
    });
  };

  const handleSwipeLeft = () => {
    const currentIndex =
      DEFAULT_CATEGORIES?.findIndex(
        cat => cat?.id === selectedCategoryRef?.current,
      ) ?? -1;
    if (currentIndex < (DEFAULT_CATEGORIES?.length ?? 0) - 1) {
      const nextCategoryId = DEFAULT_CATEGORIES?.[currentIndex + 1]?.id;
      if (nextCategoryId) {
        changeCategoryWithAnimation('left', nextCategoryId);
      }
    } else {
      resetPosition();
    }
  };

  const handleSwipeRight = () => {
    const currentIndex =
      DEFAULT_CATEGORIES?.findIndex(
        cat => cat?.id === selectedCategoryRef?.current,
      ) ?? -1;
    if (currentIndex > 0) {
      const previousCategoryId = DEFAULT_CATEGORIES?.[currentIndex - 1]?.id;
      if (previousCategoryId) {
        changeCategoryWithAnimation('right', previousCategoryId);
      }
    } else {
      resetPosition();
    }
  };

  const resetPosition = () => {
    Animated.parallel([
      Animated.spring(translateX, {
        toValue: 0,
        tension: 40,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSelectCategoryFromBar = catId => {
    if (catId === selectedCategory) return;
    if (isSwipingRef?.current) {
      setSelectedCategory(catId);
      return;
    }
    const currentIdx =
      DEFAULT_CATEGORIES?.findIndex(c => c?.id === selectedCategory) ?? -1;
    const newIdx = DEFAULT_CATEGORIES?.findIndex(c => c?.id === catId) ?? -1;
    const direction = newIdx > currentIdx ? 'left' : 'right';
    changeCategoryWithAnimation(direction, catId);
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        const dx = gestureState?.dx ?? 0;
        const dy = gestureState?.dy ?? 0;

        return Math.abs(dx) > 15 && Math.abs(dx) > Math.abs(dy) * 1.2;
      },
      onPanResponderMove: (_, gestureState) => {
        const dx = gestureState?.dx ?? 0;

        translateX.setValue(dx);
        const progress = Math.min(1, Math.abs(dx) / (SCREEN_WIDTH * 0.5));
        opacity.setValue(1 - progress * 0.4);
      },
      onPanResponderRelease: (_, gestureState) => {
        const dx = gestureState?.dx ?? 0;

        if (dx < -SWIPE_THRESHOLD) {
          handleSwipeLeft();
        } else if (dx > SWIPE_THRESHOLD) {
          handleSwipeRight();
        } else {
          resetPosition();
        }
      },
    }),
  ).current;

  const activeCategoryObj =
    DEFAULT_CATEGORIES?.find(c => c?.id === selectedCategory) ||
    DEFAULT_CATEGORIES?.[0];

  return (
    <SafeAreaView style={styles?.safeArea} edges={['top', 'left', 'right']}>
      <Header />
      <Categories
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategoryFromBar}
      />
      <View style={styles?.content} {...panResponder?.panHandlers}>
        <Animated.View
          style={[
            styles?.card,
            {
              transform: [{ translateX }],
              opacity,
            },
          ]}
        >
          <Text style={styles?.icon}>{activeCategoryObj?.icon}</Text>
          <Text style={styles?.title}>{activeCategoryObj?.label}</Text>
          <Text style={styles?.subtitle}>
            Swipe left or right to switch categories
          </Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
