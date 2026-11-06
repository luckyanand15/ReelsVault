import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import BottomSheet from '../BottomSheet/BottomSheet';
import HardShadow from '../HardShadow/HardShadow';
import Icon from '../Icon/Icon';
import { useTheme } from '../../context/ThemeContext';
import styles from './ReelActionsSheet.styles';
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
  const { colors } = useTheme();
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

  // Picking every category is the same as deleting the reel. The button is
  // never disabled: a press with nothing picked says so.
  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) {
      setError('Pick at least one category.');
      return;
    }
    runDelete(allSelected ? undefined : selectedIds);
  };

  const toggleCategory = id => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id],
    );
    if (error) setError('');
  };

  const toggleAll = () => {
    setSelectedIds(allSelected ? [] : reelCategories.map(c => c?.id));
    if (error) setError('');
  };

  const renderOption = ({ icon, label, color, onPress }) => (
    <Pressable
      style={({ pressed }) => [
        styles?.option,
        { backgroundColor: colors?.bg, borderColor: colors?.line },
        pressed && styles?.pressedFade,
      ]}
      onPress={onPress}
      accessibilityRole="button"
    >
      <Icon name={icon} size={22} strokeWidth={2.4} color={color} />
      <Text style={[styles?.optionText, { color }]}>{label}</Text>
    </Pressable>
  );

  const renderMenu = () => (
    <View style={styles?.options}>
      {renderOption({
        icon: 'pencil',
        label: 'Edit',
        color: colors?.fg,
        onPress: () => onEdit?.(reel),
      })}
      {renderOption({
        icon: 'trash',
        label: 'Delete',
        color: colors?.pinkText,
        onPress: handleDeletePress,
      })}
    </View>
  );

  const renderConfirm = () => (
    <>
      <Text style={[styles?.message, { color: colors?.mut }]}>
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

  const renderCheckRow = ({ key, checked, onPress, icon, label, bold }) => (
    <Pressable
      key={key}
      style={({ pressed }) => [styles?.checkRow, pressed && styles?.pressedFade]}
      onPress={onPress}
      disabled={isDeleting}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled: isDeleting }}
      accessibilityLabel={label}
    >
      <View
        style={[
          styles?.checkbox,
          checked
            ? { backgroundColor: colors?.accent, borderColor: colors?.outline }
            : { backgroundColor: colors?.bg, borderColor: colors?.line },
        ]}
      >
        {checked && <Icon name="check" size={16} strokeWidth={3} color={colors?.ink} />}
      </View>
      {!!icon && <Text style={styles?.checkIcon}>{icon}</Text>}
      <Text
        style={[styles?.checkLabel, bold && styles?.checkLabelBold, { color: colors?.fg }]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );

  const renderCategories = () => (
    <>
      <Text style={[styles?.message, { color: colors?.mut }]}>
        This reel is saved in {reelCategories.length} categories. Choose where
        to delete it from.
      </Text>
      <View>
        {renderCheckRow({
          key: 'all',
          checked: allSelected,
          onPress: toggleAll,
          label: 'All categories',
          bold: true,
        })}
        <ScrollView style={styles?.categoryList} bounces={false}>
          {reelCategories.map(category =>
            renderCheckRow({
              key: category?.id,
              checked: selectedIds.includes(category?.id),
              onPress: () => toggleCategory(category?.id),
              icon: category?.icon,
              label: category?.label,
            }),
          )}
        </ScrollView>
      </View>
      {allSelected && (
        <Text style={[styles?.hint, { color: colors?.mut }]}>
          The reel will be deleted completely.
        </Text>
      )}
      {renderButtons(
        allSelected ? 'Delete' : 'Remove',
        handleDeleteSelected,
        selectedIds.length === 0,
      )}
    </>
  );

  // `inactive` is only the look: pressing still runs onConfirm so it can
  // explain what's missing.
  const renderButtons = (confirmText, onConfirm, inactive) => (
    <View style={styles?.buttonRow}>
      <Pressable
        style={({ pressed }) => [
          styles?.button,
          styles?.cancelButton,
          { borderColor: colors?.line },
          pressed && styles?.pressedFade,
        ]}
        onPress={close}
        disabled={isDeleting}
        accessibilityRole="button"
      >
        <Text style={[styles?.buttonText, { color: colors?.fg }]}>Cancel</Text>
      </Pressable>

      {inactive && !isDeleting ? (
        <Pressable
          style={({ pressed }) => [
            styles?.button,
            styles?.flex,
            { backgroundColor: colors?.bg, borderColor: colors?.line },
            pressed && styles?.pressedFade,
          ]}
          onPress={onConfirm}
          accessibilityRole="button"
        >
          <Text style={[styles?.buttonText, { color: colors?.mut }]}>{confirmText}</Text>
        </Pressable>
      ) : (
        <HardShadow
          color={colors?.accent}
          offset={3}
          borderRadius={16}
          style={styles?.flex}
        >
          <Pressable
            style={({ pressed }) => [
              styles?.button,
              { backgroundColor: colors?.pink, borderColor: colors?.outline },
              pressed && styles?.pressedPush,
            ]}
            onPress={onConfirm}
            disabled={isDeleting}
            accessibilityRole="button"
            accessibilityState={{ busy: isDeleting }}
          >
            {isDeleting ? (
              <ActivityIndicator color={colors?.ink} />
            ) : (
              <Text style={[styles?.buttonText, { color: colors?.ink }]}>
                {confirmText}
              </Text>
            )}
          </Pressable>
        </HardShadow>
      )}
    </View>
  );

  return (
    <BottomSheet
      visible={visible}
      onClose={close}
      onDismiss={onDismiss}
      title={reelTitle(reel, currentCategory?.id)}
      titleLines={2}
      barColor={step === 'menu' ? colors?.accent : colors?.pink}
    >
      {step === 'menu' && renderMenu()}
      {step === 'confirm' && renderConfirm()}
      {step === 'categories' && renderCategories()}
      {!!error && (
        <Text style={[styles?.error, { color: colors?.pinkText }]}>{error}</Text>
      )}
    </BottomSheet>
  );
}
