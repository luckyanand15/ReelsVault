import React, { useEffect, useState } from 'react';
import AuthLayout, { AuthHeading } from '../../components/AuthLayout/AuthLayout';
import TextField from '../../components/TextField/TextField';
import RoundArrowButton from '../../components/RoundArrowButton/RoundArrowButton';
import routes from '../../routes/routes';
import { useForgotPasswordFlow } from '../../context/ForgotPasswordFlowContext';
import {
  OTP_RESEND_COOLDOWN_SECONDS,
  OTP_VALID_MS,
} from '../../context/SignupFlowContext';
import { requestPasswordReset } from '../../api/auth.api';
import { formatRetryAfter } from '../../utils/formatRetryAfter';
import { ERROR_CODES } from '../../constants/errorCodes';

export default function ForgotPasswordEmail({ navigation, route }) {
  const { continueWithEmail, forgotPasswordData } = useForgotPasswordFlow();

  // Prefilled with the address from the login screen, if there was one.
  const [email, setEmail] = useState(route?.params?.email ?? '');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set when a later step sends the user back here, e.g. because the
  // verified code expired before the new password was saved.
  const notice = route?.params?.notice;
  useEffect(() => {
    if (notice) {
      setError(notice);
    }
  }, [notice]);

  const validateEmail = (text) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(text.trim());
  };

  const isEmailValid = validateEmail(email);

  const handleEmailChange = (text) => {
    setEmail(text);
    if (error && validateEmail(text)) {
      setError('');
    }
  };

  const handleArrowPress = async () => {
    if (!email.trim()) {
      setError('Email address is required.');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (isSubmitting) {
      return;
    }

    const trimmedEmail = email.trim();

    // A code already sent to this address is still valid, so don't ask for
    // another (the server would reject it within its 30s cooldown anyway).
    const { email: sentEmail, otpSentAt } = forgotPasswordData;
    const hasValidCode =
      Boolean(otpSentAt) &&
      sentEmail.toLowerCase() === trimmedEmail.toLowerCase() &&
      Date.now() - otpSentAt < OTP_VALID_MS;

    if (hasValidCode) {
      setError('');
      continueWithEmail({ email: trimmedEmail, otpSentAt });
      navigation.navigate(routes.ForgotPasswordOtp, { alreadySent: true });
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // The server answers the same way whether or not the email has an
      // account, so always carry on to the code screen.
      await requestPasswordReset(trimmedEmail);
      continueWithEmail({ email: trimmedEmail, otpSentAt: Date.now() });
      navigation.navigate(routes.ForgotPasswordOtp);
    } catch (err) {
      const { status, data } = err?.response || {};
      if (status === 429 && data?.code === ERROR_CODES.OTP_COOLDOWN) {
        // A code was sent moments ago and is still valid, so carry on.
        // Backdate otpSentAt so the resend timer shows the server's wait.
        const retryAfter = data.retryAfter ?? OTP_RESEND_COOLDOWN_SECONDS;
        const backdatedSentAt = Date.now() - (OTP_RESEND_COOLDOWN_SECONDS - retryAfter) * 1000;
        continueWithEmail({ email: trimmedEmail, otpSentAt: backdatedSentAt });
        navigation.navigate(routes.ForgotPasswordOtp, { alreadySent: true });
      } else if (status === 429) {
        setError(`Too many requests. Please try again ${formatRetryAfter(data?.retryAfter)}.`);
      } else {
        setError('Failed to send reset code. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      onBack={() => navigation?.goBack?.()}
      footer={
        <RoundArrowButton
          onPress={handleArrowPress}
          active={isEmailValid}
          loading={isSubmitting}
          accessibilityLabel="Send reset code"
        />
      }
    >
      <AuthHeading step="Step 1 of 4" title={'Forgot your\npassword?'}>
        Enter the email address for your account and we'll send you a code to reset it.
      </AuthHeading>

      <TextField
        label="Email Address"
        required
        error={error}
        floatingError
        value={email}
        onChangeText={handleEmailChange}
        placeholder="Enter your email address"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="done"
        onSubmitEditing={handleArrowPress}
        autoFocus
      />
    </AuthLayout>
  );
}
