import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import styles from './ReelActionsSheet.styles';
import theme from '../../constants/theme';
import { reelTitle } from '../../utils/reelTitle';

// Long-press menu for a reel. Every step (menu, confirm, category picker)
// lives in this one sheet so no second modal has to open over a closing one.
//
// reelCategories are the existing categories the reel is in. currentCategory
// is the open category, or null under All. onDelete(categoryIds) gets the
// categories to remove the reel from, or undefined to delete it everywhere;
// it should throw on failure so the sheet can stay open with an error.
// onDismiss fires once the sheet has finished closing.
export default function ReelActionsSheet({
  visible,
  reel,
  reelCategories = [],
  currentCategory = null,
  onEdit,
  onDelete,
  onClose,
  onDismiss,
}) {
  const [step, setStep] = useState('menu');
  const [selectedIds, setSelectedIds] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      setStep('menu');
      setSelectedIds([]);
      setIsDeleting(false);
      setError('');
    }
  }, [visible, reel?.id]);

  const inSeveral = reelCategories.length > 1;
  // In a category the reel is only taken out of it; the server deletes the
  // reel if that was its last one.
  const removesFromCurrentOnly = !!currentCategory && inSeveral;
  const allSelected =
    reelCategories.length > 0 && selectedIds.length === reelCategories.length;

  const close = () => {
    if (!isDeleting) {
      onClose?.();
    }
  };

  const handleDeletePress = () => {
    setError('');
    setStep(!currentCategory && inSeveral ? 'categories' : 'confirm');
  };

  const runDelete = async categoryIds => {
    setIsDeleting(true);
    setError('');
    try {
      await onDelete?.(categoryIds);
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not delete the reel.');
      setIsDeleting(false);
    }
  };

  const handleConfirm = () =>
    runDelete(currentCategory ? [currentCategory.id] : undefined);

  // Picking every category is the same as deleting the reel.
  const handleDeleteSelected = () =>
    runDelete(allSelected ? undefined : selectedIds);

  const toggleCategory = id =>
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id],
    );

  const toggleAll = () =>
    setSelectedIds(allSelected ? [] : reelCategories.map(c => c?.id));

  const renderMenu = () => (
    <>
      <TouchableOpacity
        style={styles?.option}
        onPress={() => onEdit?.(reel)}
        activeOpacity={0.7}
      >
        <Text style={styles?.optionIcon}>✏️</Text>
        <Text style={styles?.optionText}>Edit</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles?.option}
        onPress={handleDeletePress}
        activeOpacity={0.7}
      >
        <Text style={styles?.optionIcon}>🗑️</Text>
        <Text style={[styles?.optionText, styles?.destructiveText]}>
          Delete
        </Text>
      </TouchableOpacity>
    </>
  );

  const renderConfirm = () => (
    <>
      <Text style={styles?.message}>
        {removesFromCurrentOnly
          ? `Remove this reel from "${currentCategory?.label}"? It will stay in your other categories.`
          : 'Delete this reel? This cannot be undone.'}
      </Text>
      {renderButtons(
        removesFromCurrentOnly ? 'Remove' : 'Delete',
        handleConfirm,
        false,
      )}
    </>
  );

  const renderCategories = () => (
    <>
      <Text style={styles?.message}>
        This reel is saved in {reelCategories.length} categories. Choose where
        to delete it from.
      </Text>
      <TouchableOpacity
        style={styles?.checkRow}
        onPress={toggleAll}
        activeOpacity={0.7}
        disabled={isDeleting}
      >
        <View style={[styles?.checkbox, allSelected && styles?.checkboxOn]}>
          {allSelected && <Text style={styles?.checkMark}>✓</Text>}
        </View>
        <Text style={[styles?.checkLabel, styles?.checkLabelBold]}>
          All categories
        </Text>
      </TouchableOpacity>
      <ScrollView style={styles?.categoryList} bounces={false}>
        {reelCategories.map(category => {
          const checked = selectedIds.includes(category?.id);
          return (
            <TouchableOpacity
              key={category?.id}
              style={styles?.checkRow}
              onPress={() => toggleCategory(category?.id)}
              activeOpacity={0.7}
              disabled={isDeleting}
            >
              <View style={[styles?.checkbox, checked && styles?.checkboxOn]}>
                {checked && <Text style={styles?.checkMark}>✓</Text>}
              </View>
              <Text style={styles?.checkIcon}>{category?.icon}</Text>
              <Text style={styles?.checkLabel} numberOfLines={1}>
                {category?.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      {allSelected && (
        <Text style={styles?.hint}>The reel will be deleted completely.</Text>
      )}
      {renderButtons(
        allSelected ? 'Delete' : 'Remove',
        handleDeleteSelected,
        selectedIds.length === 0,
      )}
    </>
  );

  const renderButtons = (confirmText, onConfirm, disabled) => (
    <View style={styles?.buttonRow}>
      <TouchableOpacity
        style={styles?.cancelButton}
        onPress={close}
        activeOpacity={0.7}
        disabled={isDeleting}
      >
        <Text style={styles?.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles?.deleteButton,
          (disabled || isDeleting) && styles?.deleteButtonDisabled,
        ]}
        onPress={onConfirm}
        activeOpacity={0.8}
        disabled={disabled || isDeleting}
      >
        {isDeleting ? (
          <ActivityIndicator color={theme?.colors?.background} />
        ) : (
          <Text style={styles?.deleteButtonText}>{confirmText}</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={close}
      onDismiss={onDismiss}
    >
      <View style={styles?.overlay}>
        <TouchableWithoutFeedback onPress={close}>
          <View style={styles?.backdropTouch} />
        </TouchableWithoutFeedback>
        <View style={styles?.drawerContainer}>
          <View style={styles?.dragHandleContainer}>
            <View style={styles?.dragHandle} />
          </View>
          <Text style={styles?.reelTitle} numberOfLines={2}>
            {reelTitle(reel, currentCategory?.id)}
          </Text>
          {step === 'menu' && renderMenu()}
          {step === 'confirm' && renderConfirm()}
          {step === 'categories' && renderCategories()}
          {!!error && <Text style={styles?.error}>{error}</Text>}
        </View>
      </View>
    </Modal>
  );
}
