import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import styles from './ConfirmationComponent.styles';

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
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      statusBarTranslucent={true}
      onRequestClose={onCancel}
    >
      <View style={styles?.overlay}>
        <TouchableWithoutFeedback onPress={onCancel}>
          <View style={styles?.backdropTouch} />
        </TouchableWithoutFeedback>

        <View style={styles?.dialogContainer}>
          {!!title && <Text style={styles?.title}>{title}</Text>}
          {!!message && <Text style={styles?.message}>{message}</Text>}

          <View style={styles?.buttonContainer}>
            <TouchableOpacity
              style={styles?.cancelButton}
              onPress={onCancel}
              activeOpacity={0.7}
            >
              <Text style={styles?.cancelButtonText}>{cancelText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles?.confirmButton,
                isDestructive && styles?.confirmButtonDestructive,
              ]}
              onPress={onConfirm}
              activeOpacity={0.8}
            >
              <Text style={styles?.confirmButtonText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
