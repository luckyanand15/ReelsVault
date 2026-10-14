import React, { useState } from 'react';
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
import { useLoginFlow } from '../../context/LoginFlowContext';
import { checkEmail } from '../../api/auth.api';
import styles from './LoginEmail.styles';

export default function LoginEmail({ navigation }) {
  const { confirmEmailChecked } = useLoginFlow();

  const [email, setEmail] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const exists = await checkEmail(email.trim());
      if (!exists) {
        setError('Email not found.');
        return;
      }
      confirmEmailChecked({ email: email.trim() });
      navigation.navigate(routes.LoginPassword);
    } catch (err) {
      setError(
        err?.response?.data?.message || 'Something went wrong. Please try again.',
      );
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
              <Text style={styles?.title}>Welcome back</Text>
              <Text style={styles?.subtitle}>
                Enter your email address to log in.
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
