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
import { useForgotPasswordFlow } from '../../context/ForgotPasswordFlowContext';
import {
  OTP_RESEND_COOLDOWN_SECONDS,
  OTP_VALID_MS,
} from '../../context/SignupFlowContext';
import { requestPasswordReset } from '../../api/auth.api';
import { formatRetryAfter } from '../../utils/formatRetryAfter';
import styles from './ForgotPasswordEmail.styles';

export default function ForgotPasswordEmail({ navigation, route }) {
  const { continueWithEmail, forgotPasswordData } = useForgotPasswordFlow();

  // Prefilled with the address from the login screen, if there was one.
  const [email, setEmail] = useState(route?.params?.email ?? '');
  const [emailFocused, setEmailFocused] = useState(false);
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
      if (status === 429 && data?.code === 'OTP_COOLDOWN') {
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
              <Text style={styles?.stepIndicator}>Step 1 of 3</Text>
              <Text style={styles?.title}>Forgot your password?</Text>
              <Text style={styles?.subtitle}>
                Enter the email address for your account and we'll send you a code to reset it.
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
                accessibilityLabel="Send reset code"
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
