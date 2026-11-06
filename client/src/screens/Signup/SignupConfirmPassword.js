import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import AuthLayout, { AuthHeading } from '../../components/AuthLayout/AuthLayout';
import TextField from '../../components/TextField/TextField';
import RoundArrowButton from '../../components/RoundArrowButton/RoundArrowButton';
import routes from '../../routes/routes';
import { SignupStep, useSignupFlow } from '../../context/SignupFlowContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { createUser } from '../../api/user.api';
import styles from './SignupPassword.styles';

export default function SignupConfirmPassword({ navigation }) {
  const { canAccessStep, completeSignup, signupData } = useSignupFlow();
  const { authLogin } = useAuth();
  const { colors } = useTheme();
  const { firstName, lastName, email, isEmailVerified, verificationToken, password } =
    signupData;
  const canAccessConfirmStep =
    canAccessStep(SignupStep.ConfirmPassword) &&
    Boolean(email) &&
    isEmailVerified &&
    Boolean(verificationToken) &&
    Boolean(password);

  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasCompletedSignupRef = useRef(false);

  useEffect(() => {
    if (!canAccessConfirmStep && !hasCompletedSignupRef.current) {
      navigation.replace(routes.Signup);
    }
  }, [canAccessConfirmStep, navigation]);

  const doPasswordsMatch = password === confirmPassword;
  // Only the look of the arrow: it stays pressable so pressing it shows the
  // reason, instead of a disabled button with no explanation.
  const isFormValid = confirmPassword.length > 0 && doPasswordsMatch;

  const handleConfirmChange = (text) => {
    setConfirmPassword(text);
    if (error) {
      setError('');
    }
  };

  const handleArrowPress = async () => {
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

  if (!canAccessConfirmStep && !hasCompletedSignupRef.current) {
    return null;
  }

  const showMismatch = confirmPassword.length > 0 && !doPasswordsMatch;

  const showHideToggle = (
    <TouchableOpacity
      style={styles?.toggleButton}
      onPress={() => setShowPassword((prev) => !prev)}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
    >
      <Text style={[styles?.toggleText, { color: colors?.fg }]}>
        {showPassword ? 'Hide' : 'Show'}
      </Text>
    </TouchableOpacity>
  );

  return (
    <AuthLayout
      circleColor={colors?.accent}
      onBack={() => navigation?.goBack?.()}
      footer={
        <RoundArrowButton
          onPress={handleArrowPress}
          active={isFormValid}
          loading={isSubmitting}
          accessibilityLabel="Create account and go to Dashboard"
        />
      }
    >
      <AuthHeading step="Step 6 of 6" title={'Confirm your\npassword'}>
        Re-enter your password to make sure it's right.
      </AuthHeading>

      <View style={styles?.fields}>
        <TextField
          label="Confirm Password"
          required
          labelAccessory={showHideToggle}
          error={error || (showMismatch ? 'Passwords do not match.' : '')}
          value={confirmPassword}
          onChangeText={handleConfirmChange}
          placeholder="Re-enter your password"
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="newPassword"
          returnKeyType="done"
          autoFocus
          onSubmitEditing={handleArrowPress}
          submitBehavior="submit"
        />
      </View>
    </AuthLayout>
  );
}
