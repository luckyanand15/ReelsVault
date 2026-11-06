import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import AuthLayout, { AuthHeading } from '../../components/AuthLayout/AuthLayout';
import TextField from '../../components/TextField/TextField';
import RoundArrowButton from '../../components/RoundArrowButton/RoundArrowButton';
import routes from '../../routes/routes';
import { AccountFlow, useAccountFlow } from '../../context/AccountFlowContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { changePassword } from '../../api/account.api';
import { ERROR_CODES } from '../../constants/errorCodes';
import { exitToSettings, isReauthRequired } from './accountFlowErrors';
import styles from './ChangePassword.styles';

// Step 4 of changing the password: re-enter the new one, then save it.
export default function ChangePasswordConfirm({ navigation }) {
  const { accountData, resetAccountFlow } = useAccountFlow();
  const { replaceTokens } = useAuth();
  const { colors } = useTheme();
  const { flow, reauthToken, changeToken, newPassword } = accountData;
  const canAccessStep =
    flow === AccountFlow.Password &&
    Boolean(reauthToken) &&
    Boolean(changeToken) &&
    Boolean(newPassword);

  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set before this screen clears the flow on its way out, so the guard
  // below doesn't also try to redirect (and the cleared password doesn't
  // flash "Passwords do not match." while it animates out).
  const isLeavingRef = useRef(false);

  useEffect(() => {
    if (!canAccessStep && !isLeavingRef.current) {
      navigation.popTo(routes.Settings);
    }
  }, [canAccessStep, navigation]);

  const doPasswordsMatch = isLeavingRef.current || newPassword === confirmPassword;
  // Only the look of the arrow: it stays pressable so pressing it shows the
  // reason, instead of a disabled button with no explanation.
  const isFormValid = confirmPassword.length > 0 && doPasswordsMatch;

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
      const tokens = await changePassword({
        reauthToken,
        changeToken,
        password: newPassword,
        confirmPassword,
      });
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

  if (!canAccessStep && !isLeavingRef.current) {
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
      circleColor={colors?.yellow}
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
      <AuthHeading step="Step 4 of 4" title={'Confirm new\npassword'}>
        You'll stay logged in here. Your other devices will be logged out.
      </AuthHeading>

      <View style={styles?.fields}>
        <TextField
          label="Confirm New Password"
          required
          labelAccessory={showHideToggle}
          error={error || (showMismatch ? 'Passwords do not match.' : '')}
          floatingError
          value={confirmPassword}
          onChangeText={handleConfirmChange}
          placeholder="Re-enter your new password"
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="newPassword"
          returnKeyType="done"
          onSubmitEditing={handleArrowPress}
          submitBehavior="submit"
          autoFocus
        />
      </View>
    </AuthLayout>
  );
}
