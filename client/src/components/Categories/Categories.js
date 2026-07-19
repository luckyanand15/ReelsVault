import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import styles from './Categories.styles';

export const DEFAULT_CATEGORIES = [
  { id: 'all', label: 'All', icon: '✨' },
  { id: 'shopping', label: 'Shopping', icon: '🛍️' },
  { id: 'binge', label: 'Binge', icon: '🎬' },
  { id: 'music', label: 'Music', icon: '🎵' },
  { id: 'study', label: 'Study', icon: '📚' },
  { id: 'travel', label: 'Travel', icon: '✈️' },
  { id: 'fitness', label: 'Fitness', icon: '🏋️' },
  { id: 'food', label: 'Food', icon: '🍕' },
  { id: 'tech', label: 'Tech', icon: '💻' },
  { id: 'gaming', label: 'Gaming', icon: '🎮' },
];

export default function Categories({
  categories = DEFAULT_CATEGORIES,
  selectedCategory,
  onSelectCategory,
}) {
  const [activeCategory, setActiveCategory] = useState(
    categories[0]?.id || 'all',
  );
  const scrollViewRef = useRef(null);
  const chipLayouts = useRef({});

  const currentActive =
    selectedCategory !== undefined ? selectedCategory : activeCategory;

  useEffect(() => {
    if (chipLayouts.current[currentActive] && scrollViewRef.current) {
      const layout = chipLayouts.current[currentActive];
      // Scroll to position chip with padding
      const scrollX = Math.max(0, layout.x - 20);
      scrollViewRef.current.scrollTo({ x: scrollX, animated: true });
    }
  }, [currentActive]);

  const handleSelect = categoryId => {
    if (selectedCategory === undefined) {
      setActiveCategory(categoryId);
    }
    if (onSelectCategory) {
      onSelectCategory(categoryId);
    }
  };

  return (
    <View style={styles?.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles?.scrollContent}
      >
        {categories.map(item => {
          const isSelected = item?.id === currentActive;

          return (
            <TouchableOpacity
              key={item?.id}
              style={[styles?.categoryChip, isSelected && styles?.activeChip]}
              onPress={() => handleSelect(item?.id)}
              onLayout={e => {
                chipLayouts.current[item?.id] = e.nativeEvent.layout;
              }}
              activeOpacity={0.7}
            >
              {item?.icon ? (
                <Text style={styles?.chipIcon}>{item?.icon}</Text>
              ) : null}
              <Text
                style={[styles?.chipText, isSelected && styles?.activeChipText]}
              >
                {item?.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
