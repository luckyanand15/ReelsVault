import React, { useEffect, useState } from 'react';
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
import styles from './ForgotPasswordReset.styles';

const MIN_PASSWORD_LENGTH = 8;
// bcrypt ignores anything past 72 bytes; must match user.validator.js.
const MAX_PASSWORD_BYTES = 72;

export default function ForgotPasswordReset({ navigation }) {
  const { canAccessStep, continueWithPassword, forgotPasswordData } =
    useForgotPasswordFlow();
  const { colors } = useTheme();
  const { email, resetToken } = forgotPasswordData;
  const canAccessResetStep =
    canAccessStep(ForgotPasswordStep.Reset) && Boolean(email) && Boolean(resetToken);

  const [password, setPassword] = useState(forgotPasswordData?.password ?? '');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Only while on top: when the confirm screen finishes it clears the flow
    // while this screen is still in the stack, and that must not redirect.
    if (!canAccessResetStep && navigation.isFocused()) {
      navigation.replace(routes.ForgotPasswordEmail);
    }
  }, [canAccessResetStep, navigation]);

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
    navigation.navigate(routes.ForgotPasswordConfirmPassword);
  };

  if (!canAccessResetStep) {
    return null;
  }

  const showHideToggle = (
    <TouchableOpacity
      style={styles?.toggleButton}
      hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
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
          accessibilityLabel="Next step"
        />
      }
    >
      <AuthHeading step="Step 3 of 4" title={'Set a new\npassword'}>
        You'll use this password to log into Reels Vault.
      </AuthHeading>

      <View style={styles?.fields}>
        <TextField
          label="New Password"
          required
          labelAccessory={showHideToggle}
          hint={`${MIN_PASSWORD_LENGTH} to ${MAX_PASSWORD_BYTES} characters, including a letter.`}
          error={error}
          floatingError
          value={password}
          onChangeText={handlePasswordChange}
          placeholder="Enter your new password"
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
