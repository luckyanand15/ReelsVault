import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import AuthLayout, { AuthHeading } from '../../components/AuthLayout/AuthLayout';
import TextField from '../../components/TextField/TextField';
import RoundArrowButton from '../../components/RoundArrowButton/RoundArrowButton';
import { useTheme } from '../../context/ThemeContext';
import routes from '../../routes/routes';
import {
  ForgotPasswordStep,
  useForgotPasswordFlow,
} from '../../context/ForgotPasswordFlowContext';
import { useLoginFlow } from '../../context/LoginFlowContext';
import { resetPassword } from '../../api/auth.api';
import { ERROR_CODES } from '../../constants/errorCodes';
import styles from './ForgotPasswordReset.styles';

const MIN_PASSWORD_LENGTH = 8;
// bcrypt ignores anything past 72 bytes; must match user.validator.js.
const MAX_PASSWORD_BYTES = 72;

export default function ForgotPasswordReset({ navigation }) {
  const { canAccessStep, forgotPasswordData, resetForgotPasswordFlow } =
    useForgotPasswordFlow();
  const { resetLoginFlow } = useLoginFlow();
  const { colors } = useTheme();
  const { email, resetToken } = forgotPasswordData;
  const canAccessResetStep =
    canAccessStep(ForgotPasswordStep.Reset) && Boolean(email) && Boolean(resetToken);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
      if (data?.code === ERROR_CODES.RESET_TOKEN_INVALID) {
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

  const showHideToggle = (
    <TouchableOpacity
      style={styles?.toggleButton}
      onPress={() => setShowPassword((prev) => !prev)}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
    >
      <Text style={[styles?.toggleText, { color: colors?.fg }]}>
        {showPassword ? 'Hide' : 'Show'}
      </Text>
    </TouchableOpacity>
  );

  return (
    <AuthLayout
      circleColor={colors?.cyan}
      onBack={() => navigation?.goBack?.()}
      footer={
        <RoundArrowButton
          onPress={handleArrowPress}
          active={isFormValid}
          loading={isSubmitting}
          accessibilityLabel="Change password"
        />
      }
    >
      <AuthHeading step="Step 3 of 3" title={'Set a new\npassword'}>
        You'll be logged out on all your devices and can log in again with this password.
      </AuthHeading>

      <View style={styles?.fields}>
        <TextField
          label="New Password"
          required
          labelAccessory={showHideToggle}
          hint={`${MIN_PASSWORD_LENGTH} to ${MAX_PASSWORD_BYTES} characters, including a letter.`}
          value={password}
          onChangeText={handlePasswordChange}
          placeholder="Enter your new password"
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="newPassword"
          returnKeyType="next"
          onSubmitEditing={() => confirmInputRef.current?.focus()}
          blurOnSubmit={false}
        />

        <TextField
          inputRef={confirmInputRef}
          label="Confirm New Password"
          required
          error={error || (showMismatch ? 'Passwords do not match.' : '')}
          value={confirmPassword}
          onChangeText={handleConfirmChange}
          placeholder="Re-enter your new password"
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="newPassword"
          returnKeyType="done"
          onSubmitEditing={handleArrowPress}
        />
      </View>
    </AuthLayout>
  );
}
