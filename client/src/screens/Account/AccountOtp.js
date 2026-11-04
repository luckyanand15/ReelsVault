import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/Header/Header';
import routes from '../../routes/routes';
import { AccountFlow, useAccountFlow } from '../../context/AccountFlowContext';
import { OTP_RESEND_COOLDOWN_SECONDS as RESEND_COOLDOWN_SECONDS } from '../../context/SignupFlowContext';
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

  if (!canAccessStep) {
    return null;
  }

  const sentTo = isEmailFlow ? newEmail : 'your current email';

  return (
    <SafeAreaView style={styles?.safeArea} edges={['top', 'left', 'right']}>
      <Header onLeftPress={() => navigation?.goBack?.()} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles?.keyboardAvoidingView}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles?.container}>
            <View style={styles?.headerContent}>
              <Text style={styles?.stepIndicator}>
                {isEmailFlow ? 'Step 3 of 3' : 'Step 2 of 3'}
              </Text>
              <Text style={styles?.title}>Enter the code</Text>
              <Text style={styles?.subtitle}>
                {alreadySent ? 'We already sent a 6-digit code to' : "We've sent a 6-digit code to"}{' '}
                <Text style={styles?.emailHighlight}>{sentTo}</Text>
                {alreadySent ? '. It is still valid, so you can use it below.' : '.'}
              </Text>
            </View>

            <View style={styles?.form}>
              <View style={styles?.otpContainer}>
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => (inputRefs.current[index] = ref)}
                    style={[
                      styles?.otpBox,
                      focusedIndex === index && styles?.otpBoxFocused,
                      !!error && styles?.otpBoxError,
                    ]}
                    value={digit}
                    onChangeText={(text) => handleChangeText(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    onFocus={() => setFocusedIndex(index)}
                    onBlur={() => setFocusedIndex(null)}
                    keyboardType="number-pad"
                    maxLength={6}
                    selectTextOnFocus
                    autoFocus={index === 0}
                  />
                ))}
              </View>

              {isVerifying && <ActivityIndicator />}

              {error ? <Text style={styles?.errorText}>{error}</Text> : null}

              <TouchableOpacity
                onPress={handleResend}
                disabled={resendCooldown > 0 || isResending}
                activeOpacity={0.7}
              >
                <Text style={styles?.hintText}>
                  {isResending
                    ? 'Sending...'
                    : resendCooldown > 0
                    ? `Resend code in ${resendCooldown}s`
                    : "Didn't receive the code? Resend"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
