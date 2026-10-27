import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Text,
  View,
  PanResponder,
  Animated,
  Dimensions,
  TouchableOpacity,
  TouchableWithoutFeedback,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Header from '../../components/Header/Header';
import Categories from '../../components/Categories/Categories';
import AddCategoryModal from '../../components/AddCategoryModal/AddCategoryModal';
import AddReelModal from '../../components/AddReelModal/AddReelModal';
import ReelItem from '../../components/ReelItem/ReelItem';
import styles from './Dashboard.styles';
import { createCategory } from '../../api/category.api';
import { fetchReels, createReel } from '../../api/reel.api';
import { mapCategory } from '../../utils/mapCategory';
import { useCategories } from '../../context/CategoriesContext';
import routes from '../../routes/routes';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = 60;

export default function Dashboard() {
  const navigation = useNavigation();
  const { categoriesList, setCategoriesList } = useCategories();
  const categoriesListRef = useRef(categoriesList);
  categoriesListRef.current = categoriesList;

  const [selectedCategory, setSelectedCategory] = useState('all');
  const selectedCategoryRef = useRef(selectedCategory);
  selectedCategoryRef.current = selectedCategory;

  const [isFabOpen, setIsFabOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isAddReelOpen, setIsAddReelOpen] = useState(false);
  const [reels, setReels] = useState([]);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const data = await fetchReels();
        if (isMounted) {
          setReels(data || []);
        }
      } catch (error) {
        console.error('Failed to load reels:', error?.message);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

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
    const list = categoriesListRef?.current || [];
    const currentIndex = list?.findIndex(
      cat => cat?.id === selectedCategoryRef?.current,
    );
    if (currentIndex !== -1 && currentIndex < list?.length - 1) {
      const nextCategoryId = list?.[currentIndex + 1]?.id;
      if (nextCategoryId) {
        changeCategoryWithAnimation('left', nextCategoryId);
      }
    } else {
      resetPosition();
    }
  };

  const handleSwipeRight = () => {
    const list = categoriesListRef?.current || [];
    const currentIndex = list?.findIndex(
      cat => cat?.id === selectedCategoryRef?.current,
    );
    if (currentIndex > 0) {
      const previousCategoryId = list?.[currentIndex - 1]?.id;
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
    const list = categoriesListRef?.current || [];
    const currentIdx = list?.findIndex(c => c?.id === selectedCategory);
    const newIdx = list?.findIndex(c => c?.id === catId);
    const direction = newIdx > currentIdx ? 'left' : 'right';
    changeCategoryWithAnimation(direction, catId);
  };

  // Returns the new category (or null) so the Add Reel drawer can select it.
  const addCategory = async ({ label, icon }) => {
    try {
      const created = await createCategory({ title: label, icon });
      const newCategory = mapCategory(created);
      setCategoriesList(prev => {
        if (prev?.length > 0 && prev[0]?.id === 'all') {
          return [prev[0], newCategory, ...prev.slice(1)];
        }
        return [newCategory, ...prev];
      });
      return newCategory;
    } catch (error) {
      console.error('Failed to create category:', error?.message);
      return null;
    }
  };

  const handleAddCategory = async payload => {
    const newCategory = await addCategory(payload);
    if (newCategory) {
      handleSelectCategoryFromBar(newCategory.id);
    }
  };

  // Errors propagate so the drawer can show them and stay open.
  const handleSaveReel = async payload => {
    const created = await createReel(payload);
    setReels(prev => [created, ...prev]);
    if (
      selectedCategory !== 'all' &&
      selectedCategory !== created?.categoryId
    ) {
      handleSelectCategoryFromBar(created?.categoryId);
    }
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
    categoriesList?.find(c => c?.id === selectedCategory) ||
    categoriesList?.[0];

  const iconByCategoryId = useMemo(
    () => Object.fromEntries(categoriesList.map(c => [c?.id, c?.icon])),
    [categoriesList],
  );

  // Reels of a category deleted this session are dropped (server deletes them too).
  const visibleReels = useMemo(
    () =>
      reels.filter(reel =>
        selectedCategory === 'all'
          ? iconByCategoryId[reel?.categoryId] !== undefined
          : reel?.categoryId === selectedCategory,
      ),
    [reels, selectedCategory, iconByCategoryId],
  );

  const addableCategories = useMemo(
    () => categoriesList.filter(c => c?.id !== 'all'),
    [categoriesList],
  );

  return (
    <SafeAreaView style={styles?.safeArea} edges={['top', 'left', 'right']}>
      <Header onRightPress={() => navigation.navigate(routes.Settings)} />
      <Categories
        categories={categoriesList}
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategoryFromBar}
      />
      <View style={styles?.content} {...panResponder?.panHandlers}>
        <Animated.View
          style={[
            visibleReels.length > 0 ? styles?.reelsContainer : styles?.card,
            {
              transform: [{ translateX }],
              opacity,
            },
          ]}
        >
          {visibleReels.length > 0 ? (
            <FlatList
              data={visibleReels}
              keyExtractor={item => item?.id}
              renderItem={({ item }) => (
                <ReelItem
                  reel={item}
                  icon={iconByCategoryId[item?.categoryId]}
                />
              )}
              contentContainerStyle={styles?.reelsList}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <>
              <Text style={styles?.icon}>{activeCategoryObj?.icon}</Text>
              <Text style={styles?.title}>{activeCategoryObj?.label}</Text>
              <Text style={styles?.subtitle}>
                No reels yet. Tap + to add one.{'\n'}
                Swipe left or right to switch categories
              </Text>
            </>
          )}
        </Animated.View>
      </View>

      {/* FAB Backdrop */}
      {isFabOpen && (
        <TouchableWithoutFeedback onPress={() => setIsFabOpen(false)}>
          <View style={styles?.fabBackdrop} />
        </TouchableWithoutFeedback>
      )}

      {/* Floating Action Button (FAB) & Menu */}
      <View style={styles?.fabContainer}>
        {isFabOpen && (
          <View style={styles?.menuContainer}>
            {/* Add Categories Option (Enabled) */}
            <TouchableOpacity
              style={styles?.menuItem}
              onPress={() => {
                setIsFabOpen(false);
                setIsAddCategoryOpen(true);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles?.menuItemText}>Add Categories</Text>
            </TouchableOpacity>

            {/* Add Reels Option */}
            <TouchableOpacity
              style={styles?.menuItem}
              onPress={() => {
                setIsFabOpen(false);
                setIsAddReelOpen(true);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles?.menuItemText}>Add Reels</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Plus / Close Floating Button */}
        <TouchableOpacity
          style={[styles?.fabButton, isFabOpen && styles?.fabButtonActive]}
          onPress={() => setIsFabOpen(prev => !prev)}
          activeOpacity={0.85}
        >
          <Text style={styles?.fabIconText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Add Category Bottom Drawer Modal */}
      <AddCategoryModal
        visible={isAddCategoryOpen}
        onClose={() => setIsAddCategoryOpen(false)}
        onAddCategory={handleAddCategory}
      />

      {/* Add Reel Bottom Drawer Modal */}
      <AddReelModal
        visible={isAddReelOpen}
        onClose={() => setIsAddReelOpen(false)}
        onSave={handleSaveReel}
        onAddCategory={addCategory}
        categories={addableCategories}
        defaultCategoryId={selectedCategory !== 'all' ? selectedCategory : null}
      />
    </SafeAreaView>
  );
}
