import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import BottomSheet from '../BottomSheet/BottomSheet';
import Chip from '../Chip/Chip';
import TextField from '../TextField/TextField';
import PrimaryButton from '../PrimaryButton/PrimaryButton';
import AddCategoryModal from '../AddCategoryModal/AddCategoryModal';
import { useTheme } from '../../context/ThemeContext';
import { fetchReelTitle } from '../../api/reel.api';
import { ERROR_CODES } from '../../constants/errorCodes';
import styles from './AddReelModal.styles';

const URL_PATTERN = /^https?:\/\/\S+$/i;
// Wait for the user to stop typing before looking a link up. A paste is
// looked up at once.
const TITLE_LOOKUP_DELAY_MS = 400;

export default function AddReelModal({
  visible,
  onClose,
  onSave,
  onAddCategory,
  categories = [],
  defaultCategoryId = null,
  defaultUrl = '',
}) {
  const { colors } = useTheme();
  const [categoryId, setCategoryId] = useState(null);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [suggestedTitle, setSuggestedTitle] = useState(null);
  const [isFindingTitle, setIsFindingTitle] = useState(false);
  // Set when the link changed by more than one character at once (a paste).
  const pastedRef = useRef(false);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);

  useEffect(() => {
    if (visible) {
      setCategoryId(defaultCategoryId);
      setTitle('');
      setUrl(defaultUrl);
      setError('');
    }
  }, [visible, defaultCategoryId, defaultUrl]);

  const trimmedTitle = title.trim();
  const trimmedUrl = url.trim();
  // A blank title saves with the suggested one.
  const finalTitle = trimmedTitle || suggestedTitle;
  const isReady = !!categoryId && !!finalTitle && !!trimmedUrl;

  // Look up a title for each new link; a reply for a link since changed or
  // a closed drawer is dropped.
  useEffect(() => {
    const pasted = pastedRef.current;
    pastedRef.current = false;
    setSuggestedTitle(null);
    if (!visible || !URL_PATTERN.test(trimmedUrl)) {
      return undefined;
    }
    let cancelled = false;
    const timer = setTimeout(
      async () => {
        setIsFindingTitle(true);
        const found = await fetchReelTitle(trimmedUrl);
        if (!cancelled) {
          setSuggestedTitle(found);
          setIsFindingTitle(false);
        }
      },
      pasted ? 0 : TITLE_LOOKUP_DELAY_MS,
    );
    return () => {
      cancelled = true;
      clearTimeout(timer);
      setIsFindingTitle(false);
    };
  }, [visible, trimmedUrl]);

  const handleClose = () => {
    if (isSaving) return;
    if (onClose) onClose();
  };

  // The button is never disabled: a press with something missing says what.
  const handleSave = async () => {
    if (isSaving) return;
    if (!categoryId) {
      setError('Pick a category.');
      return;
    }
    if (!trimmedUrl) {
      setError('Paste a link.');
      return;
    }
    if (!URL_PATTERN.test(trimmedUrl)) {
      setError('Please paste a valid link starting with http:// or https://');
      return;
    }
    if (!finalTitle) {
      setError(
        isFindingTitle
          ? 'Still finding a title. Wait a moment or type one.'
          : 'Add a title.',
      );
      return;
    }

    setError('');
    setIsSaving(true);
    try {
      await onSave({ categoryId, title: finalTitle, url: trimmedUrl });
      setIsSaving(false);
      if (onClose) onClose();
    } catch (saveError) {
      setIsSaving(false);
      const data = saveError?.response?.data;
      if (data?.code === ERROR_CODES.REEL_DUPLICATE) {
        const categoryLabel = categories.find(c => c?.id === categoryId)?.label;
        setError(
          categoryLabel
            ? `This reel is already saved in "${categoryLabel}". Pick another category.`
            : 'This reel is already saved in this category.',
        );
        return;
      }
      setError(data?.message || 'Could not save the reel. Please try again.');
    }
  };

  const handleAddCategory = async payload => {
    const created = await onAddCategory?.(payload);
    if (created?.id) {
      setCategoryId(created.id);
      setError('');
    }
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={handleClose}
      title="Add Reel"
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
        <Text style={[styles?.label, { color: colors?.fg }]}>Category</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          style={styles?.chipsScroll}
          contentContainerStyle={styles?.chipsContent}
        >
          {categories.map(item => (
            <Chip
              key={item?.id}
              label={item?.label}
              icon={item?.icon}
              selected={item?.id === categoryId}
              onPress={() => {
                setCategoryId(item?.id);
                if (error) setError('');
              }}
            />
          ))}
          <Chip
            variant="new"
            label="New Category"
            onPress={() => setIsAddCategoryOpen(true)}
          />
        </ScrollView>
      </View>

      <TextField
        variant="sheet"
        label="Link"
        placeholder="Paste the reel / short link"
        value={url}
        onChangeText={text => {
          pastedRef.current = text.length - url.length > 1;
          setUrl(text);
          if (error) setError('');
        }}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
        maxLength={2048}
      />

      <View style={styles?.section}>
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
        />

        {suggestedTitle && suggestedTitle !== trimmedTitle ? (
          <TouchableOpacity
            style={[
              styles?.suggestion,
              { backgroundColor: colors?.bg, borderColor: colors?.line },
            ]}
            onPress={() => setTitle(suggestedTitle)}
            activeOpacity={0.7}
            accessibilityRole="button"
          >
            <Text style={[styles?.suggestionLabel, { color: colors?.mut }]}>
              {trimmedTitle
                ? 'Use suggested title'
                : 'Suggested (used if left blank)'}
            </Text>
            <Text
              style={[styles?.suggestionText, { color: colors?.fg }]}
              numberOfLines={2}
            >
              {suggestedTitle}
            </Text>
          </TouchableOpacity>
        ) : isFindingTitle ? (
          <View style={styles?.findingTitle}>
            <ActivityIndicator size="small" color={colors?.mut} />
            <Text style={[styles?.findingTitleText, { color: colors?.mut }]}>
              Finding a title…
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles?.section}>
        {error ? (
          <Text style={[styles?.errorText, { color: colors?.pinkText }]}>
            {error}
          </Text>
        ) : null}

        <PrimaryButton
          title="Save Reel"
          onPress={handleSave}
          inactive={!isReady}
          loading={isSaving}
          height={58}
        />
      </View>
    </BottomSheet>
  );
}
