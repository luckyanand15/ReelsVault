import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/Header/Header';
import routes from '../../routes/routes';
import { AccountFlow, useAccountFlow } from '../../context/AccountFlowContext';
import { OTP_RESEND_COOLDOWN_SECONDS } from '../../context/SignupFlowContext';
import { reauthenticate, sendPasswordChangeOtp } from '../../api/account.api';
import { formatRetryAfter } from '../../utils/formatRetryAfter';
import { ERROR_CODES } from '../../constants/errorCodes';
import styles from './AccountPassword.styles';

// Step 1 of both the email and the password change: the current password.
export default function AccountPassword({ navigation, route }) {
  const flow = route?.params?.flow === AccountFlow.Password ? AccountFlow.Password : AccountFlow.Email;
  const isPasswordFlow = flow === AccountFlow.Password;
  const { startAccountFlow, markOtpSent } = useAccountFlow();

  const [password, setPassword] = useState('');
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFormValid = password.length > 0;

  const handlePasswordChange = (text) => {
    setPassword(text);
    if (error) {
      setError('');
    }
  };

  // Password flow: the code goes to the current email as soon as the
  // password checks out.
  const sendCodeAndContinue = async (reauthToken) => {
    try {
      await sendPasswordChangeOtp({ reauthToken });
      markOtpSent();
      navigation.navigate(routes.AccountOtp);
    } catch (err) {
      const { status, data } = err?.response || {};
      if (status === 429 && data?.code === ERROR_CODES.OTP_COOLDOWN) {
        // A code was sent moments ago and is still valid, so carry on.
        // Backdate otpSentAt so the resend timer shows the server's wait.
        const retryAfter = data.retryAfter ?? OTP_RESEND_COOLDOWN_SECONDS;
        markOtpSent({
          otpSentAt: Date.now() - (OTP_RESEND_COOLDOWN_SECONDS - retryAfter) * 1000,
        });
        navigation.navigate(routes.AccountOtp, { alreadySent: true });
      } else if (status === 429) {
        setError(`Too many requests. Please try again ${formatRetryAfter(data?.retryAfter)}.`);
      } else {
        setError('Failed to send the code. Please try again.');
      }
    }
  };

  const handleArrowPress = async () => {
    if (!isFormValid) {
      setError('Password is required.');
      return;
    }

    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      let reauthToken;
      try {
        reauthToken = await reauthenticate(password);
      } catch (err) {
        const { status, data } = err?.response || {};
        if (status === 429 && data?.code !== ERROR_CODES.LOGIN_LOCKED) {
          setError(`Too many requests. Please try again ${formatRetryAfter(data?.retryAfter)}.`);
        } else {
          setError(data?.message || 'Something went wrong. Please try again.');
        }
        return;
      }

      startAccountFlow({ flow, reauthToken });
      setPassword('');

      if (isPasswordFlow) {
        await sendCodeAndContinue(reauthToken);
      } else {
        navigation.navigate(routes.ChangeEmail);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles?.safeArea} edges={['top', 'left', 'right']}>
      <Header onLeftPress={() => navigation?.goBack?.()} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles?.keyboardAvoidingView}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles?.container}>
            <View style={styles?.headerContent}>
              <Text style={styles?.stepIndicator}>Step 1 of 3</Text>
              <Text style={styles?.title}>Enter your password</Text>
              <Text style={styles?.subtitle}>
                {isPasswordFlow
                  ? "Confirm your current password. We'll then email you a code."
                  : 'Confirm your current password before changing your email.'}
              </Text>
            </View>

            <View style={styles?.form}>
              <View style={styles?.inputGroup}>
                <View style={styles?.labelRow}>
                  <Text style={styles?.label}>
                    Current Password <Text style={styles?.star}>*</Text>
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowPassword((prev) => !prev)}
                    activeOpacity={0.7}
                    accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <Text style={styles?.toggleText}>{showPassword ? 'Hide' : 'Show'}</Text>
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={[
                    styles?.input,
                    passwordFocused && styles?.inputFocused,
                    !!error && styles?.inputError,
                  ]}
                  value={password}
                  onChangeText={handlePasswordChange}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  placeholder="Enter your current password"
                  placeholderTextColor="#A3A3A3"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="password"
                  returnKeyType="done"
                  onSubmitEditing={handleArrowPress}
                  autoFocus
                />
                {!!error && <Text style={styles?.errorText}>{error}</Text>}
              </View>
            </View>

            <View style={styles?.footer}>
              <TouchableOpacity
                style={[
                  styles?.arrowButton,
                  (!isFormValid || isSubmitting) && styles?.arrowButtonDisabled,
                ]}
                onPress={handleArrowPress}
                disabled={!isFormValid || isSubmitting}
                activeOpacity={0.8}
                accessibilityLabel="Continue"
                accessibilityState={{ disabled: !isFormValid || isSubmitting }}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={styles?.arrowIcon?.color} />
                ) : (
                  <Text style={[styles?.arrowIcon, !isFormValid && styles?.arrowIconDisabled]}>
                    ➔
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
