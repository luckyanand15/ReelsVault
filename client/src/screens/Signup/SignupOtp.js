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
import { SignupStep, useSignupFlow } from '../../context/SignupFlowContext';
import { sendOtp, verifyOtp } from '../../api/otp.api';
import { createUser } from '../../api/user.api';
import styles from './SignupOtp.styles';

const RESEND_COOLDOWN_SECONDS = 30;

export default function SignupOtp({ navigation }) {
  const { canAccessStep, confirmEmailVerification, signupData } = useSignupFlow();
  const { email, firstName, lastName } = signupData;
  const canAccessOtpStep = canAccessStep(SignupStep.Otp) && Boolean(email);

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [focusedIndex, setFocusedIndex] = useState(null);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN_SECONDS);

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

  const fullOtp = otp.join('');
  const isOtpComplete = fullOtp.length === 6;

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
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleArrowPress = async () => {
    if (!isOtpComplete) {
      setError('Please enter all 6 digits.');
      return;
    }

    if (isVerifying) {
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const verifyResult = await verifyOtp(email, fullOtp);
      const verificationToken = verifyResult?.data?.verificationToken;
      const user = await createUser({ firstName, lastName, email, verificationToken });
      confirmEmailVerification({ userId: user?.id });
      navigation.navigate(routes.SignupPin);
    } catch (err) {
      if (err?.response?.status === 409) {
        setError('This email is already registered.');
      } else {
        setError(
          err?.response?.data?.message || 'Something went wrong. Please try again.',
        );
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
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      if (err?.response?.status === 429) {
        setError('Too many requests. Please wait a moment and try again.');
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
              <Text style={styles?.stepIndicator}>Step 3 of 3</Text>
              <Text style={styles?.title}>Enter verification code</Text>
              <Text style={styles?.subtitle}>
                We sent a 6-digit code to{' '}
                <Text style={styles?.emailHighlight}>
                  {email || 'your email'}
                </Text>
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
                  />
                ))}
              </View>

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

            {/* Footer with Arrow Button */}
            <View style={styles?.footer}>
              <TouchableOpacity
                style={[
                  styles?.arrowButton,
                  (!isOtpComplete || isVerifying) && styles?.arrowButtonDisabled,
                ]}
                onPress={handleArrowPress}
                disabled={!isOtpComplete || isVerifying}
                activeOpacity={0.8}
                accessibilityLabel="Verify OTP"
                accessibilityState={{ disabled: !isOtpComplete || isVerifying }}
              >
                {isVerifying ? (
                  <ActivityIndicator color={styles?.arrowIcon?.color} />
                ) : (
                  <Text
                    style={[
                      styles?.arrowIcon,
                      !isOtpComplete && styles?.arrowIconDisabled,
                    ]}
                  >
                    ➔
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
