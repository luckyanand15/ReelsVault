import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  Keyboard,
  Platform,
} from 'react-native';
import styles from './AddCategoryModal.styles';

const PRESET_ICONS = [
  '🏷️', '📂', '🎨', '⚽', '🍿', '🎧', '🎮', '💡',
  '🍔', '💼', '🚗', '✈️', '🌟', '📦', '📌', '🎯',
  '💻', '🍕', '📚', '🛍️', '🎵', '🎬', '🏋️', '🔥',
  '📷', '🎤', '🏆', '💎', '🚀', '☕', '🎁', '⚡',
  '🚴', '⛵', '🏀', '🍉', '🍣', '🐶', '🌿', '🎓',
  '💬', '🔔', '❤️', '📍', '🎉', '🛠️',
];

export default function AddCategoryModal({ visible, onClose, onAddCategory }) {
  const [selectedIcon, setSelectedIcon] = useState(PRESET_ICONS[0]);
  const [categoryName, setCategoryName] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  const iconScrollViewRef = useRef(null);

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, e => {
      const height = e?.endCoordinates?.height || 260;
      setKeyboardHeight(height);
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleAdd = () => {
    const trimmed = categoryName.trim();
    if (!trimmed) return;

    if (onAddCategory) {
      onAddCategory({
        label: trimmed,
        icon: selectedIcon,
      });
    }

    // Reset fields & close
    setCategoryName('');
    setSelectedIcon(PRESET_ICONS[0]);
    setKeyboardHeight(0);
    if (onClose) onClose();
  };

  const handleClose = () => {
    setCategoryName('');
    setSelectedIcon(PRESET_ICONS[0]);
    setKeyboardHeight(0);
    if (onClose) onClose();
  };

  // Custom Scrollbar calculations
  const showCustomScrollbar =
    contentHeight > containerHeight + 5 && containerHeight > 0;
  const thumbHeight = showCustomScrollbar
    ? Math.max(24, (containerHeight / contentHeight) * containerHeight)
    : 0;
  const maxScroll = contentHeight - containerHeight;
  const maxThumbTop = containerHeight - thumbHeight;
  const thumbTop = maxScroll > 0 ? (scrollY / maxScroll) * maxThumbTop : 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      statusBarTranslucent={true}
      onRequestClose={handleClose}
    >
      <View style={styles?.overlay}>
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles?.backdropTouch} />
        </TouchableWithoutFeedback>

        <View
          style={[
            styles?.drawerContainer,
            keyboardHeight > 0 && { paddingBottom: keyboardHeight + 16 },
          ]}
        >
          <View style={styles?.dragHandleContainer}>
            <View style={styles?.dragHandle} />
          </View>

          <View style={styles?.header}>
            <Text style={styles?.title}>Add Category</Text>
            <TouchableOpacity
              style={styles?.closeButton}
              onPress={handleClose}
              activeOpacity={0.7}
            >
              <Text style={styles?.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles?.formContainer}>
            <Text style={styles?.label}>Choose Icon</Text>

            {/* Dedicated scroll section ONLY for icons */}
            <View
              style={[
                styles?.iconScrollWrapper,
                keyboardHeight > 0 && styles?.iconScrollWrapperKeyboard,
              ]}
              onLayout={e =>
                setContainerHeight(e.nativeEvent.layout.height - 12)
              }
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
                <View style={styles?.iconGrid}>
                  {PRESET_ICONS.map((icon, index) => {
                    const isSelected = icon === selectedIcon;
                    return (
                      <TouchableOpacity
                        key={`${icon}-${index}`}
                        style={[
                          styles?.iconOption,
                          isSelected && styles?.selectedIconOption,
                        ]}
                        onPress={() => setSelectedIcon(icon)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles?.iconEmoji}>{icon}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>

              {/* Custom Dark Scrollbar Indicator */}
              {showCustomScrollbar && (
                <View style={styles?.customScrollTrack}>
                  <View
                    style={[
                      styles?.customScrollThumb,
                      {
                        height: thumbHeight,
                        transform: [{ translateY: thumbTop }],
                      },
                    ]}
                  />
                </View>
              )}
            </View>

            <Text style={styles?.label}>Category Name</Text>
            <TextInput
              style={styles?.input}
              placeholder="e.g. Work, Inspiration, Recipes"
              placeholderTextColor="#A3A3A3"
              value={categoryName}
              onChangeText={setCategoryName}
              maxLength={24}
              autoCapitalize="words"
            />

            <TouchableOpacity
              style={[
                styles?.submitButton,
                !categoryName.trim() && styles?.disabledSubmitButton,
              ]}
              onPress={handleAdd}
              disabled={!categoryName.trim()}
              activeOpacity={0.8}
            >
              <Text style={styles?.submitButtonText}>Create Category</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
