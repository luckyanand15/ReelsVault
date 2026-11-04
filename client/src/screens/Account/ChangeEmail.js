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
import { AccountFlow, useAccountFlow } from '../../context/AccountFlowContext';
import { OTP_RESEND_COOLDOWN_SECONDS, OTP_VALID_MS } from '../../context/SignupFlowContext';
import { sendEmailChangeOtp } from '../../api/account.api';
import { formatRetryAfter } from '../../utils/formatRetryAfter';
import { ERROR_CODES } from '../../constants/errorCodes';
import { exitToSettings, isReauthRequired } from './accountFlowErrors';
import styles from './ChangeEmail.styles';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Step 2 of changing the email: the new address, which gets the code.
export default function ChangeEmail({ navigation }) {
  const { accountData, markOtpSent, resetAccountFlow } = useAccountFlow();
  const { reauthToken, newEmail: sentEmail, otpSentAt } = accountData;
  const canAccessStep = accountData.flow === AccountFlow.Email && Boolean(reauthToken);

  const [email, setEmail] = useState(sentEmail);
  const [emailFocused, setEmailFocused] = useState(false);
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
    <SafeAreaView style={styles?.safeArea} edges={['top', 'left', 'right']}>
      <Header onLeftPress={() => navigation?.goBack?.()} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles?.keyboardAvoidingView}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles?.container}>
            <View style={styles?.headerContent}>
              <Text style={styles?.stepIndicator}>Step 2 of 3</Text>
              <Text style={styles?.title}>Your new email</Text>
              <Text style={styles?.subtitle}>
                We'll send a code to this address to make sure it's yours.
              </Text>
            </View>

            <View style={styles?.form}>
              <View style={styles?.inputGroup}>
                <View style={styles?.labelRow}>
                  <Text style={styles?.label}>
                    New Email Address <Text style={styles?.star}>*</Text>
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
                  placeholder="Enter your new email address"
                  placeholderTextColor="#A3A3A3"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="emailAddress"
                  returnKeyType="done"
                  onSubmitEditing={handleArrowPress}
                  autoFocus
                />
                {!!error && <Text style={styles?.errorText}>{error}</Text>}
              </View>
            </View>

            <View style={styles?.footer}>
              <TouchableOpacity
                style={[
                  styles?.arrowButton,
                  (!isEmailValid || isSubmitting) && styles?.arrowButtonDisabled,
                ]}
                onPress={handleArrowPress}
                disabled={!isEmailValid || isSubmitting}
                activeOpacity={0.8}
                accessibilityLabel="Send code"
                accessibilityState={{ disabled: !isEmailValid || isSubmitting }}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={styles?.arrowIcon?.color} />
                ) : (
                  <Text style={[styles?.arrowIcon, !isEmailValid && styles?.arrowIconDisabled]}>
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
