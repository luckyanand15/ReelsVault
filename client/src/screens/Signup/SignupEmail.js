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
import { SignupStep, useSignupFlow } from '../../context/SignupFlowContext';
import { createUser } from '../../api/user.api';
import styles from './SignupEmail.styles';

export default function SignupEmail({ navigation }) {
  const { canAccessStep, continueWithEmail, signupData } = useSignupFlow();
  const canAccessEmailStep = canAccessStep(SignupStep.Email);
  const { firstName, lastName } = signupData;

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

    setIsSubmitting(true);
    setError('');

    try {
      const user = await createUser({
        firstName,
        lastName,
        email: email.trim(),
      });
      continueWithEmail({ userId: user?.id, email: email.trim() });
      navigation.navigate(routes.SignupOtp);
    } catch (err) {
      if (err?.response?.status === 409) {
        setError('This email is already in use.');
      } else {
        setError('Something went wrong. Please try again.');
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
              <Text style={styles?.stepIndicator}>Step 2 of 3</Text>
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
