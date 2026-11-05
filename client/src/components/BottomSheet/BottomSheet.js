import React from 'react';
import { Modal, View, Text, TouchableWithoutFeedback } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import IconButton from '../IconButton/IconButton';
import { useTheme } from '../../context/ThemeContext';
import useKeyboardHeight from '../../hooks/useKeyboardHeight';
import styles from './BottomSheet.styles';

// Drawer used by Add Reel / Add Category / Edit Reel: scrim, outlined sheet with
// a coloured hard bar along its top edge, drag handle, title and close button.
// Children are the sheet's sections (22px apart). `nested` renders inside the
// same Modal, after the sheet, so iOS can stack a second drawer on top.
export default function BottomSheet({
  visible,
  onClose,
  title,
  barColor,
  children,
  nested,
}) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight(visible);

  const paddingBottom =
    keyboardHeight > 0 ? keyboardHeight + 16 : (insets?.bottom ?? 0) + 24;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <View style={[styles?.overlay, { backgroundColor: colors?.scrim }]}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles?.backdropTouch} />
        </TouchableWithoutFeedback>

        <View style={styles?.sheetWrap}>
          {/* Hard bar: the same shape as the sheet, 6px higher, behind it */}
          <View
            pointerEvents="none"
            style={[styles?.bar, { backgroundColor: barColor ?? colors?.accent }]}
          />
          <View
            style={[
              styles?.sheet,
              {
                backgroundColor: colors?.surf,
                borderColor: colors?.outline,
                paddingBottom,
              },
            ]}
          >
            <View style={[styles?.dragHandle, { backgroundColor: colors?.line }]} />

            <View style={styles?.header}>
              <Text
                style={[styles?.title, { color: colors?.fg }]}
                accessibilityRole="header"
                numberOfLines={1}
              >
                {title}
              </Text>
              <IconButton
                icon="close"
                onPress={onClose}
                accessibilityLabel="Close"
                size={44}
                fill="bg"
                iconSize={20}
                iconStrokeWidth={2.8}
              />
            </View>

            {children}
          </View>
        </View>
      </View>

      {nested}
    </Modal>
  );
}
