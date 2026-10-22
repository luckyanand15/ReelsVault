import React, { useEffect, useRef, useState } from 'react';
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
import {
  ForgotPasswordStep,
  useForgotPasswordFlow,
} from '../../context/ForgotPasswordFlowContext';
import { useLoginFlow } from '../../context/LoginFlowContext';
import { resetPassword } from '../../api/auth.api';
import styles from './ForgotPasswordReset.styles';

const MIN_PASSWORD_LENGTH = 8;
// bcrypt ignores anything past 72 bytes; must match user.validator.js.
const MAX_PASSWORD_BYTES = 72;

export default function ForgotPasswordReset({ navigation }) {
  const { canAccessStep, forgotPasswordData, resetForgotPasswordFlow } =
    useForgotPasswordFlow();
  const { resetLoginFlow } = useLoginFlow();
  const { email, resetToken } = forgotPasswordData;
  const canAccessResetStep =
    canAccessStep(ForgotPasswordStep.Reset) && Boolean(email) && Boolean(resetToken);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmFocused, setConfirmFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const confirmInputRef = useRef(null);
  // Set before this screen clears the flow on its way out, so the guard
  // below doesn't also try to redirect.
  const isLeavingRef = useRef(false);

  useEffect(() => {
    if (!canAccessResetStep && !isLeavingRef.current) {
      navigation.replace(routes.ForgotPasswordEmail);
    }
  }, [canAccessResetStep, navigation]);

  const isPasswordLongEnough = password.length >= MIN_PASSWORD_LENGTH;
  // Must match the server rule in user.validator.js.
  const hasLetter = /[A-Za-z]/.test(password);
  // Bytes, not characters: an emoji counts as up to 4.
  const isPasswordShortEnough =
    new TextEncoder().encode(password).length <= MAX_PASSWORD_BYTES;
  const doPasswordsMatch = password === confirmPassword;
  // hasLetter is left out on purpose: the button stays enabled so pressing it
  // shows the reason, instead of a disabled button with no explanation.
  const isFormValid = isPasswordLongEnough && confirmPassword.length > 0 && doPasswordsMatch;

  const handlePasswordChange = (text) => {
    setPassword(text);
    if (error) {
      setError('');
    }
  };

  const handleConfirmChange = (text) => {
    setConfirmPassword(text);
    if (error) {
      setError('');
    }
  };

  const handleArrowPress = async () => {
    if (!isPasswordLongEnough) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }

    if (!isPasswordShortEnough) {
      setError(`Password must be ${MAX_PASSWORD_BYTES} characters or fewer.`);
      return;
    }

    if (!hasLetter) {
      setError('Must contain at least one letter.');
      return;
    }

    if (!doPasswordsMatch) {
      setError('Passwords do not match.');
      return;
    }

    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await resetPassword({ email, resetToken, password, confirmPassword });
      isLeavingRef.current = true;
      // The server has ended every session for this account, so start the
      // login flow from scratch: email first, then the new password.
      navigation.reset({
        index: 1,
        routes: [
          { name: routes.Welcome },
          { name: routes.LoginEmail, params: { email, passwordReset: true } },
        ],
      });
      resetForgotPasswordFlow();
      resetLoginFlow();
    } catch (err) {
      const { data } = err?.response || {};
      if (data?.code === 'RESET_TOKEN_INVALID') {
        // The verified code expired before the password was set. Go back to
        // the email step to get a new one.
        isLeavingRef.current = true;
        navigation.popTo(routes.ForgotPasswordEmail, { notice: data.message });
        resetForgotPasswordFlow();
      } else {
        setError(
          err?.response?.data?.message || 'Something went wrong. Please try again.',
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canAccessResetStep) {
    return null;
  }

  const showMismatch = confirmPassword.length > 0 && !doPasswordsMatch;

  return (
    <SafeAreaView style={styles?.safeArea} edges={['top', 'left', 'right']}>
      <Header onLeftPress={() => navigation?.goBack?.()} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles?.keyboardAvoidingView}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles?.container}>
            {/* Header Content */}
            <View style={styles?.headerContent}>
              <Text style={styles?.stepIndicator}>Step 3 of 3</Text>
              <Text style={styles?.title}>Set a new password</Text>
              <Text style={styles?.subtitle}>
                You'll be logged out on all your devices and can log in again with this password.
              </Text>
            </View>

            {/* Input Form */}
            <View style={styles?.form}>
              <View style={styles?.inputGroup}>
                <View style={styles?.labelRow}>
                  <Text style={styles?.label}>
                    New Password <Text style={styles?.star}>*</Text>
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowPassword((prev) => !prev)}
                    activeOpacity={0.7}
                    accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <Text style={styles?.toggleText}>
                      {showPassword ? 'Hide' : 'Show'}
                    </Text>
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
                  placeholder="Enter your new password"
                  placeholderTextColor="#A3A3A3"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="newPassword"
                  returnKeyType="next"
                  onSubmitEditing={() => confirmInputRef.current?.focus()}
                  blurOnSubmit={false}
                />
                <Text style={styles?.hintText}>
                  {MIN_PASSWORD_LENGTH} to {MAX_PASSWORD_BYTES} characters, including a letter.
                </Text>
              </View>

              <View style={styles?.inputGroup}>
                <View style={styles?.labelRow}>
                  <Text style={styles?.label}>
                    Confirm New Password <Text style={styles?.star}>*</Text>
                  </Text>
                </View>
                <TextInput
                  ref={confirmInputRef}
                  style={[
                    styles?.input,
                    confirmFocused && styles?.inputFocused,
                    (showMismatch || !!error) && styles?.inputError,
                  ]}
                  value={confirmPassword}
                  onChangeText={handleConfirmChange}
                  onFocus={() => setConfirmFocused(true)}
                  onBlur={() => setConfirmFocused(false)}
                  placeholder="Re-enter your new password"
                  placeholderTextColor="#A3A3A3"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="newPassword"
                  returnKeyType="done"
                  onSubmitEditing={handleArrowPress}
                />
                {error ? (
                  <Text style={styles?.errorText}>{error}</Text>
                ) : showMismatch ? (
                  <Text style={styles?.errorText}>Passwords do not match.</Text>
                ) : null}
              </View>
            </View>

            {/* Footer with Arrow Button */}
            <View style={styles?.footer}>
              <TouchableOpacity
                style={[
                  styles?.arrowButton,
                  (!isFormValid || isSubmitting) && styles?.arrowButtonDisabled,
                ]}
                onPress={handleArrowPress}
                disabled={!isFormValid || isSubmitting}
                activeOpacity={0.8}
                accessibilityLabel="Change password"
                accessibilityState={{ disabled: !isFormValid || isSubmitting }}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={styles?.arrowIcon?.color} />
                ) : (
                  <Text
                    style={[
                      styles?.arrowIcon,
                      !isFormValid && styles?.arrowIconDisabled,
                    ]}
                  >
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
