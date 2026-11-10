import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import AuthLayout, { AuthHeading } from '../../components/AuthLayout/AuthLayout';
import TextField from '../../components/TextField/TextField';
import RoundArrowButton from '../../components/RoundArrowButton/RoundArrowButton';
import CancelSignupSheet from '../../components/CancelSignupSheet/CancelSignupSheet';
import useCancelAccountPasswordGuard from '../../hooks/useCancelAccountPasswordGuard';
import routes from '../../routes/routes';
import { AccountFlow, useAccountFlow } from '../../context/AccountFlowContext';
import { useTheme } from '../../context/ThemeContext';
import styles from './ChangePassword.styles';

const MIN_PASSWORD_LENGTH = 8;
// bcrypt ignores anything past 72 bytes; must match user.validator.js.
const MAX_PASSWORD_BYTES = 72;

// Step 3 of changing the password, once the emailed code is confirmed: the
// new password. The confirm screen after it sends it to the server.
export default function ChangePassword({ navigation }) {
  const { accountData, setNewPassword } = useAccountFlow();
  const { colors } = useTheme();
  const cancelGuard = useCancelAccountPasswordGuard(navigation);
  const { flow, reauthToken, changeToken } = accountData;
  const canAccessStep =
    flow === AccountFlow.Password && Boolean(reauthToken) && Boolean(changeToken);

  const [password, setPassword] = useState(accountData?.newPassword ?? '');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Only while on top: when the confirm screen finishes it clears the flow
    // while this screen is still in the stack, and that must not redirect.
    if (!canAccessStep && navigation.isFocused()) {
      navigation.popTo(routes.Settings);
    }
  }, [canAccessStep, navigation]);

  const isPasswordLongEnough = password.length >= MIN_PASSWORD_LENGTH;
  // Must match the server rule in user.validator.js.
  const hasLetter = /[A-Za-z]/.test(password);
  // Bytes, not characters: an emoji counts as up to 4.
  const isPasswordShortEnough = new TextEncoder().encode(password).length <= MAX_PASSWORD_BYTES;
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

    setNewPassword({ newPassword: password });
    navigation.navigate(routes.ChangePasswordConfirm);
  };

  if (!canAccessStep) {
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
      circleColor={colors?.yellow}
      onBack={cancelGuard.onBack}
      footer={
        <RoundArrowButton
          onPress={handleArrowPress}
          active={isFormValid}
          accessibilityLabel="Next step"
        />
      }
    >
      <AuthHeading step="Step 3 of 4" title={'Set a new\npassword'}>
        Choose a new password for your account.
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
          onSubmitEditing={handleArrowPress}
          submitBehavior="submit"
          autoFocus
        />
      </View>

      <CancelSignupSheet {...cancelGuard.sheetProps} />
    </AuthLayout>
  );
}
