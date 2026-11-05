import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import AuthLayout, { AuthHeading } from '../../components/AuthLayout/AuthLayout';
import TextField from '../../components/TextField/TextField';
import RoundArrowButton from '../../components/RoundArrowButton/RoundArrowButton';
import routes from '../../routes/routes';
import { SignupStep, useSignupFlow } from '../../context/SignupFlowContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { createUser } from '../../api/user.api';
import styles from './SignupPassword.styles';

const MIN_PASSWORD_LENGTH = 8;
// bcrypt ignores anything past 72 bytes; must match user.validator.js.
const MAX_PASSWORD_BYTES = 72;

export default function SignupPassword({ navigation }) {
  const { canAccessStep, completeSignup, signupData } = useSignupFlow();
  const { authLogin } = useAuth();
  const { colors } = useTheme();
  const { firstName, lastName, email, isEmailVerified, verificationToken } = signupData;
  const canAccessPasswordStep =
    canAccessStep(SignupStep.Password) &&
    Boolean(email) &&
    isEmailVerified &&
    Boolean(verificationToken);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const confirmInputRef = useRef(null);
  const hasCompletedSignupRef = useRef(false);

  useEffect(() => {
    if (!canAccessPasswordStep && !hasCompletedSignupRef.current) {
      navigation.replace(routes.Signup);
    }
  }, [canAccessPasswordStep, navigation]);

  const isPasswordLongEnough = password.length >= MIN_PASSWORD_LENGTH;
  // Must match the server rule in user.validator.js.
  const hasLetter = /[A-Za-z]/.test(password);
  // Bytes, not characters: an emoji counts as up to 4.
  const isPasswordShortEnough =
    new TextEncoder().encode(password).length <= MAX_PASSWORD_BYTES;
  const doPasswordsMatch = password === confirmPassword;
  // Only the look of the arrow: it stays pressable so pressing it shows the
  // reason, instead of a disabled button with no explanation.
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
      const session = await createUser({
        firstName,
        lastName,
        email,
        verificationToken,
        password,
        confirmPassword,
      });
      hasCompletedSignupRef.current = true;
      completeSignup({ userId: session?.user?.id });
      await authLogin(session);
      // Reset navigation stack and open Dashboard
      navigation.reset({
        index: 0,
        routes: [{ name: routes.Dashboard }],
      });
    } catch (err) {
      if (err?.response?.status === 409) {
        setError('This email is already registered.');
      } else {
        setError(
          err?.response?.data?.message || 'Something went wrong. Please try again.',
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canAccessPasswordStep) {
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
      circleColor={colors?.accent}
      onBack={() => navigation?.goBack?.()}
      footer={
        <RoundArrowButton
          onPress={handleArrowPress}
          active={isFormValid}
          loading={isSubmitting}
          accessibilityLabel="Create account and go to Dashboard"
        />
      }
    >
      <AuthHeading step="Step 4 of 4" title={'Create a\npassword'}>
        You'll use this password to log into Reels Vault.
      </AuthHeading>

      <View style={styles?.fields}>
        <TextField
          label="Password"
          required
          labelAccessory={showHideToggle}
          hint={`${MIN_PASSWORD_LENGTH} to ${MAX_PASSWORD_BYTES} characters, including a letter.`}
          value={password}
          onChangeText={handlePasswordChange}
          placeholder="Enter your password"
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
          label="Confirm Password"
          required
          error={error || (showMismatch ? 'Passwords do not match.' : '')}
          value={confirmPassword}
          onChangeText={handleConfirmChange}
          placeholder="Re-enter your password"
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
