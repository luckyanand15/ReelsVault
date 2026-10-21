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
import { useAuth } from '../../context/AuthContext';
import { createUser } from '../../api/user.api';
import styles from './SignupPassword.styles';

const MIN_PASSWORD_LENGTH = 8;
// bcrypt ignores anything past 72 bytes; must match user.validator.js.
const MAX_PASSWORD_BYTES = 72;

export default function SignupPassword({ navigation }) {
  const { canAccessStep, completeSignup, signupData } = useSignupFlow();
  const { authLogin } = useAuth();
  const { firstName, lastName, email, isEmailVerified, verificationToken } = signupData;
  const canAccessPasswordStep =
    canAccessStep(SignupStep.Password) &&
    Boolean(email) &&
    isEmailVerified &&
    Boolean(verificationToken);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmFocused, setConfirmFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const confirmInputRef = useRef(null);
  const hasCompletedSignupRef = useRef(false);

  useEffect(() => {
    if (!canAccessPasswordStep && !hasCompletedSignupRef.current) {
      navigation.replace(routes.Signup);
    }
  }, [canAccessPasswordStep, navigation]);

  const isPasswordLongEnough = password.length >= MIN_PASSWORD_LENGTH;
  // Must match the server rule in user.validator.js.
  const hasLetter = /[A-Za-z]/.test(password);
  // Bytes, not characters: an emoji counts as up to 4.
  const isPasswordShortEnough =
    new TextEncoder().encode(password).length <= MAX_PASSWORD_BYTES;
  const doPasswordsMatch = password === confirmPassword;
  // hasLetter is left out on purpose: the button stays enabled so pressing it
  // shows the reason, instead of a disabled button with no explanation.
  const isFormValid = isPasswordLongEnough && confirmPassword.length > 0 && doPasswordsMatch;

  const handlePasswordChange = (text) => {
    setPassword(text);
    if (error) {
      setError('');
    }
  };

  const handleConfirmChange = (text) => {
    setConfirmPassword(text);
    if (error) {
      setError('');
    }
  };

  const handleArrowPress = async () => {
    if (!isPasswordLongEnough) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }

    if (!isPasswordShortEnough) {
      setError(`Password must be ${MAX_PASSWORD_BYTES} characters or fewer.`);
      return;
    }

    if (!hasLetter) {
      setError('Must contain at least one letter.');
      return;
    }

    if (!doPasswordsMatch) {
      setError('Passwords do not match.');
      return;
    }

    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const session = await createUser({
        firstName,
        lastName,
        email,
        verificationToken,
        password,
        confirmPassword,
      });
      hasCompletedSignupRef.current = true;
      completeSignup({ userId: session?.user?.id });
      await authLogin(session);
      // Reset navigation stack and open Dashboard
      navigation.reset({
        index: 0,
        routes: [{ name: routes.Dashboard }],
      });
    } catch (err) {
      if (err?.response?.status === 409) {
        setError('This email is already registered.');
      } else {
        setError(
          err?.response?.data?.message || 'Something went wrong. Please try again.',
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canAccessPasswordStep) {
    return null;
  }

  const showMismatch = confirmPassword.length > 0 && !doPasswordsMatch;

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
              <Text style={styles?.stepIndicator}>Step 4 of 4</Text>
              <Text style={styles?.title}>Create a password</Text>
              <Text style={styles?.subtitle}>
                You'll use this password to log into Reels Vault.
              </Text>
            </View>

            {/* Input Form */}
            <View style={styles?.form}>
              <View style={styles?.inputGroup}>
                <View style={styles?.labelRow}>
                  <Text style={styles?.label}>
                    Password <Text style={styles?.star}>*</Text>
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowPassword((prev) => !prev)}
                    activeOpacity={0.7}
                    accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <Text style={styles?.toggleText}>
                      {showPassword ? 'Hide' : 'Show'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={[
                    styles?.input,
                    passwordFocused && styles?.inputFocused,
                    !!error && styles?.inputError,
                  ]}
                  value={password}
                  onChangeText={handlePasswordChange}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  placeholder="Enter your password"
                  placeholderTextColor="#A3A3A3"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="newPassword"
                  returnKeyType="next"
                  onSubmitEditing={() => confirmInputRef.current?.focus()}
                  blurOnSubmit={false}
                />
                <Text style={styles?.hintText}>
                  {MIN_PASSWORD_LENGTH} to {MAX_PASSWORD_BYTES} characters, including a letter.
                </Text>
              </View>

              <View style={styles?.inputGroup}>
                <View style={styles?.labelRow}>
                  <Text style={styles?.label}>
                    Confirm Password <Text style={styles?.star}>*</Text>
                  </Text>
                </View>
                <TextInput
                  ref={confirmInputRef}
                  style={[
                    styles?.input,
                    confirmFocused && styles?.inputFocused,
                    (showMismatch || !!error) && styles?.inputError,
                  ]}
                  value={confirmPassword}
                  onChangeText={handleConfirmChange}
                  onFocus={() => setConfirmFocused(true)}
                  onBlur={() => setConfirmFocused(false)}
                  placeholder="Re-enter your password"
                  placeholderTextColor="#A3A3A3"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="newPassword"
                  returnKeyType="done"
                  onSubmitEditing={handleArrowPress}
                />
                {error ? (
                  <Text style={styles?.errorText}>{error}</Text>
                ) : showMismatch ? (
                  <Text style={styles?.errorText}>Passwords do not match.</Text>
                ) : null}
              </View>
            </View>

            {/* Footer with Arrow Button */}
            <View style={styles?.footer}>
              <TouchableOpacity
                style={[
                  styles?.arrowButton,
                  (!isFormValid || isSubmitting) && styles?.arrowButtonDisabled,
                ]}
                onPress={handleArrowPress}
                disabled={!isFormValid || isSubmitting}
                activeOpacity={0.8}
                accessibilityLabel="Create account and go to Dashboard"
                accessibilityState={{ disabled: !isFormValid || isSubmitting }}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={styles?.arrowIcon?.color} />
                ) : (
                  <Text
                    style={[
                      styles?.arrowIcon,
                      !isFormValid && styles?.arrowIconDisabled,
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
