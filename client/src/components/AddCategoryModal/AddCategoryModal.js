import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import BottomSheet from '../BottomSheet/BottomSheet';
import HardShadow from '../HardShadow/HardShadow';
import TextField from '../TextField/TextField';
import PrimaryButton from '../PrimaryButton/PrimaryButton';
import { useTheme } from '../../context/ThemeContext';
import useKeyboardHeight from '../../hooks/useKeyboardHeight';
import styles, {
  ICON_COLUMNS,
  ICON_GAP,
  SHADOW_ROOM,
} from './AddCategoryModal.styles';

const PRESET_ICONS = [
  '🏷️', '📂', '🎨', '⚽', '🍿', '🎧', '🎮', '💡',
  '🍔', '💼', '🚗', '✈️', '🌟', '📦', '📌', '🎯',
  '💻', '🍕', '📚', '🛍️', '🎵', '🎬', '🏋️', '🔥',
  '📷', '🎤', '🏆', '💎', '🚀', '☕', '🎁', '⚡',
  '🚴', '⛵', '🏀', '🍉', '🍣', '🐶', '🌿', '🎓',
  '💬', '🔔', '❤️', '📍', '🎉', '🛠️',
];

export default function AddCategoryModal({
  visible,
  onClose,
  onAddCategory,
  categoryToEdit = null,
}) {
  const { colors } = useTheme();
  const keyboardHeight = useKeyboardHeight(visible);
  const [selectedIcon, setSelectedIcon] = useState(PRESET_ICONS[0]);
  const [categoryName, setCategoryName] = useState('');
  const [error, setError] = useState('');
  const [gridWidth, setGridWidth] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  const iconScrollViewRef = useRef(null);

  useEffect(() => {
    if (visible) {
      setError('');
      if (categoryToEdit) {
        setCategoryName(categoryToEdit.label || '');
        setSelectedIcon(categoryToEdit.icon || PRESET_ICONS[0]);
      } else {
        setCategoryName('');
        setSelectedIcon(PRESET_ICONS[0]);
      }
    }
  }, [visible, categoryToEdit]);

  const trimmedName = categoryName.trim();

  const handleAdd = () => {
    if (!trimmedName) {
      setError('Enter a category name.');
      return;
    }

    if (onAddCategory) {
      onAddCategory({
        id: categoryToEdit?.id,
        label: trimmedName,
        icon: selectedIcon,
      });
    }

    // Reset fields & close
    setCategoryName('');
    setSelectedIcon(PRESET_ICONS[0]);
    if (onClose) onClose();
  };

  const handleClose = () => {
    setCategoryName('');
    setSelectedIcon(PRESET_ICONS[0]);
    if (onClose) onClose();
  };

  // Six equal columns: tile size comes from the measured grid width
  const tileSize =
    gridWidth > 0
      ? Math.floor(
          (gridWidth - SHADOW_ROOM - ICON_GAP * (ICON_COLUMNS - 1)) / ICON_COLUMNS,
        )
      : 0;

  // Custom Scrollbar calculations
  const showCustomScrollbar =
    contentHeight > containerHeight + 5 && containerHeight > 0;
  const thumbHeight = showCustomScrollbar
    ? Math.max(24, (containerHeight / contentHeight) * containerHeight)
    : 0;
  const maxScroll = contentHeight - containerHeight;
  const maxThumbTop = containerHeight - thumbHeight;
  const thumbTop = maxScroll > 0 ? (scrollY / maxScroll) * maxThumbTop : 0;

  const isEditing = !!categoryToEdit;

  return (
    <BottomSheet
      visible={visible}
      onClose={handleClose}
      title={isEditing ? 'Edit Category' : 'Add Category'}
      barColor={colors?.pink}
    >
      <View style={styles?.section}>
        <Text style={[styles?.label, { color: colors?.fg }]}>Choose Icon</Text>

        {/* Dedicated scroll section ONLY for icons */}
        <View
          style={[
            styles?.iconBox,
            keyboardHeight > 0 && styles?.iconBoxKeyboard,
            { backgroundColor: colors?.bg, borderColor: colors?.line },
          ]}
          onLayout={e => setContainerHeight(e.nativeEvent.layout.height - 28)}
        >
          <ScrollView
            ref={iconScrollViewRef}
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={(_, h) => setContentHeight(h)}
            onScroll={e => setScrollY(e.nativeEvent.contentOffset.y)}
            scrollEventThrottle={16}
          >
            <View
              style={styles?.iconGrid}
              onLayout={e => setGridWidth(e.nativeEvent.layout.width)}
            >
              {tileSize > 0 &&
                PRESET_ICONS.map((icon, index) => {
                  const isSelected = icon === selectedIcon;
                  const tile = (
                    <Pressable
                      onPress={() => setSelectedIcon(icon)}
                      accessibilityRole="button"
                      accessibilityLabel={`Icon ${icon}`}
                      accessibilityState={{ selected: isSelected }}
                      style={({ pressed }) => [
                        styles?.iconTile,
                        { width: tileSize, height: tileSize },
                        isSelected
                          ? { backgroundColor: colors?.accent, borderColor: colors?.outline }
                          : { backgroundColor: colors?.surf, borderColor: colors?.line },
                        pressed && !isSelected && styles?.pressedFade,
                      ]}
                    >
                      <Text style={styles?.iconEmoji}>{icon}</Text>
                    </Pressable>
                  );

                  return isSelected ? (
                    <HardShadow
                      key={`${icon}-${index}`}
                      color={colors?.pink}
                      offset={3}
                      borderRadius={14}
                    >
                      {tile}
                    </HardShadow>
                  ) : (
                    <View key={`${icon}-${index}`}>{tile}</View>
                  );
                })}
            </View>
          </ScrollView>

          {/* Custom Scrollbar Indicator */}
          {showCustomScrollbar && (
            <View style={[styles?.customScrollTrack, { backgroundColor: colors?.line }]}>
              <View
                style={[
                  styles?.customScrollThumb,
                  {
                    backgroundColor: colors?.mut,
                    height: thumbHeight,
                    transform: [{ translateY: thumbTop }],
                  },
                ]}
              />
            </View>
          )}
        </View>
      </View>

      <TextField
        variant="sheet"
        label="Category Name"
        error={error}
        placeholder="e.g. Work, Inspiration, Recipes"
        value={categoryName}
        onChangeText={text => {
          setCategoryName(text);
          if (error && text.trim()) setError('');
        }}
        maxLength={24}
        autoCapitalize="words"
      />

      <PrimaryButton
        title={isEditing ? 'Save Changes' : 'Create Category'}
        onPress={handleAdd}
        inactive={!trimmedName}
        height={58}
      />
    </BottomSheet>
  );
}
