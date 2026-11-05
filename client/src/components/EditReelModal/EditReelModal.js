import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import BottomSheet from '../BottomSheet/BottomSheet';
import Chip from '../Chip/Chip';
import TextField from '../TextField/TextField';
import PrimaryButton from '../PrimaryButton/PrimaryButton';
import AddCategoryModal from '../AddCategoryModal/AddCategoryModal';
import { useTheme } from '../../context/ThemeContext';
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
  const { colors } = useTheme();
  const [title, setTitle] = useState('');
  const [categoryIds, setCategoryIds] = useState([]);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);

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

  const trimmedTitle = title.trim();
  const titleChanged = trimmedTitle !== initialTitle;
  const categoriesChanged = !sameIds(categoryIds, initialCategoryIds);
  const isReady =
    !!trimmedTitle &&
    categoryIds.length > 0 &&
    (titleChanged || categoriesChanged);

  const handleClose = () => {
    if (isSaving) return;
    onClose?.();
  };

  const toggleCategory = id => {
    setCategoryIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id],
    );
    if (error) setError('');
  };

  // The button is never disabled: a press with something missing says what.
  const handleSave = async () => {
    if (isSaving) return;
    if (categoryIds.length === 0) {
      setError('Select at least one category.');
      return;
    }
    if (!trimmedTitle) {
      setError('Add a title.');
      return;
    }
    if (!titleChanged && !categoriesChanged) {
      setError('Nothing to save yet. Change the title or categories first.');
      return;
    }

    setError('');
    setIsSaving(true);
    try {
      await onSave?.({
        ...(titleChanged && { title: trimmedTitle }),
        ...(categoriesChanged && { categoryIds }),
      });
      setIsSaving(false);
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
    <BottomSheet
      visible={visible}
      onClose={handleClose}
      title="Edit Reel"
      barColor={colors?.accent}
      nested={
        <AddCategoryModal
          visible={isAddCategoryOpen}
          onClose={() => setIsAddCategoryOpen(false)}
          onAddCategory={handleAddCategory}
        />
      }
    >
      <View style={styles?.section}>
        <Text style={[styles?.label, { color: colors?.fg }]}>Categories</Text>
        <ScrollView
          style={styles?.chipsScroll}
          contentContainerStyle={styles?.chipsWrap}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled={true}
        >
          {categories.map(item => (
            <Chip
              key={item?.id}
              label={item?.label}
              icon={item?.icon}
              selected={categoryIds.includes(item?.id)}
              onPress={() => toggleCategory(item?.id)}
              disabled={isSaving}
            />
          ))}
          <Chip
            variant="new"
            label="New Category"
            onPress={() => setIsAddCategoryOpen(true)}
            disabled={isSaving}
          />
        </ScrollView>
        {categoryIds.length === 0 && !error && (
          <Text style={[styles?.hintText, { color: colors?.pinkText }]}>
            Select at least one category.
          </Text>
        )}
      </View>

      <TextField
        variant="sheet"
        label="Title"
        placeholder="e.g. 5-minute pasta recipe"
        value={title}
        onChangeText={text => {
          setTitle(text);
          if (error) setError('');
        }}
        maxLength={100}
        editable={!isSaving}
      />

      <View style={styles?.section}>
        {error ? (
          <Text style={[styles?.errorText, { color: colors?.pinkText }]}>
            {error}
          </Text>
        ) : null}

        <PrimaryButton
          title="Save Changes"
          onPress={handleSave}
          inactive={!isReady}
          loading={isSaving}
          height={58}
        />
      </View>
    </BottomSheet>
  );
}
