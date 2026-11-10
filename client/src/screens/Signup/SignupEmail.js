import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import AuthLayout, { AuthHeading } from '../../components/AuthLayout/AuthLayout';
import TextField from '../../components/TextField/TextField';
import RoundArrowButton from '../../components/RoundArrowButton/RoundArrowButton';
import routes from '../../routes/routes';
import {
  OTP_RESEND_COOLDOWN_SECONDS,
  OTP_VALID_MS,
  SignupStep,
  useSignupFlow,
} from '../../context/SignupFlowContext';
import { useTheme } from '../../context/ThemeContext';
import { sendOtp } from '../../api/otp.api';
import { formatRetryAfter } from '../../utils/formatRetryAfter';
import { ERROR_CODES } from '../../constants/errorCodes';
import styles from './Signup.styles';

export default function SignupEmail({ navigation }) {
  const { canAccessStep, continueWithEmail, signupData } = useSignupFlow();
  const { colors } = useTheme();
  const canAccessEmailStep = canAccessStep(SignupStep.Email);

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!canAccessEmailStep) {
      navigation.replace(routes.Signup);
    }
  }, [canAccessEmailStep, navigation]);

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

    // A code already sent to this address is still in the user's inbox and
    // still valid, so don't send another (the server would reject it within
    // its 30s cooldown anyway). The server lowercases emails, so compare that way.
    const { email: sentEmail, otpSentAt } = signupData;
    const hasValidCode =
      Boolean(otpSentAt) &&
      sentEmail.toLowerCase() === trimmedEmail.toLowerCase() &&
      Date.now() - otpSentAt < OTP_VALID_MS;

    if (hasValidCode) {
      setError('');
      continueWithEmail({ email: trimmedEmail, otpSentAt });
      navigation.navigate(routes.SignupOtp, { alreadySent: true });
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await sendOtp(trimmedEmail);
      continueWithEmail({ email: trimmedEmail, otpSentAt: Date.now() });
      navigation.navigate(routes.SignupOtp);
    } catch (err) {
      const { status, data } = err?.response || {};
      if (status === 409) {
        setError('This email is already registered.');
      } else if (status === 429 && data?.code === ERROR_CODES.OTP_COOLDOWN) {
        // A code was sent to this address moments ago (e.g. before the app
        // restarted) and is still valid, so carry on rather than block.
        // Backdate otpSentAt so the code screen's resend timer shows the
        // server's remaining wait.
        const retryAfter = data.retryAfter ?? OTP_RESEND_COOLDOWN_SECONDS;
        const backdatedSentAt =
          Date.now() - (OTP_RESEND_COOLDOWN_SECONDS - retryAfter) * 1000;
        continueWithEmail({ email: trimmedEmail, otpSentAt: backdatedSentAt });
        navigation.navigate(routes.SignupOtp, { alreadySent: true });
      } else if (status === 429) {
        setError(`Too many requests. Please try again ${formatRetryAfter(data?.retryAfter)}.`);
      } else {
        setError('Failed to send verification code. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canAccessEmailStep) {
    return null;
  }

  return (
    <AuthLayout
      circleColor={colors?.yellow}
      onBack={() => navigation?.goBack?.()}
      footer={
        <RoundArrowButton
          onPress={handleArrowPress}
          active={isEmailValid}
          loading={isSubmitting}
          accessibilityLabel="Next step"
        />
      }
    >
      <AuthHeading step="Step 3 of 6" title={'What\'s your\nemail?'}>
        Enter your email address to continue setting up your account.
      </AuthHeading>

      <View style={styles?.fields}>
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
      </View>
    </AuthLayout>
  );
}
