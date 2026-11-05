import React, { useState } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import AuthLayout, { AuthHeading } from '../../components/AuthLayout/AuthLayout';
import TextField from '../../components/TextField/TextField';
import RoundArrowButton from '../../components/RoundArrowButton/RoundArrowButton';
import routes from '../../routes/routes';
import { AccountFlow, useAccountFlow } from '../../context/AccountFlowContext';
import { OTP_RESEND_COOLDOWN_SECONDS } from '../../context/SignupFlowContext';
import { useTheme } from '../../context/ThemeContext';
import { reauthenticate, sendPasswordChangeOtp } from '../../api/account.api';
import { formatRetryAfter } from '../../utils/formatRetryAfter';
import { ERROR_CODES } from '../../constants/errorCodes';
import styles from './AccountPassword.styles';

// Step 1 of both the email and the password change: the current password.
export default function AccountPassword({ navigation, route }) {
  const flow = route?.params?.flow === AccountFlow.Password ? AccountFlow.Password : AccountFlow.Email;
  const isPasswordFlow = flow === AccountFlow.Password;
  const { startAccountFlow, markOtpSent } = useAccountFlow();
  const { colors } = useTheme();

  const [password, setPassword] = useState('');
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
      // Matches the Settings row: password yellow, email cyan.
      circleColor={isPasswordFlow ? colors?.yellow : colors?.cyan}
      onBack={() => navigation?.goBack?.()}
      footer={
        <RoundArrowButton
          onPress={handleArrowPress}
          active={isFormValid}
          loading={isSubmitting}
          accessibilityLabel="Continue"
        />
      }
    >
      <AuthHeading step="Step 1 of 3" title={'Enter your\npassword'}>
        {isPasswordFlow
          ? "Confirm your current password. We'll then email you a code."
          : 'Confirm your current password before changing your email.'}
      </AuthHeading>

      <TextField
        label="Current Password"
        required
        error={error}
        labelAccessory={showHideToggle}
        value={password}
        onChangeText={handlePasswordChange}
        placeholder="Enter your current password"
        secureTextEntry={!showPassword}
        autoCapitalize="none"
        autoCorrect={false}
        textContentType="password"
        returnKeyType="done"
        onSubmitEditing={handleArrowPress}
        autoFocus
      />
    </AuthLayout>
  );
}
