import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import {
  Text,
  View,
  PanResponder,
  Animated,
  Dimensions,
  TouchableOpacity,
  TouchableWithoutFeedback,
  FlatList,
  RefreshControl,
  useWindowDimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Header from '../../components/Header/Header';
import Categories from '../../components/Categories/Categories';
import AddCategoryModal from '../../components/AddCategoryModal/AddCategoryModal';
import AddReelModal from '../../components/AddReelModal/AddReelModal';
import ReelItem from '../../components/ReelItem/ReelItem';
import styles from './Dashboard.styles';
import { createCategory } from '../../api/category.api';
import {
  fetchReels,
  createReel,
  refreshReelThumbnail,
} from '../../api/reel.api';
import { mapCategory } from '../../utils/mapCategory';
import { useCategories } from '../../context/CategoriesContext';
import routes from '../../routes/routes';
import theme from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = 60;
const GRID_COLUMNS = 3;
const VIEW_MODE_KEY = 'dashboardViewMode';

const ListViewIcon = ({ active }) => (
  <View style={styles?.listIcon}>
    {[0, 1, 2].map(i => (
      <View
        key={i}
        style={[styles?.listIconBar, active && styles?.viewIconActive]}
      />
    ))}
  </View>
);

const GridViewIcon = ({ active }) => (
  <View style={styles?.gridIcon}>
    {[0, 1, 2, 3].map(i => (
      <View
        key={i}
        style={[styles?.gridIconCell, active && styles?.viewIconActive]}
      />
    ))}
  </View>
);

export default function Dashboard() {
  const navigation = useNavigation();
  const { categoriesList, setCategoriesList, refreshCategories } =
    useCategories();
  const categoriesListRef = useRef(categoriesList);
  categoriesListRef.current = categoriesList;

  const [selectedCategory, setSelectedCategory] = useState('all');
  const selectedCategoryRef = useRef(selectedCategory);
  selectedCategoryRef.current = selectedCategory;

  const [isFabOpen, setIsFabOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isAddReelOpen, setIsAddReelOpen] = useState(false);
  const [reels, setReels] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const isGrid = viewMode === 'grid';

  // Tile width for 3 per row: screen minus the content padding and the
  // gaps between columns.
  const { width: windowWidth } = useWindowDimensions();
  const gridItemWidth =
    (windowWidth -
      2 * theme?.spacing?.md -
      (GRID_COLUMNS - 1) * theme?.spacing?.sm) /
    GRID_COLUMNS;

  // Remembers the chosen view across launches; storage failures just keep
  // the default.
  useEffect(() => {
    AsyncStorage.getItem(VIEW_MODE_KEY)
      .then(saved => {
        if (saved === 'list' || saved === 'grid') {
          setViewMode(saved);
        }
      })
      .catch(() => {});
  }, []);

  const changeViewMode = mode => {
    setViewMode(mode);
    AsyncStorage.setItem(VIEW_MODE_KEY, mode).catch(() => {});
  };

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

  // Pull-to-refresh: reloads reels and categories together. Each half is
  // independent, so one failing keeps the other's fresh data and the
  // current list stays on screen.
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    const [reelsResult, categoriesResult] = await Promise.allSettled([
      fetchReels(),
      refreshCategories(),
    ]);
    if (reelsResult.status === 'fulfilled') {
      setReels(reelsResult.value || []);
    } else {
      console.error('Failed to refresh reels:', reelsResult.reason?.message);
    }
    if (categoriesResult.status === 'rejected') {
      console.error(
        'Failed to refresh categories:',
        categoriesResult.reason?.message,
      );
    }
    setIsRefreshing(false);
  }, [refreshCategories]);

  // A refreshed list can drop the open category (deleted elsewhere).
  useEffect(() => {
    if (
      selectedCategory !== 'all' &&
      !categoriesList.some(c => c?.id === selectedCategory)
    ) {
      setSelectedCategory('all');
    }
  }, [categoriesList, selectedCategory]);

  // One refresh per reel per session: a reel with no findable thumbnail
  // keeps its category icon instead of asking again on every render.
  const thumbnailRequestedRef = useRef(new Set());
  const handleThumbnailMissing = useCallback(async reel => {
    const requested = thumbnailRequestedRef.current;
    if (!reel?.id || requested.has(reel.id)) {
      return;
    }
    requested.add(reel.id);
    try {
      const updated = await refreshReelThumbnail(reel.id);
      if (updated?.thumbnailUrl && updated.thumbnailUrl !== reel.thumbnailUrl) {
        setReels(prev =>
          prev.map(r =>
            r?.id === updated.id
              ? { ...r, thumbnailUrl: updated.thumbnailUrl }
              : r,
          ),
        );
      }
    } catch (error) {
      console.error('Failed to refresh thumbnail:', error?.message);
    }
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
  // A reel already saved elsewhere comes back with the category added, so it
  // replaces its old entry instead of being listed twice.
  const handleSaveReel = async payload => {
    const saved = await createReel(payload);
    setReels(prev =>
      prev.some(r => r?.id === saved?.id)
        ? prev.map(r => (r?.id === saved?.id ? saved : r))
        : [saved, ...prev],
    );
    if (
      selectedCategory !== 'all' &&
      selectedCategory !== payload?.categoryId
    ) {
      handleSelectCategoryFromBar(payload?.categoryId);
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

  // Reels left in no existing category are dropped (the server deletes them
  // when their last category goes).
  const visibleReels = useMemo(
    () =>
      reels.filter(reel =>
        selectedCategory === 'all'
          ? reel?.categoryIds?.some(id => iconByCategoryId[id] !== undefined)
          : reel?.categoryIds?.includes(selectedCategory),
      ),
    [reels, selectedCategory, iconByCategoryId],
  );

  // The open category's icon, or under All the first category still present.
  const reelIcon = reel =>
    selectedCategory !== 'all'
      ? iconByCategoryId[selectedCategory]
      : iconByCategoryId[
          reel?.categoryIds?.find(id => iconByCategoryId[id] !== undefined)
        ];

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
      <View style={styles?.viewToggleRow}>
        <View style={styles?.viewToggle}>
          <TouchableOpacity
            style={[
              styles?.viewToggleButton,
              !isGrid && styles?.viewToggleButtonActive,
            ]}
            onPress={() => changeViewMode('list')}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="List view"
            accessibilityState={{ selected: !isGrid }}
          >
            <ListViewIcon active={!isGrid} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles?.viewToggleButton,
              isGrid && styles?.viewToggleButtonActive,
            ]}
            onPress={() => changeViewMode('grid')}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Grid view"
            accessibilityState={{ selected: isGrid }}
          >
            <GridViewIcon active={isGrid} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles?.content} {...panResponder?.panHandlers}>
        <Animated.View
          style={[
            styles?.reelsContainer,
            {
              transform: [{ translateX }],
              opacity,
            },
          ]}
        >
          {/* The list renders even when empty so pull-to-refresh works there too. */}
          {/* numColumns can't change on a mounted FlatList, so the key
              remounts it when the view switches. */}
          <FlatList
            key={viewMode}
            data={visibleReels}
            keyExtractor={item => item?.id}
            numColumns={isGrid ? GRID_COLUMNS : 1}
            columnWrapperStyle={isGrid ? styles?.gridRow : undefined}
            renderItem={({ item }) => (
              <ReelItem
                reel={item}
                icon={reelIcon(item)}
                onThumbnailMissing={handleThumbnailMissing}
                variant={viewMode}
                style={isGrid ? { width: gridItemWidth } : undefined}
              />
            )}
            contentContainerStyle={
              visibleReels.length > 0 ? styles?.reelsList : styles?.emptyList
            }
            showsVerticalScrollIndicator={false}
            alwaysBounceVertical
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                tintColor={theme?.colors?.textMuted}
                colors={[theme?.colors?.accent]}
              />
            }
            ListEmptyComponent={
              <View style={styles?.card}>
                <Text style={styles?.icon}>{activeCategoryObj?.icon}</Text>
                <Text style={styles?.title}>{activeCategoryObj?.label}</Text>
                <Text style={styles?.subtitle}>
                  No reels yet. Tap + to add one.{'\n'}
                  Swipe left or right to switch categories{'\n'}
                  Pull down to refresh
                </Text>
              </View>
            }
          />
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
