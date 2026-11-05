import React, { useState, useEffect, useRef } from 'react';
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
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (visible) {
      setCategoryId(defaultCategoryId);
      setTitle('');
      setUrl(defaultUrl);
      setError('');
    }
  }, [visible, defaultCategoryId, defaultUrl]);

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
  const trimmedUrl = url.trim();
  // A blank title saves with the suggested one.
  const finalTitle = trimmedTitle || suggestedTitle;
  const canSave = !!categoryId && !!finalTitle && !!trimmedUrl && !isSaving;

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
    setKeyboardHeight(0);
    if (onClose) onClose();
  };

  const handleSave = async () => {
    if (!canSave) return;
    if (!URL_PATTERN.test(trimmedUrl)) {
      setError('Please paste a valid link starting with http:// or https://');
      return;
    }

    setError('');
    setIsSaving(true);
    try {
      await onSave({ categoryId, title: finalTitle, url: trimmedUrl });
      setIsSaving(false);
      setKeyboardHeight(0);
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
            <Text style={styles?.title}>Add Reel</Text>
            <TouchableOpacity
              style={styles?.closeButton}
              onPress={handleClose}
              activeOpacity={0.7}
            >
              <Text style={styles?.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles?.formContainer}>
            <Text style={styles?.label}>Category</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles?.chipsContent}
            >
              {categories.map(item => {
                const isSelected = item?.id === categoryId;
                return (
                  <TouchableOpacity
                    key={item?.id}
                    style={[styles?.chip, isSelected && styles?.activeChip]}
                    onPress={() => {
                      setCategoryId(item?.id);
                      if (error) setError('');
                    }}
                    activeOpacity={0.7}
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
              >
                <Text style={styles?.chipText}>+ New Category</Text>
              </TouchableOpacity>
            </ScrollView>

            <Text style={styles?.label}>Link</Text>
            <TextInput
              style={styles?.input}
              placeholder="Paste the reel / short link"
              placeholderTextColor="#A3A3A3"
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

            <Text style={styles?.label}>Title</Text>
            <TextInput
              style={styles?.input}
              placeholder="e.g. 5-minute pasta recipe"
              placeholderTextColor="#A3A3A3"
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />

            {suggestedTitle && suggestedTitle !== trimmedTitle ? (
              <TouchableOpacity
                style={styles?.suggestion}
                onPress={() => setTitle(suggestedTitle)}
                activeOpacity={0.7}
              >
                <Text style={styles?.suggestionLabel}>
                  {trimmedTitle
                    ? 'Use suggested title'
                    : 'Suggested (used if left blank)'}
                </Text>
                <Text style={styles?.suggestionText} numberOfLines={2}>
                  {suggestedTitle}
                </Text>
              </TouchableOpacity>
            ) : isFindingTitle ? (
              <View style={styles?.findingTitle}>
                <ActivityIndicator size="small" color="#A3A3A3" />
                <Text style={styles?.findingTitleText}>Finding a title…</Text>
              </View>
            ) : null}

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
                <Text style={styles?.submitButtonText}>Save Reel</Text>
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
