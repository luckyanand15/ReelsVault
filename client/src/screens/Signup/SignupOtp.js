import React, { useEffect, useRef, useState } from 'react';
import { Text } from 'react-native';
import AuthLayout, { AuthHeading } from '../../components/AuthLayout/AuthLayout';
import OtpCodeField from '../../components/OtpCodeField/OtpCodeField';
import RoundArrowButton from '../../components/RoundArrowButton/RoundArrowButton';
import routes from '../../routes/routes';
import {
  OTP_RESEND_COOLDOWN_SECONDS as RESEND_COOLDOWN_SECONDS,
  SignupStep,
  useSignupFlow,
} from '../../context/SignupFlowContext';
import { useTheme } from '../../context/ThemeContext';
import { sendOtp, verifyOtp } from '../../api/otp.api';
import { formatRetryAfter } from '../../utils/formatRetryAfter';
import { ERROR_CODES } from '../../constants/errorCodes';
import styles from './SignupOtp.styles';

export default function SignupOtp({ navigation, route }) {
  // Set when we came here without sending a new code, because one sent
  // earlier to this address is still valid.
  const alreadySent = Boolean(route?.params?.alreadySent);
  const { canAccessStep, confirmEmailVerification, markOtpResent, signupData } =
    useSignupFlow();
  const { colors } = useTheme();
  const { email, otpSentAt } = signupData;
  const canAccessOtpStep = canAccessStep(SignupStep.Otp) && Boolean(email);

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [focusedIndex, setFocusedIndex] = useState(null);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  // Count down from when the code was actually sent, not from when this
  // screen opened: coming back here after going back to the email screen
  // shouldn't restart the full wait.
  const [resendCooldown, setResendCooldown] = useState(() => {
    if (!otpSentAt) {
      return RESEND_COOLDOWN_SECONDS;
    }
    const elapsedSeconds = Math.floor((Date.now() - otpSentAt) / 1000);
    return Math.max(RESEND_COOLDOWN_SECONDS - elapsedSeconds, 0);
  });

  const inputRefs = useRef([]);

  useEffect(() => {
    if (!canAccessOtpStep) {
      navigation.replace(routes.Signup);
    }
  }, [canAccessOtpStep, navigation]);

  useEffect(() => {
    if (resendCooldown <= 0) {
      return undefined;
    }

    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleChangeText = (text, index) => {
    const cleanedText = text.replace(/[^0-9]/g, '');

    const newOtp = [...otp];

    if (cleanedText.length > 1) {
      // Handle pasting a 6-digit code
      const digits = cleanedText.slice(0, 6).split('');
      for (let i = 0; i < 6; i++) {
        newOtp[i] = digits[i] || '';
      }
      setOtp(newOtp);
      const nextFocus = Math.min(digits.length, 5);
      inputRefs.current[nextFocus]?.focus();
    } else {
      newOtp[index] = cleanedText;
      setOtp(newOtp);

      if (cleanedText && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }

    if (error) {
      setError('');
    }

    const code = newOtp.join('');
    if (code.length === 6) {
      handleVerify(code);
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (code) => {
    if (isVerifying) {
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const verifyResult = await verifyOtp(email, code);
      const verificationToken = verifyResult?.data?.verificationToken;
      confirmEmailVerification({ verificationToken });
      navigation.navigate(routes.SignupPassword);
    } catch (err) {
      const { status, data } = err?.response || {};
      if (status === 429) {
        setError(`Too many attempts. Please try again ${formatRetryAfter(data?.retryAfter)}.`);
      } else if (status === 400 && data?.message) {
        // The server's message says what to do next, e.g. "Too many incorrect
        // attempts. Please request a new code." or "OTP has expired...".
        setError(data.message);
      } else if (err?.response) {
        setError('Invalid OTP code.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || isResending) {
      return;
    }

    setIsResending(true);
    setError('');

    try {
      await sendOtp(email);
      markOtpResent();
      navigation.setParams({ alreadySent: false });
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      const { status, data } = err?.response || {};
      if (status === 429 && data?.code === ERROR_CODES.OTP_COOLDOWN) {
        // Our timer drifted from the server's; resync to its remaining wait.
        // The countdown on the button already tells the user what to do.
        setResendCooldown(data.retryAfter ?? RESEND_COOLDOWN_SECONDS);
      } else if (status === 429) {
        setError(`Too many requests. Please try again ${formatRetryAfter(data?.retryAfter)}.`);
      } else {
        setError('Failed to resend code. Please try again.');
      }
    } finally {
      setIsResending(false);
    }
  };

  // The code verifies itself on the sixth digit; the arrow retries it, or
  // says what's missing.
  const handleArrowPress = () => {
    const code = otp.join('');
    if (code.length < 6) {
      setError('Enter the 6-digit code.');
      return;
    }
    handleVerify(code);
  };

  if (!canAccessOtpStep) {
    return null;
  }

  return (
    <AuthLayout
      circleColor={colors?.cyan}
      onBack={() => navigation?.goBack?.()}
      footer={
        <RoundArrowButton
          onPress={handleArrowPress}
          active={otp.join('').length === 6}
          loading={isVerifying}
          accessibilityLabel="Verify code"
        />
      }
    >
      <AuthHeading step="Step 4 of 5" title={'Enter verification\ncode'}>
        {alreadySent ? 'We already sent a 6-digit code to' : 'We sent a 6-digit code to'}{' '}
        <Text style={[styles?.emailHighlight, { color: colors?.fg }]}>
          {email || 'your email'}
        </Text>
        {alreadySent ? '. It is still valid, so you can use it below.' : ''}
      </AuthHeading>

      <OtpCodeField
        digits={otp}
        inputRefs={inputRefs}
        focusedIndex={focusedIndex}
        onFocusIndex={setFocusedIndex}
        onChangeDigit={handleChangeText}
        onKeyPress={handleKeyPress}
        error={error}
        resend={{
          canResend: resendCooldown <= 0 && !isResending,
          isResending,
          cooldown: resendCooldown,
          onPress: handleResend,
        }}
      />
    </AuthLayout>
  );
}
