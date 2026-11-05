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
  Pressable,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  useWindowDimensions,
  Platform,
  TextInput,
  Keyboard,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import DashboardHeader from '../../components/DashboardHeader/DashboardHeader';
import ScreenBackground from '../../components/ScreenBackground/ScreenBackground';
import HardShadow from '../../components/HardShadow/HardShadow';
import Icon from '../../components/Icon/Icon';
import Categories from '../../components/Categories/Categories';
import AddCategoryModal from '../../components/AddCategoryModal/AddCategoryModal';
import AddReelModal from '../../components/AddReelModal/AddReelModal';
import ReelItem from '../../components/ReelItem/ReelItem';
import ReelActionsSheet from '../../components/ReelActionsSheet/ReelActionsSheet';
import EditReelModal from '../../components/EditReelModal/EditReelModal';
import styles from './Dashboard.styles';
import { createCategory } from '../../api/category.api';
import {
  fetchReels,
  fetchReelCounts,
  searchReels,
  createReel,
  refreshReelThumbnail,
  updateReel,
  deleteReel,
} from '../../api/reel.api';
import { mapCategory } from '../../utils/mapCategory';
import { reelTitle } from '../../utils/reelTitle';
import { useCategories } from '../../context/CategoriesContext';
import { useTheme } from '../../context/ThemeContext';
import routes from '../../routes/routes';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = 60;
const GRID_COLUMNS = 3;
// Screen side padding and the gap between grid columns (DESIGN.md).
const SIDE_PADDING = 20;
const GRID_COLUMN_GAP = 12;
const FAB_SIZE = 66;
const FAB_BOTTOM = 30;
const VIEW_MODE_KEY = 'dashboardViewMode';
const PAGE_SIZE = 15;
// Wait this long after the last keystroke before searching.
const SEARCH_DEBOUNCE_MS = 250;

// "1 reel", "6 reels", "15+ results": `more` adds the + while further pages
// exist and the exact total isn't known.
const countText = (count, noun, more = false) =>
  `${count}${more ? '+' : ''} ${noun}${count === 1 && !more ? '' : 's'}`;

