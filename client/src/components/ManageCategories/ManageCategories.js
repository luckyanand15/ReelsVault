import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Animated,
  PanResponder,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../ScreenHeader/ScreenHeader';
import ScreenBackground from '../ScreenBackground/ScreenBackground';
import Icon from '../Icon/Icon';
import AddCategoryModal from '../AddCategoryModal/AddCategoryModal';
import ConfirmationComponent from '../ConfirmationComponent/ConfirmationComponent';
import styles from './ManageCategories.styles';
import {
  updateCategory,
  deleteCategory,
  reorderCategories,
} from '../../api/category.api';
import { mapCategory } from '../../utils/mapCategory';
import { useCategories } from '../../context/CategoriesContext';
import { useTheme } from '../../context/ThemeContext';

const serverMessage = (error, fallback) =>
  error?.response?.data?.message || fallback;

export default function ManageCategories({ navigation }) {
  const { categoriesList: categories, setCategoriesList: onUpdateCategories } =
    useCategories();
  const { colors } = useTheme();

  const [draggingIndex, setDraggingIndex] = useState(null);
  const [rowHeight, setRowHeight] = useState(56);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  // Shown at the top when an edit, delete or reorder fails.
  const [error, setError] = useState('');

  // Filter out the 'All' category from the manage list
  const displayCategories = categories.filter(cat => cat?.id !== 'all');
  const displayCategoriesRef = useRef(displayCategories);
  displayCategoriesRef.current = displayCategories;

  const dragY = useRef(new Animated.Value(0)).current;

  // Puts 'All' back in front of a reordered or edited list
  const withAllCategory = list => {
    const allCategory = categories?.find(cat => cat?.id === 'all');
    return allCategory ? [allCategory, ...list] : list;
  };

  const handleEditCategory = item => {
    setEditingCategory(item);
  };

  const handleSaveCategory = async ({ id, label, icon }) => {
    try {
      const updated = await updateCategory(id, { title: label, icon });
      const mapped = mapCategory(updated);
      const updatedDisplay = displayCategories?.map(cat =>
        cat?.id === id ? mapped : cat,
      );

      if (onUpdateCategories) {
        onUpdateCategories(withAllCategory(updatedDisplay));
      }
      setError('');
    } catch (saveError) {
      console.error('Failed to update category:', saveError?.message);
      setError(
        serverMessage(saveError, `Couldn't save changes to "${label}". Please try again.`),
      );
    } finally {
      setEditingCategory(null);
    }
  };

  const handleDeleteCategory = category => {
    setCategoryToDelete(category);
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      await deleteCategory(categoryToDelete.id);

      const updatedDisplay = displayCategories?.filter(
        cat => cat?.id !== categoryToDelete?.id,
      );

      if (onUpdateCategories) {
        onUpdateCategories(withAllCategory(updatedDisplay));
      }
      setError('');
    } catch (deleteError) {
      console.error('Failed to delete category:', deleteError?.message);
      setError(
        serverMessage(
          deleteError,
          `Couldn't delete "${categoryToDelete?.label || 'this category'}". Please try again.`,
        ),
      );
    } finally {
      setCategoryToDelete(null);
    }
  };

  const createPanResponder = index => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setDraggingIndex(index);
        dragY.setValue(0);
      },
      onPanResponderMove: Animated.event([null, { dy: dragY }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gestureState) => {
        handleDrop(index, gestureState.dy);
      },
      onPanResponderTerminate: (_, gestureState) => {
        handleDrop(index, gestureState.dy);
      },
    });
  };

  const handleDrop = (startIndex, dy) => {
    const height = rowHeight || 56;
    const offset = Math.round(dy / height);
    const targetIndex = Math.max(
      0,
      Math.min(displayCategoriesRef.current.length - 1, startIndex + offset),
    );

    if (targetIndex !== startIndex) {
      const previousFullList = withAllCategory(displayCategoriesRef.current);
      const updatedDisplay = [...displayCategoriesRef.current];
      const [movedItem] = updatedDisplay.splice(startIndex, 1);
      updatedDisplay.splice(targetIndex, 0, movedItem);

      if (onUpdateCategories) {
        onUpdateCategories(withAllCategory(updatedDisplay));
      }
      setError('');

      // Shown at once; if the server doesn't keep it, go back to the old
      // order so the screen matches what's saved.
      reorderCategories(updatedDisplay.map(cat => cat.id)).catch(reorderError => {
        console.error('Failed to persist category order:', reorderError?.message);
        if (onUpdateCategories) {
          onUpdateCategories(previousFullList);
        }
        setError(
          serverMessage(reorderError, "Couldn't save the new order. Please try again."),
        );
      });
    }

    setDraggingIndex(null);
    dragY.setValue(0);
  };

  const panResponders = useRef([]);
  panResponders.current = displayCategories.map((_, idx) =>
    createPanResponder(idx),
  );

  return (
    <View style={[styles?.root, { backgroundColor: colors?.bg }]}>
      <ScreenBackground variant="inner" />

      <SafeAreaView style={styles?.safeArea}>
        <ScreenHeader
          title="Manage Categories"
          titleSize={20}
          onBack={() => navigation.goBack()}
        />

        <ScrollView
          style={styles?.container}
          contentContainerStyle={styles?.content}
          scrollEnabled={draggingIndex === null}
          showsVerticalScrollIndicator={false}
        >
          {!!error && (
            <TouchableOpacity
              style={[
                styles?.errorBanner,
                { backgroundColor: colors?.surf, borderColor: colors?.pinkText },
              ]}
              onPress={() => setError('')}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`${error}. Dismiss message`}
              accessibilityLiveRegion="polite"
            >
              <Text style={[styles?.errorText, { color: colors?.fg }]}>{error}</Text>
              <Icon name="close" size={18} strokeWidth={2.8} color={colors?.mut} />
            </TouchableOpacity>
          )}

          <Text style={[styles?.helperText, { color: colors?.mut }]}>
            Touch and drag the handle to reorder categories. Position changes will update on your Dashboard.
          </Text>

          {displayCategories.length === 0 ? (
            <View style={[styles?.emptyCard, { borderColor: colors?.line }]}>
              <Text style={[styles?.emptyTitle, { color: colors?.fg }]}>
                No categories yet
              </Text>
              <Text style={[styles?.emptyText, { color: colors?.mut }]}>
                Add one from the + button on your dashboard.
              </Text>
            </View>
          ) : (
            // Not overflow-hidden: a row dragged past the edge stays visible
            <View
              style={[
                styles?.categoryListCard,
                { backgroundColor: colors?.surf, borderColor: colors?.outline },
              ]}
            >
              {displayCategories.map((item, index) => {
                const isDragging = draggingIndex === index;
                const isLast = index === displayCategories.length - 1;
                const panResponder = panResponders.current[index];
                const label = item?.label;

                return (
                  <Animated.View
                    key={item?.id}
                    onLayout={e => {
                      if (index === 0 && e.nativeEvent.layout.height > 0) {
                        setRowHeight(e.nativeEvent.layout.height);
                      }
                    }}
                    style={[
                      styles?.categoryRow,
                      !isLast && { borderBottomColor: colors?.line },
                      isDragging && [
                        styles?.draggingRow,
                        { backgroundColor: colors?.bg, borderColor: colors?.accent },
                        { transform: [{ translateY: dragY }] },
                      ],
                    ]}
                  >
                    <View
                      style={styles?.dragHandleTouch}
                      accessible
                      accessibilityLabel={`Drag to reorder ${label}`}
                      {...(panResponder?.panHandlers || {})}
                    >
                      <Icon
                        name="menu"
                        size={22}
                        strokeWidth={2.8}
                        color={isDragging ? colors?.fg : colors?.mut}
                      />
                    </View>

                    <View style={[styles?.iconTile, { backgroundColor: colors?.accent }]}>
                      <Text style={styles?.categoryIcon}>{item?.icon || '📁'}</Text>
                    </View>
                    <Text
                      style={[styles?.categoryLabel, { color: colors?.fg }]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {label}
                    </Text>

                    <TouchableOpacity
                      style={styles?.actionButton}
                      onPress={() => handleEditCategory(item)}
                      activeOpacity={0.7}
                      accessibilityRole="button"
                      accessibilityLabel={`Edit ${label}`}
                    >
                      <Icon name="pencil" size={20} strokeWidth={2.4} color={colors?.fg} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles?.actionButton}
                      onPress={() => handleDeleteCategory(item)}
                      activeOpacity={0.7}
                      accessibilityRole="button"
                      accessibilityLabel={`Delete ${label}`}
                    >
                      <Icon name="close" size={20} strokeWidth={2.8} color={colors?.pinkText} />
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      {/* Add / Edit Category Modal */}
      <AddCategoryModal
        visible={!!editingCategory}
        onClose={() => setEditingCategory(null)}
        onAddCategory={handleSaveCategory}
        categoryToEdit={editingCategory}
      />

      {/* Delete Confirmation Component Modal */}
      <ConfirmationComponent
        visible={!!categoryToDelete}
        title="Delete Category"
        message={`Are you sure you want to delete "${categoryToDelete?.label || 'this category'}"?`}
        confirmText="Yes"
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={confirmDeleteCategory}
        onCancel={() => setCategoryToDelete(null)}
      />
    </View>
  );
}
