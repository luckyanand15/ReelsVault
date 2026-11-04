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
import { AccountFlow, useAccountFlow } from '../../context/AccountFlowContext';
import { useAuth } from '../../context/AuthContext';
import { changePassword } from '../../api/account.api';
import { ERROR_CODES } from '../../constants/errorCodes';
import { exitToSettings, isReauthRequired } from './accountFlowErrors';
import styles from './ChangePassword.styles';

const MIN_PASSWORD_LENGTH = 8;
// bcrypt ignores anything past 72 bytes; must match user.validator.js.
const MAX_PASSWORD_BYTES = 72;

// Step 3 of changing the password, once the emailed code is confirmed.
export default function ChangePassword({ navigation }) {
  const { accountData, resetAccountFlow } = useAccountFlow();
  const { replaceTokens } = useAuth();
  const { flow, reauthToken, changeToken } = accountData;
  const canAccessStep =
    flow === AccountFlow.Password && Boolean(reauthToken) && Boolean(changeToken);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmFocused, setConfirmFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const confirmInputRef = useRef(null);
  const isLeavingRef = useRef(false);

  useEffect(() => {
    if (!canAccessStep && !isLeavingRef.current) {
      navigation.popTo(routes.Settings);
    }
  }, [canAccessStep, navigation]);

  const isPasswordLongEnough = password.length >= MIN_PASSWORD_LENGTH;
  // Must match the server rule in user.validator.js.
  const hasLetter = /[A-Za-z]/.test(password);
  // Bytes, not characters: an emoji counts as up to 4.
  const isPasswordShortEnough = new TextEncoder().encode(password).length <= MAX_PASSWORD_BYTES;
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

  const leave = (notice) => {
    isLeavingRef.current = true;
    exitToSettings(navigation, resetAccountFlow, notice);
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
      const tokens = await changePassword({ reauthToken, changeToken, password, confirmPassword });
      // The server ended every session, this one included, and sent back a
      // new pair so this device stays logged in.
      await replaceTokens(tokens);
      leave('Your password has been changed. Other devices have been logged out.');
    } catch (err) {
      const { data } = err?.response || {};
      if (isReauthRequired(err) || data?.code === ERROR_CODES.CHANGE_TOKEN_INVALID) {
        leave(data.message);
      } else {
        setError(data?.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canAccessStep) {
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
            <View style={styles?.headerContent}>
              <Text style={styles?.stepIndicator}>Step 3 of 3</Text>
              <Text style={styles?.title}>Set a new password</Text>
              <Text style={styles?.subtitle}>
                You'll stay logged in here. Your other devices will be logged out.
              </Text>
            </View>

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
                  placeholder="Enter your new password"
                  placeholderTextColor="#A3A3A3"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="newPassword"
                  returnKeyType="next"
                  onSubmitEditing={() => confirmInputRef.current?.focus()}
                  submitBehavior="submit"
                  autoFocus
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
