import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import HardShadow from '../HardShadow/HardShadow';
import { useTheme } from '../../context/ThemeContext';
import styles from './OtpCodeField.styles';

// Six outlined digit boxes (accent hard shadows), the error line and the
// "Resend" link. The screen owns the digits and their logic (typing, paste,
// backspace, verifying); this only draws them.
//
// digits: the six values. inputRefs: a ref holding the six TextInputs.
// onChangeDigit(text, index) / onKeyPress(e, index) / onFocusIndex(index|null).
// resend: { canResend, isResending, cooldown, onPress }.
// verifying: shows "Verifying..." where the error goes, for screens with no
// arrow spinner to say the code is being checked.
export default function OtpCodeField({
  digits,
  inputRefs,
  focusedIndex,
  onFocusIndex,
  onChangeDigit,
  onKeyPress,
  error,
  resend,
  verifying = false,
}) {
  const { colors } = useTheme();
  const { canResend, isResending, cooldown, onPress } = resend || {};

  return (
    <View style={styles?.form}>
      <View style={styles?.otpContainer}>
        {digits.map((digit, index) => (
          <HardShadow
            key={index}
            color={colors?.accent}
            offset={3}
            borderRadius={14}
            style={styles?.otpSlot}
          >
            <TextInput
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={[
                styles?.otpBox,
                {
                  backgroundColor: colors?.surf,
                  color: colors?.fg,
                  borderColor: error
                    ? colors?.pinkText
                    : focusedIndex === index
                    ? colors?.accent
                    : colors?.outline,
                },
              ]}
              value={digit}
              onChangeText={(text) => onChangeDigit(text, index)}
              onKeyPress={(e) => onKeyPress(e, index)}
              onFocus={() => onFocusIndex(index)}
              onBlur={() => onFocusIndex(null)}
              keyboardType="number-pad"
              maxLength={6}
              selectTextOnFocus
              autoFocus={index === 0}
              selectionColor={colors?.pink}
              cursorColor={colors?.fg}
              accessibilityLabel={`Digit ${index + 1} of 6`}
            />
          </HardShadow>
        ))}
      </View>

      {error ? (
        <Text style={[styles?.errorText, { color: colors?.pinkText }]}>{error}</Text>
      ) : verifying ? (
        <Text
          style={[styles?.errorText, { color: colors?.mut }]}
          accessibilityLiveRegion="polite"
        >
          Verifying...
        </Text>
      ) : null}

      <TouchableOpacity
        style={styles?.resendButton}
        onPress={onPress}
        disabled={!canResend}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityState={{ disabled: !canResend }}
      >
        {canResend ? (
          <Text style={[styles?.resendText, { color: colors?.mut }]}>
            Didn't receive the code?{' '}
            <Text
              style={[
                styles?.resendLink,
                { color: colors?.fg, textDecorationColor: colors?.pink },
              ]}
            >
              Resend
            </Text>
          </Text>
        ) : (
          <Text style={[styles?.resendText, { color: colors?.mut }]}>
            {isResending ? 'Sending...' : `Resend code in ${cooldown}s`}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
