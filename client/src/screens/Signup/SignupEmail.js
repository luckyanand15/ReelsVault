import React, { useEffect, useState } from 'react';
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
  OTP_RESEND_COOLDOWN_SECONDS,
  OTP_VALID_MS,
  SignupStep,
  useSignupFlow,
} from '../../context/SignupFlowContext';
import { sendOtp } from '../../api/otp.api';
import { formatRetryAfter } from '../../utils/formatRetryAfter';
import styles from './SignupEmail.styles';

export default function SignupEmail({ navigation }) {
  const { canAccessStep, continueWithEmail, signupData } = useSignupFlow();
  const canAccessEmailStep = canAccessStep(SignupStep.Email);

  const [email, setEmail] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
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
      } else if (status === 429 && data?.code === 'OTP_COOLDOWN') {
        // A code was sent to this address moments ago (e.g. before the app
        // restarted) and is still valid, so carry on rather than block.
        // Backdate otpSentAt so the code screen's resend timer shows the
        // server's remaining wait.
        const retryAfter = data.retryAfter ?? OTP_RESEND_COOLDOWN_SECONDS;
        const otpSentAt = Date.now() - (OTP_RESEND_COOLDOWN_SECONDS - retryAfter) * 1000;
        continueWithEmail({ email: trimmedEmail, otpSentAt });
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
              <Text style={styles?.stepIndicator}>Step 2 of 4</Text>
              <Text style={styles?.title}>What's your email?</Text>
              <Text style={styles?.subtitle}>
                Enter your email address to continue setting up your account.
              </Text>
            </View>

            {/* Input Form */}
            <View style={styles?.form}>
              <View style={styles?.inputGroup}>
                <View style={styles?.labelRow}>
                  <Text style={styles?.label}>
                    Email Address <Text style={styles?.star}>*</Text>
                  </Text>
                </View>
                <TextInput
                  style={[
                    styles?.input,
                    emailFocused && styles?.inputFocused,
                    !!error && styles?.inputError,
                  ]}
                  value={email}
                  onChangeText={handleEmailChange}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  placeholder="Enter your email address"
                  placeholderTextColor="#A3A3A3"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleArrowPress}
                  autoFocus
                />
                {!!error && <Text style={styles?.errorText}>{error}</Text>}
              </View>
            </View>

            {/* Footer with Arrow Button */}
            <View style={styles?.footer}>
              <TouchableOpacity
                style={[
                  styles?.arrowButton,
                  (!isEmailValid || isSubmitting) && styles?.arrowButtonDisabled,
                ]}
                onPress={handleArrowPress}
                disabled={!isEmailValid || isSubmitting}
                activeOpacity={0.8}
                accessibilityLabel="Next step"
                accessibilityState={{ disabled: !isEmailValid || isSubmitting }}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={styles?.arrowIcon?.color} />
                ) : (
                  <Text
                    style={[
                      styles?.arrowIcon,
                      !isEmailValid && styles?.arrowIconDisabled,
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
