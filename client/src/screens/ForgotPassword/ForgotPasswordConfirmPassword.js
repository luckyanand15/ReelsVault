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

export default function ForgotPasswordConfirmPassword({ navigation }) {
  const { canAccessStep, forgotPasswordData, resetForgotPasswordFlow } =
    useForgotPasswordFlow();
  const { resetLoginFlow } = useLoginFlow();
  const { colors } = useTheme();
  const { email, resetToken, password } = forgotPasswordData;
  const canAccessConfirmStep =
    canAccessStep(ForgotPasswordStep.ConfirmPassword) &&
    Boolean(email) &&
    Boolean(resetToken) &&
    Boolean(password);

  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set before this screen clears the flow on its way out, so the guard
  // below doesn't also try to redirect (and the cleared password doesn't
  // flash "Passwords do not match." while it animates out).
  const isLeavingRef = useRef(false);

  useEffect(() => {
    if (!canAccessConfirmStep && !isLeavingRef.current) {
      navigation.replace(routes.ForgotPasswordEmail);
    }
  }, [canAccessConfirmStep, navigation]);

  const doPasswordsMatch = isLeavingRef.current || password === confirmPassword;
  // Only the look of the arrow: it stays pressable so pressing it shows the
  // reason, instead of a disabled button with no explanation.
  const isFormValid = confirmPassword.length > 0 && doPasswordsMatch;

  const handleConfirmChange = (text) => {
    setConfirmPassword(text);
    if (error) {
      setError('');
    }
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
        setError(data?.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canAccessConfirmStep && !isLeavingRef.current) {
    return null;
  }

  const showMismatch = confirmPassword.length > 0 && !doPasswordsMatch;

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
          loading={isSubmitting}
          accessibilityLabel="Change password"
        />
      }
    >
      <AuthHeading step="Step 4 of 4" title={'Confirm new\npassword'}>
        You'll be logged out on all your devices and can log in again with this password.
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
          autoFocus
          onSubmitEditing={handleArrowPress}
          submitBehavior="submit"
        />
      </View>
    </AuthLayout>
  );
}
