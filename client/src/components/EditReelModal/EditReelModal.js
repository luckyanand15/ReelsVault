import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import AddCategoryModal from '../AddCategoryModal/AddCategoryModal';
import styles from './EditReelModal.styles';
import { reelTitle } from '../../utils/reelTitle';

const sameIds = (a = [], b = []) =>
  a.length === b.length && a.every(id => b.includes(id));

// Edits a reel's title and categories (any number, at least one). The link
// itself can't change. onSave({ title, categoryIds }) gets only the fields
// that changed and should throw on failure so the drawer stays open.
// categoryId is the open category (undefined under All); the title edited is
// the reel's title there.
export default function EditReelModal({
  visible,
  reel,
  categoryId,
  onClose,
  onSave,
  onAddCategory,
  categories = [],
}) {
  const [title, setTitle] = useState('');
  const [categoryIds, setCategoryIds] = useState([]);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Categories deleted since the reel was loaded aren't offered or kept.
  const initialCategoryIds = (reel?.categoryIds || []).filter(id =>
    categories.some(c => c?.id === id),
  );

  const initialTitle = reelTitle(reel, categoryId);

  useEffect(() => {
    if (visible) {
      setTitle(initialTitle);
      setCategoryIds(initialCategoryIds);
      setError('');
      setIsSaving(false);
    }
    // Reset only when the drawer opens or another reel is edited.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, reel?.id]);

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, e => {
      setKeyboardHeight(e?.endCoordinates?.height || 260);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const trimmedTitle = title.trim();
  const titleChanged = trimmedTitle !== initialTitle;
  const categoriesChanged = !sameIds(categoryIds, initialCategoryIds);
  const canSave =
    !!trimmedTitle &&
    categoryIds.length > 0 &&
    (titleChanged || categoriesChanged) &&
    !isSaving;

  const handleClose = () => {
    if (isSaving) return;
    setKeyboardHeight(0);
    onClose?.();
  };

  const toggleCategory = id => {
    setCategoryIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id],
    );
    if (error) setError('');
  };

  const handleSave = async () => {
    if (!canSave) return;
    setError('');
    setIsSaving(true);
    try {
      await onSave?.({
        ...(titleChanged && { title: trimmedTitle }),
        ...(categoriesChanged && { categoryIds }),
      });
      setIsSaving(false);
      setKeyboardHeight(0);
      onClose?.();
    } catch (saveError) {
      setIsSaving(false);
      setError(
        saveError?.response?.data?.message ||
          'Could not save the reel. Please try again.',
      );
    }
  };

  // A category made here is selected straight away.
  const handleAddCategory = async payload => {
    const created = await onAddCategory?.(payload);
    if (created?.id) {
      setCategoryIds(prev => [...prev, created.id]);
      setError('');
    }
  };

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
            <Text style={styles?.title}>Edit Reel</Text>
            <TouchableOpacity
              style={styles?.closeButton}
              onPress={handleClose}
              activeOpacity={0.7}
            >
              <Text style={styles?.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles?.formContainer}>
            <Text style={styles?.label}>Categories</Text>
            <ScrollView
              style={styles?.chipsScroll}
              contentContainerStyle={styles?.chipsWrap}
              keyboardShouldPersistTaps="handled"
            >
              {categories.map(item => {
                const isSelected = categoryIds.includes(item?.id);
                return (
                  <TouchableOpacity
                    key={item?.id}
                    style={[styles?.chip, isSelected && styles?.activeChip]}
                    onPress={() => toggleCategory(item?.id)}
                    activeOpacity={0.7}
                    disabled={isSaving}
                  >
                    <Text style={styles?.chipIcon}>{item?.icon}</Text>
                    <Text
                      style={[
                        styles?.chipText,
                        isSelected && styles?.activeChipText,
                      ]}
                    >
                      {item?.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity
                style={[styles?.chip, styles?.newChip]}
                onPress={() => setIsAddCategoryOpen(true)}
                activeOpacity={0.7}
                disabled={isSaving}
              >
                <Text style={styles?.chipText}>+ New Category</Text>
              </TouchableOpacity>
            </ScrollView>
            {categoryIds.length === 0 && (
              <Text style={styles?.hintText}>
                Select at least one category.
              </Text>
            )}

            <Text style={styles?.label}>Title</Text>
            <TextInput
              style={styles?.input}
              placeholder="e.g. 5-minute pasta recipe"
              placeholderTextColor="#A3A3A3"
              value={title}
              onChangeText={text => {
                setTitle(text);
                if (error) setError('');
              }}
              maxLength={100}
              editable={!isSaving}
            />

            {error ? <Text style={styles?.errorText}>{error}</Text> : null}

            <TouchableOpacity
              style={[
                styles?.submitButton,
                !canSave && styles?.disabledSubmitButton,
              ]}
              onPress={handleSave}
              disabled={!canSave}
              activeOpacity={0.8}
            >
              {isSaving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles?.submitButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Rendered inside this Modal so iOS can stack it on top */}
      <AddCategoryModal
        visible={isAddCategoryOpen}
        onClose={() => setIsAddCategoryOpen(false)}
        onAddCategory={handleAddCategory}
      />
    </Modal>
  );
}
