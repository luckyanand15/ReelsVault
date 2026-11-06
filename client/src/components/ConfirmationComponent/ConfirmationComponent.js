import React from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  TouchableWithoutFeedback,
} from 'react-native';
import HardShadow from '../HardShadow/HardShadow';
import { useTheme } from '../../context/ThemeContext';
import styles from './ConfirmationComponent.styles';

// Outlined dialog with a pink hard shadow. The confirm button is pink for
// destructive actions (with an accent shadow, like the + button), else accent.
export default function ConfirmationComponent({
  visible = false,
  title = 'Are you sure?',
  message = 'Are you sure you want to delete?',
  confirmText = 'Yes',
  cancelText = 'Cancel',
  isDestructive = true,
  onConfirm,
  onCancel,
}) {
  const { colors } = useTheme();

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      statusBarTranslucent={true}
      onRequestClose={onCancel}
    >
      <View style={[styles?.overlay, { backgroundColor: colors?.scrim }]}>
        <TouchableWithoutFeedback onPress={onCancel}>
          <View style={styles?.backdropTouch} />
        </TouchableWithoutFeedback>

        <HardShadow
          color={colors?.pink}
          offset={5}
          borderRadius={24}
          style={styles?.dialogWrap}
        >
          <View
            style={[
              styles?.dialogContainer,
              { backgroundColor: colors?.surf, borderColor: colors?.outline },
            ]}
            accessibilityViewIsModal
          >
            {!!title && (
              <Text
                style={[styles?.title, { color: colors?.fg }]}
                accessibilityRole="header"
              >
                {title}
              </Text>
            )}
            {!!message && (
              <Text style={[styles?.message, { color: colors?.mut }]}>
                {message}
              </Text>
            )}

            <View style={styles?.buttonContainer}>
              <Pressable
                style={({ pressed }) => [
                  styles?.button,
                  styles?.cancelButton,
                  { borderColor: colors?.line },
                  pressed && styles?.pressedFade,
                ]}
                onPress={onCancel}
                accessibilityRole="button"
              >
                <Text style={[styles?.buttonText, { color: colors?.fg }]}>
                  {cancelText}
                </Text>
              </Pressable>

              <HardShadow
                color={isDestructive ? colors?.accent : colors?.pink}
                offset={3}
                borderRadius={16}
                style={styles?.confirmWrap}
              >
                <Pressable
                  style={({ pressed }) => [
                    styles?.button,
                    {
                      backgroundColor: isDestructive ? colors?.pink : colors?.accent,
                      borderColor: colors?.outline,
                    },
                    pressed && styles?.pressedPush,
                  ]}
                  onPress={onConfirm}
                  accessibilityRole="button"
                >
                  <Text style={[styles?.buttonText, { color: colors?.ink }]}>
                    {confirmText}
                  </Text>
                </Pressable>
              </HardShadow>
            </View>
          </View>
        </HardShadow>
      </View>
    </Modal>
  );
}
