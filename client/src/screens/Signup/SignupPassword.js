import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import AuthLayout, { AuthHeading } from '../../components/AuthLayout/AuthLayout';
import TextField from '../../components/TextField/TextField';
import RoundArrowButton from '../../components/RoundArrowButton/RoundArrowButton';
import routes from '../../routes/routes';
import { SignupStep, useSignupFlow } from '../../context/SignupFlowContext';
import { useTheme } from '../../context/ThemeContext';
import styles from './SignupPassword.styles';

export const MIN_PASSWORD_LENGTH = 8;
// bcrypt ignores anything past 72 bytes; must match user.validator.js.
export const MAX_PASSWORD_BYTES = 72;

export default function SignupPassword({ navigation }) {
  const { canAccessStep, continueWithPassword, signupData } = useSignupFlow();
  const { colors } = useTheme();
  const { userId, email, isEmailVerified, verificationToken } = signupData;
  // Once the confirm screen creates the account it clears the token; this
  // screen is still in the stack then and must not bounce back to the start.
  const hasCompletedSignup = Boolean(userId);
  const canAccessPasswordStep =
    canAccessStep(SignupStep.Password) &&
    Boolean(email) &&
    isEmailVerified &&
    Boolean(verificationToken);

  const [password, setPassword] = useState(signupData?.password ?? '');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!canAccessPasswordStep && !hasCompletedSignup) {
      navigation.replace(routes.Signup);
    }
  }, [canAccessPasswordStep, hasCompletedSignup, navigation]);

  const isPasswordLongEnough = password.length >= MIN_PASSWORD_LENGTH;
  // Must match the server rule in user.validator.js.
  const hasLetter = /[A-Za-z]/.test(password);
  // Bytes, not characters: an emoji counts as up to 4.
  const isPasswordShortEnough =
    new TextEncoder().encode(password).length <= MAX_PASSWORD_BYTES;
  // Only the look of the arrow: it stays pressable so pressing it shows the
  // reason, instead of a disabled button with no explanation.
  const isFormValid = isPasswordLongEnough && isPasswordShortEnough && hasLetter;

  const handlePasswordChange = (text) => {
    setPassword(text);
    if (error) {
      setError('');
    }
  };

  const handleArrowPress = () => {
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

    continueWithPassword({ password });
    navigation.navigate(routes.SignupConfirmPassword);
  };

  if (!canAccessPasswordStep && !hasCompletedSignup) {
    return null;
  }

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
          accessibilityLabel="Next step"
        />
      }
    >
      <AuthHeading step="Step 5 of 6" title={'Create a\npassword'}>
        You'll use this password to log into Reels Vault.
      </AuthHeading>

      <View style={styles?.fields}>
        <TextField
          label="Password"
          required
          labelAccessory={showHideToggle}
          hint={`${MIN_PASSWORD_LENGTH} to ${MAX_PASSWORD_BYTES} characters, including a letter.`}
          error={error}
          value={password}
          onChangeText={handlePasswordChange}
          placeholder="Enter your password"
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="newPassword"
          returnKeyType="next"
          autoFocus
          onSubmitEditing={handleArrowPress}
          submitBehavior="submit"
        />
      </View>
    </AuthLayout>
  );
}
