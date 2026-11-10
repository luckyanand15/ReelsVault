import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import KeyboardAvoider from '../../components/KeyboardAvoider/KeyboardAvoider';
import ScreenHeader from '../../components/ScreenHeader/ScreenHeader';
import ScreenBackground from '../../components/ScreenBackground/ScreenBackground';
import TextField from '../../components/TextField/TextField';
import RoundArrowButton from '../../components/RoundArrowButton/RoundArrowButton';
import routes from '../../routes/routes';
import { LoginStep, useLoginFlow } from '../../context/LoginFlowContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { login } from '../../api/auth.api';
import styles from './LoginPassword.styles';

export default function LoginPassword({ navigation }) {
  const { canAccessStep, loginData } = useLoginFlow();
  const { authLogin } = useAuth();
  const { colors } = useTheme();
  const { email } = loginData;
  const canAccessPasswordStep = canAccessStep(LoginStep.Password) && Boolean(email);

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!canAccessPasswordStep) {
      navigation.replace(routes.LoginEmail);
    }
  }, [canAccessPasswordStep, navigation]);

  const isFormValid = password.length > 0;

  const handlePasswordChange = (text) => {
    setPassword(text);
    if (error) {
      setError('');
    }
  };

  const handleArrowPress = async () => {
    if (!isFormValid) {
      setError('Password is required.');
      return;
    }

    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const session = await login(email, password);
      await authLogin(session);
      navigation.reset({
        index: 0,
        routes: [{ name: routes.Dashboard }],
      });
    } catch (err) {
      setError(
        err?.response?.data?.message || 'Something went wrong. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canAccessPasswordStep) {
    return null;
  }

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
    <View style={[styles?.root, { backgroundColor: colors?.bg }]}>
      <ScreenBackground variant="auth" circleColor={colors?.cyan} />

      <SafeAreaView style={styles?.safeArea}>
        <ScreenHeader onBack={() => navigation?.goBack?.()} />

        <KeyboardAvoider style={styles?.keyboardAvoidingView}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles?.container}>
              <View style={styles?.form}>
                {/* Header Content */}
                <View style={styles?.headerContent}>
                  <Text
                    style={[styles?.title, { color: colors?.fg }]}
                    accessibilityRole="header"
                  >
                    {'Enter your\npassword'}
                  </Text>
                  <View
                    style={[
                      styles?.emailPill,
                      { backgroundColor: colors?.surf, borderColor: colors?.line },
                    ]}
                    accessible
                    accessibilityLabel={`Logging in as ${email}`}
                  >
                    <Text
                      style={[styles?.emailPillText, { color: colors?.mut }]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {email}
                    </Text>
                  </View>
                </View>

                <View style={styles?.inputGroup}>
                  <TextField
                    label="Password"
                    required
                    error={error}
                    showErrorText={false}
                    labelAccessory={showHideToggle}
                    value={password}
                    onChangeText={handlePasswordChange}
                    placeholder="Enter your password"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType="password"
                    returnKeyType="done"
                    onSubmitEditing={handleArrowPress}
                    autoFocus
                  />

                  {/* Error (left, wraps) shares a row with the link (right),
                      so a one-line error doesn't push anything down */}
                  <View style={styles?.belowFieldRow}>
                    {error ? (
                      <Text
                        style={[styles?.errorText, { color: colors?.pinkText }]}
                        accessibilityLiveRegion="polite"
                      >
                        {error}
                      </Text>
                    ) : null}

                    <TouchableOpacity
                      style={styles?.forgotPasswordButton}
                      onPress={() => navigation.navigate(routes.ForgotPasswordEmail, { email })}
                      activeOpacity={0.7}
                      accessibilityRole="button"
                    >
                      <Text style={[styles?.forgotPasswordText, { color: colors?.fg }]}>
                        Forgot password?
                      </Text>
                      {/* Android can't colour a text underline, so draw it */}
                      <View
                        style={[styles?.forgotPasswordUnderline, { backgroundColor: colors?.pink }]}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Footer with Arrow Button */}
              <View style={styles?.footer}>
                <RoundArrowButton
                  onPress={handleArrowPress}
                  active={isFormValid}
                  loading={isSubmitting}
                  accessibilityLabel="Log in"
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoider>
      </SafeAreaView>
    </View>
  );
}