export default function Dashboard() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
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
  // The reel whose long-press actions are open.
  const [actionReel, setActionReel] = useState(null);
  const [editReel, setEditReel] = useState(null);
  // iOS can't present a modal while another is still closing, so Edit waits
  // here until the actions sheet has gone.
  const pendingEditRef = useRef(null);
  // Loaded reels per category ('all' included): { items, nextCursor }. Kept
  // while switching categories so going back doesn't fetch again.
  const [reelsByCategory, setReelsByCategory] = useState({});
  const reelsByCategoryRef = useRef(reelsByCategory);
  reelsByCategoryRef.current = reelsByCategory;
  const [isRefreshing, setIsRefreshing] = useState(false);
  // New users start on the grid; a saved choice replaces it below.
  const [viewMode, setViewMode] = useState('grid');
  const isGrid = viewMode === 'grid';

  // Tile width for 3 per row: screen minus the content padding and the
  // gaps between columns.
  const { width: windowWidth } = useWindowDimensions();
  const gridItemWidth =
    (windowWidth - 2 * SIDE_PADDING - (GRID_COLUMNS - 1) * GRID_COLUMN_GAP) /
    GRID_COLUMNS;

  // Server totals for the section heading: { all, categories: { id: n } }.
  // Lists load a page at a time, so these are the only exact counts. Fetched
  // again after every change and whenever the Dashboard comes back into view
  // (Manage Categories may have deleted a category meanwhile).
  const [reelCounts, setReelCounts] = useState(null);
  const refreshCounts = useCallback(
    () =>
      fetchReelCounts()
        .then(setReelCounts)
        .catch(error =>
          console.error('Failed to load reel counts:', error?.message),
        ),
    [],
  );
  useFocusEffect(
    useCallback(() => {
      refreshCounts();
    }, [refreshCounts]),
  );

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

  // Search covers every category, whichever one is open. The text box is
  // searchText; search holds the results for the query in key, so results
  // for an older query are never shown as this one's.
  const [searchText, setSearchText] = useState('');
  const searchQuery = searchText.trim();
  const isSearching = searchQuery.length > 0;
  const [search, setSearch] = useState(null);
  const searchQueryRef = useRef(searchQuery);
  searchQueryRef.current = searchQuery;
  const searchRef = useRef(search);
  searchRef.current = search;
  // The request in flight; a newer search (or clearing it) aborts it.
  const searchAbortRef = useRef(null);
  const searchInputRef = useRef(null);

  // Any touch outside the search box takes focus (and the keyboard) away
  // from it. Runs in the capture phase and returns false, so the touch still
  // reaches whatever was tapped: a reel opens, a category switches.
  const blurSearchOnTouch = {
    onStartShouldSetResponderCapture: () => {
      if (searchInputRef.current?.isFocused()) {
        searchInputRef.current.blur();
      }
      return false;
    },
  };

  const runSearch = useCallback(async (q, page = 1) => {
    searchAbortRef.current?.abort();
    const controller = new AbortController();
    searchAbortRef.current = controller;
    // A new query starts empty (so the loader shows); a refresh or the next
    // page keeps what's already listed.
    setSearch(prev =>
      prev?.key === q
        ? { ...prev, loading: true, failed: false }
        : { key: q, items: [], nextPage: null, loading: true },
    );
    try {
      const result = await searchReels({
        q,
        page,
        limit: PAGE_SIZE,
        signal: controller.signal,
      });
      setSearch(prev => {
        if (prev?.key !== q) {
          return prev;
        }
        const items = page === 1 ? [] : prev.items;
        const seen = new Set(items.map(r => r?.id));
        return {
          key: q,
          items: [...items, ...result.reels.filter(r => !seen.has(r?.id))],
          nextPage: result.nextPage,
          fuzzy: page === 1 ? result.fuzzy : prev.fuzzy,
          loading: false,
        };
      });
    } catch (error) {
      if (controller.signal.aborted) {
        return;
      }
      console.error('Failed to search reels:', error?.message);
      setSearch(prev =>
        prev?.key === q ? { ...prev, loading: false, failed: true } : prev,
      );
    } finally {
      if (searchAbortRef.current === controller) {
        searchAbortRef.current = null;
      }
    }
  }, []);

  // Searches once typing pauses.
  useEffect(() => {
    if (!searchQuery) {
      searchAbortRef.current?.abort();
      setSearch(null);
      return undefined;
    }
    const timer = setTimeout(() => runSearch(searchQuery), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchQuery, runSearch]);

  // Abandons a search still in flight when the screen goes away.
  useEffect(() => () => searchAbortRef.current?.abort(), []);

  const loadMoreSearch = () => {
    const current = searchRef.current;
    if (current?.key === searchQuery && current.nextPage && !current.loading) {
      runSearch(searchQuery, current.nextPage);
    }
  };

  // Applies a change to the search results shown, if any.
  const updateSearchItems = useCallback(update => {
    setSearch(prev => (prev ? { ...prev, items: update(prev.items) } : prev));
  }, []);

  // Categories with a page request in flight, so one can't be asked twice.
  const loadingRef = useRef(new Set());
  // Bumped by a reset; pages requested before it are thrown away.
  const generationRef = useRef(0);

  // Loads the next page of a category, or with reset its first page again
  // (dropping every other category's cache, since a refresh can change any).
  const loadReels = useCallback(async (categoryId, reset = false) => {
    const entry = reelsByCategoryRef.current[categoryId];
    if (
      !reset &&
      (loadingRef.current.has(categoryId) || (entry && !entry.nextCursor))
    ) {
      return;
    }
    if (reset) {
      generationRef.current += 1;
      loadingRef.current.clear();
    }
    const generation = generationRef.current;
    loadingRef.current.add(categoryId);
    try {
      const page = await fetchReels({
        categoryId: categoryId === 'all' ? undefined : categoryId,
        cursor: reset ? undefined : entry?.nextCursor,
        limit: PAGE_SIZE,
      });
      if (generation !== generationRef.current) {
        return;
      }
      setReelsByCategory(prev => {
        if (reset) {
          return {
            [categoryId]: { items: page.reels, nextCursor: page.nextCursor },
          };
        }
        // A reel saved meanwhile was already put on top; skip it here.
        const items = prev[categoryId]?.items || [];
        const seen = new Set(items.map(r => r?.id));
        return {
          ...prev,
          [categoryId]: {
            items: [...items, ...page.reels.filter(r => !seen.has(r?.id))],
            nextCursor: page.nextCursor,
          },
        };
      });
    } finally {
      if (generation === generationRef.current) {
        loadingRef.current.delete(categoryId);
      }
    }
  }, []);

  // First page of a category the first time it's opened.
  useEffect(() => {
    if (!reelsByCategory[selectedCategory]) {
      loadReels(selectedCategory).catch(error =>
        console.error('Failed to load reels:', error?.message),
      );
    }
  }, [selectedCategory, reelsByCategory, loadReels]);

  // Pull-to-refresh: reloads the open category's first page and the
  // categories together. Each half is independent, so one failing keeps the
  // other's fresh data and the current list stays on screen.
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    const query = searchQueryRef.current;
    const [reelsResult, categoriesResult] = await Promise.allSettled([
      query ? runSearch(query) : loadReels(selectedCategoryRef.current, true),
      refreshCategories(),
      refreshCounts(),
    ]);
    if (reelsResult.status === 'rejected') {
      console.error('Failed to refresh reels:', reelsResult.reason?.message);
    }
    if (categoriesResult.status === 'rejected') {
      console.error(
        'Failed to refresh categories:',
        categoriesResult.reason?.message,
      );
    }
    setIsRefreshing(false);
  }, [loadReels, refreshCategories, runSearch, refreshCounts]);

  // Applies a change to every cached list.
  const updateCachedLists = useCallback(update => {
    setReelsByCategory(prev =>
      Object.fromEntries(
        Object.entries(prev).map(([catId, entry]) => [
          catId,
          { ...entry, items: update(entry.items, catId, entry) },
        ]),
      ),
    );
  }, []);

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
  const handleThumbnailMissing = useCallback(
    async reel => {
      const requested = thumbnailRequestedRef.current;
      if (!reel?.id || requested.has(reel.id)) {
        return;
      }
      requested.add(reel.id);
      try {
        const updated = await refreshReelThumbnail(reel.id);
        if (
          updated?.thumbnailUrl &&
          updated.thumbnailUrl !== reel.thumbnailUrl
        ) {
          const withThumbnail = items =>
            items.map(r =>
              r?.id === updated.id
                ? { ...r, thumbnailUrl: updated.thumbnailUrl }
                : r,
            );
          updateCachedLists(withThumbnail);
          updateSearchItems(withThumbnail);
        }
      } catch (error) {
        console.error('Failed to refresh thumbnail:', error?.message);
      }
    },
    [updateCachedLists, updateSearchItems],
  );

  // Search results span every category, so a reel leaves them only when
  // it's deleted; otherwise it gets its new data.
  const applyToSearch = useCallback(
    (reelId, reel, deleted) =>
      updateSearchItems(items =>
        deleted
          ? items.filter(r => r?.id !== reelId)
          : items.map(r => (r?.id === reelId ? { ...r, ...reel } : r)),
      ),
    [updateSearchItems],
  );

  // Removes the reel from the categories it left (every list when it was
  // deleted) and gives the lists that keep it its new categories.
  const applyReelRemoval = useCallback(
    (reelId, { reel, deleted }) => {
      applyToSearch(reelId, reel, deleted);
      updateCachedLists((items, catId) => {
        const keep =
          !deleted && (catId === 'all' || reel?.categoryIds?.includes(catId));
        return keep
          ? items.map(r =>
              r?.id === reelId
                ? {
                    ...r,
                    categories: reel.categories,
                    categoryIds: reel.categoryIds,
                  }
                : r,
            )
          : items.filter(r => r?.id !== reelId);
      });
    },
    [updateCachedLists, applyToSearch],
  );

  // Puts an edited reel in the lists of its categories (and All) and takes
  // it out of the rest. A list gaining it slots it in by date, unless it's
  // older than everything loaded there; the next page brings it then.
  const applyReelUpdate = useCallback(
    updated => {
      applyToSearch(updated?.id, updated, false);
      updateCachedLists((items, catId, entry) => {
        const belongs =
          catId === 'all' || updated?.categoryIds?.includes(catId);
        const has = items.some(r => r?.id === updated?.id);
        if (!belongs) {
          return has ? items.filter(r => r?.id !== updated?.id) : items;
        }
        if (has) {
          return items.map(r =>
            r?.id === updated?.id ? { ...r, ...updated } : r,
          );
        }
        // All is ordered by when a reel was first saved, a category by when
        // it was added there.
        const dateIn = r =>
          catId === 'all'
            ? r?.createdAt
            : r?.categories?.find(c => c?.categoryId === catId)?.createdAt;
        const isNewer = r =>
          dateIn(r) < dateIn(updated) ||
          (dateIn(r) === dateIn(updated) && r?.id < updated?.id);
        const index = items.findIndex(isNewer);
        if (index === -1) {
          return entry?.nextCursor ? items : [...items, updated];
        }
        return [...items.slice(0, index), updated, ...items.slice(index)];
      });
    },
    [updateCachedLists, applyToSearch],
  );

  // The open category (undefined under All): reels show their title there,
  // and it's the title the edit drawer changes.
  const openCategoryId =
    selectedCategory !== 'all' ? selectedCategory : undefined;
  // The category whose title a reel shows (and edits): while searching, the
  // one whose title matched, since results come from every category.
  const titleCategoryFor = reel =>
    isSearching ? reel?.matchedCategoryId : openCategoryId;

  // Errors propagate so the drawer can show them and stay open.
  const handleSaveEdit = async changes => {
    const updated = await updateReel(editReel?.id, {
      ...changes,
      categoryId: titleCategoryFor(editReel),
    });
    applyReelUpdate(updated);
    // Moving a reel between categories changes their counts.
    if (changes?.categoryIds) {
      refreshCounts();
    }
  };

  const handleEditPress = () => {
    if (Platform.OS === 'ios') {
      pendingEditRef.current = actionReel;
    } else {
      setEditReel(actionReel);
    }
    setActionReel(null);
  };

  const handleActionsDismiss = () => {
    if (pendingEditRef.current) {
      setEditReel(pendingEditRef.current);
      pendingEditRef.current = null;
    }
  };

  const handleReelLongPress = useCallback(reel => setActionReel(reel), []);

  // categoryIds undefined deletes the reel everywhere. Errors propagate so
  // the sheet can show them; a reel already gone elsewhere is just dropped.
  const handleDeleteReel = async categoryIds => {
    const reelId = actionReel?.id;
    try {
      const result = await deleteReel(reelId, categoryIds);
      applyReelRemoval(reelId, result);
    } catch (error) {
      if (error?.response?.status !== 404) {
        throw error;
      }
      applyReelRemoval(reelId, { deleted: true });
    }
    setActionReel(null);
    refreshCounts();
  };

  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const isSwipingRef = useRef(false);

  // Opening a category (by tap or swipe) ends the search, so the list shows
  // that category's reels.
  const clearSearch = () => {
    setSearchText('');
    searchInputRef.current?.blur();
  };

  const changeCategoryWithAnimation = (direction, newCategory) => {
    clearSearch();
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
    if (catId === selectedCategory) {
      // Tapping the open category while searching goes back to its reels.
      clearSearch();
      return;
    }
    if (isSwipingRef?.current) {
      clearSearch();
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
  // replaces its old entry instead of being listed twice. It goes on top of
  // All and its category; lists not loaded yet will fetch it themselves.
  const handleSaveReel = async payload => {
    const saved = await createReel(payload);
    updateCachedLists((items, catId) => {
      if (items.some(r => r?.id === saved?.id)) {
        return items.map(r => (r?.id === saved?.id ? saved : r));
      }
      return catId === 'all' || catId === payload?.categoryId
        ? [saved, ...items]
        : items;
    });
    refreshCounts();
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
  const categoryById = useMemo(
    () => Object.fromEntries(categoriesList.map(c => [c?.id, c])),
    [categoriesList],
  );

  const currentList = reelsByCategory[selectedCategory];

  // Under All, reels left in no existing category are dropped (the server
  // deletes them when their last category goes).
  const visibleReels = useMemo(() => {
    const items = currentList?.items || [];
    return selectedCategory === 'all'
      ? items.filter(reel =>
          reel?.categoryIds?.some(id => iconByCategoryId[id] !== undefined),
        )
      : items;
  }, [currentList, selectedCategory, iconByCategoryId]);

  // While searching, the list shows only the results for exactly what's
  // typed; until they arrive it's empty, so the loader shows.
  const currentSearch = search?.key === searchQuery ? search : null;
  const isSearchFresh = !!currentSearch && !currentSearch.loading;
  const shownReels = isSearching ? currentSearch?.items || [] : visibleReels;
  const hasMore = isSearching
    ? !!currentSearch?.nextPage
    : !!currentList?.nextCursor;

  // Next page once the second-last row comes into view. FlatList needs one
  // fixed callback, so it calls through a ref to the current values.
  const handleViewableRef = useRef(null);
  handleViewableRef.current = viewableItems => {
    const columns = isGrid ? GRID_COLUMNS : 1;
    const secondLastRowStart =
      (Math.ceil(shownReels.length / columns) - 2) * columns;
    const lastVisible = Math.max(-1, ...viewableItems.map(v => v?.index ?? -1));
    if (!hasMore || lastVisible < secondLastRowStart) {
      return;
    }
    if (isSearching) {
      loadMoreSearch();
    } else {
      loadReels(selectedCategory).catch(error =>
        console.error('Failed to load more reels:', error?.message),
      );
    }
  };

  const renderEmptyCard = hint => (
    <View style={[styles?.emptyCard, { borderColor: colors?.line }]}>
      <Text style={[styles?.emptyTitle, { color: colors?.fg }]}>
        Nothing here yet
      </Text>
      <Text style={[styles?.emptyText, { color: colors?.mut }]}>{hint}</Text>
    </View>
  );

  const renderEmpty = () => {
    if (isSearching) {
      if (!isSearchFresh) {
        return <ActivityIndicator style={styles?.loader} color={colors?.mut} />;
      }
      return renderEmptyCard(
        currentSearch.failed
          ? "Couldn't search right now. Pull down to try again."
          : 'Try another word, or pick a different category.',
      );
    }
    return !currentList ? (
      <ActivityIndicator style={styles?.loader} color={colors?.mut} />
    ) : (
      renderEmptyCard(
        'Tap + to add one. Swipe left or right to switch categories, or pull down to refresh.',
      )
    );
  };
  const onViewableItemsChanged = useRef(({ viewableItems }) =>
    handleViewableRef.current?.(viewableItems),
  ).current;

  // The category a reel is shown under (its icon and name on the card): the
  // one whose title matched while searching, the open one in a category, or
  // under All the first category still present.
  const reelCategory = reel =>
    isSearching && categoryById[reel?.matchedCategoryId]
      ? categoryById[reel.matchedCategoryId]
      : selectedCategory !== 'all'
      ? categoryById[selectedCategory]
      : categoryById[reel?.categoryIds?.find(id => categoryById[id])];

  // Section heading: the open category (or All / search) and its count.
  // The server count is exact; until it arrives, what's loaded is shown
  // with a + while more pages remain.
  const sectionTitle = isSearching
    ? 'Search results'
    : selectedCategory === 'all'
    ? 'All reels'
    : activeCategoryObj?.label;
  const serverCount =
    reelCounts &&
    (selectedCategory === 'all'
      ? reelCounts.all
      : reelCounts.categories?.[selectedCategory] ?? 0);
  const sectionCount = isSearching
    ? isSearchFresh
      ? countText(shownReels.length, 'result', hasMore)
      : ''
    : serverCount != null
    ? countText(serverCount, 'reel')
    : currentList
    ? countText(shownReels.length, 'reel', hasMore)
    : '';

  const addableCategories = useMemo(
    () => categoriesList.filter(c => c?.id !== 'all'),
    [categoriesList],
  );

  // Existing categories the long-pressed reel is saved in.
  const actionReelCategories = useMemo(
    () =>
      addableCategories.filter(c => actionReel?.categoryIds?.includes(c?.id)),
    [addableCategories, actionReel],
  );

  const listHeader = (
    <View style={styles?.listHeader}>
      <View style={styles?.sectionRow}>
        <Text
          style={[styles?.sectionTitle, { color: colors?.fg }]}
          numberOfLines={1}
          accessibilityRole="header"
        >
          {sectionTitle}
        </Text>
        {!!sectionCount && (
          <Text style={[styles?.sectionCount, { color: colors?.mut }]}>
            {sectionCount}
          </Text>
        )}
      </View>
      {isSearching && currentSearch?.fuzzy ? (
        <Text style={[styles?.searchHint, { color: colors?.mut }]}>
          No exact matches. Showing similar titles.
        </Text>
      ) : null}
    </View>
  );

  const renderMenuItem = ({ label, fill, icon, iconSize, onPress }) => (
    <HardShadow key={label} color={colors?.pink} offset={4} borderRadius={28}>
      <Pressable
        style={({ pressed }) => [
          styles?.menuItem,
          { backgroundColor: fill, borderColor: colors?.outline },
          pressed && styles?.pressedPush,
        ]}
        onPress={onPress}
        accessibilityRole="button"
      >
        <View style={[styles?.menuItemIcon, { backgroundColor: colors?.ink }]}>
          <Icon name={icon} size={iconSize} strokeWidth={2.6} color={fill} />
        </View>
        <Text style={[styles?.menuItemText, { color: colors?.ink }]}>
          {label}
        </Text>
      </Pressable>
    </HardShadow>
  );

  const viewModes = [
    { mode: 'grid', icon: 'grid', label: 'Grid view' },
    { mode: 'list', icon: 'list', label: 'List view' },
  ];

  return (
    <View style={[styles?.root, { backgroundColor: colors?.bg }]}>
      <ScreenBackground variant="calm" />

      <SafeAreaView style={styles?.safeArea} edges={['top', 'left', 'right']}>
        <View {...blurSearchOnTouch}>
          <DashboardHeader
            onSettingsPress={() => navigation.navigate(routes.Settings)}
          />
        </View>
        <View style={styles?.searchRow}>
          <View
            style={[
              styles?.searchBox,
              { backgroundColor: colors?.surf, borderColor: colors?.line },
            ]}
          >
            <Icon name="search" size={20} color={colors?.mut} />
            <TextInput
              ref={searchInputRef}
              style={[styles?.searchInput, { color: colors?.fg }]}
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search all reels"
              placeholderTextColor={colors?.mut}
              selectionColor={colors?.pink}
              cursorColor={colors?.fg}
              returnKeyType="search"
              onSubmitEditing={Keyboard.dismiss}
              autoCorrect={false}
              autoCapitalize="none"
              maxLength={100}
              accessibilityLabel="Search reels by title"
            />
            {searchText.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSearchText('');
                  searchInputRef.current?.blur();
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityRole="button"
                accessibilityLabel="Clear search"
              >
                <Icon
                  name="close"
                  size={18}
                  strokeWidth={2.8}
                  color={colors?.mut}
                />
              </TouchableOpacity>
            )}
          </View>
          <View
            style={[
              styles?.viewToggle,
              { backgroundColor: colors?.surf, borderColor: colors?.line },
            ]}
            {...blurSearchOnTouch}
          >
            {viewModes.map(({ mode, icon, label }) => {
              const active = viewMode === mode;
              return (
                <TouchableOpacity
                  key={mode}
                  style={[
                    styles?.viewToggleButton,
                    active && { backgroundColor: colors?.accent },
                  ]}
                  onPress={() => changeViewMode(mode)}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={label}
                  accessibilityState={{ selected: active }}
                >
                  <Icon
                    name={icon}
                    size={20}
                    strokeWidth={2.8}
                    color={active ? colors?.ink : colors?.fg}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
        <View {...blurSearchOnTouch}>
          <Categories
            categories={categoriesList}
            selectedCategory={selectedCategory}
            onSelectCategory={handleSelectCategoryFromBar}
          />
        </View>
        <View
          style={styles?.content}
          {...panResponder?.panHandlers}
          {...blurSearchOnTouch}
        >
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
              data={shownReels}
              keyExtractor={item => item?.id}
              numColumns={isGrid ? GRID_COLUMNS : 1}
              columnWrapperStyle={isGrid ? styles?.gridRow : undefined}
              renderItem={({ item }) => {
                const category = reelCategory(item);
                return (
                  <ReelItem
                    reel={item}
                    title={reelTitle(item, titleCategoryFor(item))}
                    icon={category?.icon}
                    categoryLabel={category?.label}
                    onThumbnailMissing={handleThumbnailMissing}
                    onLongPress={handleReelLongPress}
                    variant={viewMode}
                    style={isGrid ? { width: gridItemWidth } : undefined}
                  />
                );
              }}
              contentContainerStyle={[
                styles?.reelsList,
                isGrid ? styles?.reelsGrid : styles?.reelsRows,
                { paddingBottom: 130 + insets.bottom },
                shownReels.length === 0 && styles?.emptyList,
              ]}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              ListHeaderComponent={listHeader}
              onViewableItemsChanged={onViewableItemsChanged}
              showsVerticalScrollIndicator={false}
              alwaysBounceVertical
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={handleRefresh}
                  tintColor={colors?.mut}
                  colors={[colors?.ink]}
                  progressBackgroundColor={colors?.accent}
                />
              }
              ListFooterComponent={
                shownReels.length > 0 && hasMore ? (
                  <ActivityIndicator
                    style={styles?.listFooter}
                    color={colors?.mut}
                  />
                ) : null
              }
              ListEmptyComponent={renderEmpty()}
            />
          </Animated.View>
        </View>
      </SafeAreaView>

      {/* + menu: scrim over the whole screen, two pills above the button */}
      {isFabOpen && (
        <Pressable
          style={[styles?.fabBackdrop, { backgroundColor: colors?.scrim }]}
          onPress={() => setIsFabOpen(false)}
          accessibilityRole="button"
          accessibilityLabel="Close menu"
        />
      )}

      {isFabOpen && (
        <View
          style={[
            styles?.menuContainer,
            { bottom: FAB_BOTTOM + insets.bottom + FAB_SIZE + 16 },
          ]}
          {...blurSearchOnTouch}
        >
          {renderMenuItem({
            label: 'Add Category',
            fill: colors?.yellow,
            icon: 'folder',
            iconSize: 18,
            onPress: () => {
              setIsFabOpen(false);
              setIsAddCategoryOpen(true);
            },
          })}
          {renderMenuItem({
            label: 'Add Reel',
            fill: colors?.accent,
            icon: 'play',
            iconSize: 16,
            onPress: () => {
              setIsFabOpen(false);
              setIsAddReelOpen(true);
            },
          })}
        </View>
      )}

      {/* + button; turns into an x (45°) while the menu is open */}
      <View
        style={[styles?.fabContainer, { bottom: FAB_BOTTOM + insets.bottom }]}
        {...blurSearchOnTouch}
      >
        <HardShadow
          color={colors?.accent}
          offset={5}
          borderRadius={FAB_SIZE / 2}
          style={isFabOpen && styles?.fabOpen}
        >
          <Pressable
            style={({ pressed }) => [
              styles?.fabButton,
              { backgroundColor: colors?.pink, borderColor: colors?.outline },
              pressed && styles?.pressedPush,
            ]}
            onPress={() => setIsFabOpen(prev => !prev)}
            accessibilityRole="button"
            accessibilityLabel={
              isFabOpen ? 'Close add menu' : 'Add reel or category'
            }
            accessibilityState={{ expanded: isFabOpen }}
          >
            <Icon name="plus" size={30} strokeWidth={3.2} color={colors?.ink} />
          </Pressable>
        </HardShadow>
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

      {/* Long-press actions for a reel. */}
      <ReelActionsSheet
        visible={!!actionReel}
        reel={actionReel}
        reelCategories={actionReelCategories}
        // Search results come from every category, so the sheet treats them
        // like All: delete asks which categories to remove the reel from.
        currentCategory={
          selectedCategory !== 'all' && !isSearching ? activeCategoryObj : null
        }
        onEdit={handleEditPress}
        onDelete={handleDeleteReel}
        onClose={() => setActionReel(null)}
        onDismiss={handleActionsDismiss}
      />

      <EditReelModal
        visible={!!editReel}
        reel={editReel}
        categoryId={titleCategoryFor(editReel)}
        onClose={() => setEditReel(null)}
        onSave={handleSaveEdit}
        onAddCategory={addCategory}
        categories={addableCategories}
      />
    </View>
  );
}
