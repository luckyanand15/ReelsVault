import React from 'react';
import { View, Text } from 'react-native';
import BottomSheet from '../BottomSheet/BottomSheet';
import PrimaryButton from '../PrimaryButton/PrimaryButton';
import { useTheme } from '../../context/ThemeContext';
import styles from './CancelSignupSheet.styles';

// Asked when going back from a signup screen past the verified email: going
// back there would mean verifying again, so the choice is to stay or start over.
export default function CancelSignupSheet({ visible, onKeepGoing, onCancelSignup }) {
  const { colors } = useTheme();

  return (
    <BottomSheet
      visible={visible}
      onClose={onKeepGoing}
      title="Cancel sign up?"
      barColor={colors?.pink}
    >
      <Text style={[styles?.message, { color: colors?.mut }]}>
        Your progress will be lost and you'll need to start again.
      </Text>

      <View style={styles?.buttons}>
        <PrimaryButton
          title="No"
          variant="secondary"
          onPress={onKeepGoing}
          style={styles?.button}
          accessibilityLabel="No, continue signing up"
        />
        <PrimaryButton
          title="Yes, cancel"
          onPress={onCancelSignup}
          style={styles?.button}
          accessibilityLabel="Yes, cancel sign up"
        />
      </View>
    </BottomSheet>
  );
}
