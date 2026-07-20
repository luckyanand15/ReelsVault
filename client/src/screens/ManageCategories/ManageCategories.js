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
import Header from '../../components/Header/Header';
import AddCategoryModal from '../../components/AddCategoryModal/AddCategoryModal';
import ConfirmationComponent from '../../components/ConfirmationComponent/ConfirmationComponent';
import styles from './ManageCategories.styles';
import {
  updateCategory,
  deleteCategory,
  reorderCategories,
} from '../../api/category.api';
import { mapCategory } from '../../utils/mapCategory';

export default function ManageCategories({
  categories = [],
  onUpdateCategories,
  onBack,
}) {
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [rowHeight, setRowHeight] = useState(56);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  // Filter out the 'All' category from the manage list
  const displayCategories = categories.filter(cat => cat?.id !== 'all');
  const displayCategoriesRef = useRef(displayCategories);
  displayCategoriesRef.current = displayCategories;

  const dragY = useRef(new Animated.Value(0)).current;

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

      const allCategory = categories?.find(cat => cat?.id === 'all');
      const updatedFullList = allCategory
        ? [allCategory, ...updatedDisplay]
        : updatedDisplay;

      if (onUpdateCategories) {
        onUpdateCategories(updatedFullList);
      }
    } catch (error) {
      console.error('Failed to update category:', error?.message);
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

      const allCategory = categories?.find(cat => cat?.id === 'all');
      const updatedFullList = allCategory
        ? [allCategory, ...updatedDisplay]
        : updatedDisplay;

      if (onUpdateCategories) {
        onUpdateCategories(updatedFullList);
      }
    } catch (error) {
      console.error('Failed to delete category:', error?.message);
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
      const updatedDisplay = [...displayCategoriesRef.current];
      const [movedItem] = updatedDisplay.splice(startIndex, 1);
      updatedDisplay.splice(targetIndex, 0, movedItem);

      // Reconstruct full list keeping 'All' as the first category
      const allCategory = categories.find(cat => cat?.id === 'all');
      const updatedFullList = allCategory
        ? [allCategory, ...updatedDisplay]
        : updatedDisplay;

      if (onUpdateCategories) {
        onUpdateCategories(updatedFullList);
      }

      reorderCategories(updatedDisplay.map(cat => cat.id)).catch(error => {
        console.error('Failed to persist category order:', error?.message);
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
    <SafeAreaView style={styles?.safeArea} edges={['top', 'left', 'right']}>
      <Header title="Manage Categories" onLeftPress={onBack} />

      <ScrollView
        style={styles?.container}
        contentContainerStyle={styles?.content}
        scrollEnabled={draggingIndex === null}
      >
        <Text style={styles?.headerSubtitle}>
          Touch and drag the ☰ handle to reorder categories. Position changes will update on your Dashboard.
        </Text>

        <View style={styles?.categoryListCard}>
          {displayCategories.map((item, index) => {
            const isDragging = draggingIndex === index;
            const isLast = index === displayCategories.length - 1;
            const panResponder = panResponders.current[index];

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
                  isLast && styles?.categoryRowLast,
                  isDragging && styles?.draggingRow,
                  isDragging && {
                    transform: [{ translateY: dragY }],
                  },
                ]}
              >
                <View style={styles?.rowContent}>
                  <View
                    style={styles?.dragHandleTouch}
                    {...(panResponder?.panHandlers || {})}
                  >
                    <Text
                      style={[
                        styles?.dragHandleIcon,
                        isDragging && styles?.dragHandleIconActive,
                      ]}
                    >
                      ☰
                    </Text>
                  </View>

                  <Text style={styles?.categoryIcon}>{item?.icon || '📁'}</Text>
                  <Text style={styles?.categoryLabel}>{item?.label}</Text>

                  <View style={styles?.actionButtons}>
                    <TouchableOpacity
                      style={styles?.actionButton}
                      onPress={() => handleEditCategory(item)}
                      activeOpacity={0.7}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Text style={styles?.editIcon}>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles?.actionButton}
                      onPress={() => handleDeleteCategory(item)}
                      activeOpacity={0.7}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Text style={styles?.deleteIcon}>✕</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Animated.View>
            );
          })}
        </View>
      </ScrollView>

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
    </SafeAreaView>
  );
}
