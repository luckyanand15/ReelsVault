import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Animated,
  PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/Header/Header';
import styles from './ManageCategories.styles';

export default function ManageCategories({
  categories = [],
  onUpdateCategories,
  onBack,
}) {
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [rowHeight, setRowHeight] = useState(56);

  // Filter out the 'All' category from the manage list
  const displayCategories = categories.filter(cat => cat?.id !== 'all');
  const displayCategoriesRef = useRef(displayCategories);
  displayCategoriesRef.current = displayCategories;

  const dragY = useRef(new Animated.Value(0)).current;

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
                </View>
              </Animated.View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
