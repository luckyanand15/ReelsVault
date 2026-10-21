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
import {
  OTP_RESEND_COOLDOWN_SECONDS as RESEND_COOLDOWN_SECONDS,
  SignupStep,
  useSignupFlow,
} from '../../context/SignupFlowContext';
import { sendOtp, verifyOtp } from '../../api/otp.api';
import { formatRetryAfter } from '../../utils/formatRetryAfter';
import styles from './SignupOtp.styles';

export default function SignupOtp({ navigation, route }) {
  // Set when we came here without sending a new code, because one sent
  // earlier to this address is still valid.
  const alreadySent = Boolean(route?.params?.alreadySent);
  const { canAccessStep, confirmEmailVerification, markOtpResent, signupData } =
    useSignupFlow();
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
      if (status === 429 && data?.code === 'OTP_COOLDOWN') {
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

  if (!canAccessOtpStep) {
    return null;
  }

  return (
    <SafeAreaView style={styles?.safeArea} edges={['top', 'left', 'right']}>
      <Header onLeftPress={() => navigation?.goBack?.()} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles?.keyboardAvoidingView}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles?.container}>
            {/* Header Content */}
            <View style={styles?.headerContent}>
              <Text style={styles?.stepIndicator}>Step 3 of 4</Text>
              <Text style={styles?.title}>Enter verification code</Text>
              <Text style={styles?.subtitle}>
                {alreadySent ? 'We already sent a 6-digit code to' : 'We sent a 6-digit code to'}{' '}
                <Text style={styles?.emailHighlight}>
                  {email || 'your email'}
                </Text>
                {alreadySent ? '. It is still valid, so you can use it below.' : ''}
              </Text>
            </View>

            {/* OTP Input Form */}
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
