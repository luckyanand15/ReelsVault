import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import styles from './Categories.styles';

const DEFAULT_CATEGORIES = [
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

  const currentActive =
    selectedCategory !== undefined ? selectedCategory : activeCategory;

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
              activeOpacity={0.7}
            >
              {item?.icon ? (
                <Text style={styles?.chipIcon}>{item?.icon}</Text>
              ) : null}
              <Text
                style={[styles?.chipText, isSelected && styles?.activeChipText]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
