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
import styles from './AddReelModal.styles';

const URL_PATTERN = /^https?:\/\/\S+$/i;

export default function AddReelModal({
  visible,
  onClose,
  onSave,
  onAddCategory,
  categories = [],
  defaultCategoryId = null,
}) {
  const [categoryId, setCategoryId] = useState(null);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (visible) {
      setCategoryId(defaultCategoryId);
      setTitle('');
      setUrl('');
      setError('');
    }
  }, [visible, defaultCategoryId]);

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
  const canSave = !!categoryId && !!trimmedTitle && !!trimmedUrl && !isSaving;

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
      await onSave({ categoryId, title: trimmedTitle, url: trimmedUrl });
      setIsSaving(false);
      setKeyboardHeight(0);
      if (onClose) onClose();
    } catch (saveError) {
      setIsSaving(false);
      setError(
        saveError?.response?.data?.message ||
          'Could not save the reel. Please try again.',
      );
    }
  };

  const handleAddCategory = async payload => {
    const created = await onAddCategory?.(payload);
    if (created?.id) {
      setCategoryId(created.id);
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
                    onPress={() => setCategoryId(item?.id)}
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

            <Text style={styles?.label}>Title</Text>
            <TextInput
              style={styles?.input}
              placeholder="e.g. 5-minute pasta recipe"
              placeholderTextColor="#A3A3A3"
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />

            <Text style={styles?.label}>Link</Text>
            <TextInput
              style={styles?.input}
              placeholder="Paste the reel / short link"
              placeholderTextColor="#A3A3A3"
              value={url}
              onChangeText={text => {
                setUrl(text);
                if (error) setError('');
              }}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              maxLength={2048}
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
