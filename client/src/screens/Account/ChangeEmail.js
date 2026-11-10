import React, { useEffect, useState } from 'react';
import AuthLayout, { AuthHeading } from '../../components/AuthLayout/AuthLayout';
import TextField from '../../components/TextField/TextField';
import RoundArrowButton from '../../components/RoundArrowButton/RoundArrowButton';
import routes from '../../routes/routes';
import { AccountFlow, useAccountFlow } from '../../context/AccountFlowContext';
import { OTP_RESEND_COOLDOWN_SECONDS, OTP_VALID_MS } from '../../context/SignupFlowContext';
import { useTheme } from '../../context/ThemeContext';
import { sendEmailChangeOtp } from '../../api/account.api';
import { formatRetryAfter } from '../../utils/formatRetryAfter';
import { ERROR_CODES } from '../../constants/errorCodes';
import { exitToSettings, isReauthRequired } from './accountFlowErrors';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Step 2 of changing the email: the new address, which gets the code.
export default function ChangeEmail({ navigation }) {
  const { accountData, markOtpSent, resetAccountFlow } = useAccountFlow();
  const { colors } = useTheme();
  const { reauthToken, newEmail: sentEmail, otpSentAt } = accountData;
  const canAccessStep = accountData.flow === AccountFlow.Email && Boolean(reauthToken);

  const [email, setEmail] = useState(sentEmail);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!canAccessStep) {
      navigation.replace(routes.AccountPassword, { flow: AccountFlow.Email });
    }
  }, [canAccessStep, navigation]);

  const isEmailValid = EMAIL_REGEX.test(email.trim());

  const handleEmailChange = (text) => {
    setEmail(text);
    if (error) {
      setError('');
    }
  };

  const handleArrowPress = async () => {
    if (!isEmailValid) {
      setError('Please enter a valid email address.');
      return;
    }

    if (isSubmitting) {
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();

    // A code already sent to this address is still valid, so don't ask for
    // another (the server would reject it within its 30s cooldown anyway).
    const hasValidCode =
      Boolean(otpSentAt) && sentEmail === trimmedEmail && Date.now() - otpSentAt < OTP_VALID_MS;
    if (hasValidCode) {
      setError('');
      navigation.navigate(routes.AccountOtp, { alreadySent: true });
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await sendEmailChangeOtp({ reauthToken, newEmail: trimmedEmail });
      markOtpSent({ newEmail: trimmedEmail });
      navigation.navigate(routes.AccountOtp);
    } catch (err) {
      const { status, data } = err?.response || {};
      if (isReauthRequired(err)) {
        exitToSettings(navigation, resetAccountFlow, data.message);
      } else if (status === 429 && data?.code === ERROR_CODES.OTP_COOLDOWN) {
        const retryAfter = data.retryAfter ?? OTP_RESEND_COOLDOWN_SECONDS;
        markOtpSent({
          newEmail: trimmedEmail,
          otpSentAt: Date.now() - (OTP_RESEND_COOLDOWN_SECONDS - retryAfter) * 1000,
        });
        navigation.navigate(routes.AccountOtp, { alreadySent: true });
      } else if (status === 429) {
        setError(`Too many requests. Please try again ${formatRetryAfter(data?.retryAfter)}.`);
      } else if (status === 400 || status === 409) {
        // "Email is already in use" / "This is already your email".
        setError(data?.message ? `${data.message}.` : 'Please use a different email.');
      } else {
        setError('Failed to send the code. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canAccessStep) {
    return null;
  }

  return (
    <AuthLayout
      circleColor={colors?.cyan}
      onBack={() => navigation?.goBack?.()}
      footer={
        <RoundArrowButton
          onPress={handleArrowPress}
          active={isEmailValid}
          loading={isSubmitting}
          accessibilityLabel="Send code"
        />
      }
    >
      <AuthHeading step="Step 2 of 3" title={'Your new\nemail'}>
        We'll send a code to this address to make sure it's yours.
      </AuthHeading>

      <TextField
        label="New Email Address"
        required
        error={error}
        floatingError
        value={email}
        onChangeText={handleEmailChange}
        placeholder="Enter your new email address"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        textContentType="emailAddress"
        returnKeyType="done"
        onSubmitEditing={handleArrowPress}
        autoFocus
      />
    </AuthLayout>
  );
}
