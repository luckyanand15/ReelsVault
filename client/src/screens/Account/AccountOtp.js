import React, { useEffect, useRef, useState } from 'react';
import { Text } from 'react-native';
import AuthLayout, { AuthHeading } from '../../components/AuthLayout/AuthLayout';
import OtpCodeField from '../../components/OtpCodeField/OtpCodeField';
// import RoundArrowButton from '../../components/RoundArrowButton/RoundArrowButton';
import routes from '../../routes/routes';
import { AccountFlow, useAccountFlow } from '../../context/AccountFlowContext';
import { OTP_RESEND_COOLDOWN_SECONDS as RESEND_COOLDOWN_SECONDS } from '../../context/SignupFlowContext';
import { useTheme } from '../../context/ThemeContext';
import {
  confirmEmailChange,
  sendEmailChangeOtp,
  sendPasswordChangeOtp,
  verifyPasswordChangeOtp,
} from '../../api/account.api';
import { formatRetryAfter } from '../../utils/formatRetryAfter';
import { ERROR_CODES } from '../../constants/errorCodes';
import { exitToSettings, isReauthRequired } from './accountFlowErrors';
import styles from './AccountOtp.styles';

const EMPTY_OTP = ['', '', '', '', '', ''];

// The code step of both flows. Email: the code went to the new address and
// confirming it switches the email. Password: the code went to the current
// address and confirming it leads on to the new password.
export default function AccountOtp({ navigation, route }) {
  // Set when we came here without sending a new code, because one sent
  // earlier is still valid.
  const alreadySent = Boolean(route?.params?.alreadySent);
  const { accountData, confirmPasswordOtp, markOtpSent, resetAccountFlow } = useAccountFlow();
  const { colors } = useTheme();
  const { flow, reauthToken, newEmail, otpSentAt } = accountData;
  const isEmailFlow = flow === AccountFlow.Email;
  const canAccessStep =
    Boolean(reauthToken) && (flow === AccountFlow.Password || (isEmailFlow && Boolean(newEmail)));

  const [otp, setOtp] = useState(EMPTY_OTP);
  const [focusedIndex, setFocusedIndex] = useState(null);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  // Count down from when the code was actually sent, not from when this
  // screen opened.
  const [resendCooldown, setResendCooldown] = useState(() => {
    if (!otpSentAt) {
      return RESEND_COOLDOWN_SECONDS;
    }
    const elapsedSeconds = Math.floor((Date.now() - otpSentAt) / 1000);
    return Math.max(RESEND_COOLDOWN_SECONDS - elapsedSeconds, 0);
  });

  const inputRefs = useRef([]);
  // Set before this screen clears the flow on its way out, so the guard
  // below doesn't also try to redirect.
  const isLeavingRef = useRef(false);

  useEffect(() => {
    if (!canAccessStep && !isLeavingRef.current) {
      navigation.popTo(routes.Settings);
    }
  }, [canAccessStep, navigation]);

  useEffect(() => {
    if (resendCooldown <= 0) {
      return undefined;
    }

    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  const leave = (notice) => {
    isLeavingRef.current = true;
    exitToSettings(navigation, resetAccountFlow, notice);
  };

  const handleVerify = async (code) => {
    if (isVerifying) {
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      if (isEmailFlow) {
        const user = await confirmEmailChange({ reauthToken, newEmail, code });
        leave(`Your email has been changed to ${user?.email ?? newEmail}.`);
      } else {
        const changeToken = await verifyPasswordChangeOtp({ reauthToken, code });
        confirmPasswordOtp({ changeToken });
        navigation.navigate(routes.ChangePassword);
      }
    } catch (err) {
      const { status, data } = err?.response || {};
      if (isReauthRequired(err)) {
        leave(data.message);
      } else if (status === 429) {
        setError(`Too many attempts. Please try again ${formatRetryAfter(data?.retryAfter)}.`);
      } else if ((status === 400 || status === 409) && data?.message) {
        // e.g. "Invalid OTP code.", "OTP has expired...", or the new email
        // being taken by someone who signed up meanwhile.
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

  const handleChangeText = (text, index) => {
    const cleanedText = text.replace(/[^0-9]/g, '');
    const newOtp = [...otp];

    if (cleanedText.length > 1) {
      // Pasted a whole code.
      const digits = cleanedText.slice(0, 6).split('');
      for (let i = 0; i < 6; i++) {
        newOtp[i] = digits[i] || '';
      }
      setOtp(newOtp);
      inputRefs.current[Math.min(digits.length, 5)]?.focus();
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

  const handleResend = async () => {
    if (resendCooldown > 0 || isResending) {
      return;
    }

    setIsResending(true);
    setError('');

    try {
      if (isEmailFlow) {
        await sendEmailChangeOtp({ reauthToken, newEmail });
      } else {
        await sendPasswordChangeOtp({ reauthToken });
      }
      markOtpSent();
      navigation.setParams({ alreadySent: false });
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      setOtp(EMPTY_OTP);
      inputRefs.current[0]?.focus();
    } catch (err) {
      const { status, data } = err?.response || {};
      if (isReauthRequired(err)) {
        leave(data.message);
      } else if (status === 429 && data?.code === ERROR_CODES.OTP_COOLDOWN) {
        // Our timer drifted from the server's; resync to its remaining wait.
        setResendCooldown(data.retryAfter ?? RESEND_COOLDOWN_SECONDS);
      } else if (status === 429) {
        setError(`Too many requests. Please try again ${formatRetryAfter(data?.retryAfter)}.`);
      } else if (status === 409 && data?.message) {
        setError(data.message);
      } else {
        setError('Failed to resend code. Please try again.');
      }
    } finally {
      setIsResending(false);
    }
  };

  // The code verifies itself on the sixth digit; the arrow retries it, or
  // says what's missing.
  // const handleArrowPress = () => {
    // const code = otp.join('');
    // if (code.length < 6) {
      // setError('Enter the 6-digit code.');
      // return;
    // }
    // handleVerify(code);
  // };

  if (!canAccessStep) {
    return null;
  }

  const sentTo = isEmailFlow ? newEmail : 'your current email';

  return (
    <AuthLayout
      // Matches the Settings row: email cyan, password yellow.
      circleColor={isEmailFlow ? colors?.cyan : colors?.yellow}
      onBack={() => navigation?.goBack?.()}
      // Arrow hidden: the code verifies and moves on by itself on the 6th
      // digit. Uncomment (with handleArrowPress and the import) to bring it back.
      // footer={
        // <RoundArrowButton
          // onPress={handleArrowPress}
          // active={otp.join('').length === 6}
          // loading={isVerifying}
          // accessibilityLabel="Verify code"
        // />
      // }
    >
      <AuthHeading
        step={isEmailFlow ? 'Step 3 of 3' : 'Step 2 of 3'}
        title={'Enter the\ncode'}
      >
        {alreadySent ? 'We already sent a 6-digit code to' : "We've sent a 6-digit code to"}{' '}
        <Text style={[styles?.emailHighlight, { color: colors?.fg }]}>{sentTo}</Text>
        {alreadySent ? '. It is still valid, so you can use it below.' : '.'}
      </AuthHeading>

      <OtpCodeField
        digits={otp}
        inputRefs={inputRefs}
        focusedIndex={focusedIndex}
        onFocusIndex={setFocusedIndex}
        onChangeDigit={handleChangeText}
        onKeyPress={handleKeyPress}
        error={error}
        verifying={isVerifying}
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
